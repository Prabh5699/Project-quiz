const Answer = require("../models/answer");
const Question = require("../models/question");
const moment = require("moment-timezone");

exports.submitAnswer = async (req, res) => {
  try {
    const { questionId, selectedOptionId } = req.body;
    const userTimezone = req.user.timezone || "UTC";

    // First find the question to check if the answer is correct
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // check answer
    const selectedOption = question.options.id(selectedOptionId);
    if (!selectedOption) {
      return res.status(404).json({ error: "Option not found" });
    }

    const answer = new Answer({
      user: req.user.userId,
      question: questionId,
      selectedOption: selectedOptionId,
      submittedAt: moment().tz(userTimezone).toDate(),
    });

    await answer.save();

    // Return the answer with field
    res.json({
      _id: answer._id,
      user: answer.user,
      question: answer.question,
      selectedOption: answer.selectedOption,
      submittedAt: answer.submittedAt,
      isCorrect: selectedOption.isCorrect, // Add this field to show if answer was correct
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
