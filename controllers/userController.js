const _ = require('lodash');

const User = require('../models/User');
const Story = require('../models/Story');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

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
    const stories = await Story.find({ user: req.user.id });

    res.status(200).send(stories);
});

exports.getCurrentUserStories = catchAsync(async (req, res, next) => {
    const stories = await Story.find({ user: req.user.id });

    res.status(200).send(stories);
});

exports.updateMe = catchAsync(async (req, res, next) => {
    const { password, passwordConfirm } = req.body;

    if (password || passwordConfirm) {
        return next(
            new AppError(
                `This route is not for password updates. Please use update ${
                    req.protocol
                }://${req.get('host')}/api/v1/users/update-my-password`,
                400
            )
        );
    }

    const filterBody = _.pick(req.body, ['name', 'email', 'photo', 'username']);

    const user = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new: true,
        runValidators: true
    });

    createSendToken(user, 200, res);
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, { active: false });
    await Story.deleteMany({ author: user.username });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.createUser = (req, res, next) => {
    res.status(500).json({
        status: 'fail',
        message: `This route is not defined! Please use ${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/signup instead`
    });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
