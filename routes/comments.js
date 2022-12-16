const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const commentController = require('../controllers/commentController');

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

module.exports = router;
