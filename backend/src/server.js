import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import { seedAdminAccount } from './scripts/seedAdmin.js';

const PORT = process.env.PORT || 5000;

// Connect Database & Seed Admin
const startServer = async () => {
  await connectDB();
  await seedAdminAccount();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
