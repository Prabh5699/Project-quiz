const Category = require('../models/category');
const Question = require('../models/question');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('questionCount');
    res.json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCategoryQuestions = async (req, res) => {
  try {
    const questions = await Question.find({
      categories: req.params.categoryId
    }).populate('categories');
    res.json(questions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};