const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Employee = require("../models/Employee");

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/form16");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload with temporary filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Use temporary filename, will rename after getting body data
    const tempName = `temp_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, tempName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX files are allowed"));
    }
  },
});

// @desc    Upload Form 16
// @route   POST /api/form16/upload
// @access  Public (with password)
router.post("/upload", upload.single("form16"), async (req, res) => {
  try {
    const { password, employeeId, financialYear } = req.body;

    if (password !== process.env.FORM16_PASSWORD) {
      // Delete temp file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!financialYear) {
      // Delete temp file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Financial year is required",
      });
    }

    if (!employeeId) {
      // Delete temp file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      // Delete temp file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Rename the file with proper naming convention
    const extension = path.extname(req.file.originalname);
    const finalFilename = `form16_${employeeId}_${financialYear}${extension}`;
    const finalPath = path.join(uploadsDir, finalFilename);

    // Delete old file if exists for this year
    if (fs.existsSync(finalPath)) {
      fs.unlinkSync(finalPath);
    }

    // Rename temp file to final filename
    fs.renameSync(req.file.path, finalPath);

    res.json({
      success: true,
      message: "Form-16 uploaded successfully",
      filename: finalFilename,
      financialYear,
    });
  } catch (error) {
    console.error(error);
    // Clean up temp file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Download Form 16
// @route   GET /api/form16/download/:employeeId
// @access  Public (with password)
router.get("/download/:employeeId", async (req, res) => {
  try {
    const { password, financialYear } = req.query;
    const { employeeId } = req.params;

    console.log('Download request:', { employeeId, financialYear, password });

    // Generate expected password: first 4 letters of name in capital + last 4 digits of phone
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      console.log('Employee not found:', employeeId);
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const namePart = employee.name.substring(0, 4).toUpperCase();
    const phonePart = employee.phone.substring(employee.phone.length - 4);
    const expectedPassword = namePart + phonePart;

    console.log('Password check:', { provided: password, expected: expectedPassword });

    if (password !== expectedPassword) {
      console.log('Invalid password provided');
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    if (!financialYear) {
      return res.status(400).json({
        success: false,
        message: "Financial year is required",
      });
    }

    // Find the file for specific financial year
    const files = fs.readdirSync(uploadsDir);
    console.log('Available files:', files);
    
    const fileName = files.find(file => file.startsWith(`form16_${employeeId}_${financialYear}`));
    console.log('Found file:', fileName);

    if (!fileName) {
      console.log('File not found for:', { employeeId, financialYear });
      return res.status(404).json({
        success: false,
        message: "Form-16 not found for this financial year",
      });
    }

    const filePath = path.join(uploadsDir, fileName);
    console.log('Sending file:', filePath);
    res.download(filePath, `Form16_${employee.name}_${financialYear}.pdf`);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get available financial years for employee
// @route   GET /api/form16/available-years/:employeeId
// @access  Public
router.get("/available-years/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Find all files for this employee
    const files = fs.readdirSync(uploadsDir);
    const employeeFiles = files.filter(file => file.startsWith(`form16_${employeeId}_`));

    // Extract financial years from filenames
    const years = employeeFiles.map(file => {
      const match = file.match(/form16_[^_]+_(.+)\.\w+$/);
      return match ? match[1] : null;
    }).filter(year => year !== null);

    res.json({
      success: true,
      years: years.sort().reverse(), // Most recent first
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;