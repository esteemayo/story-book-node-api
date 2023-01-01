import express from 'express';

import * as authMiddleware from '../middleware/authMiddleware.js';
import * as bookmarkController from '../controllers/bookmarkController.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/find/user', bookmarkController.getUserBookmarks);

router.get('/story/:storyId', bookmarkController.getOneBookmark);

router
  .route('/')
  .get(authMiddleware.restrictTo('admin'), bookmarkController.getAllBookmarks)
  .post(bookmarkController.createBookmark);

router
  .route('/:id')
  .get(bookmarkController.getBookmark)
  .patch(bookmarkController.updateBookmark)
  .delete(bookmarkController.deleteBookmark);

export default router;
