const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendPasswordResetEmail(toEmail, resetLink) {
  await transporter.sendMail({
    from: `"AfyaFit" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset your AfyaFit password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">AfyaFit</h2>
        <h3 style="color: #1e293b; margin-top: 0;">Reset your password</h3>
        <p style="color: #475569; line-height: 1.6;">
          We received a request to reset the password for your AfyaFit account.
          Click the button below to choose a new password.
        </p>
        <a href="${resetLink}"
           style="display: inline-block; margin: 24px 0; padding: 12px 28px;
                  background: #4f46e5; color: #ffffff; text-decoration: none;
                  border-radius: 6px; font-weight: 600; font-size: 15px;">
          Reset Password
        </a>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
          This link expires in <strong>1 hour</strong>. If you did not request a
          password reset you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #cbd5e1; font-size: 12px;">
          If the button doesn't work, copy and paste this link:<br/>
          <a href="${resetLink}" style="color: #4f46e5; word-break: break-all;">${resetLink}</a>
        </p>
      </div>
    `,
    text: `Reset your AfyaFit password\n\n${resetLink}\n\nThis link expires in 1 hour.`
  });
}

async function sendOtpEmail(toEmail, otp, name) {
  await transporter.sendMail({
    from: `"AfyaFit" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify your AfyaFit account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">AfyaFit</h2>
        <h3 style="color: #1e293b; margin-top: 0;">Verify your email address</h3>
        <p style="color: #475569; line-height: 1.6;">
          Hi ${name || 'there'}, thanks for signing up! Use the code below to verify your email address.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="display: inline-block; font-size: 36px; font-weight: 700;
                       letter-spacing: 10px; color: #4f46e5; background: #ede9fe;
                       padding: 16px 32px; border-radius: 8px;">
            ${otp}
          </span>
        </div>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
          This code expires in <strong>10 minutes</strong>. If you did not create an
          AfyaFit account, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Your AfyaFit verification code is: ${otp}\n\nThis code expires in 10 minutes.`
  });
}

module.exports = { sendPasswordResetEmail, sendOtpEmail };
