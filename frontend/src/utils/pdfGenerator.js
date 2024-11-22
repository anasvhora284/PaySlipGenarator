import RNHTMLtoPDF from 'react-native-html-to-pdf';
import moment from 'moment';

const generateSalarySlipHTML = (salarySlip, employeeName, employeeId) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Helvetica', sans-serif;
            padding: 40px;
            margin: 0;
            color: #333;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2196F3;
          }
          
          .company-logo {
            width: 100%;
            text-align: center;
            margin-bottom: 20px;
          }
          
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #1976D2;
            margin-bottom: 10px;
          }
          
          .slip-title {
            font-size: 24px;
            color: #333;
            margin: 15px 0;
          }
          
          .period {
            font-size: 18px;
            color: #666;
            font-weight: 500;
          }
          
          .employee-details {
            width: 100%;
            margin: 30px 0;
            border-collapse: collapse;
          }
          
          .employee-details td {
            padding: 12px;
            border: 1px solid #E0E0E0;
          }
          
          .employee-details .label {
            background-color: #F5F5F5;
            font-weight: 500;
            width: 30%;
          }
          
          .salary-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          .salary-table th {
            background-color: #2196F3;
            color: white;
            padding: 15px;
            text-align: left;
          }
          
          .salary-table td {
            padding: 12px 15px;
            border: 1px solid #E0E0E0;
          }
          
          .salary-table tr:nth-child(even) {
            background-color: #F8F9FA;
          }
          
          .total-row {
            background-color: #EEF2F6 !important;
            font-weight: bold;
          }
          
          .net-salary-section {
            margin-top: 40px;
            padding: 20px;
            background-color: #E3F2FD;
            border-radius: 8px;
            text-align: right;
          }
          
          .net-salary-label {
            font-size: 20px;
            color: #1976D2;
            font-weight: bold;
          }
          
          .net-salary-amount {
            font-size: 24px;
            color: #1976D2;
            font-weight: bold;
            margin-left: 20px;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E0E0E0;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Your Company Name</div>
          <div class="slip-title">Salary Slip</div>
          <div class="period">${moment(
            `${salarySlip.year}-${salarySlip.month}-01`,
          ).format('MMMM YYYY')}</div>
        </div>

        <table class="employee-details">
          <tr>
            <td class="label">Employee Name</td>
            <td>${employeeName}</td>
            <td class="label">Employee ID</td>
            <td>${employeeId}</td>
          </tr>
          <tr>
            <td class="label" colspan="2">Designation</td>
            <td colspan="2">${salarySlip.employee.designation || 'N/A'}</td>
          </tr>
        </table>

        <table class="salary-table">
          <tr>
            <th colspan="2">Earnings</th>
            <th colspan="2">Deductions</th>
          </tr>
          <tr>
            <td>Component</td>
            <td>Amount</td>
            <td>Component</td>
            <td>Amount</td>
          </tr>
          ${generateSalaryRows(salarySlip)}
          <tr class="total-row">
            <td>Total Earnings</td>
            <td>₹${formatAmount(salarySlip.totalEarnings)}</td>
            <td>Total Deductions</td>
            <td>₹${formatAmount(salarySlip.totalDeductions)}</td>
          </tr>
        </table>

        <div class="net-salary-section">
          <span class="net-salary-label">Net Salary:</span>
          <span class="net-salary-amount">₹${formatAmount(
            salarySlip.netSalary,
          )}</span>
        </div>

        <div class="footer">
          <p>This is a computer-generated document. No signature is required.</p>
          <p>For any queries, please contact HR Department</p>
        </div>
      </body>
    </html>
  `;
};

// Helper function to format amounts with commas and decimals
const formatAmount = amount => {
  return amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};

// Helper function to generate salary component rows
const generateSalaryRows = salarySlip => {
  const earnings = Object.entries(salarySlip.earnings);
  const deductions = Object.entries(salarySlip.deductions);
  const maxRows = Math.max(earnings.length, deductions.length);

  let rows = '';
  for (let i = 0; i < maxRows; i++) {
    const earning = earnings[i] || ['', ''];
    const deduction = deductions[i] || ['', ''];

    rows += `
      <tr>
        <td>${earning[0].toUpperCase() || '-'}</td>
        <td>${earning[1] ? '₹' + formatAmount(earning[1]) : '-'}</td>
        <td>${deduction[0].toUpperCase() || '-'}</td>
        <td>${deduction[1] ? '₹' + formatAmount(deduction[1]) : '-'}</td>
      </tr>
    `;
  }
  return rows;
};

export const generateSalarySlipPDF = async (
  salarySlip,
  employeeName,
  employeeId,
) => {
  try {
    const options = {
      html: generateSalarySlipHTML(salarySlip, employeeName, employeeId),
      fileName: `SalarySlip_${employeeName}_${salarySlip.month}_${salarySlip.year}`,
      directory: 'Documents',
      base64: true,
    };

    const file = await RNHTMLtoPDF.convert(options);
    return file.base64;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};
