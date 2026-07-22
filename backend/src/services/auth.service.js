import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_12345';
const TOKEN_EXPIRES_IN = '7d';

/**
 * Helper to generate JWT token string.
 */
export const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
};

/**
 * Cookie configuration options for HttpOnly token.
 */
export const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
});

/**
 * Registers a new Student user.
 */
export const registerStudent = async ({ firstName, lastName, email, password }) => {
  if (!firstName || !lastName || !email || !password) {
    const err = new Error('Please fill in all required fields');
    err.status = 400;
    throw err;
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const err = new Error('An account with this email already exists');
    err.status = 400;
    throw err;
  }

  // Public registration ALWAYS sets role = 'Student'
  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    role: 'Student',
  });

  return user;
};

/**
 * Authenticates user credentials.
 */
export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const err = new Error('Please provide both email and password');
    err.status = 400;
    throw err;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Your account has been deactivated. Please contact an administrator.');
    err.status = 403;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id, user.role);

  return { user, token };
};

/**
 * Fetches profile by User ID.
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
};

/**
 * Updates user profile details.
 */
export const updateProfile = async (userId, { firstName, lastName, avatar }) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (avatar) user.avatar = avatar;

  await user.save();
  return user;
};
