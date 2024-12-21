const User = require('../models/user');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/profiles',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateProfile = [
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      const updates = { ...req.body };
      if (req.file) {
        updates.profilePicture = req.file.path;
      }

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        updates,
        { new: true }
      ).select('-password');

      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
];