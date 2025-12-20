import dotenv from 'dotenv';
dotenv.config();

import { initMongoDB } from './db/initMongoDB.js';
import { startServer } from './server.js';

const bootstrap = async () => {
  try {
    await initMongoDB();
    startServer();
  } catch (err) {
    console.error('BOOTSTRAP ERROR:', err);
    process.exit(1);
  }
};

bootstrap();
