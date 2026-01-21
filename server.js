/**
 * Placement Drive Management System - Backend Server
 * 
 * Comprehensive backend API for placement management including:
 * - Authentication and authorization
 * - Student management
 * - Drive management
 * - Enrollment tracking
 * - Analytics and reporting
 * - Resume generation
 * 
 * Environment Variables:
 * - PORT: Server port (default: 5001)
 * - NODE_ENV: Environment (development/production)
 * - FIREBASE_PROJECT_ID: Firebase project ID
 * - FIREBASE_CLIENT_EMAIL: Firebase service account email
 * - FIREBASE_PRIVATE_KEY: Firebase private key
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { transformStudentDataToResume } from './src/services/resumeGenerationService.js';

// Import routes
import facultyRoutes from './src/routes/facultyRoutes.js';
import studentRoutes from './src/routes/studentRoutes.js';

// Import middleware
import { optionalAuth } from './src/middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5173;

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',    // placement-frontend (React)
    'http://localhost:5173',    // this API server
    process.env.FRONTEND_URL    // production frontend URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// HEALTH CHECK & API DOCS
// ============================================

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'Placement Management API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      faculty: '/api/faculty/*',
      student: '/api/student/*',
      resume: '/api/generate-resume'
    }
  });
});

/**
 * API Documentation endpoint
 */
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Placement Management API',
    version: '2.0.0',
    authentication: 'Bearer token in Authorization header',
    endpoints: {
      faculty: '/api/faculty/* (dashboard, students, drives, enrollments, analytics)',
      student: '/api/student/* (profile, drives, enrollments)',
      resume: '/api/generate-resume, /api/prepare-resume, /api/templates'
    }
  });
});

// ============================================
// API ROUTES
// ============================================

// Faculty/TPO Routes
app.use('/api/faculty', facultyRoutes);

// Student Routes
app.use('/api/student', studentRoutes);

// ============================================
// RESUME GENERATION ENDPOINTS
// ============================================

/**
 * POST /api/generate-resume
 * Generate a resume PDF from student data
 */
app.post('/api/generate-resume', optionalAuth, async (req, res) => {
  try {
    const { studentData, driveData, template = 'ats-classic' } = req.body;

    if (!studentData) {
      return res.status(400).json({ 
        error: 'Student data is required',
        message: 'Please provide studentData in the request body'
      });
    }

    if (!studentData.name && !studentData.contact?.fullName) {
      return res.status(400).json({ 
        error: 'Student name is required',
        message: 'studentData must include a name field'
      });
    }

    console.log(`[Resume API] Generating resume for: ${studentData.name || studentData.contact?.fullName}`);

    const resumeData = transformStudentDataToResume(studentData, driveData);
    
    res.json({
      success: true,
      resumeData,
      template,
      message: 'Resume data prepared. Generate PDF on client side using html2pdf.js'
    });

  } catch (error) {
    console.error('[Resume API] Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate resume',
      message: error.message
    });
  }
});

/**
 * POST /api/prepare-resume
 * Prepare resume data for frontend PDF generation
 */
app.post('/api/prepare-resume', optionalAuth, async (req, res) => {
  try {
    const { studentData, driveData } = req.body;

    if (!studentData) {
      return res.status(400).json({ error: 'Student data is required' });
    }

    const resumeData = transformStudentDataToResume(studentData, driveData);

    res.json({
      success: true,
      resumeData,
      message: 'Resume data prepared successfully'
    });

  } catch (error) {
    console.error('[Prepare Resume API] Error:', error);
    res.status(500).json({ 
      error: 'Failed to prepare resume data',
      message: error.message
    });
  }
});

/**
 * GET /api/templates
 * Get list of available resume templates
 */
app.get('/api/templates', (req, res) => {
  res.json({
    templates: [
      {
        id: 'ats-classic',
        name: 'ATS Classic',
        description: 'Simple, single-column, black & white ATS-friendly format',
        recommended: true
      },
      {
        id: 'modern-professional',
        name: 'Modern Professional',
        description: 'Clean professional template with accent colors',
        recommended: false
      }
    ]
  });
});

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
    hint: 'Visit /api/docs for available endpoints'
  });
});

// ============================================
// SERVER STARTUP
// ============================================

app.listen(PORT, () => {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║     Placement Management System - Backend API                 ║');
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log(`║  Status: Running on port ${PORT}                                 ║`);
  console.log(`║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(42)}  ║`);
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log('║  API Endpoints:                                               ║');
  console.log('║  • GET  /api/health          - Health check                   ║');
  console.log('║  • GET  /api/docs            - API documentation              ║');
  console.log('║  • /api/faculty/*            - Faculty/TPO endpoints          ║');
  console.log('║  • /api/student/*            - Student endpoints              ║');
  console.log('║  • POST /api/generate-resume - Resume generation              ║');
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log('║  Features:                                                    ║');
  console.log('║  ✓ Firebase Admin SDK authentication                          ║');
  console.log('║  ✓ Role-based access control                                  ║');
  console.log('║  ✓ Eligibility computation engine                             ║');
  console.log('║  ✓ Enrollment tracking system                                 ║');
  console.log('║  ✓ Server-side analytics                                      ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
});

export default app;
