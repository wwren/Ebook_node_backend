const express = require("express");
const fs = require("fs");
const axios = require("axios");
const app = express();
const cors = require("cors");
const multer = require("multer");
const { ocrSpace } = require("ocr-space-api-wrapper");

const apikey = process.env.API_KEY;
const RequestUrl = "https://api.ocr.space/parse/image";

app.use(cors());

let fileName;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
    fileName = file.originalname;
    console.log("fileName", fileName);
  },
});

const upload = multer({ storage: storage });

app.post("/image", upload.single("file"), async function (req, res) {
  try {
    const response = await ocrSpace(`./images/${fileName}`, { apiKey: apikey });

    console.log("res2", response);
    const parsedText = response.ParsedResults[0].ParsedText;

    res.json({ data: parsedText });
  } catch (error) {
    console.error(error);
  }
});

const port = process.env.PORT || 5101;

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
