const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const categoryController = require('../controllers/categoryController');
const questionController = require('../controllers/questionController');
const answerController = require('../controllers/answerController');
const auth = require('../middleware/auth');

// Auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/verify-email/:token', authController.verifyEmail);

// User routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

// Category routes
router.get('/categories', auth, categoryController.getAllCategories);
router.get('/categories/:categoryId/questions', auth, categoryController.getCategoryQuestions);

// Question routes
router.post('/questions/import', auth, questionController.importQuestions);
router.get('/questions/search', auth, questionController.searchQuestions);

// Answer routes
router.post('/answers', auth, answerController.submitAnswer);

module.exports = router;