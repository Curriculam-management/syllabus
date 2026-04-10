const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  getDashboard,
  submitFeedback,
  updateCurriculum,
  createMeeting,
  addDocument,
  submitCqiEntry,
  advanceWorkflow,
  rejectWorkflow,
  publishCurriculum,
} = require("../services/governanceService");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);
    const safeName = path
      .basename(file.originalname, extension)
      .replace(/[^a-z0-9_-]+/gi, "-")
      .toLowerCase();

    callback(null, `${safeName}-${uniqueSuffix}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8,
  },
});

router.get("/dashboard", async (req, res, next) => {
  try {
    const role = req.query.role || "HOD";
    const data = await getDashboard(role);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/feedback", async (req, res, next) => {
  try {
    const data = await submitFeedback(req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/curriculum", async (req, res, next) => {
  try {
    const data = await updateCurriculum(req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/meetings", async (req, res, next) => {
  try {
    const data = await createMeeting(req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/documents", async (req, res, next) => {
  try {
    const data = await addDocument(req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/upload", upload.array("files", 8), async (req, res) => {
  const files = (req.files || []).map((file) => ({
    originalName: file.originalname,
    fileName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    url: `/uploads/${file.filename}`,
  }));

  res.status(201).json({ files });
});

router.post("/cqi", async (req, res, next) => {
  try {
    const data = await submitCqiEntry(req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/workflow/advance", async (req, res, next) => {
  try {
    const data = await advanceWorkflow(req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/workflow/reject", async (req, res, next) => {
  try {
    const data = await rejectWorkflow(req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/workflow/publish", async (req, res, next) => {
  try {
    const data = await publishCurriculum(req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
