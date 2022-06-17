const _ = require('lodash');
const { StatusCodes } = require('http-status-codes');

const History = require('../models/History');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const NotFoundError = require('../errors/notFound');
const ForbiddenError = require('../errors/forbidden');

exports.getAllHistories = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Bookmark.find({ user: req.user.id }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  let histories = await features.query;
  histories = _.uniq(histories.map((item) => item.story));

  res.status(StatusCodes.OK).send(histories);
});

exports.getHistoriesOnStory = catchAsync(async (req, res, next) => {
  const { storyId } = req.params;

  const histories = await Bookmark.find({ story: storyId });

  res.status(StatusCodes.OK).send(histories);
});

exports.getHistory = catchAsync(async (req, res, next) => {
  const { id: historyId } = req.params;

  const history = await History.findById(historyId);

  if (!history) {
    return next(
      new NotFoundError(`No history found with that ID → ${historyId}`)
    );
  }

  res.status(StatusCodes.OK).send(history);
});

exports.createHistory = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;

  const history = await History.create({ ...req.body });

  res.status(StatusCodes.CREATED).send(history);
});

exports.updateHistory = catchAsync(async (req, res, next) => {
  const { id: historyId } = req.params;

  let history = await History.findById(historyId);

  if (!history) {
    return next(
      new NotFoundError(`No history found with that ID → ${historyId}`)
    );
  }

  if (
    String(history.user._id) === String(req.user.id) ||
    req.user.role === 'admin'
  ) {
    history = await History.findByIdAndUpdate(
      historyId,
      { $set: { ...req.body } },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(StatusCodes.OK).send(history);
  }

  return next(new ForbiddenError('You can only update your history'));
});

exports.deleteHistory = catchAsync(async (req, res, next) => {
  const { id: historyId } = req.params;

  let history = await History.findById(historyId);

  if (!history) {
    return next(
      new NotFoundError(`No history found with that ID → ${historyId}`)
    );
  }

  if (
    String(history.user._id) === String(req.user.id) ||
    req.user.role === 'admin'
  ) {
    history = await History.findByIdAndDelete(historyId);

    return res.status(StatusCodes.NO_CONTENT).send(history);
  }

  return next(new ForbiddenError('You can only delete your history'));
});
