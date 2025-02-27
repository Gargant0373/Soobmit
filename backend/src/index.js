const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const logger = require("./logger");

const app = express();
const PORT = 3000;

app.use(cors());

// const uploadDir = path.join(__dirname, "..", "uploads");
const uploadDir = "/media/valentin-puternic/DISCUL TARE/";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    logger.info(`Created directory: ${uploadDir}`);
}

app.get("/ping", (req, res) => {
    logger.info("Received /ping request");
    res.status(200).send({ message: "Server is reachable" });
});

const getFormattedDate = () => {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      logger.info(`File upload request for: ${file.originalname}`);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${getFormattedDate()}_${file.originalname}`;
      logger.info(`Storing file as: ${uniqueName}`);
      cb(null, uniqueName);
    }
  });
  

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        logger.error("No file was uploaded");
        return res.status(400).send({ error: "No file uploaded" });
    }
    logger.info(`File uploaded successfully: ${req.file.filename}`);
    res.status(200).send({ message: "File uploaded successfully!", filename: req.file.filename });
});

app.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
});
