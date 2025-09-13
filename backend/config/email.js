const nodemailer = require('nodemailer');

// Create transporter for sending emails
const createTransporter = () => {
  // In production, you would use environment variables for these settings
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'your_email@ethereal.email',
      pass: process.env.EMAIL_PASS || 'your_password'
    }
  });

  return transporter;
};

// Generate email verification URL
const generateVerificationUrl = (token) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${baseUrl}/auth/verify-email?token=${token}`;
};

module.exports = {
  createTransporter,
  generateVerificationUrl
};