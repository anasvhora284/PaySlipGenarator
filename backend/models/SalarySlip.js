const mongoose = require("mongoose");

const salarySlipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
    earnings: {
      basic: {
        type: Number,
        required: true,
        min: 0,
      },
      da: {
        type: Number,
        required: true,
        min: 0,
      },
      hra: {
        type: Number,
        required: true,
        min: 0,
      },
      ta: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    deductions: {
      providentFund: {
        type: Number,
        required: true,
        min: 0,
      },
      esi: {
        type: Number,
        required: true,
        min: 0,
      },
      loan: {
        type: Number,
        required: true,
        min: 0,
      },
      tax: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    totalEarnings: {
      type: Number,
      required: true,
      min: 0,
    },
    totalDeductions: {
      type: Number,
      required: true,
      min: 0,
    },
    netSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    salaryInWords: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate salary slips for the same employee in the same month/year
salarySlipSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

// Pre-save middleware to calculate totals
salarySlipSchema.pre("save", function (next) {
  // Calculate total earnings
  this.totalEarnings = Object.values(this.earnings).reduce((a, b) => a + b, 0);

  // Calculate total deductions
  this.totalDeductions = Object.values(this.deductions).reduce(
    (a, b) => a + b,
    0
  );

  // Calculate net salary
  this.netSalary = this.totalEarnings - this.totalDeductions;

  next();
});

module.exports = mongoose.model("SalarySlip", salarySlipSchema);
