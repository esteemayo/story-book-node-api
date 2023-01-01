import Comment from '../models/Comment.js';
import * as factory from './handlerFactory.js';

export const sendStoryUserIds = (req, res, next) => {
  if (!req.body.story) req.body.story = req.params.storyId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

export const getAllComments = factory.getAll(Comment);
export const getComment = factory.getOne(Comment);
export const createComment = factory.createOne(Comment);
export const updateComment = factory.updateOne(Comment);
export const deleteComment = factory.deleteOne(Comment);
