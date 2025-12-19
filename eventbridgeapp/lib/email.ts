// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface PasswordResetEmailParams {
  to: string;
  resetUrl: string;
  userName: string;
}

export async function sendPasswordResetEmail({ to, resetUrl, userName }: PasswordResetEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'EventBridge <support@eventbridge.africa>',
      to: [to],
      subject: 'Reset Your Password - EventBridge',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Password Reset Request</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px;">Hi ${userName},</p>
              
              <p style="font-size: 14px; color: #666;">
                We received a request to reset your password for your EventBridge account. 
                Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 14px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          display: inline-block;
                          font-weight: bold;">
                  Reset Password
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                Or copy and paste this link into your browser:
              </p>
              <p style="font-size: 12px; background: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                <strong> This link will expire in 1 hour.</strong>
              </p>
              
              <p style="font-size: 14px; color: #666;">
                If you didn't request this password reset, you can safely ignore this email. 
                Your password will remain unchanged.
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center;">
                © ${new Date().getFullYear()} EventBridge. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

