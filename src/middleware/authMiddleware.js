/**
 * Authentication Middleware
 * 
 * Provides server-side token verification and role-based access control.
 * This middleware validates Firebase ID tokens and checks user roles.
 * 
 * In mock mode (when Firebase is not configured), provides development
 * bypass for testing purposes.
 */

import { adminAuth, adminDb, isFirebaseMockMode } from '../config/firebase-admin.js';

// Development mode bypass - allows testing without Firebase credentials
const DEV_BYPASS_ENABLED = process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS === 'true';

/**
 * Verify Firebase ID Token
 * Extracts and verifies the token from the Authorization header
 */
export const verifyToken = async (req, res, next) => {
  try {
    // Development bypass for testing
    if (DEV_BYPASS_ENABLED || isFirebaseMockMode()) {
      console.log('⚠️  Auth bypass: Using mock user for development');
      req.user = {
        uid: 'dev-user-id',
        email: 'dev@example.com',
        emailVerified: true,
        role: req.headers['x-dev-role'] || 'faculty', // Can override via header
        userData: {
          role: req.headers['x-dev-role'] || 'faculty',
          name: 'Development User'
        }
      };
      return next();
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided or invalid format. Use: Bearer <token>'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      };
      
      // Fetch user role from Firestore
      const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists) {
        req.user.role = userDoc.data().role;
        req.user.userData = userDoc.data();
      }
      
      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        code: error.code
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication process failed'
    });
  }
};

/**
 * Role-based Access Control Middleware
 * Restricts access to users with specific roles
 * 
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!req.user.role) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'User role not found'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Verifies token if present but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    // In mock mode, just continue without auth
    if (isFirebaseMockMode()) {
      return next();
    }

    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email
        };
        
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        if (userDoc.exists) {
          req.user.role = userDoc.data().role;
        }
      } catch (error) {
        // Token invalid but continue without auth
        console.log('Optional auth: Invalid token provided');
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

/**
 * Rate limiting helper (simple in-memory implementation)
 */
const requestCounts = new Map();

export const rateLimit = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const key = req.user?.uid || req.ip;
    const now = Date.now();
    
    if (!requestCounts.has(key)) {
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = requestCounts.get(key);
    
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    if (record.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((record.resetTime - now) / 1000)} seconds`
      });
    }
    
    record.count++;
    next();
  };
};
