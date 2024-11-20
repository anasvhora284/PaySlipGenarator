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

// Get single salary slip, Update salary slip and Delete salary slip
router
  .route("/:id")
  .get(getSalarySlip)
  .put(updateSalarySlip)
  .delete(deleteSalarySlip);

module.exports = router;
