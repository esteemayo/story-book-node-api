const express = require('express');

const authController = require('../controllers/authController');
const bookmarkController = require('../controllers/bookmarkController');

const router = express.Router();

router.use(authController.protect);

router.get('/find/user', bookmarkController.getUserBookmarks);

router.get('/story/:storyId', bookmarkController.getOneBookmark);

router
  .route('/')
  .get(authController.restrictTo('admin'), bookmarkController.getAllBookmarks)
  .post(bookmarkController.createBookmark);

router
  .route('/:id')
  .get(bookmarkController.getBookmark)
  .patch(bookmarkController.updateBookmark)
  .delete(bookmarkController.deleteBookmark);

module.exports = router;
