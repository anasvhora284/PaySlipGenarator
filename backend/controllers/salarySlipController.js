const SalarySlip = require("../models/SalarySlip");
const { convertToWords } = require("../utils/numberToWords");
const { csvToHtmlWithSmartSpan } = require("../utils/csvToHtmlConverter");

// Get all salary slips
exports.getSalarySlips = async (req, res) => {
  try {
    const salarySlips = await SalarySlip.find().populate(
      "employee",
      "name employeeId designation"
    );
    res.status(200).json(salarySlips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get salary slips by employee
exports.getEmployeeSalarySlips = async (req, res) => {
  try {
    const salarySlips = await SalarySlip.find({
      employee: req.params.employeeId,
    }).populate("employee", "name employeeId designation");
    res.status(200).json(salarySlips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single salary slip
exports.getSalarySlip = async (req, res) => {
  try {
    const salarySlip = await SalarySlip.findById(req.params.id).populate(
      "employee",
      "name employeeId designation"
    );
    if (!salarySlip) {
      return res.status(404).json({ message: "Salary slip not found" });
    }
    res.status(200).json(salarySlip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new salary slip
exports.createSalarySlip = async (req, res) => {
  try {
    const { employee, month, year, earnings, deductions } = req.body;

    // Check if salary slip already exists for this employee and month/year
    const existingSalarySlip = await SalarySlip.findOne({
      employee,
      month,
      year,
    });

    if (existingSalarySlip) {
      return res.status(400).json({
        message:
          "Salary slip already exists for this employee in the specified month and year",
      });
    }

    // Calculate totals
    const totalEarnings = Object.values(earnings).reduce((a, b) => a + b, 0);
    const totalDeductions = Object.values(deductions).reduce(
      (a, b) => a + b,
      0
    );
    const netSalary = totalEarnings - totalDeductions;

    // Convert net salary to words
    const salaryInWords = convertToWords(netSalary);

    const salarySlip = await SalarySlip.create({
      employee,
      month,
      year,
      earnings,
      deductions,
      totalEarnings,
      totalDeductions,
      netSalary,
      salaryInWords,
    });

    await salarySlip.populate("employee", "name employeeId designation");
    res.status(201).json(salarySlip);
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error
      res.status(400).json({
        message:
          "Salary slip already exists for this employee in the specified month and year",
      });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Update salary slip
exports.updateSalarySlip = async (req, res) => {
  try {
    const salarySlip = await SalarySlip.findById(req.params.id);
    if (!salarySlip) {
      return res.status(404).json({ message: "Salary slip not found" });
    }

    // If month or year is being updated, check for existing salary slip
    if (req.body.month || req.body.year) {
      const existingSalarySlip = await SalarySlip.findOne({
        employee: salarySlip.employee,
        month: req.body.month || salarySlip.month,
        year: req.body.year || salarySlip.year,
        _id: { $ne: req.params.id }, // Exclude current salary slip
      });

      if (existingSalarySlip) {
        return res.status(400).json({
          message:
            "Salary slip already exists for this employee in the specified month and year",
        });
      }
    }

    // If earnings or deductions are updated, recalculate totals
    if (req.body.earnings || req.body.deductions) {
      const earnings = req.body.earnings || salarySlip.earnings;
      const deductions = req.body.deductions || salarySlip.deductions;

      req.body.totalEarnings = Object.values(earnings).reduce(
        (a, b) => a + b,
        0
      );
      req.body.totalDeductions = Object.values(deductions).reduce(
        (a, b) => a + b,
        0
      );
      req.body.netSalary = req.body.totalEarnings - req.body.totalDeductions;
      req.body.salaryInWords = convertToWords(req.body.netSalary);
    }

    const updatedSalarySlip = await SalarySlip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("employee", "name employeeId designation");

    res.status(200).json(updatedSalarySlip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete salary slip
exports.deleteSalarySlip = async (req, res) => {
  try {
    const salarySlip = await SalarySlip.findByIdAndDelete(req.params.id);
    if (!salarySlip) {
      return res.status(404).json({ message: "Salary slip not found" });
    }
    res.status(200).json({ message: "Salary slip deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Convert CSV to HTML with smart colspan/rowspan
exports.convertCsvToHtml = async (req, res) => {
  try {
    const { csvContent } = req.body;

    if (!csvContent) {
      return res.status(400).json({ message: "CSV content is required" });
    }

    // Convert CSV to HTML using JavaScript converter
    const htmlOutput = csvToHtmlWithSmartSpan(csvContent);

    res.status(200).json({
      success: true,
      html: htmlOutput,
    });
  } catch (error) {
    console.error("CSV conversion error:", error);
    res.status(500).json({
      message: "Failed to convert CSV to HTML",
      error: error.message,
    });
  }
};
