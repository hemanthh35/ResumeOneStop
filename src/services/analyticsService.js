/**
 * Analytics Service
 * 
 * Server-side analytics computation for:
 * - Dashboard KPIs
 * - Placement statistics
 * - Branch-wise/Year-wise reports
 * - Company-wise analytics
 * - Trend analysis
 */

import { adminDb } from '../config/firebase-admin.js';
import { ENROLLMENT_STATUS } from './enrollmentService.js';

/**
 * Get comprehensive dashboard statistics
 * 
 * @returns {Promise<Object>}
 */
export const getDashboardStats = async () => {
  try {
    // Fetch all data in parallel
    const [studentsSnap, drivesSnap, enrollmentsSnap] = await Promise.all([
      adminDb.collection('students').get(),
      adminDb.collection('drives').get(),
      adminDb.collection('enrollments').get()
    ]);

    // Process students
    let totalStudents = 0;
    let placedStudents = 0;
    const branchWiseStudents = {};
    const yearWiseStudents = {};

    studentsSnap.forEach((doc) => {
      const student = doc.data();
      totalStudents++;
      
      if (student.isPlaced) {
        placedStudents++;
      }

      // Branch-wise count
      const branch = student.branch || 'Unknown';
      branchWiseStudents[branch] = (branchWiseStudents[branch] || 0) + 1;

      // Year-wise count
      const year = student.year || 'Unknown';
      yearWiseStudents[year] = (yearWiseStudents[year] || 0) + 1;
    });

    // Process drives
    let totalDrives = 0;
    let activeDrives = 0;
    let totalPlacements = 0;
    let totalCTCOffered = 0;
    let highestCTC = 0;
    let lowestCTC = Infinity;
    const companyWiseData = [];

    drivesSnap.forEach((doc) => {
      const drive = doc.data();
      totalDrives++;
      
      if (drive.status === 'Upcoming' || drive.status === 'Ongoing') {
        activeDrives++;
      }

      const placed = drive.placedStudents || 0;
      totalPlacements += placed;

      if (drive.ctc) {
        const ctc = parseFloat(drive.ctc);
        totalCTCOffered += ctc * placed;
        if (ctc > highestCTC) highestCTC = ctc;
        if (ctc < lowestCTC && ctc > 0) lowestCTC = ctc;
      }

      companyWiseData.push({
        id: doc.id,
        company: drive.companyName,
        ctc: drive.ctc,
        enrolled: drive.enrolledStudents || 0,
        placed: placed,
        status: drive.status
      });
    });

    // Process enrollments
    const enrollmentStatusCounts = {};
    let totalEnrollments = 0;

    enrollmentsSnap.forEach((doc) => {
      const enrollment = doc.data();
      totalEnrollments++;
      enrollmentStatusCounts[enrollment.status] = (enrollmentStatusCounts[enrollment.status] || 0) + 1;
    });

    // Calculate averages and percentages
    const avgCTC = totalPlacements > 0 ? (totalCTCOffered / totalPlacements).toFixed(2) : 0;
    const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(2) : 0;

    return {
      overview: {
        totalStudents,
        placedStudents,
        unplacedStudents: totalStudents - placedStudents,
        placementRate: parseFloat(placementRate),
        totalDrives,
        activeDrives,
        completedDrives: totalDrives - activeDrives,
        totalPlacements,
        totalEnrollments
      },
      ctcStats: {
        avgCTC: parseFloat(avgCTC),
        highestCTC: highestCTC === 0 ? 0 : highestCTC,
        lowestCTC: lowestCTC === Infinity ? 0 : lowestCTC,
        totalOffered: totalCTCOffered.toFixed(2)
      },
      distribution: {
        branchWise: branchWiseStudents,
        yearWise: yearWiseStudents,
        enrollmentStatus: enrollmentStatusCounts
      },
      companyWise: companyWiseData.sort((a, b) => (b.placed || 0) - (a.placed || 0)),
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error computing dashboard stats:', error);
    throw error;
  }
};

/**
 * Get branch-wise placement analytics
 * 
 * @returns {Promise<Object>}
 */
export const getBranchWiseAnalytics = async () => {
  try {
    const studentsSnap = await adminDb.collection('students').get();
    
    const branchData = {};

    studentsSnap.forEach((doc) => {
      const student = doc.data();
      const branch = student.branch || 'Unknown';
      
      if (!branchData[branch]) {
        branchData[branch] = {
          total: 0,
          placed: 0,
          avgCGPA: 0,
          totalCGPA: 0,
          highestCTC: 0,
          totalCTC: 0
        };
      }

      branchData[branch].total++;
      
      if (student.cgpa) {
        branchData[branch].totalCGPA += parseFloat(student.cgpa);
      }

      if (student.isPlaced) {
        branchData[branch].placed++;
        if (student.placedCTC) {
          const ctc = parseFloat(student.placedCTC);
          branchData[branch].totalCTC += ctc;
          if (ctc > branchData[branch].highestCTC) {
            branchData[branch].highestCTC = ctc;
          }
        }
      }
    });

    // Calculate averages
    const analytics = Object.entries(branchData).map(([branch, data]) => ({
      branch,
      total: data.total,
      placed: data.placed,
      unplaced: data.total - data.placed,
      placementRate: data.total > 0 ? ((data.placed / data.total) * 100).toFixed(2) : 0,
      avgCGPA: data.total > 0 ? (data.totalCGPA / data.total).toFixed(2) : 0,
      avgCTC: data.placed > 0 ? (data.totalCTC / data.placed).toFixed(2) : 0,
      highestCTC: data.highestCTC
    }));

    return {
      branchAnalytics: analytics.sort((a, b) => b.total - a.total),
      totalBranches: analytics.length,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error computing branch analytics:', error);
    throw error;
  }
};

/**
 * Get drive-specific analytics
 * 
 * @param {string} driveId - Drive ID
 * @returns {Promise<Object>}
 */
export const getDriveAnalytics = async (driveId) => {
  try {
    const [driveDoc, enrollmentsSnap] = await Promise.all([
      adminDb.collection('drives').doc(driveId).get(),
      adminDb.collection('enrollments').where('driveId', '==', driveId).get()
    ]);

    if (!driveDoc.exists) {
      throw new Error('Drive not found');
    }

    const drive = { id: driveDoc.id, ...driveDoc.data() };
    
    // Process enrollments
    const statusCounts = {};
    const branchWise = {};
    const roundWise = { round1: 0, round2: 0, round3: 0, final: 0 };
    let totalCGPA = 0;
    let enrollmentCount = 0;

    enrollmentsSnap.forEach((doc) => {
      const enrollment = doc.data();
      enrollmentCount++;
      
      // Status counts
      statusCounts[enrollment.status] = (statusCounts[enrollment.status] || 0) + 1;
      
      // Branch-wise
      const branch = enrollment.studentBranch || 'Unknown';
      if (!branchWise[branch]) {
        branchWise[branch] = { enrolled: 0, selected: 0 };
      }
      branchWise[branch].enrolled++;
      if (enrollment.status === ENROLLMENT_STATUS.SELECTED || 
          enrollment.status === ENROLLMENT_STATUS.OFFER_ACCEPTED) {
        branchWise[branch].selected++;
      }

      // Round-wise
      if (enrollment.roundsCleared) {
        if (enrollment.roundsCleared.includes(1)) roundWise.round1++;
        if (enrollment.roundsCleared.includes(2)) roundWise.round2++;
        if (enrollment.roundsCleared.includes(3)) roundWise.round3++;
      }
      if ([ENROLLMENT_STATUS.SELECTED, ENROLLMENT_STATUS.OFFER_ACCEPTED, ENROLLMENT_STATUS.FINAL_ROUND]
          .includes(enrollment.status)) {
        roundWise.final++;
      }

      // CGPA tracking
      if (enrollment.studentCGPA) {
        totalCGPA += parseFloat(enrollment.studentCGPA);
      }
    });

    const selectedCount = (statusCounts[ENROLLMENT_STATUS.SELECTED] || 0) + 
                         (statusCounts[ENROLLMENT_STATUS.OFFER_ACCEPTED] || 0);

    return {
      drive,
      enrollmentStats: {
        total: enrollmentCount,
        statusCounts,
        selected: selectedCount,
        selectionRate: enrollmentCount > 0 ? ((selectedCount / enrollmentCount) * 100).toFixed(2) : 0,
        avgCGPA: enrollmentCount > 0 ? (totalCGPA / enrollmentCount).toFixed(2) : 0
      },
      branchWise: Object.entries(branchWise).map(([branch, data]) => ({
        branch,
        ...data,
        selectionRate: data.enrolled > 0 ? ((data.selected / data.enrolled) * 100).toFixed(2) : 0
      })),
      roundWise,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error computing drive analytics:', error);
    throw error;
  }
};

/**
 * Get placement trends over time
 * 
 * @param {number} months - Number of months to analyze (default 12)
 * @returns {Promise<Object>}
 */
export const getPlacementTrends = async (months = 12) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const studentsSnap = await adminDb.collection('students')
      .where('isPlaced', '==', true)
      .get();

    const monthlyData = {};
    
    studentsSnap.forEach((doc) => {
      const student = doc.data();
      if (student.placementDate) {
        const date = new Date(student.placementDate);
        if (date >= cutoffDate) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { count: 0, totalCTC: 0 };
          }
          monthlyData[monthKey].count++;
          if (student.placedCTC) {
            monthlyData[monthKey].totalCTC += parseFloat(student.placedCTC);
          }
        }
      }
    });

    const trends = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        placements: data.count,
        avgCTC: data.count > 0 ? (data.totalCTC / data.count).toFixed(2) : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      trends,
      period: `Last ${months} months`,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error computing placement trends:', error);
    throw error;
  }
};

/**
 * Export analytics data for reports
 * 
 * @param {string} type - Report type (students, drives, enrollments)
 * @returns {Promise<Object>}
 */
export const exportAnalyticsData = async (type = 'all') => {
  try {
    const data = {};

    if (type === 'all' || type === 'students') {
      const studentsSnap = await adminDb.collection('students').get();
      data.students = [];
      studentsSnap.forEach(doc => {
        const student = doc.data();
        data.students.push({
          rollNumber: student.rollNumber,
          name: student.name,
          branch: student.branch,
          year: student.year,
          cgpa: student.cgpa,
          isPlaced: student.isPlaced || false,
          placedCompany: student.placedCompany || '',
          placedCTC: student.placedCTC || ''
        });
      });
    }

    if (type === 'all' || type === 'drives') {
      const drivesSnap = await adminDb.collection('drives').get();
      data.drives = [];
      drivesSnap.forEach(doc => {
        const drive = doc.data();
        data.drives.push({
          companyName: drive.companyName,
          ctc: drive.ctc,
          driveDate: drive.driveDate,
          status: drive.status,
          enrolledStudents: drive.enrolledStudents || 0,
          placedStudents: drive.placedStudents || 0
        });
      });
    }

    if (type === 'all' || type === 'enrollments') {
      const enrollmentsSnap = await adminDb.collection('enrollments').get();
      data.enrollments = [];
      enrollmentsSnap.forEach(doc => {
        const enrollment = doc.data();
        data.enrollments.push({
          studentName: enrollment.studentName,
          rollNumber: enrollment.studentRollNumber,
          company: enrollment.companyName,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt
        });
      });
    }

    return {
      exportedAt: new Date().toISOString(),
      type,
      ...data
    };
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    throw error;
  }
};

export default {
  getDashboardStats,
  getBranchWiseAnalytics,
  getDriveAnalytics,
  getPlacementTrends,
  exportAnalyticsData
};
