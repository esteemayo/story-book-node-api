import { StatusCodes } from 'http-status-codes';

import Bookmark from '../models/Bookmark.js';
import catchAsync from '../utils/catchAsync.js';
import APIFeatures from '../utils/apiFeatures.js';
import NotFoundError from '../errors/notFound.js';
import ForbiddenError from '../errors/forbidden.js';
import BadRequestError from '../errors/badRequest.js';

export const getAllBookmarks = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Bookmark.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const bookmarks = await features.query;

  res.status(StatusCodes.OK).json(bookmarks);
});

export const getUserBookmarks = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Bookmark.find({ user: req.user.id }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const bookmarks = await features.query;

  res.status(StatusCodes.OK).json(bookmarks);
});

export const getBookmark = catchAsync(async (req, res, next) => {
  const { id: bookmarkId } = req.params;

  const bookmark = await Bookmark.findById(bookmarkId);

  if (!bookmark) {
    return next(
      new NotFoundError(`No bookmark found with that ID → ${bookmarkId}`)
    );
  }

  if (
    String(bookmark.user._id) === String(req.user.id) ||
    req.user.role === 'admin'
  ) {
    return res.status(StatusCodes.OK).json(bookmark);
  }

  return next(new ForbiddenError('You do not have access to this bookmark'));
});

export const getOneBookmark = catchAsync(async (req, res, next) => {
  const {
    user: { id: userId },
    params: { storyId },
  } = req;

  const bookmark = await Bookmark.findOne({
    user: userId,
    story: storyId,
  });

  if (!bookmark) {
    return next(
      new NotFoundError(
        `No bookmark found with that IDs → ${userId} & ${storyId}`
      )
    );
  }

  res.status(StatusCodes.OK).json(bookmark);
});

export const createBookmark = catchAsync(async (req, res, next) => {
  const {
    user: { id: userId },
    body: { story },
  } = req;

  let bookmark = await Bookmark.findOne({
    user: userId,
    story,
  });

  if (bookmark) {
    return next(
      new BadRequestError('You already have this story set as bookmark')
    );
  }

  if (!req.body.user) req.body.user = userId;

  bookmark = await Bookmark.create({ ...req.body });

  res.status(StatusCodes.CREATED).json(bookmark);
});

export const updateBookmark = catchAsync(async (req, res, next) => {
  const { id: bookmarkId } = req.params;

  let bookmark = await Bookmark.findById(bookmarkId);

  if (!bookmark) {
    return next(
      new NotFoundError(`No bookmark found with that ID → ${bookmarkId}`)
    );
  }

  if (
    String(bookmark.user._id) === String(req.user.id) ||
    req.user.role === 'admin'
  ) {
    bookmark = await Bookmark.findByIdAndUpdate(
      bookmarkId,
      { $set: { ...req.body } },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(StatusCodes.OK).json(bookmark);
  }

  return next(new ForbiddenError('You can only update your bookmark'));
});

export const deleteBookmark = catchAsync(async (req, res, next) => {
  const { id: bookmarkId } = req.params;

  let bookmark = await Bookmark.findById(bookmarkId);

  if (!bookmark) {
    return next(
      new NotFoundError(`No bookmark found with that ID → ${bookmarkId}`)
    );
  }

  if (
    String(bookmark.user._id) === String(req.user.id) ||
    req.user.role === 'admin'
  ) {
    bookmark = await Bookmark.findByIdAndDelete(bookmarkId);

    return res.status(StatusCodes.NO_CONTENT).json(bookmark);
  }

  return next(new ForbiddenError('You can only delete your bookmark'));
});
