# SmartCVSender

# 📧 Email Campaign Application - Full Stack Solution

This application allows you to send personalized emails with CV attachments to multiple recipients from an Excel file. It features a modern React frontend and a robust Node.js backend with file upload capabilities.

## 🚀 Features

### Backend Features
- 📥 Read Excel files (`.xlsx`) containing email addresses
- 📧 Send emails via Gmail SMTP
- 📎 Dynamic file attachment support (PDF CVs)
- 📝 Customizable email subject and message
- 🔄 Rate limiting to avoid email provider restrictions
- 📊 Email statistics and health check endpoints
- 🛡️ File validation and security measures

### Frontend Features
- 🎨 Modern, responsive UI with smooth animations
- 📝 Dynamic form for email subject and message customization
- 📁 Drag-and-drop file upload with PDF validation
- ✅ Real-time form validation and error handling
- 📱 Mobile-friendly responsive design
- 🎯 Loading states and success/error feedback
- 💫 Beautiful gradient backgrounds and glassmorphism effects
## 📁 Project Structure

```
SMARTCVS/
│
├── backend/
│   ├── uploads/                            # Temporary file storage for CV uploads
│   ├── .env                               # Environment variables (EMAIL_USER, EMAIL_PASS)
│   ├── package.json                       # Backend dependencies
│   ├── sendEmails.js                      # Main Express server file
│   └── Tunisian_Companies_Emails_Combined.xlsx  # Excel file with email addresses
│
├── frontend/
│   ├── public/
│   │   └── index.html                     # HTML template
│   ├── src/
│   │   ├── App.jsx                        # Main React component
│   │   ├── App.css                        # Main application styles
│   │   ├── main.jsx                       # React entry point
│   │   └── sendemail.jsx                  # Email sending component
│   ├── package.json                       # Frontend dependencies
│   └── vite.config.js                     # Vite configuration
│
└── README.md                              # Project documentation
```


## ✅ Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- Gmail account with App Password enabled
- Excel file with email addresses

## 🛠️ Installation & Setup

### 1. Clone or Download the Project

```bash
git clone <repository-url>
cd smartcvsender
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install express cors dotenv nodemailer xlsx multer
```

Create a `.env` file in the backend directory:

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=5000
```

> 📌 **Important**: Use Gmail App Password, not your regular password!  
> [How to create Gmail App Password](https://support.google.com/accounts/answer/185833)

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install react react-dom lucide-react
```

### 4. Excel File Preparation

Place your Excel file (`Tunisian_Companies_Emails_Combined.xlsx`) in the backend directory. The file should contain:
- A column with email addresses (column name should include "email")
- Valid email formats (e.g., user@domain.com)

## 🚀 Running the Application

### Start the Backend Server

```bash
cd backend
node sendEmails.js
```

The server will start on `http://localhost:5000`

Available endpoints:
- `POST /send-emails` - Send email campaign
- `GET /health` - Health check
- `GET /stats` - Email statistics

### Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The React app will start on `http://localhost:5173`

## 📧 Using the Application

### Step 1: Access the Web Interface
Open your browser and go to `http://localhost:5173`

### Step 2: Fill the Form
1. **Email Subject**: Enter a compelling subject line
   - Example: "Application for Web Developer Position"
   - Example: "Internship Application - Computer Science Student"

2. **Email Message**: Write your personalized message
   ```
   Dear Hiring Manager,
   
   I am writing to express my interest in opportunities at your company.
   As a skilled web developer with expertise in React, Node.js, and modern
   web technologies, I am eager to contribute to your team.
   
   Please find my CV attached for your review.
   
   Best regards,
   [Your Name]
   ```

3. **Upload CV**: Select your PDF resume (max 5MB)

### Step 3: Send Emails
Click "Send Emails" and monitor the progress. The application will:
- Validate your inputs
- Upload your CV temporarily
- Send emails to all addresses in the Excel file
- Provide real-time feedback on success/failure
- Clean up temporary files automatically
