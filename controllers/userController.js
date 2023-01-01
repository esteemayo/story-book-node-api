import _ from 'lodash';
import { StatusCodes } from 'http-status-codes';

import User from '../models/User.js';
import Story from '../models/Story.js';
import factory from './handlerFactory.js';
import catchAsync from '../utils/catchAsync.js';
import APIFeatures from '../utils/apiFeatures.js';
import BadRequestError from '../errors/badRequest.js';
import createSendToken from '../middleware/createSendToken.js';

export const getUserDashBoard = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;

  const features = new APIFeatures(Story.find({ user: userId }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const stories = await features.query;

  res.status(StatusCodes.OK).json(stories);
});

export const getCurrentUserStories = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;

  const features = new APIFeatures(Story.find({ user: userId }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const stories = await features.query;

  res.status(StatusCodes.OK).json(stories);
});

export const updateMe = catchAsync(async (req, res, next) => {
  const {
    user: { id: userId },
    body: { password, passwordConfirm },
  } = req;

  if (password || passwordConfirm) {
    return next(
      new BadRequestError(
        `This route is not for password updates. Please use update ${req.protocol
        }://${req.get('host')}/api/v1/users/update-my-password`
      )
    );
  }

  const filterBody = _.pick(req.body, ['name', 'email', 'photo', 'username']);

  const user = await User.findByIdAndUpdate(userId, filterBody, {
    new: true,
    runValidators: true,
  });

  createSendToken(user, StatusCodes.OK, req, res);
});

export const deleteMe = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;

  const user = await User.findByIdAndUpdate(userId, { active: false });
  await Story.deleteMany({ author: user.username });

  res.status(StatusCodes.NO_CONTENT).json({
    status: 'success',
    data: null,
  });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const createUser = (req, res, next) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: 'fail',
    message: `This route is not defined! Please use ${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/signup instead`,
  });
};

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
