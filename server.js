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

import 'dotenv/config';
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
const PORT = process.env.PORT || 5001;

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
// ATS SCORING ENDPOINT
// ============================================

/**
 * POST /api/ats-score
 * Analyze resume text for ATS compatibility
 * Requires OPENROUTER_API_KEY environment variable
 */
app.post('/api/ats-score', async (req, res) => {
  try {
    const { resumeText } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        error: 'Resume text is required',
        message: 'Please provide resume text with at least 50 characters'
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'API key not configured',
        message: 'OPENROUTER_API_KEY environment variable is not set'
      });
    }

    console.log(`[ATS API] Analyzing resume (${resumeText.length} chars)`);

    const systemPrompt = `You are an ATS analyzer. Analyze the resume and provide ONLY the score, grade, and brief analysis. No markdown, no asterisks, plain text only.

OUTPUT FORMAT (EXACTLY AS SHOWN):

ATS SCORE: [0-100]

GRADE: [A+/A/B+/B/C+/C/D/F]

STRENGTHS:
1. [First strength]
2. [Second strength]
3. [Third strength]

CRITICAL ISSUES:
1. [First issue]
2. [Second issue]
3. [Third issue]

RECOMMENDATIONS:
1. [First recommendation]
2. [Second recommendation]
3. [Third recommendation]
4. [Fourth recommendation]
5. [Fifth recommendation]

KEYWORDS FOUND: [number]

MISSING KEYWORDS: [list 5-7 important keywords]

Be concise. No formatting. Plain text only.`;

    const userPrompt = `Analyze this resume quickly:

${resumeText.substring(0, 12000)}

Provide analysis in the exact format specified. Be concise.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'PlacementPro ATS Scorer'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const result = await response.json();
    const analysis = result.choices?.[0]?.message?.content || 'No analysis generated.';

    // Parse the response
    const scoreMatch = analysis.match(/ATS SCORE:\s*(\d+)/i);
    const gradeMatch = analysis.match(/GRADE:\s*([A-F][+]?)/i);

    res.json({
      success: true,
      score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
      grade: gradeMatch ? gradeMatch[1] : 'N/A',
      fullAnalysis: analysis
    });

  } catch (error) {
    console.error('[ATS API] Error:', error);
    res.status(500).json({
      error: 'Failed to analyze resume',
      message: error.message
    });
  }
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
