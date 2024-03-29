import express from 'express';

import * as authMiddleware from '../middleware/authMiddleware.js';
import commentRouter from './comments.js';
import * as storyController from '../controllers/storyController.js';

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
  .get(authMiddleware.isLoggedIn, storyController.getStoryById)
  .patch(authMiddleware.protect, storyController.updateStory)
  .delete(authMiddleware.protect, storyController.deleteStory);

router.get(
  '/details/:slug',
  authMiddleware.isLoggedIn,
  storyController.getStoryBySlug
);

router.get(
  '/user/:userId',
  authMiddleware.protect,
  storyController.getUserStories
);

export default router;
