const { StatusCodes } = require('http-status-codes');

const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const NotFoundError = require('../errors/notFound');

exports.getAll = (Model) =>
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

    res.status(StatusCodes.OK).send(docs);
  });

exports.getOne = (Model, popOptions) =>
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

    res.status(StatusCodes.OK).send(doc);
  });

exports.getSlug = (Model, popOptions) =>
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

    res.status(StatusCodes.OK).send(doc);
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create({ ...req.body });

    res.status(StatusCodes.CREATED).send(doc);
  });

exports.updateOne = (Model) =>
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

    res.status(StatusCodes.OK).send(doc);
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id: docId } = req.params;

    const doc = await Model.findByIdAndDelete(docId);

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that ID: ${docId}`)
      );
    }

    res.status(StatusCodes.NO_CONTENT).send(doc);
  });
