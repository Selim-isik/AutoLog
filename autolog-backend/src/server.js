import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routers/index.js';
import { env } from './utils/env.js';

const PORT = Number(env('PORT', '3000'));
const FRONTEND_URL = env('FRONTEND_URL') || 'http://localhost:5173';

export const startServer = () => {
  const app = express();

  const corsOptions = {
    origin: FRONTEND_URL,
    credentials: true,
  };

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.use(cors(corsOptions));
  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
  });

  app.use(router);

  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  app.use((err, req, res) => {
    res
      .status(500)
      .json({ message: 'Something went wrong', error: err.message });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
