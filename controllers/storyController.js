const { StatusCodes } = require('http-status-codes');

const Story = require('../models/Story');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const NotFoundError = require('../errors/notFound');
const ForbiddenError = require('../errors/forbidden');
const UnauthenticatedError = require('../errors/unauthenticated');

exports.getAllStories = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Story.find({ status: 'public' }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const stories = await features.query;

  res.status(StatusCodes.OK).send(stories);
});

exports.getStoryById = catchAsync(async (req, res, next) => {
  const { id: storyId } = req.params;

  const story = await Story.findById(storyId).populate('comments');

  if (!story) {
    return next(new NotFoundError(`No story found with that ID: ${storyId}`));
  }

  if (story.status === 'public') {
    res.status(StatusCodes.OK).send(story);
  } else if (story.status === 'private' || story.status === 'unpublished') {
    res.status(StatusCodes.OK).send(story);
  } else {
    if (req.user) {
      if (req.user.username === story.author) {
        res.status(StatusCodes.OK).send(story);
      } else {
        return next(
          new ForbiddenError(
            'You do not have the permission to view this story'
          )
        );
      }
    } else {
      return next(
        new UnauthenticatedError(
          'You have to be logged in to perform this action'
        )
      );
    }
  }
});

exports.getStoryBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const story = await Story.findOne({ slug: slug }).populate('comments');

  if (!story) {
    return next(new NotFoundError(`No story found with that SLUG: ${slug}`));
  }

  if (story.status === 'public') {
    res.status(StatusCodes.OK).send(story);
  } else if (story.status === 'private' || story.status === 'unpublished') {
    res.status(StatusCodes.OK).send(story);
  } else {
    if (req.user) {
      if (req.user.username === story.author) {
        res.status(StatusCodes.OK).send(story);
      } else {
        return next(
          new ForbiddenError(
            'You do not have the permission to view this story'
          )
        );
      }
    } else {
      return next(
        new UnauthenticatedError(
          'You have to be logged in to perform this action'
        )
      );
    }
  }
});

exports.getUserStories = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const stories = await Story.find({ user: userId, status: 'public' });

  res.status(StatusCodes.OK).send(stories);
});

exports.createStory = catchAsync(async (req, res, next) => {
  if (!req.body.author) req.body.author = req.user.username;
  if (!req.body.user) req.body.user = req.user.id;

  const story = await Story.create({ ...req.body });

  res.status(StatusCodes.CREATED).send(story);
});

exports.updateStory = catchAsync(async (req, res, next) => {
  const { id: storyId } = req.params;

  const story = await Story.findById(storyId);

  if (!story) {
    return next(new NotFoundError(`No story found with that ID: ${storyId}`));
  }

  if (story.author === req.user.username) {
    const updatedStory = await Story.findByIdAndUpdate(storyId, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(StatusCodes.OK).send(updatedStory);
  }

  return next(new ForbiddenError('You can only update your story'));
});

exports.deleteStory = catchAsync(async (req, res, next) => {
  const { id: storyId } = req.params;

  const story = await Story.findById(storyId);

  if (!story) {
    return next(new NotFoundError(`No story found with that ID: ${storyId}`));
  }

  if (story.author === req.user.username || req.user.role === 'admin') {
    await Story.findByIdAndDelete(storyId);
    res.status(StatusCodes.NO_CONTENT).json({
      status: 'success',
      data: null,
    });
  }

  return next(new ForbiddenError('You can only delete your story'));
});
