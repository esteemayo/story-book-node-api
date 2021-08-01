const Story = require('../models/Story');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllStories = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Story.find({ status: 'public' }), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const stories = await features.query;

    res.status(200).send(stories);
});

exports.getStory = catchAsync(async (req, res, next) => {
    const story = await Story.findById(req.params.id).populate('comments');

    if (!story) {
        return next(new AppError('No story found with that ID', 404));
    }

    if (story.status === 'public') {
        res.status(200).send(story);
    } else if (story.status === 'private' || story.status === 'unpublished') {
        res.status(200).send(story);
    } else {
        if (req.user) {
            if (req.user.username === story.author) {
                res.status(200).send(story);
            } else {
                return next(new AppError('You do not have the permission to view this story', 403));
            }
        } else {
            return next(new AppError('You have to be logged in to perform this action', 401));
        }
    }
});

exports.getWithSlug = catchAsync(async (req, res, next) => {
    const story = await Story.findOne({ 'slug': req.params.slug }).populate('comments');

    if (!story) {
        return next(new AppError('No story found with that SLUG', 404));
    }

    if (story.status === 'public') {
        res.status(200).send(story);
    } else if (story.status === 'private' || story.status === 'unpublished') {
        res.status(200).send(story);
    } else {
        if (req.user) {
            if (req.user.username === story.author) {
                res.status(200).send(story);
            } else {
                return next(new AppError('You do not have the permission to view this story', 403));
            }
        } else {
            return next(new AppError('You have to be logged in to perform this action', 401));
        }
    }
});

exports.getUserStories = catchAsync(async (req, res, next) => {
    const stories = await Story.find({ user: req.params.userId, status: 'public' });

    res.status(200).send(stories);
});

exports.createStory = catchAsync(async (req, res, next) => {
    if (!req.body.author) req.body.author = req.user.username;
    if (!req.body.user) req.body.user = req.user.id;

    const story = await Story.create(req.body);

    res.status(201).send(story);
});

exports.updateStory = catchAsync(async (req, res, next) => {
    const story = await Story.findById(req.params.id);

    if (!story) {
        return next(new AppError('No story found with that ID', 404));
    }

    if (story.author === req.user.username) {
        const updatedStory = await Story.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).send(updatedStory);
    }

    return next(new AppError('You can only update your story', 401));
});

exports.deleteStory = catchAsync(async (req, res, next) => {
    const story = await Story.findById(req.params.id);

    if (!story) {
        return next(new AppError('No story found with that ID', 404));
    }

    if (story.author === req.user.username || req.user.role === 'admin') {
        await Story.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    }

    return next(new AppError('You can only delete your story', 401));
});
