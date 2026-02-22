import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // ✅ matches your .env
    pass: process.env.EMAIL_PASS, // ✅ matches your .env
  },
});

export const sendMail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: `"EzRent Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
