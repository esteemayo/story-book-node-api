const { StatusCodes } = require('http-status-codes');

const Story = require('../models/Story');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const NotFoundError = require('../errors/notFound');
const ForbiddenError = require('../errors/forbidden');
const UnauthenticatedError = require('../errors/unauthenticated');

exports.getAllStories = catchAsync(async (req, res, next) => {
  // filtering
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((item) => delete queryObj[item]);

  // advanced filering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Story.find(JSON.parse(queryStr)).where('status').equals('public');

  // sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // limiting fields
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 6;
  const skip = (page - 1) * limit;

  const total = await Story.find({ status: 'public' }).countDocuments();
  query = query.skip(skip).limit(limit);

  const numberOfPages = Math.ceil(total / limit);

  const stories = await query;

  res.status(StatusCodes.OK).json({
    totalStories: total,
    currentPage: page,
    numberOfPages,
    stories,
  });
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

exports.getStoriesByTag = catchAsync(async (req, res, next) => {
  const { tag } = req.params;
  const tagQuery = tag || { $exists: true };

  const tagPromise = Story.getTagsList();
  const storyPromise = Story.find(tagQuery);

  const [tags, stories] = await Promise.all([tagPromise, storyPromise]);

  res.status(StatusCodes.OK).json({
    tags,
    stories,
  });
});

exports.getRelatedStories = catchAsync(async (req, res, next) => {
  const tags = req.body;

  const features = new APIFeatures(
    Story.find({ tags: { $in: tags }, status: 'public' }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const stories = await features.query;

  res.status(StatusCodes.OK).send(stories);
});

exports.searchStories = catchAsync(async (req, res, next) => {
  const stories = await Story.find(
    {
      $text: {
        $search: req.query.q,
      },
    },
    {
      score: {
        $meta: 'textScore',
      },
    }
  )
    .sort({
      score: {
        $meta: 'textScore',
      },
    })
    .limit(10);

  res.status(StatusCodes.OK).send(stories);
});

exports.getStoriesBySearch = catchAsync(async (req, res, next) => {
  const { searchQuery } = req.query;

  const title = new RegExp(searchQuery, 'i');
  const stories = await Story.find({ title });

  res.status(StatusCodes.OK).send(stories);
});

exports.createStory = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.author) req.body.author = req.user.username;

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

exports.likeStory = catchAsync(async (req, res, next) => {
  const { id: storyId } = req.params;

  let story = await Story.findById(storyId);

  if (!story) {
    return next(new NotFoundError(`No story found with that ID: ${storyId}`));
  }

  const index = story.likes.findIndex((id) => id === String(req.user.id));

  if (index === -1) {
    story.likes.push(req.user.id);
  } else {
    story.likes = story.likes.filter((id) => id !== String(req.user.id));
  }

  story = await Story.findByIdAndUpdate(
    storyId,
    { $set: { ...story } },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(StatusCodes.OK).send(story);
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
