import _ from 'lodash';
import { StatusCodes } from 'http-status-codes';

import History from '../models/History.js';
import catchAsync from '../utils/catchAsync.js';
import APIFeatures from '../utils/apiFeatures.js';
import NotFoundError from '../errors/notFound.js';
import ForbiddenError from '../errors/forbidden.js';

export const getAllHistories = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    History.find({ user: req.user.id }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  let histories = await features.query;
  histories = _.uniq(histories.map((item) => item.story));

  res.status(StatusCodes.OK).json(histories);
});

export const getHistoriesOnStory = catchAsync(async (req, res, next) => {
  const { storyId } = req.params;

  const histories = await History.find({ story: storyId });

  res.status(StatusCodes.OK).json(histories);
});

export const getHistory = catchAsync(async (req, res, next) => {
  const { id: historyId } = req.params;

  const history = await History.findById(historyId);

  if (!history) {
    return next(
      new NotFoundError(`No history found with that ID → ${historyId}`)
    );
  }

  res.status(StatusCodes.OK).json(history);
});

export const createHistory = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;

  const history = await History.create({ ...req.body });

  res.status(StatusCodes.CREATED).json(history);
});

export const updateHistory = catchAsync(async (req, res, next) => {
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

    return res.status(StatusCodes.OK).json(history);
  }

  return next(new ForbiddenError('You can only update your history'));
});

export const deleteHistory = catchAsync(async (req, res, next) => {
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

    return res.status(StatusCodes.NO_CONTENT).json(history);
  }

  return next(new ForbiddenError('You can only delete your history'));
});
