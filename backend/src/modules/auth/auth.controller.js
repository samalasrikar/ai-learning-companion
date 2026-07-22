import asyncHandler from 'express-async-handler';
import {
  registerStudent,
  loginUser,
  getCookieOptions,
  getUserById,
  updateProfile,
} from '../../services/auth.service.js';

/**
 * Register a new Student account.
 * @route POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const user = await registerStudent({ firstName, lastName, email, password });

  res.status(201).json({
    success: true,
    message: 'Student account registered successfully. Please log in.',
    user,
  });
});

/**
 * Login user and issue HttpOnly cookie token.
 * @route POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await loginUser({ email, password });

  // Set HttpOnly cookie
  res.cookie('token', token, getCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    user,
    token, // Also returned for client memory/testing if needed
  });
});

/**
 * Logout user and clear cookie.
 * @route POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', getCookieOptions());
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * Get current authenticated user profile.
 * @route GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * Update current user profile.
 * @route PATCH /api/auth/profile
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, avatar } = req.body;
  const user = await updateProfile(req.user._id, { firstName, lastName, avatar });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user,
  });
});
