const multer = require('multer');
const uuid = require('uuid/v1');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const fileUpload = multer({
  limits: { fileSize: 1024 * 1024 },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./images/");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, `${ uuid() + '.' + ext }`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    if (!isValid) {
      if (req.file) {
        fs.unlink(req.file.path, err => {
          console.log(err)
        });
      }
      return cb(new Error('Invalid Mime Type'), false);
    } else {
      cb(null, isValid);
    }
  }
})

module.exports = fileUpload;
