import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware verifying JWT from HttpOnly cookie or Bearer Authorization header.
 */
export const authenticateUser = async (req, res, next) => {
  let token = null;

  // Check HttpOnly cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Check Authorization Bearer header second
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

/**
 * Optional authentication middleware that attaches req.user if a valid token exists,
 * but allows execution to continue if unauthenticated.
 */
export const optionalAuthenticateUser = async (req, res, next) => {
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid tokens for optional auth
  }

  next();
};

/**
 * Middleware ensuring current user has Admin role.
 */
export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin role required.',
  });
};
