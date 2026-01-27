import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PRODUCTION-READY Email Service using Nodemailer
 * 
 * ✅ Uses real SMTP (Gmail, Outlook, or custom SMTP server)
 * ✅ Proper error handling and logging
 * ✅ HTML and plain text support
 * ✅ Supports multiple email providers
 * ✅ Rate limiting friendly (can be integrated with Redis)
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    // Choose email provider based on configuration
    const provider = process.env.EMAIL_PROVIDER || 'gmail';

    try {
      if (provider === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS // Use Gmail App Password, not regular password
          }
        });
      } else if (provider === 'outlook') {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.outlook.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
      } else {
        // Custom SMTP provider
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
      }

      console.log(`✅ Email service initialized with ${provider.toUpperCase()} SMTP`);
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      throw new Error(`Email service initialization failed: ${error.message}`);
    }
  }

  /**
   * Verify email configuration is working
   */
  async verifyConfiguration() {
    try {
      await this.transporter.verify();
      console.log('✅ Email configuration verified successfully');
      return true;
    } catch (error) {
      console.error('❌ Email configuration failed:', error.message);
      return false;
    }
  }

  /**
   * Send email with HTML and plain text
   */
  async sendEmail({ to, subject, text, html, from = null }) {
    if (!this.transporter) {
      throw new Error('Email service not initialized');
    }

    const senderEmail = from || process.env.SMTP_FROM || process.env.SMTP_USER;

    try {
      const info = await this.transporter.sendMail({
        from: senderEmail,
        to,
        subject,
        text,
        html: html || text // Fallback to text if HTML not provided
      });

      console.log(`✅ Email sent to ${to} | Message ID: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error.message);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(user, verificationLink) {
    const verificationUrl = verificationLink;
    
    const text = `Hi ${user.name || 'there'},

Please verify your PebbleNotes account by clicking the link below:
${verificationUrl}

This link expires in 24 hours.

If you did not create this account, please ignore this email.

Best regards,
PebbleNotes Team`;

    const html = `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 700;">PebbleNotes</h1>
          <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 14px;">Verify Your Account</p>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 40px 30px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hi <strong>${user.name || 'there'}</strong>,
          </p>
          
          <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
            Welcome to PebbleNotes! Please verify your email address to complete your registration and unlock all features.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0; padding: 20px 0 0 0; border-top: 1px solid #e5e7eb;">
            If the button above doesn't work, copy and paste this link in your browser:
          </p>
          
          <p style="color: #1f2937; font-size: 12px; word-break: break-all; background: #f9fafb; padding: 12px; border-radius: 6px; margin: 12px 0; font-family: 'Monaco', 'Courier New', monospace;">
            ${verificationUrl}
          </p>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin: 20px 0;">
            <p style="color: #92400e; font-size: 13px; margin: 0;">
              ⏰ This verification link expires in <strong>24 hours</strong>. If it expires, you can request a new one from the Sign In page.
            </p>
          </div>
        </div>
        
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; padding: 20px 30px; border-radius: 0 0 12px 12px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © 2024 PebbleNotes. All rights reserved. | <a href="https://pebblenotes.com" style="color: #3b82f6; text-decoration: none;">Visit Website</a>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '✉️ Verify Your PebbleNotes Account',
      text,
      html
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetLink) {
    const resetUrl = resetLink;
    
    const text = `Hi ${user.name || 'there'},

You requested a password reset for your PebbleNotes account.

Click the link below to reset your password:
${resetUrl}

This link expires in 1 hour. If you did not request this, please ignore this email.

Best regards,
PebbleNotes Team`;

    const html = `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 700;">PebbleNotes</h1>
          <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 14px;">Reset Your Password</p>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 40px 30px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hi <strong>${user.name || 'there'}</strong>,
          </p>
          
          <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
            We received a request to reset the password for your account. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0; padding: 20px 0 0 0; border-top: 1px solid #e5e7eb;">
            If the button above doesn't work, copy and paste this link in your browser:
          </p>
          
          <p style="color: #1f2937; font-size: 12px; word-break: break-all; background: #f9fafb; padding: 12px; border-radius: 6px; margin: 12px 0; font-family: 'Monaco', 'Courier New', monospace;">
            ${resetUrl}
          </p>
          
          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px; margin: 20px 0;">
            <p style="color: #7f1d1d; font-size: 13px; margin: 0;">
              ⏰ This reset link expires in <strong>1 hour</strong>. If you did not request this, please ignore this email and your account will remain secure.
            </p>
          </div>
        </div>
        
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; padding: 20px 30px; border-radius: 0 0 12px 12px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © 2024 PebbleNotes. All rights reserved. | <a href="https://pebblenotes.com" style="color: #3b82f6; text-decoration: none;">Visit Website</a>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '🔐 Reset Your PebbleNotes Password',
      text,
      html
    });
  }

  /**
   * Send welcome email (optional, for after verification)
   */
  async sendWelcomeEmail(user) {
    const text = `Hi ${user.name || 'there'},

Welcome to PebbleNotes! Your account is now fully verified and ready to use.

You can now:
- Browse and search notes
- Save notes to favorites
- Purchase premium notes
- Join our community

Start exploring quality study notes today!

Best regards,
PebbleNotes Team`;

    const html = `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 700;">Welcome to PebbleNotes! 🎉</h1>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 40px 30px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hi <strong>${user.name || 'there'}</strong>,
          </p>
          
          <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
            Your email has been verified! Your account is now fully activated and ready to use.
          </p>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="color: #166534; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">✨ You can now:</p>
            <ul style="color: #15803d; font-size: 14px; margin: 0; padding-left: 20px;">
              <li style="margin: 6px 0;">Browse and search high-quality study notes</li>
              <li style="margin: 6px 0;">Save notes to your favorites</li>
              <li style="margin: 6px 0;">Purchase premium notes and materials</li>
              <li style="margin: 6px 0;">Review and rate notes from other users</li>
              <li style="margin: 6px 0;">Join our learning community</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/marketplace" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Explore Notes
            </a>
          </div>
        </div>
        
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; padding: 20px 30px; border-radius: 0 0 12px 12px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © 2024 PebbleNotes. All rights reserved. | <a href="https://pebblenotes.com" style="color: #3b82f6; text-decoration: none;">Visit Website</a>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '🎉 Welcome to PebbleNotes!',
      text,
      html
    });
  }
}

// Create singleton instance
export const emailService = new EmailService();

export default emailService;
