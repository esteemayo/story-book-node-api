import express from 'express';

import * as authMiddleware from '../middleware/authMiddleware.js';
import * as historyController from '../controllers/historyController.js';

const router = express.Router();

router.get('/story/:storyId', historyController.getHistoriesOnStory);

router.use(authMiddleware.protect);

router
  .route('/')
  .get(historyController.getAllHistories)
  .post(historyController.createHistory);

router.use(authMiddleware.restrictTo('admin'));

router
  .route('/:id')
  .get(historyController.getHistory)
  .patch(historyController.updateHistory)
  .delete(historyController.deleteHistory);

export default router;
