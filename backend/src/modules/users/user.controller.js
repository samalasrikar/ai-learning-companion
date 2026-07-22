import asyncHandler from 'express-async-handler';
import {
  getAllUsersService,
  getUserByIdService,
  toggleUserStatusService,
} from '../../services/user.service.js';
import { updateProfile } from '../../services/auth.service.js';

/**
 * Get current authenticated user profile.
 * @route GET /api/users/me
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * Update current authenticated user profile details.
 * @route PATCH /api/users/me
 */
export const updateMe = asyncHandler(async (req, res) => {
  const { firstName, lastName, avatar } = req.body;
  const user = await updateProfile(req.user._id, { firstName, lastName, avatar });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user,
  });
});

/**
 * Update current authenticated user profile picture via file upload.
 * @route PATCH /api/users/me/avatar
 */
export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please select an image file to upload as your profile avatar.');
  }

  const avatarPath = `/uploads/avatars/${req.file.filename}`;
  const user = await updateProfile(req.user._id, { avatar: avatarPath });

  res.status(200).json({
    success: true,
    message: 'Profile picture updated successfully',
    user,
  });
});

/**
 * Get all Student users (Admin only). Excludes Admin account.
 * @route GET /api/users
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const users = await getAllUsersService(search);
  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

/**
 * Get single Student user by ID (Admin only).
 * @route GET /api/users/:id
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await getUserByIdService(req.params.id);
  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * Toggle student active/disabled status (Admin only).
 * @route PATCH /api/users/:id/status
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await toggleUserStatusService(req.params.id, isActive);
  res.status(200).json({
    success: true,
    message: `Student account ${user.isActive ? 'enabled' : 'disabled'} successfully`,
    user,
  });
});
