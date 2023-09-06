const express = require('express')
const fs = require('fs');
const axios = require('axios');
const app = express()
const cors = require('cors')
const multer = require('multer')


let fileName;

const LicenseCode = '26184D1B-87E8-4E37-8F21-990BE0323376';
const UserName = 'wwren';
const RequestUrl = 'http://www.ocrwebservice.com/restservices/processDocument?gettext=true';

const config = {
  auth: {
    username: UserName,
    password: LicenseCode,
  },
  headers: {
    'Content-Type': 'application/octet-stream',
  },
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
    fileName = file.originalname
    console.log('fileName', fileName)
  },
})

const upload = multer({ storage: storage })

app.use(cors())

app.post('/image', upload.single('file'), function (req, res) {
  const FilePath = `./images/${fileName}`;
  const image_data = fs.readFileSync(FilePath);

  axios
  .post(RequestUrl, image_data, config)
  .then((response) => {
    if (response.status === 401) {
      // Please provide valid username and license code
      console.log('Unauthorized request');
      return;
    }

    const jobj = response.data;

    const ocrError = jobj.ErrorMessage;

    if (ocrError !== '') {
      // Error occurs during recognition
      console.log('Recognition Error: ' + ocrError);
      return;
    }

    console.log('jobj', jobj)
    // Task description
    console.log('Task Description: ' + jobj.TaskDescription);

    // Available pages
    console.log('Available Pages: ' + jobj.AvailablePages);

    // Processed pages
    console.log('Processed Pages: ' + jobj.ProcessedPages);

    // Extracted text from first or single page
    console.log('Extracted Text: ' + jobj.OCRText[0][0]);

    // Extracted text from second page (if multipage doc converted)
    // console.log('Extracted Text: ' + jobj.OCRText[0][1]);

    // Get extracted text from First zone for each page
    console.log('Zone 1 Page 1 Text: ' + jobj.OCRText[0][0]);
    // console.log('Zone 1 Page 2 Text: ' + jobj.OCRText[0][1]);

    // Get extracted text from Second zone for each page
    // console.log('Zone 2 Page 1 Text: ' + jobj.OCRText[1][0]);
    // console.log('Zone 2 Page 2 Text: ' + jobj.OCRText[1][1]);

    // Download output file (if outputformat was specified)
    // axios.get(jobj.OutputFileUrl, { responseType: 'stream' }).then((file_response) => {
    //   const output_file = fs.createWriteStream('outputDoc.doc');
    //   file_response.data.pipe(output_file);
    // });
  })
  .catch((error) => {
    console.error('Error:', error);
  });

  res.json({})
})

const port = process.env.PORT || 5101

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})
