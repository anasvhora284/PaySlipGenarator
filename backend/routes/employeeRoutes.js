const express = require("express");
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

// Base route: /api/employees

// Get all employees and Create new employee
router.route("/").get(getEmployees).post(createEmployee);

// Get single employee, Update employee and Delete employee
router
  .route("/:id")
  .get(getEmployee)
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
