import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_USER_PASSWORD,
  },
});

export const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `SnapNest App <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};
