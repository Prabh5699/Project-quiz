const Question = require("../models/question");
const Category = require("../models/category");
const { parse } = require("csv-parse");
const fs = require("fs");
const multer = require("multer");

const upload = multer({ dest: "uploads/csv" });

exports.importQuestions = [
  upload.single("csv"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Please upload a CSV file" });
      }

      const questions = [];
      const processFile = new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(parse({ columns: true }))
          .on("data", (row) => {
            const question = {
              text: row.question,
              options: JSON.parse(row.options),
              categoryNames: row.categories.split(",").map((cat) => cat.trim()), //temp data
            };
            questions.push(question);
          })
          .on("end", resolve)
          .on("error", reject);
      });

      await processFile;

      // Create categories if they don't exist
      const uniqueCategories = [
        ...new Set(questions.flatMap((q) => q.categoryNames)),
      ];
      const categoryMap = new Map();

      for (const categoryName of uniqueCategories) {
        let category = await Category.findOne({ name: categoryName });
        if (!category) {
          category = await Category.create({
            name: categoryName,
            description: `Questions related to ${categoryName}`,
          });
        }
        categoryMap.set(categoryName, category._id);
      }

      // Create questions with category IDs
      const questionsToInsert = questions.map((question) => ({
        text: question.text,
        options: question.options,
        categories: question.categoryNames.map((name) => categoryMap.get(name)),
      }));

      const insertedQuestions = await Question.insertMany(questionsToInsert);

      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        message: `${insertedQuestions.length} questions imported successfully`,
        questions: insertedQuestions,
      });
    } catch (error) {
      // Clean up the uploaded file in case of error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ error: error.message });
    }
  },
];

exports.searchQuestions = async (req, res) => {
  try {
    const { query, userId } = req.query;
    const userTimezone = req.user.timezone || "UTC";

    const questions = await Question.aggregate([
      {
        $match: {
          text: { $regex: query, $options: "i" },
        },
      },
      {
        $lookup: {
          from: "answers",
          let: { questionId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$question", "$$questionId"] },
                    { $eq: ["$user", userId] },
                  ],
                },
              },
            },
          ],
          as: "userAnswers",
        },
      },
    ]);

    res.json(questions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
