import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routers/index.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swagger.js';

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const FRONTEND_URLS = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  'https://auto-log-sttq-ipy6e6pe0-selim-isiks-projects.vercel.app',
  'https://auto-log-three.vercel.app',
].filter(Boolean);

export const startServer = () => {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.use(
    cors({
      origin: FRONTEND_URLS,
      credentials: true,
    }),
  );

  app.use(cookieParser());

  app.use(
    pino({
      transport: { target: 'pino-pretty' },
    }),
  );

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  app.get('/', (req, res) => {
    res.json({ message: 'Backend OK', allowedOrigins: FRONTEND_URLS });
  });

  app.use(router);

  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  app.use((err, req, res, next) => {
    res
      .status(500)
      .json({ message: 'Something went wrong', error: err.message });
  });

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log('ALLOWED CORS ORIGINS:', FRONTEND_URLS);
  });
};

startServer();
