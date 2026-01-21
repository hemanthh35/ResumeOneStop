/**
 * Seed Script - Populate Database with Dummy Data
 * 
 * Run this script to create sample faculty, students, and drives for testing.
 * 
 * Usage: 
 *   cd placement-backend
 *   node scripts/seedData.js
 */

import { adminDb } from '../src/config/firebase-admin.js';
import admin from 'firebase-admin';

// ============================================
// DUMMY DATA
// ============================================

const facultyUsers = [
    {
        id: 'faculty_001',
        email: 'tpo@college.edu',
        name: 'Dr. Rajesh Kumar',
        role: 'faculty',
        department: 'Training & Placement',
        designation: 'Training & Placement Officer',
        phone: '9876543210'
    },
    {
        id: 'faculty_002',
        email: 'coordinator@college.edu',
        name: 'Prof. Priya Sharma',
        role: 'faculty',
        department: 'Computer Science',
        designation: 'Placement Coordinator',
        phone: '9876543211'
    }
];

const students = [
    // Computer Science Students
    { rollNumber: 'CS2021001', name: 'Rahul Verma', email: 'rahul.verma@student.edu', branch: 'Computer Science', year: '4', section: 'A', cgpa: '8.5', skills: 'Python, JavaScript, React, Node.js, MongoDB', projects: 'E-commerce Website: Built full-stack e-commerce platform with React and Node.js\n\nChat Application: Real-time chat app using Socket.io', internships: 'Software Intern at TCS (3 months)', certifications: 'AWS Cloud Practitioner, Google Analytics', achievements: 'Winner - College Hackathon 2023' },
    { rollNumber: 'CS2021002', name: 'Sneha Patel', email: 'sneha.patel@student.edu', branch: 'Computer Science', year: '4', section: 'A', cgpa: '9.1', skills: 'Java, Spring Boot, MySQL, Docker, Kubernetes', projects: 'Microservices Architecture: Built scalable microservices with Spring Boot\n\nInventory Management System: Enterprise inventory solution', internships: 'Backend Developer Intern at Infosys (6 months)', certifications: 'Oracle Java Certified, Docker Certified Associate', achievements: 'Published research paper on cloud computing' },
    { rollNumber: 'CS2021003', name: 'Amit Singh', email: 'amit.singh@student.edu', branch: 'Computer Science', year: '4', section: 'A', cgpa: '7.8', skills: 'Python, Machine Learning, TensorFlow, Data Analysis', projects: 'Sentiment Analysis Tool: ML-based sentiment analyzer for social media\n\nStock Price Predictor: LSTM-based stock prediction model', internships: 'Data Science Intern at Wipro (3 months)', certifications: 'Google TensorFlow Developer', achievements: 'Top 10 in Kaggle competition' },
    { rollNumber: 'CS2021004', name: 'Priya Reddy', email: 'priya.reddy@student.edu', branch: 'Computer Science', year: '4', section: 'B', cgpa: '8.9', skills: 'React, TypeScript, GraphQL, AWS, Firebase', projects: 'Social Media Dashboard: Analytics dashboard for social media managers\n\nTask Management App: Kanban-style project management tool', internships: 'Frontend Developer at Accenture (4 months)', certifications: 'AWS Solutions Architect', achievements: 'Best Project Award - Final Year' },
    { rollNumber: 'CS2021005', name: 'Vikram Joshi', email: 'vikram.joshi@student.edu', branch: 'Computer Science', year: '4', section: 'B', cgpa: '7.2', skills: 'C++, Python, Competitive Programming, DSA', projects: 'Online Judge Platform: Competitive programming platform\n\nAlgorithm Visualizer: Interactive DSA visualization tool', internships: '', certifications: 'HackerRank Problem Solving', achievements: '3-star CodeChef, 1500+ rating on Codeforces' },
    { rollNumber: 'CS2021006', name: 'Ananya Gupta', email: 'ananya.gupta@student.edu', branch: 'Computer Science', year: '4', section: 'B', cgpa: '8.3', skills: 'Android, Kotlin, Flutter, Firebase, REST APIs', projects: 'Food Delivery App: Full-featured delivery app with real-time tracking\n\nFitness Tracker: Health and workout tracking application', internships: 'Mobile App Developer at Deloitte (5 months)', certifications: 'Google Associate Android Developer', achievements: 'Published 2 apps on Play Store with 10K+ downloads' },

    // Information Technology Students
    { rollNumber: 'IT2021001', name: 'Rohan Mehta', email: 'rohan.mehta@student.edu', branch: 'Information Technology', year: '4', section: 'A', cgpa: '8.0', skills: 'Python, Django, PostgreSQL, Redis, Docker', projects: 'Blog Platform: Multi-tenant blogging platform with Django\n\nAPI Gateway: Custom API gateway with rate limiting', internships: 'Backend Intern at Cognizant (3 months)', certifications: 'Red Hat Certified System Administrator', achievements: 'Open source contributor to Django' },
    { rollNumber: 'IT2021002', name: 'Kavya Nair', email: 'kavya.nair@student.edu', branch: 'Information Technology', year: '4', section: 'A', cgpa: '8.7', skills: 'JavaScript, Vue.js, Node.js, MongoDB, AWS', projects: 'Learning Management System: Online course platform\n\nEvent Booking System: Ticket booking with payment integration', internships: 'Full Stack Developer at Tech Mahindra (4 months)', certifications: 'MongoDB Certified Developer', achievements: 'Winner - Smart India Hackathon regional round' },
    { rollNumber: 'IT2021003', name: 'Suresh Kumar', email: 'suresh.kumar@student.edu', branch: 'Information Technology', year: '4', section: 'A', cgpa: '7.5', skills: 'PHP, Laravel, MySQL, JavaScript, Bootstrap', projects: 'Hospital Management System: Complete HMS with appointment booking\n\nE-learning Portal: Online education platform', internships: 'Web Developer Intern at HCL (3 months)', certifications: 'Zend PHP Certified Engineer', achievements: '' },
    { rollNumber: 'IT2021004', name: 'Meera Krishnan', email: 'meera.k@student.edu', branch: 'Information Technology', year: '4', section: 'B', cgpa: '9.0', skills: 'Java, Spring, Hibernate, Oracle, Microservices', projects: 'Banking Application: Core banking system simulation\n\nPayment Gateway Integration: Multi-provider payment solution', internships: 'Java Developer at Capgemini (6 months)', certifications: 'Spring Professional Certification', achievements: 'University topper in DBMS' },

    // Electronics Students
    { rollNumber: 'EC2021001', name: 'Arjun Rao', email: 'arjun.rao@student.edu', branch: 'Electronics', year: '4', section: 'A', cgpa: '8.2', skills: 'Embedded C, VHDL, ARM, IoT, PCB Design', projects: 'Smart Home System: IoT-based home automation\n\nDrone Controller: Custom flight controller with GPS', internships: 'Embedded Systems Intern at Bosch (4 months)', certifications: 'ARM Accredited Engineer', achievements: 'Patent filed for IoT device' },
    { rollNumber: 'EC2021002', name: 'Divya Sharma', email: 'divya.sharma@student.edu', branch: 'Electronics', year: '4', section: 'A', cgpa: '7.9', skills: 'MATLAB, Signal Processing, Python, Arduino', projects: 'Voice Recognition System: Real-time speech processing\n\nHealth Monitoring Device: Wearable health tracker', internships: 'R&D Intern at Texas Instruments (3 months)', certifications: 'MATLAB Certified', achievements: 'Best Innovation Award - Tech Fest' },

    // Mechanical Students
    { rollNumber: 'ME2021001', name: 'Karthik Iyer', email: 'karthik.iyer@student.edu', branch: 'Mechanical', year: '4', section: 'A', cgpa: '7.6', skills: 'AutoCAD, SolidWorks, ANSYS, CNC Programming', projects: 'Automated Assembly Line: Industry 4.0 assembly simulation\n\nHeat Exchanger Design: Optimized heat exchanger for efficiency', internships: 'Design Engineer Intern at L&T (3 months)', certifications: 'SolidWorks CSWA', achievements: '' },
    { rollNumber: 'ME2021002', name: 'Lakshmi Menon', email: 'lakshmi.menon@student.edu', branch: 'Mechanical', year: '4', section: 'A', cgpa: '8.4', skills: 'CATIA, Fusion 360, 3D Printing, FEA Analysis', projects: 'Electric Vehicle Chassis: Lightweight EV frame design\n\nRobotic Arm: 6-DOF industrial robotic arm', internships: 'Product Design Intern at Tata Motors (4 months)', certifications: 'CATIA V5 Certified', achievements: 'SAE BAJA competition participant' }
];

const drives = [
    {
        id: 'drive_001',
        companyName: 'Tata Consultancy Services',
        ctc: '7.5',
        driveDate: '2026-02-15',
        minCGPA: 7.0,
        eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics'],
        eligibleYears: ['4'],
        jobRole: 'Software Developer',
        jobDescription: 'Looking for passionate software developers with strong programming skills. Experience in Java, Python, or JavaScript preferred. Must have good problem-solving abilities.',
        status: 'Upcoming',
        enrolledStudents: 8,
        placedStudents: 0,
        rounds: ['Online Test', 'Technical Interview', 'HR Interview'],
        registrationDeadline: '2026-02-10'
    },
    {
        id: 'drive_002',
        companyName: 'Infosys',
        ctc: '6.5',
        driveDate: '2026-02-20',
        minCGPA: 6.5,
        eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'],
        eligibleYears: ['4'],
        jobRole: 'Systems Engineer',
        jobDescription: 'Seeking fresh graduates for Systems Engineer role. Training will be provided. Strong fundamentals in programming and databases required.',
        status: 'Upcoming',
        enrolledStudents: 12,
        placedStudents: 0,
        rounds: ['Aptitude Test', 'Technical Interview', 'HR Interview'],
        registrationDeadline: '2026-02-15'
    },
    {
        id: 'drive_003',
        companyName: 'Wipro',
        ctc: '5.5',
        driveDate: '2026-01-25',
        minCGPA: 6.0,
        eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'],
        eligibleYears: ['4'],
        jobRole: 'Project Engineer',
        jobDescription: 'Entry-level position for engineering graduates. Focus on project management and technical execution. Good communication skills required.',
        status: 'Ongoing',
        enrolledStudents: 15,
        placedStudents: 4,
        rounds: ['Online Assessment', 'Technical Round', 'HR Round'],
        registrationDeadline: '2026-01-20'
    },
    {
        id: 'drive_004',
        companyName: 'Google (via Pool Campus)',
        ctc: '25.0',
        driveDate: '2026-03-10',
        minCGPA: 8.0,
        eligibleBranches: ['Computer Science', 'Information Technology'],
        eligibleYears: ['4'],
        jobRole: 'Software Engineer',
        jobDescription: 'Looking for exceptional engineers with strong CS fundamentals. Must have experience in Data Structures, Algorithms, and System Design. Open source contributions are a plus.',
        status: 'Upcoming',
        enrolledStudents: 5,
        placedStudents: 0,
        rounds: ['Online Coding Round', 'Technical Interview 1', 'Technical Interview 2', 'Hiring Committee'],
        registrationDeadline: '2026-03-01'
    },
    {
        id: 'drive_005',
        companyName: 'Amazon',
        ctc: '18.0',
        driveDate: '2026-03-05',
        minCGPA: 7.5,
        eligibleBranches: ['Computer Science', 'Information Technology'],
        eligibleYears: ['4'],
        jobRole: 'SDE I',
        jobDescription: 'Software Development Engineer role at Amazon. Strong problem-solving skills required. Experience with distributed systems is preferred.',
        status: 'Upcoming',
        enrolledStudents: 6,
        placedStudents: 0,
        rounds: ['Online Assessment', 'Technical Interview 1', 'Technical Interview 2', 'Bar Raiser'],
        registrationDeadline: '2026-02-25'
    },
    {
        id: 'drive_006',
        companyName: 'Accenture',
        ctc: '4.5',
        driveDate: '2026-01-10',
        minCGPA: 6.0,
        eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'],
        eligibleYears: ['4'],
        jobRole: 'Associate Software Engineer',
        jobDescription: 'Entry-level software development role. Training provided. Looking for candidates with good analytical and communication skills.',
        status: 'Results Published',
        enrolledStudents: 20,
        placedStudents: 8,
        rounds: ['Cognitive Assessment', 'Coding Round', 'Interview'],
        registrationDeadline: '2026-01-05'
    },
    {
        id: 'drive_007',
        companyName: 'Capgemini',
        ctc: '4.0',
        driveDate: '2026-01-08',
        minCGPA: 6.0,
        eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'],
        eligibleYears: ['4'],
        jobRole: 'Analyst',
        jobDescription: 'Hiring for Analyst position. Focus on business analysis and technical solutions. Good presentation skills required.',
        status: 'Results Published',
        enrolledStudents: 18,
        placedStudents: 6,
        rounds: ['Written Test', 'Group Discussion', 'Technical Interview', 'HR Interview'],
        registrationDeadline: '2026-01-03'
    }
];

// Sample enrollments for some students in completed drives
const enrollments = [
    // Accenture enrollments (Results Published)
    { studentId: 'CS2021001', driveId: 'drive_006', status: 'selected', companyName: 'Accenture' },
    { studentId: 'CS2021003', driveId: 'drive_006', status: 'selected', companyName: 'Accenture' },
    { studentId: 'IT2021001', driveId: 'drive_006', status: 'selected', companyName: 'Accenture' },
    { studentId: 'IT2021003', driveId: 'drive_006', status: 'selected', companyName: 'Accenture' },
    { studentId: 'CS2021005', driveId: 'drive_006', status: 'rejected', companyName: 'Accenture' },
    { studentId: 'EC2021002', driveId: 'drive_006', status: 'selected', companyName: 'Accenture' },
    { studentId: 'ME2021001', driveId: 'drive_006', status: 'selected', companyName: 'Accenture' },
    { studentId: 'ME2021002', driveId: 'drive_006', status: 'selected', companyName: 'Accenture' },
    { studentId: 'IT2021002', driveId: 'drive_006', status: 'selected', companyName: 'Accenture' },

    // Capgemini enrollments (Results Published)
    { studentId: 'CS2021002', driveId: 'drive_007', status: 'selected', companyName: 'Capgemini' },
    { studentId: 'CS2021004', driveId: 'drive_007', status: 'selected', companyName: 'Capgemini' },
    { studentId: 'CS2021006', driveId: 'drive_007', status: 'selected', companyName: 'Capgemini' },
    { studentId: 'IT2021004', driveId: 'drive_007', status: 'selected', companyName: 'Capgemini' },
    { studentId: 'EC2021001', driveId: 'drive_007', status: 'selected', companyName: 'Capgemini' },
    { studentId: 'CS2021005', driveId: 'drive_007', status: 'selected', companyName: 'Capgemini' },

    // Wipro enrollments (Ongoing)
    { studentId: 'CS2021001', driveId: 'drive_003', status: 'round_2_cleared', companyName: 'Wipro' },
    { studentId: 'IT2021001', driveId: 'drive_003', status: 'enrolled', companyName: 'Wipro' },
    { studentId: 'IT2021002', driveId: 'drive_003', status: 'round_1_cleared', companyName: 'Wipro' },
    { studentId: 'EC2021002', driveId: 'drive_003', status: 'enrolled', companyName: 'Wipro' },
];

// ============================================
// SEED FUNCTIONS
// ============================================

async function seedFacultyUsers() {
    console.log('📚 Seeding faculty users...');
    const batch = adminDb.batch();

    for (const faculty of facultyUsers) {
        const ref = adminDb.collection('users').doc(faculty.id);
        batch.set(ref, {
            ...faculty,
            createdAt: new Date().toISOString()
        });
    }

    await batch.commit();
    console.log(`✅ Created ${facultyUsers.length} faculty users`);
}

async function seedStudents() {
    console.log('👨‍🎓 Seeding students...');
    const batch = adminDb.batch();

    for (const student of students) {
        const studentId = student.rollNumber.replace(/\s+/g, '_');
        const ref = adminDb.collection('students').doc(studentId);
        batch.set(ref, {
            ...student,
            isPlaced: false,
            createdAt: new Date().toISOString()
        });
    }

    await batch.commit();
    console.log(`✅ Created ${students.length} students`);
}

async function seedDrives() {
    console.log('🏢 Seeding placement drives...');
    const batch = adminDb.batch();

    for (const drive of drives) {
        const ref = adminDb.collection('drives').doc(drive.id);
        batch.set(ref, {
            ...drive,
            createdAt: new Date().toISOString()
        });
    }

    await batch.commit();
    console.log(`✅ Created ${drives.length} drives`);
}

async function seedEnrollments() {
    console.log('📝 Seeding enrollments...');
    const batch = adminDb.batch();

    for (const enrollment of enrollments) {
        const enrollmentId = `${enrollment.studentId}_${enrollment.driveId}`;
        const ref = adminDb.collection('enrollments').doc(enrollmentId);

        // Get student details
        const student = students.find(s => s.rollNumber === enrollment.studentId);

        batch.set(ref, {
            ...enrollment,
            studentName: student?.name || '',
            studentRollNumber: enrollment.studentId,
            studentBranch: student?.branch || '',
            enrolledAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            statusHistory: [{
                status: enrollment.status,
                timestamp: new Date().toISOString(),
                note: 'Seeded data'
            }]
        });

        // Update student as placed if selected
        if (enrollment.status === 'selected') {
            const studentRef = adminDb.collection('students').doc(enrollment.studentId);
            const drive = drives.find(d => d.id === enrollment.driveId);
            batch.update(studentRef, {
                isPlaced: true,
                placedCompany: enrollment.companyName,
                placedCTC: drive?.ctc || 0,
                placementDate: new Date().toISOString()
            });
        }
    }

    await batch.commit();
    console.log(`✅ Created ${enrollments.length} enrollments`);
}

async function runSeed() {
    console.log('🌱 Starting database seed...\n');

    try {
        await seedFacultyUsers();
        await seedStudents();
        await seedDrives();
        await seedEnrollments();

        console.log('\n🎉 Database seeding complete!');
        console.log('\n📊 Summary:');
        console.log(`   - ${facultyUsers.length} faculty users`);
        console.log(`   - ${students.length} students`);
        console.log(`   - ${drives.length} placement drives`);
        console.log(`   - ${enrollments.length} enrollments`);
        console.log('\n💡 You can now login with the seeded faculty accounts or test student features.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

// Run the seed
runSeed();
