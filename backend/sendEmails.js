import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import xlsx from 'xlsx';
import fs from 'fs';
import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// NOW add the debug lines here (after __dirname is defined)
console.log('🔍 Debug - EMAIL_USER:', process.env.EMAIL_USER);
console.log('🔍 Debug - EMAIL_PASS:', process.env.EMAIL_PASS ? 'EXISTS' : 'MISSING');
console.log('🔍 Debug - Current directory:', process.cwd());
console.log('🔍 Debug - __dirname:', __dirname);

const app = express();
const port = process.env.PORT || 5000;
app.use(cors({
  origin: 'http://localhost:5173' // Allow frontend origin
}));
app.use(express.json());

const { EMAIL_USER, EMAIL_PASS } = process.env;

const workbookPath = join(__dirname, './Tunisian_Companies_Emails_Combined.xlsx');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `cv-${uniqueSuffix}.pdf`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Enhanced email sending endpoint
app.post('/send-emails', upload.single('cv'), async (req, res) => {
  try {
    const { subject, message } = req.body;
    const cvFile = req.file;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    if (!cvFile) {
      return res.status(400).json({
        success: false,
        message: 'CV file is required'
      });
    }

    const workbook = xlsx.readFile(workbookPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    const emails = data
      .map(row => {
        for (let key in row) {
          if (key.toLowerCase().includes("email")) {
            return row[key];
          }
        }
        return null;
      })
      .filter(email => email && email.includes('@'))
      .filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

    if (emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid emails found in Excel file'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    });

    await transporter.verify();

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const email of emails) {
      try {
        await transporter.sendMail({
          from: `"Islem" <${EMAIL_USER}>`,
          to: email,
          subject: subject,
          text: message,
          attachments: [{
            filename: 'CV.pdf',
            path: cvFile.path
          }]
        });
        sent++;
        console.log(`✅ Email sent to: ${email}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (emailError) {
        failed++;
        errors.push({ email, error: emailError.message });
        console.error(`❌ Failed to send to ${email}:`, emailError.message);
      }
    }

    setTimeout(() => {
      if (fs.existsSync(cvFile.path)) {
        fs.unlinkSync(cvFile.path);
        console.log('Uploaded CV file cleaned up');
      }
    }, 5000);

    res.json({
      success: true,
      sent,
      failed,
      total: emails.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    console.error('Server error:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get email statistics endpoint
app.get('/stats', (req, res) => {
  try {
    const workbook = xlsx.readFile(workbookPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    const emails = data
      .map(row => {
        for (let key in row) {
          if (key.toLowerCase().includes("email")) {
            return row[key];
          }
        }
        return null;
      })
      .filter(email => email && email.includes('@'));

    res.json({
      totalEmails: emails.length,
      excelFile: 'tjrba.xlsx'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Could not read Excel file'
    });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  res.status(500).json({
    success: false,
    message: error.message
  });
});

app.listen(port, () => {
  console.log(`🚀 Enhanced Backend listening at http://localhost:${port}`);
  console.log(`📊 Stats available at http://localhost:${port}/stats`);
  console.log(`❤️ Health check at http://localhost:${port}/health`);
});