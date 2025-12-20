import nodemailer from 'nodemailer';
import createHttpError from 'http-errors';
import { SMTP } from '../constants/index.js';
import { env } from '../utils/env.js';

const transporter = nodemailer.createTransport({
  host: env(SMTP.SMTP_HOST),
  port: Number(env(SMTP.SMTP_PORT)),
  secure: false,
  auth: {
    user: env(SMTP.SMTP_USER),
    pass: env(SMTP.SMTP_PASSWORD),
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = async (options) => {
  try {
    return await transporter.sendMail({
      from: env(SMTP.SMTP_FROM),
      ...options,
    });
  } catch (err) {
    console.error('SMTP Hatası:', err);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};
