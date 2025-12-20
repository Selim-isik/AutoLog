import dotenv from 'dotenv';
dotenv.config();

import { initMongoDB } from './db/initMongoDB.js';

const app = async () => {
  await initMongoDB();
};

app();
