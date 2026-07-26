import { env, logStartupConfig } from './config/env.js';
import app from './app.js';
import connectDB from './config/db.js';
import { seedAdminAccount } from './scripts/seedAdmin.js';

const startServer = async () => {
  try {
    // 1. Log safe environment configuration
    logStartupConfig();

    // 2. Connect to MongoDB database
    await connectDB();

    // 3. Seed default Admin account if missing
    await seedAdminAccount();

    // 4. Start Express HTTP server
    app.listen(env.PORT, () => {
      console.log(`🚀 Express server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
