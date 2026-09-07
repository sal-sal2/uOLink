import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  return res.status(501).json({
    message: "Image uploads are temporarily unavailable.",
  });
});

export default router;
/* Logic for upload previously when on disk, later will be moved to R2 or S3

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images");
    },
    filename: (req, file, cb) => {
      cb(null, req.body.name);
    },
  });
const upload = multer({ storage: storage });

router.post("/", upload.single("file"), (req, res) => {
    try {
      return res.status(200).json("File uploded successfully");
    } catch (error) {
      console.error(error);
    }
  });

export default router;

*/