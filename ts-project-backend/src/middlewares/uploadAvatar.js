const multer = require('multer');
const multerS3 = require('multer-s3');
const { s3 } = require('../config/s3');

const uploadAvatar = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const ext = file.originalname.split('.').pop();
      const fileName = `avatars/${req.user._id}_${Date.now()}.${ext}`;
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 15 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only images allowed'));
    }
    cb(null, true);
  },
});

module.exports = uploadAvatar;
