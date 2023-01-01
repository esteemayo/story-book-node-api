import express from 'express';

import * as authMiddleware from '../middleware/authMiddleware.js';
import * as commentController from '../controllers/commentController.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware.protect);

router
  .route('/')
  .get(commentController.getAllComments)
  .post(commentController.sendStoryUserIds, commentController.createComment);

router
  .route('/:id')
  .get(commentController.getComment)
  .patch(commentController.updateComment)
  .delete(
    authMiddleware.restrictTo('user', 'admin'),
    commentController.deleteComment
  );

export default router;
