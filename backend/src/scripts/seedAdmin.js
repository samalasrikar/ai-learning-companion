import User from '../models/user.model.js';

/**
 * Seeds the single Admin account if no Admin currently exists.
 */
export const seedAdminAccount = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'Admin' });
    if (existingAdmin) {
      console.log(`Admin account already exists (${existingAdmin.email})`);
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jarvis.edu';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!Password';

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
