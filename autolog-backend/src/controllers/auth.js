import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUsersSession,
} from '../services/auth.js';
import { ONE_DAY } from '../constants/index.js';
import { UsersCollection as User } from '../db/models/user.js';
import { sendEmail } from '../utils/sendMail.js';
import { env } from '../utils/env.js';

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
};

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);
  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);
  const user = await User.findOne({ email: req.body.email });
  setupSession(res, session);
  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        _id: user._id,
        avatar: user.avatar,
      },
    },
  });
};

export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');
  res.status(204).send();
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });
  setupSession(res, session);
  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const requestResetTokenController = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(createHttpError(404, 'User not found'));

    const resetToken = jwt.sign({ sub: user._id, email }, env('JWT_SECRET'), {
      expiresIn: '15m',
    });

    const resetLink = `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`;
    const templatePath = path.resolve(
      'src',
      'templates',
      'reset-password-email.html',
    );
    let htmlContent = await fs.readFile(templatePath, 'utf-8');

    htmlContent = htmlContent
      .replace('{{name}}', user.name || 'Customer')
      .replace('{{link}}', resetLink);

    await sendEmail({
      to: user.email,
      subject: 'Reset your AutoLog password',
      html: htmlContent,
    });

    res.json({ status: 200, message: 'Reset password email has been sent!' });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(token, env('JWT_SECRET'));
    } catch (err) {
      return next(createHttpError(401, 'Token is expired or invalid'));
    }

    const user = await User.findOne({ email: decoded.email, _id: decoded.sub });
    if (!user) return next(createHttpError(404, 'User not found'));

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne({ _id: user._id }, { password: hashedPassword });

    res.json({ status: 200, message: 'Password has been successfully reset!' });
  } catch (error) {
    next(error);
  }
};
