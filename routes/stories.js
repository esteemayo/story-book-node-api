const express = require('express');

const storyController = require('../controllers/storyController');
const authController = require('../controllers/authController');
const commentRouter = require('./comments');

const router = express.Router();

router.use('/:storyId/comments', commentRouter);

router.get('/search', storyController.searchStories);

router.get('/search/query', storyController.getStoriesBySearch);

router.post('/related-stories', storyController.getRelatedStories);

router.patch('/like/:id', authController.protect, storyController.likeStory);

router
  .route('/')
  .get(storyController.getAllStories)
  .post(authController.protect, storyController.createStory);

router
  .route('/:id')
  .get(authController.isLoggedIn, storyController.getStoryById)
  .patch(authController.protect, storyController.updateStory)
  .delete(authController.protect, storyController.deleteStory);

router.get(
  '/details/:slug',
  authController.isLoggedIn,
  storyController.getStoryBySlug
);

router.get(
  '/user/:userId',
  authController.protect,
  storyController.getUserStories
);

module.exports = router;
