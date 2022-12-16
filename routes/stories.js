const express = require('express');

const commentRouter = require('./comments');
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const storyController = require('../controllers/storyController');

const router = express.Router();

router.use('/:storyId/comments', commentRouter);

router.get('/search', storyController.searchStories);

router.get('/search/query', storyController.getStoriesBySearch);

router.get('/tag/:tag', storyController.getStoriesByTag);

router.post('/related-stories', storyController.getRelatedStories);

router.patch('/like/:id', authMiddleware.protect, storyController.likeStory);

router
  .route('/')
  .get(storyController.getAllStories)
  .post(authMiddleware.protect, storyController.createStory);

router
  .route('/:id')
  .get(authController.isLoggedIn, storyController.getStoryById)
  .patch(authMiddleware.protect, storyController.updateStory)
  .delete(authMiddleware.protect, storyController.deleteStory);

router.get(
  '/details/:slug',
  authController.isLoggedIn,
  storyController.getStoryBySlug
);

router.get(
  '/user/:userId',
  authMiddleware.protect,
  storyController.getUserStories
);

module.exports = router;
