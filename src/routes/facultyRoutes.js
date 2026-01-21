/**
 * Faculty Routes
 * 
 * API endpoints for faculty/TPO operations:
 * - Dashboard stats
 * - Student management
 * - Drive management
 * - Enrollment management
 * - Analytics
 */

import express from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { adminDb } from '../config/firebase-admin.js';
import { 
  getEligibleStudentsForDrive, 
  getEligibleDrivesForStudent,
  updateDriveEligibilityCount 
} from '../services/eligibilityService.js';
import {
  enrollStudent,
  updateEnrollmentStatus,
  updateRoundStatus,
  getDriveEnrollments,
  getStudentEnrollments,
  withdrawEnrollment,
  ENROLLMENT_STATUS
} from '../services/enrollmentService.js';
import {
  getDashboardStats,
  getBranchWiseAnalytics,
  getDriveAnalytics,
  getPlacementTrends,
  exportAnalyticsData
} from '../services/analyticsService.js';

const router = express.Router();

// Apply authentication to all faculty routes
router.use(verifyToken);
router.use(requireRole('faculty', 'admin'));

// ============================================
// DASHBOARD & ANALYTICS
// ============================================

/**
 * GET /api/faculty/dashboard
 * Get comprehensive dashboard statistics
 */
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/faculty/analytics
 * Get detailed analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const [dashboardStats, branchAnalytics, trends] = await Promise.all([
      getDashboardStats(),
      getBranchWiseAnalytics(),
      getPlacementTrends(12)
    ]);

    res.json({
      success: true,
      data: {
        overview: dashboardStats.overview,
        ctcStats: dashboardStats.ctcStats,
        distribution: dashboardStats.distribution,
        companyWise: dashboardStats.companyWise,
        branchAnalytics: branchAnalytics.branchAnalytics,
        trends: trends.trends
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

/**
 * GET /api/faculty/analytics/branch
 * Get branch-wise analytics
 */
router.get('/analytics/branch', async (req, res) => {
  try {
    const analytics = await getBranchWiseAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch branch analytics', message: error.message });
  }
});

/**
 * GET /api/faculty/analytics/trends
 * Get placement trends
 */
router.get('/analytics/trends', async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const trends = await getPlacementTrends(months);
    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trends', message: error.message });
  }
});

/**
 * GET /api/faculty/export
 * Export analytics data
 */
router.get('/export', async (req, res) => {
  try {
    const type = req.query.type || 'all';
    const data = await exportAnalyticsData(type);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data', message: error.message });
  }
});

// ============================================
// STUDENT MANAGEMENT
// ============================================

/**
 * GET /api/faculty/students
 * Get all students with optional filters
 */
router.get('/students', async (req, res) => {
  try {
    const { branch, year, section, minCGPA, maxCGPA, search, placed } = req.query;
    
    let query = adminDb.collection('students');
    
    // Apply filters that Firestore can handle
    if (branch) {
      query = query.where('branch', '==', branch);
    }
    if (year) {
      query = query.where('year', '==', year);
    }
    if (placed !== undefined) {
      query = query.where('isPlaced', '==', placed === 'true');
    }

    const snapshot = await query.get();
    let students = [];
    
    snapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() });
    });

    // Apply additional filters in memory
    if (section) {
      students = students.filter(s => s.section?.toLowerCase() === section.toLowerCase());
    }
    if (minCGPA) {
      students = students.filter(s => parseFloat(s.cgpa) >= parseFloat(minCGPA));
    }
    if (maxCGPA) {
      students = students.filter(s => parseFloat(s.cgpa) <= parseFloat(maxCGPA));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      students = students.filter(s => 
        s.name?.toLowerCase().includes(searchLower) ||
        s.rollNumber?.toLowerCase().includes(searchLower) ||
        s.email?.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: students,
      total: students.length
    });
  } catch (error) {
    console.error('Fetch students error:', error);
    res.status(500).json({
      error: 'Failed to fetch students',
      message: error.message
    });
  }
});

/**
 * GET /api/faculty/students/:id
 * Get single student details
 */
router.get('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await adminDb.collection('students').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Also fetch student's enrollments
    const enrollments = await getStudentEnrollments(id);

    res.json({
      success: true,
      data: {
        ...doc.data(),
        id: doc.id,
        enrollments: enrollments.enrollments
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student', message: error.message });
  }
});

/**
 * PUT /api/faculty/students/:id
 * Update student details
 */
router.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdAt;
    
    // Add metadata
    updateData.updatedAt = new Date().toISOString();
    updateData.updatedBy = req.user.uid;

    await adminDb.collection('students').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      error: 'Failed to update student',
      message: error.message
    });
  }
});

/**
 * POST /api/faculty/students
 * Create new student
 */
router.post('/students', async (req, res) => {
  try {
    const studentData = req.body;
    
    // Validate required fields
    if (!studentData.rollNumber || !studentData.name) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Roll number and name are required'
      });
    }

    // Use roll number as document ID
    const studentId = studentData.rollNumber.replace(/\s+/g, '_');
    
    // Check if student already exists
    const existing = await adminDb.collection('students').doc(studentId).get();
    if (existing.exists) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Student with this roll number already exists'
      });
    }

    // Add metadata
    studentData.createdAt = new Date().toISOString();
    studentData.createdBy = req.user.uid;
    studentData.isPlaced = false;

    await adminDb.collection('students').doc(studentId).set(studentData);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      studentId
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      error: 'Failed to create student',
      message: error.message
    });
  }
});

/**
 * DELETE /api/faculty/students/:id
 * Delete student
 */
router.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for existing enrollments
    const enrollmentsSnap = await adminDb.collection('enrollments')
      .where('studentId', '==', id)
      .get();
    
    if (!enrollmentsSnap.empty) {
      return res.status(400).json({
        error: 'Cannot delete',
        message: 'Student has existing enrollments. Please remove enrollments first.'
      });
    }

    await adminDb.collection('students').doc(id).delete();

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete student', message: error.message });
  }
});

/**
 * POST /api/faculty/students/bulk-upload
 * Bulk upload students from Excel data
 */
router.post('/students/bulk-upload', async (req, res) => {
  try {
    const { students } = req.body;
    
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Students array is required'
      });
    }

    const results = { success: 0, failed: 0, errors: [] };
    const batch = adminDb.batch();

    for (const student of students) {
      try {
        if (!student.rollNumber || !student.name) {
          results.failed++;
          results.errors.push(`Missing roll number or name for a student`);
          continue;
        }

        const studentId = student.rollNumber.replace(/\s+/g, '_');
        const studentRef = adminDb.collection('students').doc(studentId);
        
        batch.set(studentRef, {
          ...student,
          uploadedAt: new Date().toISOString(),
          uploadedBy: req.user.uid,
          uploadSource: 'bulk-api',
          isPlaced: false
        }, { merge: true });
        
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Error processing ${student.rollNumber}: ${err.message}`);
      }
    }

    await batch.commit();

    res.json({
      success: true,
      message: `Uploaded ${results.success} students`,
      results
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      error: 'Bulk upload failed',
      message: error.message
    });
  }
});

// ============================================
// DRIVE MANAGEMENT
// ============================================

/**
 * GET /api/faculty/drives
 * Get all drives
 */
router.get('/drives', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = adminDb.collection('drives');
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const drives = [];
    
    snapshot.forEach((doc) => {
      drives.push({ id: doc.id, ...doc.data() });
    });

    // Sort by date
    drives.sort((a, b) => new Date(b.driveDate) - new Date(a.driveDate));

    res.json({
      success: true,
      data: drives,
      total: drives.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drives', message: error.message });
  }
});

/**
 * GET /api/faculty/drives/:id
 * Get single drive with analytics
 */
router.get('/drives/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await adminDb.collection('drives').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Drive not found' });
    }

    const analytics = await getDriveAnalytics(id);

    res.json({
      success: true,
      data: {
        ...doc.data(),
        id: doc.id,
        analytics
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drive', message: error.message });
  }
});

/**
 * POST /api/faculty/drives
 * Create new drive
 */
router.post('/drives', async (req, res) => {
  try {
    const driveData = req.body;
    
    // Validate required fields
    if (!driveData.companyName || !driveData.ctc) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Company name and CTC are required'
      });
    }

    // Add metadata
    driveData.createdAt = new Date().toISOString();
    driveData.createdBy = req.user.uid;
    driveData.enrolledStudents = 0;
    driveData.placedStudents = 0;
    driveData.status = driveData.status || 'Upcoming';

    const driveRef = await adminDb.collection('drives').add(driveData);

    // Calculate eligible students count
    await updateDriveEligibilityCount(driveRef.id);

    res.status(201).json({
      success: true,
      message: 'Drive created successfully',
      driveId: driveRef.id
    });
  } catch (error) {
    console.error('Create drive error:', error);
    res.status(500).json({
      error: 'Failed to create drive',
      message: error.message
    });
  }
});

/**
 * PUT /api/faculty/drives/:id
 * Update drive
 */
router.put('/drives/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    delete updateData.id;
    delete updateData.createdAt;
    
    updateData.updatedAt = new Date().toISOString();
    updateData.updatedBy = req.user.uid;

    await adminDb.collection('drives').doc(id).update(updateData);

    // Recalculate eligibility if criteria changed
    if (updateData.minCGPA || updateData.eligibleBranches || updateData.eligibleYears) {
      await updateDriveEligibilityCount(id);
    }

    res.json({
      success: true,
      message: 'Drive updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update drive', message: error.message });
  }
});

/**
 * DELETE /api/faculty/drives/:id
 * Delete drive
 */
router.delete('/drives/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for existing enrollments
    const enrollmentsSnap = await adminDb.collection('enrollments')
      .where('driveId', '==', id)
      .get();
    
    if (!enrollmentsSnap.empty) {
      return res.status(400).json({
        error: 'Cannot delete',
        message: 'Drive has existing enrollments. Please remove all enrollments first.'
      });
    }

    await adminDb.collection('drives').doc(id).delete();

    res.json({
      success: true,
      message: 'Drive deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete drive', message: error.message });
  }
});

/**
 * GET /api/faculty/drives/:id/eligible-students
 * Get all eligible students for a drive
 */
router.get('/drives/:id/eligible-students', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getEligibleStudentsForDrive(id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compute eligibility', message: error.message });
  }
});

// ============================================
// ENROLLMENT MANAGEMENT
// ============================================

/**
 * GET /api/faculty/enrollments
 * Get all enrollments with optional filters
 */
router.get('/enrollments', async (req, res) => {
  try {
    const { driveId, studentId, status } = req.query;
    
    let query = adminDb.collection('enrollments');
    
    if (driveId) {
      query = query.where('driveId', '==', driveId);
    }
    if (studentId) {
      query = query.where('studentId', '==', studentId);
    }
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const enrollments = [];
    
    snapshot.forEach((doc) => {
      enrollments.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: enrollments,
      total: enrollments.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollments', message: error.message });
  }
});

/**
 * GET /api/faculty/drives/:driveId/enrollments
 * Get enrollments for a specific drive
 */
router.get('/drives/:driveId/enrollments', async (req, res) => {
  try {
    const { driveId } = req.params;
    const { status } = req.query;
    
    const result = await getDriveEnrollments(driveId, { status });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollments', message: error.message });
  }
});

/**
 * POST /api/faculty/enrollments
 * Create enrollment (enroll student in drive)
 */
router.post('/enrollments', async (req, res) => {
  try {
    const { studentId, driveId } = req.body;
    
    if (!studentId || !driveId) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Student ID and Drive ID are required'
      });
    }

    const result = await enrollStudent(studentId, driveId, req.user.uid);
    res.status(201).json(result);
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(400).json({
      error: 'Enrollment failed',
      message: error.message
    });
  }
});

/**
 * PUT /api/faculty/enrollments/:id/status
 * Update enrollment status
 */
router.put('/enrollments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    
    if (!status || !Object.values(ENROLLMENT_STATUS).includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Valid statuses: ${Object.values(ENROLLMENT_STATUS).join(', ')}`
      });
    }

    const result = await updateEnrollmentStatus(id, status, req.user.uid, remarks);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status', message: error.message });
  }
});

/**
 * PUT /api/faculty/enrollments/:id/round
 * Update round status
 */
router.put('/enrollments/:id/round', async (req, res) => {
  try {
    const { id } = req.params;
    const { roundNumber, cleared } = req.body;
    
    if (roundNumber === undefined || cleared === undefined) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Round number and cleared status are required'
      });
    }

    const result = await updateRoundStatus(id, roundNumber, cleared, req.user.uid);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update round', message: error.message });
  }
});

/**
 * POST /api/faculty/enrollments/bulk-status
 * Bulk update enrollment statuses
 */
router.post('/enrollments/bulk-status', async (req, res) => {
  try {
    const { enrollmentIds, status, remarks } = req.body;
    
    if (!Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Enrollment IDs array is required'
      });
    }

    const results = { success: 0, failed: 0, errors: [] };
    
    for (const enrollmentId of enrollmentIds) {
      try {
        await updateEnrollmentStatus(enrollmentId, status, req.user.uid, remarks);
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`${enrollmentId}: ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: `Updated ${results.success} enrollments`,
      results
    });
  } catch (error) {
    res.status(500).json({ error: 'Bulk update failed', message: error.message });
  }
});

/**
 * DELETE /api/faculty/enrollments/:id
 * Withdraw/cancel enrollment
 */
router.delete('/enrollments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const result = await withdrawEnrollment(id, req.user.uid, reason);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to withdraw enrollment', message: error.message });
  }
});

// Export enrollment statuses for reference
router.get('/enrollment-statuses', (req, res) => {
  res.json({
    success: true,
    data: ENROLLMENT_STATUS
  });
});

export default router;
