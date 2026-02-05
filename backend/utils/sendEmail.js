import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // Use 465 for SSL
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // This helps if the server has strict certificate requirements
      rejectUnauthorized: false,
    },

    connectionTimeout: 10000, // 10 seconds
  });

  const mailOptions = {
    from: `"Job Portal" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  return await transporter.sendMail(mailOptions);
};
