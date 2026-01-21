/**
 * Student Routes
 * 
 * API endpoints for student operations:
 * - Profile management
 * - Drive discovery and enrollment
 * - Application tracking
 */

import express from 'express';
import { verifyToken, requireRole, optionalAuth } from '../middleware/authMiddleware.js';
import { adminDb } from '../config/firebase-admin.js';
import { 
  getEligibleDrivesForStudent,
  checkStudentEligibility 
} from '../services/eligibilityService.js';
import {
  enrollStudent,
  getStudentEnrollments,
  withdrawEnrollment,
  ENROLLMENT_STATUS
} from '../services/enrollmentService.js';

const router = express.Router();

// ============================================
// PUBLIC ENDPOINTS (No auth required)
// ============================================

/**
 * GET /api/student/drives/public
 * Get list of active drives (public view)
 */
router.get('/drives/public', async (req, res) => {
  try {
    const snapshot = await adminDb.collection('drives')
      .where('status', 'in', ['Upcoming', 'Ongoing'])
      .get();

    const drives = [];
    snapshot.forEach((doc) => {
      const drive = doc.data();
      drives.push({
        id: doc.id,
        companyName: drive.companyName,
        ctc: drive.ctc,
        driveDate: drive.driveDate,
        minCGPA: drive.minCGPA,
        eligibleBranches: drive.eligibleBranches,
        requiredSkills: drive.requiredSkills,
        status: drive.status
      });
    });

    res.json({
      success: true,
      data: drives
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drives', message: error.message });
  }
});

// ============================================
// AUTHENTICATED ENDPOINTS
// ============================================

router.use(verifyToken);
router.use(requireRole('student'));

/**
 * GET /api/student/profile
 * Get current student's profile
 */
router.get('/profile', async (req, res) => {
  try {
    // First try to find student by user ID
    let studentDoc = await adminDb.collection('students')
      .where('userId', '==', req.user.uid)
      .get();

    if (studentDoc.empty) {
      // Try to find by email
      studentDoc = await adminDb.collection('students')
        .where('email', '==', req.user.email)
        .get();
    }

    if (studentDoc.empty) {
      return res.status(404).json({
        error: 'Profile not found',
        message: 'Student profile not found. Please contact administrator.'
      });
    }

    const student = { id: studentDoc.docs[0].id, ...studentDoc.docs[0].data() };
    
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile', message: error.message });
  }
});

/**
 * PUT /api/student/profile
 * Update current student's profile
 */
router.put('/profile', async (req, res) => {
  try {
    const updateData = req.body;
    
    // Find student document
    let studentQuery = await adminDb.collection('students')
      .where('userId', '==', req.user.uid)
      .get();

    if (studentQuery.empty) {
      studentQuery = await adminDb.collection('students')
        .where('email', '==', req.user.email)
        .get();
    }

    if (studentQuery.empty) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const studentId = studentQuery.docs[0].id;
    
    // Fields students can update
    const allowedFields = [
      'name', 'phone', 'skills', 'projects', 'internships',
      'certifications', 'achievements', 'linkedIn', 'github',
      'portfolio', 'resume'
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    filteredData.updatedAt = new Date().toISOString();

    await adminDb.collection('students').doc(studentId).update(filteredData);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile', message: error.message });
  }
});

/**
 * GET /api/student/eligible-drives
 * Get all drives the student is eligible for
 */
router.get('/eligible-drives', async (req, res) => {
  try {
    // Find student ID
    let studentQuery = await adminDb.collection('students')
      .where('userId', '==', req.user.uid)
      .get();

    if (studentQuery.empty) {
      studentQuery = await adminDb.collection('students')
        .where('email', '==', req.user.email)
        .get();
    }

    if (studentQuery.empty) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const studentId = studentQuery.docs[0].id;
    const result = await getEligibleDrivesForStudent(studentId);

    // Also fetch existing enrollments
    const enrollments = await getStudentEnrollments(studentId);
    const enrolledDriveIds = enrollments.enrollments.map(e => e.driveId);

    // Mark drives as enrolled
    result.eligibleDrives = result.eligibleDrives.map(drive => ({
      ...drive,
      isEnrolled: enrolledDriveIds.includes(drive.id)
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch eligible drives', message: error.message });
  }
});

/**
 * GET /api/student/drives
 * Get all available drives with eligibility status
 */
router.get('/drives', async (req, res) => {
  try {
    // Find student
    let studentQuery = await adminDb.collection('students')
      .where('userId', '==', req.user.uid)
      .get();

    if (studentQuery.empty) {
      studentQuery = await adminDb.collection('students')
        .where('email', '==', req.user.email)
        .get();
    }

    const student = studentQuery.empty ? null : 
      { id: studentQuery.docs[0].id, ...studentQuery.docs[0].data() };

    // Fetch all active drives
    const drivesSnap = await adminDb.collection('drives')
      .where('status', 'in', ['Upcoming', 'Ongoing'])
      .get();

    // Get existing enrollments
    let enrolledDriveIds = [];
    if (student) {
      const enrollments = await getStudentEnrollments(student.id);
      enrolledDriveIds = enrollments.enrollments.map(e => e.driveId);
    }

    const drives = [];
    drivesSnap.forEach((doc) => {
      const drive = { id: doc.id, ...doc.data() };
      
      let eligibility = { eligible: true, reasons: [] };
      if (student) {
        eligibility = checkStudentEligibility(student, drive);
      }

      drives.push({
        ...drive,
        eligibility,
        isEnrolled: enrolledDriveIds.includes(doc.id)
      });
    });

    res.json({
      success: true,
      data: drives
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drives', message: error.message });
  }
});

/**
 * POST /api/student/enroll
 * Enroll in a drive
 */
router.post('/enroll', async (req, res) => {
  try {
    const { driveId } = req.body;
    
    if (!driveId) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Drive ID is required'
      });
    }

    // Find student ID
    let studentQuery = await adminDb.collection('students')
      .where('userId', '==', req.user.uid)
      .get();

    if (studentQuery.empty) {
      studentQuery = await adminDb.collection('students')
        .where('email', '==', req.user.email)
        .get();
    }

    if (studentQuery.empty) {
      return res.status(404).json({
        error: 'Profile not found',
        message: 'Please complete your profile before enrolling'
      });
    }

    const studentId = studentQuery.docs[0].id;
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
 * GET /api/student/enrollments
 * Get all enrollments for current student
 */
router.get('/enrollments', async (req, res) => {
  try {
    // Find student ID
    let studentQuery = await adminDb.collection('students')
      .where('userId', '==', req.user.uid)
      .get();

    if (studentQuery.empty) {
      studentQuery = await adminDb.collection('students')
        .where('email', '==', req.user.email)
        .get();
    }

    if (studentQuery.empty) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const studentId = studentQuery.docs[0].id;
    const result = await getStudentEnrollments(studentId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollments', message: error.message });
  }
});

/**
 * GET /api/student/enrollments/:id
 * Get specific enrollment details
 */
router.get('/enrollments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const enrollmentDoc = await adminDb.collection('enrollments').doc(id).get();
    
    if (!enrollmentDoc.exists) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    const enrollment = enrollmentDoc.data();
    
    // Verify the enrollment belongs to this student
    let studentQuery = await adminDb.collection('students')
      .where('userId', '==', req.user.uid)
      .get();

    if (studentQuery.empty) {
      studentQuery = await adminDb.collection('students')
        .where('email', '==', req.user.email)
        .get();
    }

    if (studentQuery.empty || studentQuery.docs[0].id !== enrollment.studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: { id: enrollmentDoc.id, ...enrollment }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollment', message: error.message });
  }
});

/**
 * DELETE /api/student/enrollments/:id
 * Withdraw from a drive
 */
router.delete('/enrollments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Verify the enrollment belongs to this student
    const enrollmentDoc = await adminDb.collection('enrollments').doc(id).get();
    
    if (!enrollmentDoc.exists) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    const enrollment = enrollmentDoc.data();
    
    let studentQuery = await adminDb.collection('students')
      .where('userId', '==', req.user.uid)
      .get();

    if (studentQuery.empty) {
      studentQuery = await adminDb.collection('students')
        .where('email', '==', req.user.email)
        .get();
    }

    if (studentQuery.empty || studentQuery.docs[0].id !== enrollment.studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await withdrawEnrollment(id, req.user.uid, reason);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to withdraw', message: error.message });
  }
});

/**
 * GET /api/student/dashboard
 * Get student dashboard data
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Find student
    let studentQuery = await adminDb.collection('students')
      .where('userId', '==', req.user.uid)
      .get();

    if (studentQuery.empty) {
      studentQuery = await adminDb.collection('students')
        .where('email', '==', req.user.email)
        .get();
    }

    if (studentQuery.empty) {
      return res.json({
        success: true,
        data: {
          hasProfile: false,
          message: 'Please complete your profile'
        }
      });
    }

    const student = { id: studentQuery.docs[0].id, ...studentQuery.docs[0].data() };
    
    // Get enrollments
    const enrollments = await getStudentEnrollments(student.id);
    
    // Get eligible drives count
    const eligibleDrives = await getEligibleDrivesForStudent(student.id);

    // Get upcoming drives count
    const upcomingDrivesSnap = await adminDb.collection('drives')
      .where('status', '==', 'Upcoming')
      .get();

    res.json({
      success: true,
      data: {
        hasProfile: true,
        student: {
          name: student.name,
          rollNumber: student.rollNumber,
          branch: student.branch,
          cgpa: student.cgpa,
          isPlaced: student.isPlaced || false,
          placedCompany: student.placedCompany
        },
        stats: {
          activeEnrollments: enrollments.activeEnrollments,
          totalEnrollments: enrollments.total,
          eligibleDrives: eligibleDrives.eligibleDrives.length,
          upcomingDrives: upcomingDrivesSnap.size
        },
        recentEnrollments: enrollments.enrollments.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard', message: error.message });
  }
});

export default router;
