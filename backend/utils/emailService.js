const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendForm16Email = async (
  toEmail,
  employeeName,
  financialYear,
  fileBuffer,
  fileName
) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: toEmail,
      subject: `Form-16 for Financial Year ${financialYear}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2D6A4F;">Form-16 Certificate</h2>
          <p>Dear ${employeeName},</p>
          <p>Please find attached your Form-16 certificate for the financial year ${financialYear}.</p>
          <p>This certificate contains details of your salary and tax deductions for the specified financial year.</p>
          <p>If you have any questions, please contact your HR department.</p>
          <br>
          <p>Best regards,<br>HR Department</p>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: fileBuffer,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = {
  sendForm16Email,
};
