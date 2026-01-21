/**
 * Eligibility Computation Service
 * 
 * Handles all eligibility calculations for placement drives including:
 * - CGPA requirements
 * - Branch matching
 * - Year/batch requirements
 * - Backlog checks
 * - Custom eligibility criteria
 */

import { adminDb } from '../config/firebase-admin.js';

/**
 * Check if a student is eligible for a specific drive
 * 
 * @param {Object} student - Student data
 * @param {Object} drive - Drive data with eligibility criteria
 * @returns {Object} - { eligible: boolean, reasons: string[], score: number }
 */
export const checkStudentEligibility = (student, drive) => {
  const reasons = [];
  let score = 100; // Start with perfect eligibility score

  // 1. CGPA Check
  if (drive.minCGPA) {
    const studentCGPA = parseFloat(student.cgpa) || 0;
    const minCGPA = parseFloat(drive.minCGPA);
    
    if (studentCGPA < minCGPA) {
      reasons.push(`CGPA ${studentCGPA.toFixed(2)} is below minimum requirement of ${minCGPA}`);
      score -= 30;
    }
  }

  // 2. Branch Check
  if (drive.eligibleBranches && drive.eligibleBranches.length > 0) {
    const studentBranch = student.branch?.toLowerCase().trim();
    const eligibleBranches = drive.eligibleBranches.map(b => b.toLowerCase().trim());
    
    if (studentBranch && !eligibleBranches.some(branch => 
      studentBranch.includes(branch) || branch.includes(studentBranch)
    )) {
      reasons.push(`Branch '${student.branch}' is not eligible for this drive`);
      score -= 40;
    }
  }

  // 3. Year/Batch Check
  if (drive.eligibleYear || drive.eligibleYears) {
    const eligibleYears = drive.eligibleYears || [drive.eligibleYear];
    const studentYear = parseInt(student.year) || 0;
    
    if (!eligibleYears.includes(studentYear) && !eligibleYears.includes(studentYear.toString())) {
      reasons.push(`Year ${student.year || 'unspecified'} is not eligible (required: ${eligibleYears.join(', ')})`);
      score -= 30;
    }
  }

  // 4. Backlog Check
  if (drive.noBacklogsRequired && student.activeBacklogs > 0) {
    reasons.push(`Active backlogs (${student.activeBacklogs}) not allowed for this drive`);
    score -= 50;
  }

  // 5. Placement Status Check (if company doesn't allow already placed students)
  if (drive.noAlreadyPlaced && student.isPlaced) {
    reasons.push('Already placed students are not eligible for this drive');
    score -= 100;
  }

  // 6. 10th Percentage Check
  if (drive.min10thPercentage) {
    const studentPercentage = parseFloat(student.percentage10th) || 0;
    if (studentPercentage < parseFloat(drive.min10thPercentage)) {
      reasons.push(`10th percentage ${studentPercentage}% is below minimum ${drive.min10thPercentage}%`);
      score -= 15;
    }
  }

  // 7. 12th Percentage Check
  if (drive.min12thPercentage) {
    const studentPercentage = parseFloat(student.percentage12th) || 0;
    if (studentPercentage < parseFloat(drive.min12thPercentage)) {
      reasons.push(`12th percentage ${studentPercentage}% is below minimum ${drive.min12thPercentage}%`);
      score -= 15;
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    score: Math.max(0, score)
  };
};

/**
 * Get all eligible students for a specific drive
 * 
 * @param {string} driveId - Drive ID
 * @returns {Promise<Object>} - { eligible: [], notEligible: [], stats: {} }
 */
export const getEligibleStudentsForDrive = async (driveId) => {
  try {
    // Fetch drive details
    const driveDoc = await adminDb.collection('drives').doc(driveId).get();
    if (!driveDoc.exists) {
      throw new Error('Drive not found');
    }
    const drive = { id: driveDoc.id, ...driveDoc.data() };

    // Fetch all students
    const studentsSnapshot = await adminDb.collection('students').get();
    const eligible = [];
    const notEligible = [];

    studentsSnapshot.forEach((doc) => {
      const student = { id: doc.id, ...doc.data() };
      const eligibility = checkStudentEligibility(student, drive);
      
      if (eligibility.eligible) {
        eligible.push({
          ...student,
          eligibilityScore: eligibility.score
        });
      } else {
        notEligible.push({
          ...student,
          eligibilityReasons: eligibility.reasons,
          eligibilityScore: eligibility.score
        });
      }
    });

    // Sort eligible students by eligibility score
    eligible.sort((a, b) => b.eligibilityScore - a.eligibilityScore);

    return {
      drive,
      eligible,
      notEligible,
      stats: {
        totalStudents: studentsSnapshot.size,
        eligibleCount: eligible.length,
        notEligibleCount: notEligible.length,
        eligibilityRate: ((eligible.length / studentsSnapshot.size) * 100).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Error computing eligibility:', error);
    throw error;
  }
};

/**
 * Get all drives a student is eligible for
 * 
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} - { eligibleDrives: [], notEligibleDrives: [] }
 */
export const getEligibleDrivesForStudent = async (studentId) => {
  try {
    // Fetch student details
    const studentDoc = await adminDb.collection('students').doc(studentId).get();
    if (!studentDoc.exists) {
      throw new Error('Student not found');
    }
    const student = { id: studentDoc.id, ...studentDoc.data() };

    // Fetch all active drives
    const drivesSnapshot = await adminDb.collection('drives')
      .where('status', 'in', ['Upcoming', 'Ongoing'])
      .get();

    const eligibleDrives = [];
    const notEligibleDrives = [];

    drivesSnapshot.forEach((doc) => {
      const drive = { id: doc.id, ...doc.data() };
      const eligibility = checkStudentEligibility(student, drive);
      
      if (eligibility.eligible) {
        eligibleDrives.push({
          ...drive,
          eligibilityScore: eligibility.score
        });
      } else {
        notEligibleDrives.push({
          ...drive,
          eligibilityReasons: eligibility.reasons
        });
      }
    });

    return {
      student,
      eligibleDrives,
      notEligibleDrives,
      stats: {
        totalDrives: drivesSnapshot.size,
        eligibleCount: eligibleDrives.length
      }
    };
  } catch (error) {
    console.error('Error computing student eligibility:', error);
    throw error;
  }
};

/**
 * Bulk check eligibility for all students against a drive
 * and update the drive document with eligible student count
 * 
 * @param {string} driveId - Drive ID
 * @returns {Promise<Object>}
 */
export const updateDriveEligibilityCount = async (driveId) => {
  try {
    const result = await getEligibleStudentsForDrive(driveId);
    
    // Update drive document with eligibility stats
    await adminDb.collection('drives').doc(driveId).update({
      eligibleStudentCount: result.eligible.length,
      eligibilityUpdatedAt: new Date().toISOString()
    });

    return {
      success: true,
      eligibleCount: result.eligible.length,
      message: `Updated eligibility count for drive: ${result.drive.companyName}`
    };
  } catch (error) {
    console.error('Error updating drive eligibility:', error);
    throw error;
  }
};

export default {
  checkStudentEligibility,
  getEligibleStudentsForDrive,
  getEligibleDrivesForStudent,
  updateDriveEligibilityCount
};
