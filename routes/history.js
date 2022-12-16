const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const historyController = require('../controllers/historyController');

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

module.exports = router;
