// src/index.js
import { initMongoDB } from './db/initMongoDB.js';
import { startServer } from './server.js';

const app = async () => {
  await initMongoDB();
  startServer();
};

app();
