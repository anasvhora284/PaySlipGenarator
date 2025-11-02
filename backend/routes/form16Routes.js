const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Employee = require("../models/Employee");
const SalarySlip = require("../models/SalarySlip");
const {
  calculateForm16Values,
  fillForm16Template,
} = require("../utils/form16Calculator");
const { sendForm16Email } = require("../utils/emailService");
const XLSX = require("xlsx");

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
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
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

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const namePart = employee.name.substring(0, 4).toUpperCase();
    const phonePart = employee.phone.substring(employee.phone.length - 4);
    const expectedPassword = namePart + phonePart;

    if (password !== expectedPassword) {
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

    const files = fs.readdirSync(uploadsDir);

    const fileName = files.find((file) =>
      file.startsWith(`form16_${employeeId}_${financialYear}`)
    );

    if (!fileName) {
      return res.status(404).json({
        success: false,
        message: "Form-16 not found for this financial year",
      });
    }

    const filePath = path.join(uploadsDir, fileName);
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
    const employeeFiles = files.filter((file) =>
      file.startsWith(`form16_${employeeId}_`)
    );

    // Extract financial years from filenames
    const years = employeeFiles
      .map((file) => {
        const match = file.match(/form16_[^_]+_(.+)\.\w+$/);
        return match ? match[1] : null;
      })
      .filter((year) => year !== null);

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

// @desc    Get available financial years from salary slips
// @route   GET /api/form16/available-years-salary/:employeeId
// @access  Public
router.get("/available-years-salary/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const salarySlips = await SalarySlip.find({ employee: employeeId });

    const financialYears = new Set();

    salarySlips.forEach((slip) => {
      const year = slip.year;
      const month = slip.month;

      if (month >= 4) {
        financialYears.add(`${year}-${(year + 1).toString().slice(2)}`);
      } else {
        financialYears.add(`${year - 1}-${year.toString().slice(2)}`);
      }
    });

    const years = Array.from(financialYears).sort().reverse();

    res.json({
      success: true,
      years,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Generate Form 16 XLSX
// @route   GET /api/form16/generate/:employeeId
// @access  Public
router.get("/generate/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { financialYear } = req.query;

    if (!financialYear) {
      return res.status(400).json({
        success: false,
        message: "Financial year is required",
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const salarySlips = await SalarySlip.find({ employee: employeeId });

    const form16Data = calculateForm16Values(salarySlips, financialYear);

    const templatePath = path.join(__dirname, "../../frontend/assets/VK.xlsx");

    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({
        success: false,
        message: "Form 16 template not found",
      });
    }

    const workbook = fillForm16Template(
      templatePath,
      form16Data,
      employee,
      financialYear
    );

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Form16_${employee.name}_${financialYear}.xlsx`
    );

    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get Form 16 data as JSON (for WebView editing)
// @route   GET /api/form16/:employeeId/:financialYear
// @access  Public
router.get("/:employeeId/:financialYear", async (req, res) => {
  try {
    const { employeeId, financialYear } = req.params;

    if (!financialYear) {
      return res.status(400).json({
        success: false,
        message: "Financial year is required",
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const salarySlips = await SalarySlip.find({ employee: employeeId });

    const form16Data = calculateForm16Values(salarySlips, financialYear);

    const templatePath = path.join(__dirname, "../../frontend/assets/VK.xlsx");

    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({
        success: false,
        message: "Form 16 template not found",
      });
    }

    const workbook = fillForm16Template(
      templatePath,
      form16Data,
      employee,
      financialYear
    );

    // Extract data from worksheet with proper empty cell handling
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const merges = worksheet['!merges'] || [];
    
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      blankrows: true,
      raw: false
    });
    
    const maxCols = range.e.c + 1;
    for (let i = 0; i < data.length; i++) {
      if (!data[i]) data[i] = [];
      while (data[i].length < maxCols) {
        data[i].push('');
      }
    }

    res.json({
      success: true,
      data: data,
      merges: merges,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
      },
      financialYear,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Send Form 16 via email
// @route   POST /api/form16/send-email/:employeeId
// @access  Public
router.post("/send-email/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { financialYear, data, merges } = req.body;

    if (!financialYear || !data) {
      return res.status(400).json({
        success: false,
        message: "Financial year and data are required",
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (!employee.email) {
      return res.status(400).json({
        success: false,
        message: "Employee email not found",
      });
    }

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    if (merges && merges.length > 0) {
      worksheet['!merges'] = merges;
    }
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Form-16');
    
    // Convert workbook to buffer
    const fileBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const fileName = `Form16_${employee.name}_${financialYear}.xlsx`;

    // TODO: Save updated Form-16 to database/storage here
    
    await sendForm16Email(
      employee.email,
      employee.name,
      financialYear,
      fileBuffer,
      fileName
    );

    res.json({
      success: true,
      message: "Form-16 sent to employee email successfully",
    });
  } catch (error) {
    console.error("Send email error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send email",
    });
  }
});

module.exports = router;
