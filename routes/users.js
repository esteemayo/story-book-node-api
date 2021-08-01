const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password/:token', authController.resetPassword);

router.use(authController.protect);

router.get('/dashboard', userController.getUserDashBoard);

router.get('/my-stories', userController.getCurrentUserStories);

router.get('/me', userController.getMe, userController.getUser);

router.patch('/update-my-password', authController.updatePassword);

router.patch('/update-me', userController.updateMe);

router.delete('/delete-me', userController.deleteMe);

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
