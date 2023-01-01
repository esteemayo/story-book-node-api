import { StatusCodes } from 'http-status-codes';

import catchAsync from '../utils/catchAsync.js';
import APIFeatures from '../utils/apiFeatures.js';
import NotFoundError from '../errors/notFound.js';

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.storyId) filter = { story: req.params.storyId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;
    // const docs = await features.query.explain();

    res.status(StatusCodes.OK).json(docs);
  });

export const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const { id: docId } = req.params;

    let query = Model.findById(docId);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that ID: ${docId}`)
      );
    }

    res.status(StatusCodes.OK).json(doc);
  });

export const getSlug = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const { slug } = req.params;

    let query = Model.findOne({ slug: slug });
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that SLUG: ${slug}`)
      );
    }

    res.status(StatusCodes.OK).json(doc);
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create({ ...req.body });

    res.status(StatusCodes.CREATED).json(doc);
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id: docId } = req.params;

    const doc = await Model.findByIdAndUpdate(docId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that ID: ${docId}`)
      );
    }

    res.status(StatusCodes.OK).json(doc);
  });

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id: docId } = req.params;

    const doc = await Model.findByIdAndDelete(docId);

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that ID: ${docId}`)
      );
    }

    res.status(StatusCodes.NO_CONTENT).json(doc);
  });
