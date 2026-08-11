import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

/**
 * Required environment variables for the Express backend.
 */
const REQUIRED_ENV_VARS = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];

/**
 * Mask sensitive string for safe logging.
 */
const maskSecret = (str) => {
  if (!str) return 'not_configured';
  if (str.length <= 8) return '****';
  return `${str.substring(0, 4)}...${str.substring(str.length - 4)}`;
};

/**
 * Validates required environment variables on startup.
 */
export const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    const errorMsg = `FATAL CONFIGURATION ERROR: Missing required environment variables in Express backend: [${missing.join(', ')}]`;
    console.error(`\x1b[31m${errorMsg}\x1b[0m`);
    throw new Error(errorMsg);
  }
};

/**
 * Centralized, validated application configuration.
 */
export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'openrouter/free',
  SITE_NAME: process.env.SITE_NAME || 'Jarvis',
  SITE_URL: process.env.SITE_URL || 'http://localhost:5173',
  RAG_SERVICE_URL: process.env.RAG_SERVICE_URL || 'http://localhost:8000',
};

/**
 * Safely logs non-sensitive startup configuration parameters.
 */
export const logStartupConfig = () => {
  console.log('====================================================');
  console.log('       EXPRESS BACKEND ENVIRONMENT CONFIG           ');
  console.log('====================================================');
  console.log(`  Environment      : ${env.NODE_ENV}`);
  console.log(`  Port             : ${env.PORT}`);
  console.log(`  MongoDB URI      : ${maskSecret(env.MONGO_URI)}`);
  console.log(`  RAG Service URL  : ${env.RAG_SERVICE_URL}`);
  console.log(`  OpenRouter API   : ${env.OPENROUTER_API_KEY ? 'Configured (' + maskSecret(env.OPENROUTER_API_KEY) + ')' : 'Not Configured'}`);
  console.log('====================================================');
};

// Execute validation on module import
validateEnv();
