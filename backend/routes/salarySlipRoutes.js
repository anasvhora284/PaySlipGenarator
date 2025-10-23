const express = require("express");
const router = express.Router();
const {
  getSalarySlips,
  getSalarySlip,
  getEmployeeSalarySlips,
  createSalarySlip,
  updateSalarySlip,
  deleteSalarySlip,
} = require("../controllers/salarySlipController");

// Base route: /api/salaryslips

// Get all salary slips and Create new salary slip
router.route("/").get(getSalarySlips).post(createSalarySlip);

// Get all salary slips for a specific employee
router.route("/employee/:employeeId").get(getEmployeeSalarySlips);

// Verify salary slip password
router.post("/verify-password", (req, res) => {
  try {
    const { password } = req.body;
    
    if (password === process.env.SALARY_SLIP_PASSWORD) {
      return res.json({
        success: true,
        message: "Password verified",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get single salary slip, Update salary slip and Delete salary slip
router
  .route("/:id")
  .get(getSalarySlip)
  .put(updateSalarySlip)
  .delete(deleteSalarySlip);

module.exports = router;
