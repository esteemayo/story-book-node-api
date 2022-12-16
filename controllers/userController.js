const _ = require('lodash');
const { StatusCodes } = require('http-status-codes');

const User = require('../models/User');
const Story = require('../models/Story');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const BadRequestError = require('../errors/badRequest');
const createSendToken = require('../middleware/createSendToken');

exports.getUserDashBoard = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;

  const features = new APIFeatures(Story.find({ user: userId }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const stories = await features.query;

  res.status(StatusCodes.OK).json(stories);
});

exports.getCurrentUserStories = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;

  const features = new APIFeatures(Story.find({ user: userId }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const stories = await features.query;

  res.status(StatusCodes.OK).json(stories);
});

exports.updateMe = catchAsync(async (req, res, next) => {
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

exports.deleteMe = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;

  const user = await User.findByIdAndUpdate(userId, { active: false });
  await Story.deleteMany({ author: user.username });

  res.status(StatusCodes.NO_CONTENT).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.createUser = (req, res, next) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: 'fail',
    message: `This route is not defined! Please use ${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/signup instead`,
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
