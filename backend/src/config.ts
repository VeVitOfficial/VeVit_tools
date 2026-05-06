import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'vevit_tools',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },
  cookieSecret: process.env.COOKIE_SECRET || 'dev-secret-change-me',
  uploadDir: process.env.UPLOAD_DIR || '/tmp/vevit-uploads',
  jobTtlMs: 60 * 60 * 1000,
} as const;