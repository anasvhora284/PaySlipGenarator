const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const calculateForm16Values = (salarySlips, financialYear) => {
  const [startYearStr, endYearStr] = financialYear.split("-");
  const startYear = parseInt(startYearStr);
  const endYearShort = parseInt(endYearStr);
  const endYear = startYear < 2000 ? 2000 + endYearShort : startYear + 1;
  const startMonth = 4;
  const endMonth = 3;

  const filteredSlips = salarySlips.filter((slip) => {
    const slipYear = slip.year;
    const slipMonth = slip.month;

    if (slipYear === startYear) {
      return slipMonth >= startMonth;
    } else if (slipYear === endYear) {
      return slipMonth <= endMonth;
    }
    return false;
  });

  let totalEarnings = 0;
  let totalDeductions = 0;
  let totalBasic = 0;
  let totalDA = 0;
  let totalHRA = 0;
  let totalTA = 0;
  let totalPF = 0;
  let totalESI = 0;
  let totalLoan = 0;
  let totalTax = 0;

  filteredSlips.forEach((slip) => {
    totalEarnings += slip.totalEarnings || 0;
    totalDeductions += slip.totalDeductions || 0;
    totalBasic += slip.earnings?.basic || 0;
    totalDA += slip.earnings?.da || 0;
    totalHRA += slip.earnings?.hra || 0;
    totalTA += slip.earnings?.ta || 0;
    totalPF += slip.deductions?.providentFund || 0;
    totalESI += slip.deductions?.esi || 0;
    totalLoan += slip.deductions?.loan || 0;
    totalTax += slip.deductions?.tax || 0;
  });

  const grossSalary = totalEarnings;
  const standardDeduction = 75000;
  const transportAllowance = 0;
  const balanceAfterAllowance =
    grossSalary - standardDeduction - transportAllowance;
  const entertainmentAllowance = 0;
  const taxOnEmployment = totalTax;
  const aggregateDeductions = entertainmentAllowance + taxOnEmployment;
  const incomeChargeable = balanceAfterAllowance - aggregateDeductions;

  const taxableIncome = incomeChargeable;
  let taxOnIncome = 0;

  if (taxableIncome <= 250000) {
    taxOnIncome = 0;
  } else if (taxableIncome <= 500000) {
    taxOnIncome = (taxableIncome - 250000) * 0.05;
  } else if (taxableIncome <= 1000000) {
    taxOnIncome = 12500 + (taxableIncome - 500000) * 0.2;
  } else {
    taxOnIncome = 112500 + (taxableIncome - 1000000) * 0.3;
  }

  const rebateUnder87A =
    taxableIncome <= 500000 ? Math.min(taxOnIncome, 12500) : 0;

  const taxAfterRebate = taxOnIncome - rebateUnder87A;

  const educationCess = Math.round(taxAfterRebate * 0.04);

  const taxPayable = taxAfterRebate + educationCess;


  return {
    grossSalary,
    totalBasic,
    totalDA,
    totalHRA,
    totalTA,
    standardDeduction,
    transportAllowance,
    balanceAfterAllowance,
    entertainmentAllowance,
    taxOnEmployment,
    aggregateDeductions,
    incomeChargeable,
    taxableIncome,
    taxOnIncome,
    rebateUnder87A,
    educationCess,
    taxPayable,
    totalPF,
    totalESI,
    totalLoan,
    deductions: {
      totalPF,
      totalESI,
      totalLoan,
    },
  };
};

const fillForm16Template = (templatePath, data, employee, financialYear) => {
  if (!fs.existsSync(templatePath)) {
    throw new Error("Template file not found");
  }

  const workbook = XLSX.readFile(templatePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const [startYearStr, endYearStr] = financialYear.split("-");
  const startYear = parseInt(startYearStr);
  const endYearShort = parseInt(endYearStr);
  const endYear = startYear < 2000 ? 2000 + endYearShort : startYear + 1;

  const assessmentYear = `${endYear}-${(endYear + 1).toString().slice(2)}`;
  const fromDate = `01-04-${startYear}`;
  const toDate = `31-03-${endYear}`;

  const currentDate = new Date();
  const formattedDate = `${String(currentDate.getDate()).padStart(
    2,
    "0"
  )}-${String(currentDate.getMonth() + 1).padStart(
    2,
    "0"
  )}-${currentDate.getFullYear()}`;

  if (worksheet["G8"]) {
    worksheet["G8"].v = employee.name || "";
    worksheet["G8"].t = "s";
  } else {
    worksheet["G8"] = { t: "s", v: employee.name || "" };
  }

  if (worksheet["G9"]) {
    worksheet["G9"].v = employee.designation || "";
    worksheet["G9"].t = "s";
  } else {
    worksheet["G9"] = { t: "s", v: employee.designation || "" };
  }

  if (worksheet["A12"]) {
    worksheet["A12"].v = employee.employerPAN || "";
    worksheet["A12"].t = "s";
  } else {
    worksheet["A12"] = { t: "s", v: employee.employerPAN || "" };
  }

  if (worksheet["D12"]) {
    worksheet["D12"].v = employee.employerTAN || "";
    worksheet["D12"].t = "s";
  } else {
    worksheet["D12"] = { t: "s", v: employee.employerTAN || "" };
  }

  if (worksheet["E12"]) {
    worksheet["E12"].v = employee.pan || "";
    worksheet["E12"].t = "s";
  } else {
    worksheet["E12"] = { t: "s", v: employee.pan || "" };
  }

  worksheet["G15"] = { t: "s", v: assessmentYear };
  worksheet["I15"] = { t: "s", v: fromDate };
  worksheet["K15"] = { t: "s", v: toDate };

  const verificationTextPartA = `I, ${
    employee.authorizedPersonName || employee.name
  }, working in the capacity of ${
    employee.authorizedPersonDesignation || employee.designation
  } do hereby certify that a sum of Rs ${data.taxPayable.toFixed(
    2
  )} has been deducted at source and paid to the credit of the Central Government. I further certify that the information given above is true and correct based on the books of account, documents and other available records.`;
  worksheet["B39"] = { t: "s", v: verificationTextPartA };

  worksheet["C43"] = { t: "s", v: formattedDate };
  worksheet["C44"] = {
    t: "s",
    v: employee.authorizedPersonDesignation || employee.designation || "",
  };
  worksheet["E44"] = {
    t: "s",
    v: employee.authorizedPersonName || employee.name || "",
  };

  worksheet["E18"] = { t: "n", v: 0 };
  worksheet["G18"] = { t: "n", v: 0 };
  worksheet["I18"] = { t: "n", v: 0 };

  worksheet["E19"] = { t: "n", v: 0 };
  worksheet["G19"] = { t: "n", v: 0 };
  worksheet["I19"] = { t: "n", v: 0 };

  worksheet["E20"] = { t: "n", v: 0 };
  worksheet["G20"] = { t: "n", v: 0 };
  worksheet["I20"] = { t: "n", v: 0 };

  worksheet["E21"] = { t: "n", v: 0 };
  worksheet["G21"] = { t: "n", v: 0 };
  worksheet["I21"] = { t: "n", v: 0 };

  worksheet["E22"] = { t: "n", v: 0 };
  worksheet["G22"] = { t: "n", v: 0 };
  worksheet["I22"] = { t: "n", v: 0 };

  worksheet["B29"] = { t: "n", v: 0 };
  worksheet["B37"] = { t: "n", v: 0 };

  worksheet["G55"] = { t: "n", v: data.grossSalary };
  worksheet["G59"] = { t: "n", v: data.grossSalary };

  worksheet["D62"] = { t: "n", v: data.standardDeduction };
  worksheet["F62"] = { t: "n", v: data.standardDeduction };
  worksheet["G62"] = { t: "n", v: data.standardDeduction };

  worksheet["D63"] = { t: "n", v: data.transportAllowance };
  worksheet["F63"] = { t: "n", v: data.transportAllowance };
  worksheet["G63"] = { t: "n", v: data.transportAllowance };

  worksheet["G64"] = { t: "n", v: data.balanceAfterAllowance };

  worksheet["G66"] = { t: "n", v: data.entertainmentAllowance };
  worksheet["D67"] = { t: "n", v: data.taxOnEmployment };
  worksheet["F67"] = { t: "n", v: data.taxOnEmployment };

  worksheet["G69"] = { t: "n", v: data.incomeChargeable };

  worksheet["G72"] = { t: "n", v: data.incomeChargeable };

  worksheet["G73"] = { t: "n", v: 0 };

  worksheet["G86"] = { t: "n", v: 0 };

  worksheet["G87"] = { t: "n", v: data.taxableIncome };

  worksheet["G88"] = { t: "n", v: data.taxOnIncome };

  worksheet["G89"] = { t: "n", v: data.rebateUnder87A };

  worksheet["G90"] = { t: "n", v: data.educationCess };

  worksheet["G91"] = { t: "n", v: data.taxPayable };

  worksheet["G92"] = { t: "n", v: 0 };

  worksheet["G93"] = { t: "n", v: data.taxPayable };

  const verificationTextPartB = `I, ${
    employee.authorizedPersonName || employee.name
  }, working in the capacity of ${
    employee.authorizedPersonDesignation || employee.designation
  } do hereby certify that the information given above is true, complete and correct and is based on the books of account, documents, TDS statements and other available records.`;
  worksheet["B95"] = { t: "s", v: verificationTextPartB };

  worksheet["C97"] = { t: "s", v: formattedDate };
  worksheet["C98"] = {
    t: "s",
    v: employee.authorizedPersonDesignation || employee.designation || "",
  };
  worksheet["E98"] = {
    t: "s",
    v: employee.authorizedPersonName || employee.name || "",
  };

  return workbook;
};

module.exports = {
  calculateForm16Values,
  fillForm16Template,
};
