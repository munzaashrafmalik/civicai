import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('Email not configured, skipping email send');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"CivicAI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Email send failed:', error);
    return { success: false, error: error.message };
  }
}

export function getWelcomeEmail(userName: string): { subject: string; html: string } {
  return {
    subject: 'Welcome to CivicAI! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to CivicAI! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName},</h2>
              <p>Thank you for joining CivicAI! We're excited to have you on board.</p>
              <p>With CivicAI, you can:</p>
              <ul>
                <li>✅ Report civic issues in your area</li>
                <li>✅ Track the status of your complaints</li>
                <li>✅ Get real-time updates on resolutions</li>
                <li>✅ Make your city a better place</li>
              </ul>
              <p>Ready to get started?</p>
              <a href="${process.env.NEXTAUTH_URL || 'https://civicai-ochre.vercel.app'}" class="button">Visit Dashboard</a>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Best regards,<br>The CivicAI Team</p>
            </div>
            <div class="footer">
              <p>© 2026 CivicAI. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function getComplaintStatusEmail(
  userName: string,
  complaintTitle: string,
  status: string
): { subject: string; html: string } {
  const statusMessages: Record<string, string> = {
    pending: 'Your complaint is pending review',
    in_progress: 'Your complaint is being worked on',
    resolved: 'Your complaint has been resolved! 🎉',
    rejected: 'Your complaint was rejected',
  };

  return {
    subject: `Complaint Update: ${complaintTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .status { display: inline-block; padding: 8px 20px; background: #3b82f6; color: white; border-radius: 20px; font-weight: bold; margin: 10px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Complaint Update</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName},</h2>
              <p>Your complaint "<strong>${complaintTitle}</strong>" has been updated.</p>
              <p>Current status:</p>
              <div class="status">${statusMessages[status] || status}</div>
              <p>Click below to view details and track progress:</p>
              <a href="${process.env.NEXTAUTH_URL || 'https://civicai-ochre.vercel.app'}/my-complaints" class="button">View Complaint</a>
              <p>Thank you for helping make your city better!</p>
              <p>Best regards,<br>The CivicAI Team</p>
            </div>
            <div class="footer">
              <p>© 2026 CivicAI. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}
