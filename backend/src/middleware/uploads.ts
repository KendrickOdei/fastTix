import multer from 'multer'

const storage = multer.memoryStorage();

export const uploads = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1].toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg, .jpeg, .png files are allowed'));
    }
  },
  
});