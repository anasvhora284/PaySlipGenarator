const SalarySlip = require("../models/SalarySlip");
const { convertToWords } = require("../utils/numberToWords");

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
    res.status(500).json({ message: error.message });
  }
};

// Update salary slip
exports.updateSalarySlip = async (req, res) => {
  try {
    const salarySlip = await SalarySlip.findById(req.params.id);
    if (!salarySlip) {
      return res.status(404).json({ message: "Salary slip not found" });
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
