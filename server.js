const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const app = express();
const PORT = 3000;
const HOST = '127.0.0.1'; // BOHUT ZAROORI: Sirf aapke system par accessible rahega

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Upload folder setup
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Uploads static route (Taaki browser mein direct link khul sake)
app.use('/uploads', express.static(uploadFolder));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});

const upload = multer({ storage });

// Excel File path
const EXCEL_FILE = path.join(__dirname, 'employees.xlsx');

function appendToExcel(dataRow) {
  let workbook;
  let worksheet;

  if (fs.existsSync(EXCEL_FILE)) {
    workbook = xlsx.readFile(EXCEL_FILE);
    worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const existingData = xlsx.utils.sheet_to_json(worksheet);
    existingData.push(dataRow);
    worksheet = xlsx.utils.json_to_sheet(existingData);
    workbook.Sheets[workbook.SheetNames[0]] = worksheet;
  } else {
    workbook = xlsx.utils.book_new();
    worksheet = xlsx.utils.json_to_sheet([dataRow]);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Employees');
  }

  xlsx.writeFile(workbook, EXCEL_FILE);
}

// Form Submission Route
app.post(
  '/api/submit-employee',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
  ]),
  (req, res) => {
    try {
      const resumeFile = req.files['resume'] ? req.files['resume'][0].filename : null;
      const photoFile = req.files['photo'] ? req.files['photo'][0].filename : null;

      // 1. Browser ke through open karne wala link (Localhost URL)
      // Example: http://127.0.0.1:3000/uploads/filename.pdf
      const resumeLink = resumeFile
        ? `=HYPERLINK("http://127.0.0.1:3000/uploads/${resumeFile}", "Open Resume")`
        : 'No File';

      const photoLink = photoFile
        ? `=HYPERLINK("http://127.0.0.1:3000/uploads/${photoFile}", "View Photo")`
        : 'No File';

      const rowData = {
        'Submission Time': new Date().toLocaleString(),
        'Full Name': req.body.fullName || '',
        'DOB': req.body.dob || '',
        'Contact Number': req.body.contact || '',
        'Email Address': req.body.email || '',
        'Education': req.body.education || '',
        'Course / Branch': req.body.course || '',
        'Resume Link': resumeLink,
        'Photo Link': photoLink
      };

      appendToExcel(rowData);
      console.log(`[EXCEL UPDATED] Entry saved for: ${req.body.fullName}`);

      res.status(200).json({ success: true, message: 'Saved to Excel!' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// Strictly bind to 127.0.0.1
app.listen(PORT, HOST, () => {
  console.log(`Vault running securely at http://${HOST}:${PORT}`);
});