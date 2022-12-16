const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const bookmarkController = require('../controllers/bookmarkController');

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

module.exports = router;
