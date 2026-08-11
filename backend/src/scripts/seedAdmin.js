import User from '../models/user.model.js';
import { env } from '../config/env.js';

/**
 * Seeds the single Admin account if no Admin currently exists.
 * Requires ADMIN_EMAIL and ADMIN_PASSWORD to be set in environment variables.
 */
export const seedAdminAccount = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'Admin' });
    if (existingAdmin) {
      console.log(`Admin account already exists (${existingAdmin.email})`);
      return;
    }

    const adminEmail = env.ADMIN_EMAIL;
    const adminPassword = env.ADMIN_PASSWORD;

    const adminUser = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: 'Admin',
      isActive: true,
    });

    console.log(`Successfully seeded Admin account: ${adminUser.email}`);
  } catch (error) {
    console.error('Failed to seed Admin account:', error.message);
  }
};
