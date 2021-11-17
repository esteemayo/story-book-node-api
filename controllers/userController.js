const _ = require('lodash');
const { StatusCodes } = require('http-status-codes');

const User = require('../models/User');
const Story = require('../models/Story');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const BadRequestError = require('../errors/badRequest');

const createSendToken = (user, statusCode, res) => {
    const token = user.generateAuthToken();

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        user
    });
};

exports.getUserDashBoard = catchAsync(async (req, res, next) => {
    const { id: userID } = req.user;

    const stories = await Story.find({ user: userID });

    res.status(StatusCodes.OK).send(stories);
});

exports.getCurrentUserStories = catchAsync(async (req, res, next) => {
    const { id: userID } = req.user;

    const stories = await Story.find({ user: userID });

    res.status(StatusCodes.OK).send(stories);
});

exports.updateMe = catchAsync(async (req, res, next) => {
    const {
        user: { id: userID },
        body: {
            password,
            passwordConfirm,
        },
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

    const user = await User.findByIdAndUpdate(userID, filterBody, {
        new: true,
        runValidators: true
    });

    createSendToken(user, StatusCodes.OK, res);
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    const { id: userID } = req.user;

    const user = await User.findByIdAndUpdate(userID, { active: false });
    await Story.deleteMany({ author: user.username });

    res.status(StatusCodes.NO_CONTENT).json({
        status: 'success',
        data: null
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
        )}/api/v1/users/signup instead`
    });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// do NOT update password with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
