/**
 * Enrollment Service
 * 
 * Manages student enrollments for placement drives including:
 * - Enrollment creation and management
 * - Status tracking (enrolled, shortlisted, rejected, selected, joined)
 * - Round-wise tracking
 * - Enrollment statistics
 */

import { adminDb } from '../config/firebase-admin.js';
import { checkStudentEligibility } from './eligibilityService.js';
import admin from 'firebase-admin';

// Enrollment statuses
export const ENROLLMENT_STATUS = {
  ENROLLED: 'enrolled',
  SHORTLISTED: 'shortlisted',
  ROUND_1_CLEARED: 'round_1_cleared',
  ROUND_2_CLEARED: 'round_2_cleared',
  ROUND_3_CLEARED: 'round_3_cleared',
  FINAL_ROUND: 'final_round',
  SELECTED: 'selected',
  OFFER_RECEIVED: 'offer_received',
  OFFER_ACCEPTED: 'offer_accepted',
  JOINED: 'joined',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

/**
 * Enroll a student in a drive
 * 
 * @param {string} studentId - Student ID
 * @param {string} driveId - Drive ID
 * @param {string} userId - User making the enrollment (student's auth ID)
 * @returns {Promise<Object>}
 */
export const enrollStudent = async (studentId, driveId, userId) => {
  try {
    // Fetch student and drive
    const [studentDoc, driveDoc] = await Promise.all([
      adminDb.collection('students').doc(studentId).get(),
      adminDb.collection('drives').doc(driveId).get()
    ]);

    if (!studentDoc.exists) {
      throw new Error('Student not found');
    }
    if (!driveDoc.exists) {
      throw new Error('Drive not found');
    }

    const student = { id: studentDoc.id, ...studentDoc.data() };
    const drive = { id: driveDoc.id, ...driveDoc.data() };

    // Check drive status
    if (drive.status === 'Closed' || drive.status === 'Results Published') {
      throw new Error('Drive is no longer accepting enrollments');
    }

    // Check eligibility
    const eligibility = checkStudentEligibility(student, drive);
    if (!eligibility.eligible) {
      throw new Error(`Not eligible: ${eligibility.reasons.join(', ')}`);
    }

    // Check for existing enrollment
    const existingEnrollment = await adminDb.collection('enrollments')
      .where('studentId', '==', studentId)
      .where('driveId', '==', driveId)
      .get();

    if (!existingEnrollment.empty) {
      throw new Error('Student is already enrolled in this drive');
    }

    // Create enrollment document
    const enrollmentData = {
      studentId,
      driveId,
      studentName: student.name,
      studentRollNumber: student.rollNumber,
      studentBranch: student.branch,
      studentCGPA: student.cgpa,
      companyName: drive.companyName,
      ctc: drive.ctc,
      status: ENROLLMENT_STATUS.ENROLLED,
      statusHistory: [{
        status: ENROLLMENT_STATUS.ENROLLED,
        timestamp: new Date().toISOString(),
        updatedBy: userId
      }],
      enrolledAt: new Date().toISOString(),
      enrolledBy: userId,
      eligibilityScore: eligibility.score,
      currentRound: 0,
      roundsCleared: [],
      remarks: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const enrollmentRef = await adminDb.collection('enrollments').add(enrollmentData);

    // Update drive's enrolled count
    await adminDb.collection('drives').doc(driveId).update({
      enrolledStudents: admin.firestore.FieldValue.increment(1),
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      enrollmentId: enrollmentRef.id,
      enrollment: { id: enrollmentRef.id, ...enrollmentData },
      message: `Successfully enrolled in ${drive.companyName}`
    };
  } catch (error) {
    console.error('Error enrolling student:', error);
    throw error;
  }
};

/**
 * Update enrollment status
 * 
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} newStatus - New status from ENROLLMENT_STATUS
 * @param {string} updatedBy - User making the update
 * @param {string} remarks - Optional remarks
 * @returns {Promise<Object>}
 */
export const updateEnrollmentStatus = async (enrollmentId, newStatus, updatedBy, remarks = '') => {
  try {
    const enrollmentRef = adminDb.collection('enrollments').doc(enrollmentId);
    const enrollmentDoc = await enrollmentRef.get();

    if (!enrollmentDoc.exists) {
      throw new Error('Enrollment not found');
    }

    const enrollment = enrollmentDoc.data();
    const previousStatus = enrollment.status;

    // Create status history entry
    const statusUpdate = {
      status: newStatus,
      previousStatus,
      timestamp: new Date().toISOString(),
      updatedBy,
      remarks
    };

    // Update enrollment
    await enrollmentRef.update({
      status: newStatus,
      statusHistory: admin.firestore.FieldValue.arrayUnion(statusUpdate),
      remarks: remarks || enrollment.remarks,
      updatedAt: new Date().toISOString()
    });

    // If student is selected, update placedStudents count
    if (newStatus === ENROLLMENT_STATUS.SELECTED || newStatus === ENROLLMENT_STATUS.OFFER_ACCEPTED) {
      await adminDb.collection('drives').doc(enrollment.driveId).update({
        placedStudents: admin.firestore.FieldValue.increment(1)
      });

      // Mark student as placed
      await adminDb.collection('students').doc(enrollment.studentId).update({
        isPlaced: true,
        placedCompany: enrollment.companyName,
        placedCTC: enrollment.ctc,
        placementDate: new Date().toISOString()
      });
    }

    return {
      success: true,
      enrollmentId,
      previousStatus,
      newStatus,
      message: `Status updated from ${previousStatus} to ${newStatus}`
    };
  } catch (error) {
    console.error('Error updating enrollment status:', error);
    throw error;
  }
};

/**
 * Update round status for enrollment
 * 
 * @param {string} enrollmentId - Enrollment ID
 * @param {number} roundNumber - Round number (1, 2, 3, etc.)
 * @param {boolean} cleared - Whether the round was cleared
 * @param {string} updatedBy - User making the update
 * @returns {Promise<Object>}
 */
export const updateRoundStatus = async (enrollmentId, roundNumber, cleared, updatedBy) => {
  try {
    const enrollmentRef = adminDb.collection('enrollments').doc(enrollmentId);
    const enrollmentDoc = await enrollmentRef.get();

    if (!enrollmentDoc.exists) {
      throw new Error('Enrollment not found');
    }

    const enrollment = enrollmentDoc.data();
    let newStatus = enrollment.status;

    if (cleared) {
      // Update status based on round
      switch (roundNumber) {
        case 1:
          newStatus = ENROLLMENT_STATUS.ROUND_1_CLEARED;
          break;
        case 2:
          newStatus = ENROLLMENT_STATUS.ROUND_2_CLEARED;
          break;
        case 3:
          newStatus = ENROLLMENT_STATUS.ROUND_3_CLEARED;
          break;
        default:
          newStatus = ENROLLMENT_STATUS.FINAL_ROUND;
      }

      await enrollmentRef.update({
        status: newStatus,
        currentRound: roundNumber,
        roundsCleared: admin.firestore.FieldValue.arrayUnion(roundNumber),
        statusHistory: admin.firestore.FieldValue.arrayUnion({
          status: newStatus,
          timestamp: new Date().toISOString(),
          updatedBy,
          remarks: `Cleared round ${roundNumber}`
        }),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Student didn't clear the round
      await enrollmentRef.update({
        status: ENROLLMENT_STATUS.REJECTED,
        statusHistory: admin.firestore.FieldValue.arrayUnion({
          status: ENROLLMENT_STATUS.REJECTED,
          timestamp: new Date().toISOString(),
          updatedBy,
          remarks: `Rejected at round ${roundNumber}`
        }),
        updatedAt: new Date().toISOString()
      });
    }

    return {
      success: true,
      enrollmentId,
      roundNumber,
      cleared,
      newStatus: cleared ? newStatus : ENROLLMENT_STATUS.REJECTED
    };
  } catch (error) {
    console.error('Error updating round status:', error);
    throw error;
  }
};

/**
 * Get all enrollments for a drive
 * 
 * @param {string} driveId - Drive ID
 * @param {Object} filters - Optional filters (status, branch, etc.)
 * @returns {Promise<Object>}
 */
export const getDriveEnrollments = async (driveId, filters = {}) => {
  try {
    let query = adminDb.collection('enrollments').where('driveId', '==', driveId);
    
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    const snapshot = await query.get();
    const enrollments = [];

    snapshot.forEach((doc) => {
      enrollments.push({ id: doc.id, ...doc.data() });
    });

    // Sort by status and eligibility score
    enrollments.sort((a, b) => {
      if (a.status === ENROLLMENT_STATUS.SELECTED && b.status !== ENROLLMENT_STATUS.SELECTED) return -1;
      if (b.status === ENROLLMENT_STATUS.SELECTED && a.status !== ENROLLMENT_STATUS.SELECTED) return 1;
      return (b.eligibilityScore || 0) - (a.eligibilityScore || 0);
    });

    // Calculate stats
    const statusCounts = {};
    enrollments.forEach(e => {
      statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
    });

    return {
      driveId,
      enrollments,
      total: enrollments.length,
      statusCounts,
      filters
    };
  } catch (error) {
    console.error('Error fetching drive enrollments:', error);
    throw error;
  }
};

/**
 * Get all enrollments for a student
 * 
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>}
 */
export const getStudentEnrollments = async (studentId) => {
  try {
    const snapshot = await adminDb.collection('enrollments')
      .where('studentId', '==', studentId)
      .orderBy('enrolledAt', 'desc')
      .get();

    const enrollments = [];
    snapshot.forEach((doc) => {
      enrollments.push({ id: doc.id, ...doc.data() });
    });

    return {
      studentId,
      enrollments,
      total: enrollments.length,
      activeEnrollments: enrollments.filter(e => 
        ![ENROLLMENT_STATUS.REJECTED, ENROLLMENT_STATUS.WITHDRAWN].includes(e.status)
      ).length
    };
  } catch (error) {
    console.error('Error fetching student enrollments:', error);
    throw error;
  }
};

/**
 * Withdraw enrollment
 * 
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} userId - User requesting withdrawal
 * @param {string} reason - Reason for withdrawal
 * @returns {Promise<Object>}
 */
export const withdrawEnrollment = async (enrollmentId, userId, reason = '') => {
  try {
    const enrollmentRef = adminDb.collection('enrollments').doc(enrollmentId);
    const enrollmentDoc = await enrollmentRef.get();

    if (!enrollmentDoc.exists) {
      throw new Error('Enrollment not found');
    }

    const enrollment = enrollmentDoc.data();

    // Can't withdraw if already selected or rejected
    if ([ENROLLMENT_STATUS.SELECTED, ENROLLMENT_STATUS.OFFER_ACCEPTED, ENROLLMENT_STATUS.JOINED].includes(enrollment.status)) {
      throw new Error('Cannot withdraw after selection');
    }

    await enrollmentRef.update({
      status: ENROLLMENT_STATUS.WITHDRAWN,
      statusHistory: admin.firestore.FieldValue.arrayUnion({
        status: ENROLLMENT_STATUS.WITHDRAWN,
        timestamp: new Date().toISOString(),
        updatedBy: userId,
        remarks: reason
      }),
      withdrawnAt: new Date().toISOString(),
      withdrawnBy: userId,
      withdrawalReason: reason,
      updatedAt: new Date().toISOString()
    });

    // Update drive enrolled count
    await adminDb.collection('drives').doc(enrollment.driveId).update({
      enrolledStudents: admin.firestore.FieldValue.increment(-1)
    });

    return {
      success: true,
      message: 'Enrollment withdrawn successfully'
    };
  } catch (error) {
    console.error('Error withdrawing enrollment:', error);
    throw error;
  }
};

export default {
  ENROLLMENT_STATUS,
  enrollStudent,
  updateEnrollmentStatus,
  updateRoundStatus,
  getDriveEnrollments,
  getStudentEnrollments,
  withdrawEnrollment
};
