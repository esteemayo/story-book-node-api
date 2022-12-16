const _ = require('lodash');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { StatusCodes } = require('http-status-codes');

const User = require('../models/User');
const sendMail = require('../utils/mail');
const AppError = require('../errors/appError');
const catchAsync = require('../utils/catchAsync');
const NotFoundError = require('../errors/notFound');
const ForbiddenError = require('../errors/forbidden');
const BadRequestError = require('../errors/badRequest');
const createSendToken = require('../middleware/createSendToken');
const UnauthenticatedError = require('../errors/unauthenticated');

exports.signup = catchAsync(async (req, res, next) => {
  const userData = _.pick(req.body, [
    'name',
    'role',
    'email',
    'photo',
    'username',
    'password',
    'passwordConfirm',
    'passwordChangedAt',
  ]);

  const user = await User.create({ ...userData });

  createSendToken(user, StatusCodes.CREATED, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Please provide email and password'));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password))) {
    return next(new UnauthenticatedError('Incorrect email or password'));
  }

  createSendToken(user, StatusCodes.OK, req, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (email === '') {
    return next(new BadRequestError('Please enter your email address'));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(
      new NotFoundError(`There is no user with email address → ${email}`)
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `
    Hi ${user.name},
    There was a request to change your password!
    If you did not make this request then please ignore this email.
    Otherwise, please click this link to change your password: ${resetURL}
  `;

  const html = `
    <div style='background: #f7f7f7; color: #333; padding: 50px; text-align: left;'>
        <h3>Hi ${user.name},</h3>
        <p>There was a request to change your password!</p>
        <p>If you did not make this request then please ignore this email.</p>
        <p>Otherwise, please click this link to change your password: 
          <a href='${resetURL}'>Reset my password →</a>
        </p>
    </div>
  `;

  try {
    await sendMail({
      email: user.email,
      subject: 'Password Reset Token (valid for 10 minutes)',
      message,
      html,
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Token sent to mail',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later.')
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new BadRequestError('Token is invalid or has expired'));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, StatusCodes.OK, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent))) {
    return next(new BadRequestError('Your current password is wrong'));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, StatusCodes.OK, req, res);
});
