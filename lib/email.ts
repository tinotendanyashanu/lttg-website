import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'LeoTheTechGuy <noreply@leothetechguy.com>'; // Verified domain
const ADMIN_EMAIL = 'contact@leothetechguy.com'; 

const LOGO_URL = 'https://leothetechguy.com/logo_transparent.png'; // Using smaller, transparent logo for better email compatibility

const EMAIL_STYLES = `
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
`;

const FOOTER_STYLES = `
  background-color: #f8fafc;
  padding: 40px 20px;
  text-align: center;
  border-top: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
`;

const SOCIAL_LINK_STYLE = `
  display: inline-block;
  margin: 0 10px;
  color: #64748b;
  text-decoration: none;
`;

// ... (rest of imports/constants)

export async function sendEmail({
  to,
  subject,
  html,
  replyTo = ADMIN_EMAIL, // Default reply-to is admin
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      replyTo: replyTo,
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function sendAdminNotification({
  subject,
  text,
  replyTo, 
}: {
  subject: string;
  text: string;
  replyTo?: string;
}) {
  try {
      const data = await resend.emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `[ADMIN] ${subject}`,
          html: `<p>${text}</p>`,
          replyTo: replyTo,
      });
  } catch (error) {
      // Silently fail in production
  }
}

function BaseTemplate(content: string) {
  return `
    <div style="background-color: #f1f5f9; padding: 40px 0;">
      <div style="${EMAIL_STYLES}">
        <!-- Header -->
        <div style="padding: 32px 20px; text-align: center; border-bottom: 1px solid #f1f5f9;">
          <img src="${LOGO_URL}" alt="LeoTheTechGuy" style="height: 36px; width: auto;" />
        </div>

        <!-- Body -->
        <div style="padding: 40px 32px; color: #334155; line-height: 1.6; font-size: 16px;">
          ${content}
        </div>

        <!-- Footer -->
        <div style="${FOOTER_STYLES}">
          <div style="margin-bottom: 24px;">
            <a href="https://leothetechguy.com" style="${SOCIAL_LINK_STYLE}">Website</a>
            <a href="https://leothetechguy.com/services" style="${SOCIAL_LINK_STYLE}">Services</a>
            <a href="https://leothetechguy.com/contact" style="${SOCIAL_LINK_STYLE}">Contact</a>
          </div>

          <div style="margin-bottom: 24px;">
            <a href="https://youtube.com/@LeoTheTechGuy" style="${SOCIAL_LINK_STYLE}">YouTube</a>
            <a href="https://x.com/LeoTheTechGuy" style="${SOCIAL_LINK_STYLE}">X (Twitter)</a>
            <a href="https://instagram.com/Leothetechguy" style="${SOCIAL_LINK_STYLE}">Instagram</a>
            <a href="https://facebook.com/Leothetechguy" style="${SOCIAL_LINK_STYLE}">Facebook</a>
          </div>

          <p style="margin: 0; font-weight: 600; color: #1e293b;">LeoTheTechGuy</p>
          <p style="margin: 4px 0;">Warsaw, Poland. Serving clients worldwide.</p>
          <p style="margin: 4px 0;"><a href="mailto:contact@leothetechguy.com" style="color: #64748b; text-decoration: none;">contact@leothetechguy.com</a></p>
          
          <div style="margin-top: 24px; font-size: 11px; color: #94a3b8;">
            &copy; ${new Date().getFullYear()} LeoTheTechGuy. All rights reserved.<br />
            You are receiving this because you engaged with LeoTheTechGuy.
          </div>
        </div>
      </div>
    </div>
  `;
}

export const EmailTemplates = {
  contactConfirmation: (name: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Message Received</h2>
      <p>Hello ${name},</p>
      <p>Thank you for reaching out. I have received your message and am currently reviewing your inquiry.</p>
      <p>I aim to provide thoughtful responses to every query. You can expect to hear from me shortly with clarity on next steps.</p>
      <p style="margin-top: 32px;">Best regards,<br /><strong style="color: #1e293b;">Leo</strong></p>
    `),

  projectInquiryConfirmation: (name: string, project: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Project Inquiry: ${project}</h2>
      <p>Hello ${name},</p>
      <p>Thank you for your interest in partnering with LeoTheTechGuy for <strong>${project}</strong>.</p>
      <p>I am currently reviewing your project details. My goal is to ensure every engagement is a strategic fit for both parties. If the initiative aligns with my current capacity and expertise, I will reach out within 1-2 business days with a link to schedule a discovery call.</p>
      <p>I look forward to potentially exploring this further.</p>
      <p style="margin-top: 32px;">Best regards,<br /><strong style="color: #1e293b;">Leo</strong></p>
    `),

  partnerApplicationReceived: (name: string) =>
    BaseTemplate(`
      <h2 style="color: #10b981; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Application Under Review</h2>
      <p>Hello ${name},</p>
      <p>Thank you for applying to the LeoTheTechGuy Partner Network. We have received your application and it is now under review by our team.</p>
      <p>We prioritize quality and alignment in our partnerships. You can expect an update regarding your status within 2-3 business days.</p>
      <p>If approved, you will receive an activation link to set up your partner dashboard.</p>
      <p style="margin-top: 32px;">Regards,<br /><strong style="color: #1e293b;">The Partner Team</strong></p>
    `),
    
  verifyEmail: (name: string, link: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Activate Your Account</h2>
      <p>Hello ${name},</p>
      <p>Welcome to the LeoTheTechGuy Partner Network. To complete your registration and access your dashboard, please activate your account using the button below:</p>
      <div style="margin: 32px 0;">
        <a href="${link}" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Activate Account</a>
      </div>
      <p style="font-size: 14px; color: #64748b;">This link is valid for 1 hour for security purposes. If you did not register for this account, please ignore this email.</p>
      <p style="margin-top: 32px;">Regards,<br /><strong style="color: #1e293b;">The Partner Team</strong></p>
    `),

  resetPassword: (name: string, link: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset the password for your LeoTheTechGuy Partner account. If you made this request, click the button below to set a new password:</p>
      <div style="margin: 32px 0;">
        <a href="${link}" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #64748b;">If you did not request a password reset, no further action is required.</p>
      <p style="margin-top: 32px;">Regards,<br /><strong style="color: #1e293b;">The Partner Team</strong></p>
    `),
    
  consultationConfirmation: (name: string, date?: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Strategy Session Requested</h2>
      <p>Hello ${name},</p>
      <p>Your request for a strategic technology direction session has been received.</p>
      ${date ? `<div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 14px; color: #64748b;">Requested Date</p>
        <p style="margin: 4px 0 0 0; font-weight: 600; color: #1e293b;">${date}</p>
      </div>` : ''}
      <p>I am reviewing my schedule and will be in touch shortly to confirm a time that works for both of us.</p>
      <p style="margin-top: 32px;">Best regards,<br /><strong style="color: #1e293b;">Leo</strong></p>
    `),
    
   partnerApproved: (name: string) =>
    BaseTemplate(`
      <h2 style="color: #10b981; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Welcome to the Network</h2>
      <p>Hello ${name},</p>
      <p>It is my pleasure to inform you that your application to the LeoTheTechGuy Partner Network has been approved.</p>
      <p>You now have access to our suite of enterprise resources, lead tracking tools, and specialized support. Please log in to your dashboard to begin our partnership.</p>
      <div style="margin: 32px 0;">
        <a href="https://leothetechguy.com/partner/login" style="background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Access Partner Dashboard</a>
      </div>
      <p style="margin-top: 32px;">Welcome aboard,<br /><strong style="color: #1e293b;">Leo</strong></p>
    `),

  partnerRejected: (name: string) => 
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Application Status Update</h2>
      <p>Hello ${name},</p>
      <p>Thank you for your interest in the LeoTheTechGuy Partner Network.</p>
      <p>After a thorough review of your application, we have decided not to move forward at this time. We maintain a very selective network to ensure the highest quality of service for our clients.</p>
      <p>We appreciate your time and interest, and wish you the best in your future endeavors.</p>
      <p style="margin-top: 32px;">Best regards,<br /><strong style="color: #1e293b;">The Partner Team</strong></p>
    `),
    
  adminNotification: (type: string, details: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 24px;">System Notification: ${type}</h2>
      <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 13px; color: #334155; white-space: pre-wrap; line-height: 1.5;">
        ${details}
      </div>
      <p style="margin-top: 24px;">Further details are available in the administrative dashboard.</p>
    `),

  tierUpgrade: (name: string, newTier: string) =>
    BaseTemplate(`
      <h2 style="color: #10b981; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Tier Advancement: ${newTier.toUpperCase()}</h2>
      <p>Hello ${name},</p>
      <p>We are pleased to inform you that your account has been upgraded to the <strong>${newTier.toUpperCase()}</strong> tier.</p>
      <p>This advancement reflects your commitment to the network and unlocks enhanced commission structures and strategic benefits. You can review your updated status and benefits in your dashboard.</p>
      <p>Congratulations on this achievement.</p>
      <p style="margin-top: 32px;">Regards,<br /><strong style="color: #1e293b;">Leo</strong></p>
    `),

  commissionPaid: (name: string, dealName: string, amount: number) =>
    BaseTemplate(`
      <h2 style="color: #10b981; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Remittance Advice: Commission Paid</h2>
      <p>Hello ${name},</p>
      <p>A commission payment of <strong>$${amount}</strong> has been successfully processed for the <strong>${dealName}</strong> initiative.</p>
      <p>The funds should be available in your designated account according to your bank's processing times.</p>
      <p>Thank you for your continued partnership.</p>
      <p style="margin-top: 32px;">Regards,<br /><strong style="color: #1e293b;">Leo</strong></p>
    `)
};
