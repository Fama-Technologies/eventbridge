import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
  userName: string;
  expiresAt: Date;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  userName,
  expiresAt,
}: SendPasswordResetEmailParams) {
  const expiryTime = expiresAt.toLocaleString();

  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 40px auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content { 
            padding: 40px 30px;
          }
          .content p {
            margin: 0 0 20px 0;
            color: #555;
          }
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          .button { 
            display: inline-block; 
            padding: 16px 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }
          .warning { 
            background-color: #fff9e6; 
            border-left: 4px solid #ffc107; 
            padding: 20px; 
            margin: 25px 0;
            border-radius: 6px;
          }
          .warning strong {
            display: block;
            margin-bottom: 10px;
            color: #333;
          }
          .warning ul {
            margin: 10px 0 0 0;
            padding-left: 20px;
          }
          .warning li {
            margin: 8px 0;
            color: #666;
          }
          .link-box {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            word-break: break-all;
            color: #667eea;
            font-size: 13px;
            margin: 20px 0;
            border: 1px solid #e9ecef;
          }
          .footer { 
            background: #f8f9fa;
            text-align: center; 
            color: #666; 
            font-size: 13px; 
            padding: 30px;
            border-top: 1px solid #e9ecef;
          }
          .footer p {
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            
            <div class="button-container">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
              <strong>Important Security Information:</strong>
              <ul>
                <li>This link expires at <strong>${expiryTime}</strong> (in 1 hour)</li>
                <li>This link can only be used <strong>once</strong></li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
            <div class="link-box">${resetUrl}</div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              For security reasons, we cannot reset your password directly. You must use this link to create a new password.
            </p>
          </div>
          <div class="footer">
            <p><strong>This is an automated email. Please do not reply.</strong></p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p>If you're concerned about your account security, please contact our support team.</p>
            <p style="margin-top: 20px; color: #999;">&copy; ${new Date().getFullYear()} Your App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
