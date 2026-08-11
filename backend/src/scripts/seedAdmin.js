import User from '../models/user.model.js';

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

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error(
        'ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables before seeding the admin account.'
      );
    }

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
