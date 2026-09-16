const multer = require("multer");

// Memory storage - files are never written to disk, just held as Buffers,
// ready to save directly into MongoDB.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isPdf = file.mimetype === "application/pdf";
    if (file.fieldname === "receipt" && !isImage) {
      return cb(new Error("Only image files are allowed for the payment receipt"));
    }
    if (file.fieldname === "additionalFiles" && !isImage && !isPdf) {
      return cb(new Error("Only image or PDF files are allowed for additional files"));
    }
    cb(null, true);
  },
});

module.exports = upload;