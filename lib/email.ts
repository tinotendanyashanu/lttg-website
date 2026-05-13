import { Resend } from 'resend';

let resend: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  resend ??= new Resend(apiKey);
  return resend;
}

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
    const data = await getResendClient().emails.send({
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
      await getResendClient().emails.send({
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
            <a href="https://discord.gg/6rW46Cdf" style="${SOCIAL_LINK_STYLE}">Discord</a>
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
    
  blackHoleTermination: (name: string) =>
    BaseTemplate(`
      <h2 style="color: #dc2626; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Account Deactivation Notice</h2>
      <p>Hello ${name},</p>
      <p>This is an automated notification from the LeoTheTechGuy System.</p>
      <p>Your account has been deactivated due to extended inactivity (Black Hole protocol).</p>
      <p>If you believe this was in error or you wish to be reinstated, please contact administration.</p>
      <p style="margin-top: 32px;">Regards,<br /><strong style="color: #1e293b;">System Administration</strong></p>
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
    `),

  clientWelcome: (name: string, setupLink: string, loginEmail?: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Welcome to Your Client Portal</h2>
      <p>Hello ${name},</p>
      <p>Your client account has been created on the LeoTheTechGuy platform. You now have access to a secure portal where you can track your cases, review invoices, communicate with our team, and manage all your engagements.</p>
      ${loginEmail ? `<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
        <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Your Login Email</p>
        <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0f172a;">${loginEmail}</p>
      </div>` : ''}
      <p>To get started, please set up your password by clicking the button below:</p>
      <div style="margin: 32px 0;">
        <a href="${setupLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Set Up My Password</a>
      </div>
      <p style="font-size: 14px; color: #64748b;">This link expires in 48 hours for security. If you did not expect this invitation, please contact us at contact@leothetechguy.com.</p>
      <p style="margin-top: 24px; font-size: 14px; color: #475569;">Once your password is set up, you can log in to your portal at any time here:<br />
        <a href="https://leothetechguy.com/portal/client/login" style="color: #2563eb;">https://leothetechguy.com/portal/client/login</a>
      </p>
      <p style="margin-top: 32px;">Best regards,<br /><strong style="color: #1e293b;">The LeoTheTechGuy Team</strong></p>
    `),

  clientPasswordSetupConfirmation: (name: string) =>
    BaseTemplate(`
      <h2 style="color: #10b981; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Account Activated</h2>
      <p>Hello ${name},</p>
      <p>Your client portal account has been successfully activated. You can now log in at any time to access your portal.</p>
      <div style="margin: 32px 0;">
        <a href="https://leothetechguy.com/portal/client/login" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Access Client Portal</a>
      </div>
      <p style="margin-top: 32px;">Best regards,<br /><strong style="color: #1e293b;">The LeoTheTechGuy Team</strong></p>
    `),

  adminLoginOTP: (otp: string, ipHint?: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Admin Login Verification</h2>
      <p>A login attempt was made to the LeoTheTechGuy Admin Panel. Use the code below to complete sign-in.</p>
      <div style="margin: 32px 0; text-align: center;">
        <div style="display: inline-block; background-color: #0f172a; color: #ffffff; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 36px; font-weight: 700; letter-spacing: 12px; padding: 20px 36px; border-radius: 12px; border: 2px solid #334155;">
          ${otp}
        </div>
      </div>
      <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 0;">This code expires in <strong>10 minutes</strong>.</p>
      ${ipHint ? `<div style="background-color: #fef9c3; border: 1px solid #fde047; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 13px; color: #854d0e;">
        <strong>Security notice:</strong> This request originated from IP <code>${ipHint}</code>. If this was not you, change your admin password immediately.
      </div>` : ''}
      <p style="font-size: 14px; color: #64748b;">If you did not attempt to log in, your password may be compromised. Please take action immediately.</p>
      <p style="margin-top: 32px; font-size: 13px; color: #94a3b8;">— LeoTheTechGuy Security System</p>
    `),

  invoiceIssued: (
    clientName: string,
    invoiceNumber: string,
    amount: number,
    currency: string,
    dueAt: string | null,
    lineItems: { description: string; quantity: number; unitPrice: number; total: number }[],
    notes: string | null,
    portalLink: string,
  ) => `
    <div style="background-color: #f1f5f9; padding: 40px 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

        <!-- Invoice Header Band -->
        <div style="background-color: #0f172a; padding: 28px 36px; display: flex; align-items: center; justify-content: space-between;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="vertical-align: middle;">
                <img src="${LOGO_URL}" alt="LeoTheTechGuy" style="height: 34px; width: auto; filter: brightness(0) invert(1);" />
                <div style="margin-top: 6px;">
                  <span style="color: #ffffff; font-weight: 700; font-size: 14px;">LeoTheTechGuy</span><br />
                  <span style="color: #94a3b8; font-size: 11px;">contact@leothetechguy.com &nbsp;·&nbsp; Warsaw, Poland</span>
                </div>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <div style="color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 2px;">INVOICE</div>
                <div style="color: #94a3b8; font-size: 13px; font-family: monospace; margin-top: 4px;">${invoiceNumber}</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Invoice Meta -->
        <div style="padding: 28px 36px 0 36px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <!-- Bill To -->
              <td style="vertical-align: top; width: 50%;">
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px 18px;">
                  <p style="margin: 0 0 8px 0; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;">Bill To</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">${clientName}</p>
                </div>
              </td>
              <!-- Dates -->
              <td style="vertical-align: top; width: 50%; padding-left: 16px;">
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px 18px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    ${dueAt ? `
                    <tr>
                      <td style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; padding-bottom: 6px;">Due Date</td>
                      <td style="text-align: right; font-size: 13px; font-weight: 700; color: #dc2626; padding-bottom: 6px;">${dueAt}</td>
                    </tr>` : ''}
                    <tr>
                      <td style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;">Status</td>
                      <td style="text-align: right;">
                        <span style="background-color: #dbeafe; color: #1d4ed8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 3px 8px; border-radius: 4px;">Issued</span>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Line Items -->
        <div style="padding: 24px 36px 0 36px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background-color: #0f172a;">
                <th style="text-align: left; padding: 10px 14px; color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; border-radius: 6px 0 0 0;">Description</th>
                <th style="text-align: center; padding: 10px 10px; color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; width: 50px;">Qty</th>
                <th style="text-align: right; padding: 10px 14px; color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; width: 100px;">Unit Price</th>
                <th style="text-align: right; padding: 10px 14px; color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; width: 100px; border-radius: 0 6px 0 0;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${lineItems.map((item, i) => `
                <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 14px; color: #334155; font-weight: 500;">${item.description}</td>
                  <td style="padding: 12px 10px; text-align: center; color: #64748b;">${item.quantity}</td>
                  <td style="padding: 12px 14px; text-align: right; color: #64748b; font-family: monospace;">${currency} ${item.unitPrice.toFixed(2)}</td>
                  <td style="padding: 12px 14px; text-align: right; font-weight: 600; color: #1e293b; font-family: monospace;">${currency} ${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Total -->
          <div style="background-color: #0f172a; border-radius: 0 0 8px 8px; padding: 14px 14px; display: flex; justify-content: space-between; align-items: center;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">Total Amount Due</td>
                <td style="text-align: right; color: #ffffff; font-size: 20px; font-weight: 900; font-family: monospace;">${currency} ${amount.toFixed(2)}</td>
              </tr>
            </table>
          </div>
        </div>

        ${notes ? `
        <!-- Notes -->
        <div style="padding: 20px 36px 0 36px;">
          <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px;">
            <p style="margin: 0 0 6px 0; font-size: 10px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.08em;">Notes</p>
            <p style="margin: 0; font-size: 13px; color: #78350f; line-height: 1.6;">${notes}</p>
          </div>
        </div>` : ''}

        <!-- Greeting + CTA -->
        <div style="padding: 28px 36px; color: #334155; font-size: 14px; line-height: 1.7;">
          <p style="margin: 0 0 12px 0;">Hello <strong>${clientName}</strong>,</p>
          <p style="margin: 0 0 20px 0;">A new invoice has been issued to your account. Please review the details above and use your client portal to track payment status.</p>
          <div style="margin: 28px 0;">
            <a href="${portalLink}" style="background-color: #2563eb; color: #ffffff; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">View Invoice in Portal</a>
          </div>
          <p style="font-size: 13px; color: #94a3b8;">If you have any questions about this invoice, simply reply to this email or contact us at contact@leothetechguy.com.</p>
          <p style="margin-top: 28px; margin-bottom: 0;">Best regards,<br /><strong style="color: #1e293b;">The LeoTheTechGuy Team</strong></p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 32px 36px; text-align: center; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; line-height: 1.6;">
          <div style="margin-bottom: 16px;">
            <a href="https://leothetechguy.com" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none;">Website</a>
            <a href="https://youtube.com/@LeoTheTechGuy" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none;">YouTube</a>
            <a href="https://x.com/LeoTheTechGuy" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none;">X (Twitter)</a>
            <a href="https://discord.gg/6rW46Cdf" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none;">Discord</a>
          </div>
          <p style="margin: 0; font-weight: 600; color: #1e293b;">LeoTheTechGuy</p>
          <p style="margin: 4px 0;">Warsaw, Poland. Serving clients worldwide.</p>
          <p style="margin: 4px 0;"><a href="mailto:contact@leothetechguy.com" style="color: #64748b; text-decoration: none;">contact@leothetechguy.com</a></p>
          <div style="margin-top: 20px; font-size: 10px; color: #94a3b8;">
            &copy; ${new Date().getFullYear()} LeoTheTechGuy. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  `,

  invoiceReminder: (clientName: string, invoiceNumber: string, amount: number, currency: string, dueAt: string, portalLink: string) =>
    BaseTemplate(`
      <h2 style="color: #dc2626; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Payment Reminder: Invoice ${invoiceNumber}</h2>
      <p>Hello ${clientName},</p>
      <p>This is a friendly reminder that invoice <strong>${invoiceNumber}</strong> for <strong>${currency} ${amount.toFixed(2)}</strong> was due on <strong>${dueAt}</strong> and remains outstanding.</p>
      <p>Please log in to your client portal to review and action this invoice at your earliest convenience.</p>
      <div style="margin: 32px 0;">
        <a href="${portalLink}" style="background-color: #dc2626; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Invoice</a>
      </div>
      <p style="font-size: 14px; color: #64748b;">If you have already made payment, please disregard this notice. Contact us if you have any questions.</p>
      <p style="margin-top: 32px;">Regards,<br /><strong style="color: #1e293b;">The LeoTheTechGuy Team</strong></p>
    `),

  invoiceStatusUpdate: (clientName: string, invoiceNumber: string, status: string, portalLink: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Invoice Update: ${invoiceNumber}</h2>
      <p>Hello ${clientName},</p>
      <p>Your invoice <strong>${invoiceNumber}</strong> has been updated. The current status is now: <strong style="text-transform: capitalize;">${status}</strong>.</p>
      ${status === 'paid' ? '<p style="color: #059669; font-weight: 600;">Thank you for your payment! Your account has been updated accordingly.</p>' : ''}
      <div style="margin: 32px 0;">
        <a href="${portalLink}" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Invoice</a>
      </div>
      <p style="margin-top: 32px;">Regards,<br /><strong style="color: #1e293b;">The LeoTheTechGuy Team</strong></p>
    `),

  paymentReceived: (
    clientName: string,
    invoiceNumber: string,
    amount: number,
    serviceFee: number,
    currency: string,
    paidAt: string,
    lineItems: { description: string; quantity: number; unitPrice: number; total: number }[],
    paymentMethod: string,
    portalLink: string,
  ) => `
  <div style="background-color: #f1f5f9; padding: 40px 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

      <!-- Receipt Header Band -->
      <div style="background-color: #059669; padding: 28px 36px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: middle;">
              <img src="${LOGO_URL}" alt="LeoTheTechGuy" style="height: 34px; width: auto; filter: brightness(0) invert(1);" />
              <div style="margin-top: 6px;">
                <span style="color: #ffffff; font-weight: 700; font-size: 14px;">LeoTheTechGuy</span><br />
                <span style="color: #a7f3d0; font-size: 11px;">contact@leothetechguy.com &nbsp;·&nbsp; Warsaw, Poland</span>
              </div>
            </td>
            <td style="text-align: right; vertical-align: top;">
              <div style="color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: 2px;">RECEIPT</div>
              <div style="color: #a7f3d0; font-size: 13px; font-family: monospace; margin-top: 4px;">${invoiceNumber}</div>
              <div style="margin-top: 8px; background-color: #10b981; border-radius: 20px; padding: 4px 12px; display: inline-block;">
                <span style="color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">✓ PAID</span>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Meta -->
      <div style="padding: 28px 36px 0 36px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top; width: 50%;">
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px 18px;">
                <p style="margin: 0 0 8px 0; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;">Paid By</p>
                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">${clientName}</p>
              </div>
            </td>
            <td style="vertical-align: top; width: 50%; padding-left: 16px;">
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px 18px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; padding-bottom: 6px;">Date Paid</td>
                    <td style="text-align: right; font-size: 13px; font-weight: 700; color: #059669; padding-bottom: 6px;">${paidAt}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;">Method</td>
                    <td style="text-align: right; font-size: 13px; font-weight: 600; color: #334155; text-transform: capitalize;">${paymentMethod}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Line Items -->
      <div style="padding: 24px 36px 0 36px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background-color: #0f172a;">
              <th style="text-align: left; padding: 10px 14px; color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; border-radius: 6px 0 0 0;">Description</th>
              <th style="text-align: center; padding: 10px 10px; color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; width: 50px;">Qty</th>
              <th style="text-align: right; padding: 10px 14px; color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; width: 100px;">Unit Price</th>
              <th style="text-align: right; padding: 10px 14px; color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; width: 100px; border-radius: 0 6px 0 0;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems.map((item, i) => `
              <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 14px; color: #334155; font-weight: 500;">${item.description}</td>
                <td style="padding: 12px 10px; text-align: center; color: #64748b;">${item.quantity}</td>
                <td style="padding: 12px 14px; text-align: right; color: #64748b; font-family: monospace;">${currency} ${item.unitPrice.toFixed(2)}</td>
                <td style="padding: 12px 14px; text-align: right; font-weight: 600; color: #1e293b; font-family: monospace;">${currency} ${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals breakdown -->
        <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 10px 14px; color: #64748b; font-size: 13px;">Subtotal</td>
            <td style="padding: 10px 14px; text-align: right; color: #334155; font-size: 13px; font-family: monospace;">${currency} ${amount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 14px 10px 14px; color: #64748b; font-size: 13px;">Service fee <span style="font-size: 11px; color: #94a3b8;">(1.5% — online payment processing)</span></td>
            <td style="padding: 6px 14px 10px 14px; text-align: right; color: #334155; font-size: 13px; font-family: monospace;">${currency} ${serviceFee.toFixed(2)}</td>
          </tr>
        </table>

        <!-- Total paid -->
        <div style="background-color: #059669; border-radius: 0 0 8px 8px; padding: 14px 14px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #a7f3d0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">Total Paid</td>
              <td style="text-align: right; color: #ffffff; font-size: 20px; font-weight: 900; font-family: monospace;">${currency} ${(amount + serviceFee).toFixed(2)}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Message + CTA -->
      <div style="padding: 28px 36px; color: #334155; font-size: 14px; line-height: 1.7;">
        <p style="margin: 0 0 12px 0;">Hello <strong>${clientName}</strong>,</p>
        <p style="margin: 0 0 20px 0;">Thank you — your payment has been received and your invoice is now marked as <strong style="color: #059669;">paid</strong>. This email serves as your official receipt. You can also download or print your paid invoice from your client portal at any time.</p>
        <div style="margin: 28px 0;">
          <a href="${portalLink}" style="background-color: #059669; color: #ffffff; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">View Receipt in Portal</a>
        </div>
        <p style="font-size: 13px; color: #94a3b8;">If you have any questions about this payment, reply to this email or contact us at contact@leothetechguy.com.</p>
        <p style="margin-top: 28px; margin-bottom: 0;">Best regards,<br /><strong style="color: #1e293b;">The LeoTheTechGuy Team</strong></p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f8fafc; padding: 32px 36px; text-align: center; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; line-height: 1.6;">
        <div style="margin-bottom: 16px;">
          <a href="https://leothetechguy.com" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none;">Website</a>
          <a href="https://youtube.com/@LeoTheTechGuy" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none;">YouTube</a>
          <a href="https://x.com/LeoTheTechGuy" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none;">X (Twitter)</a>
        </div>
        <p style="margin: 0; font-weight: 600; color: #1e293b;">LeoTheTechGuy</p>
        <p style="margin: 4px 0;">Warsaw, Poland. Serving clients worldwide.</p>
        <p style="margin: 4px 0;"><a href="mailto:contact@leothetechguy.com" style="color: #64748b; text-decoration: none;">contact@leothetechguy.com</a></p>
        <div style="margin-top: 20px; font-size: 10px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} LeoTheTechGuy. All rights reserved.
        </div>
      </div>
    </div>
  </div>
`,

  ticketReply: (clientName: string, ticketId: string, subject: string, replyContent: string, portalLink: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 24px;">New Reply on Ticket ${ticketId}</h2>
      <p>Hello ${clientName},</p>
      <p>Our support team has responded to your ticket: <strong>${subject}</strong></p>
      <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 20px 24px; border-radius: 0 8px 8px 0; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Team Response</p>
        <p style="margin: 0; color: #334155; line-height: 1.6; white-space: pre-wrap;">${replyContent}</p>
      </div>
      <div style="margin: 32px 0;">
        <a href="${portalLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Ticket</a>
      </div>
      <p style="margin-top: 32px;">Regards,<br /><strong style="color: #1e293b;">The LeoTheTechGuy Support Team</strong></p>
    `),

  ticketStatusUpdate: (clientName: string, ticketId: string, subject: string, newStatus: string, portalLink: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Ticket Status Update: ${ticketId}</h2>
      <p>Hello ${clientName},</p>
      <p>The status of your support ticket <strong>${subject}</strong> has been updated to: <strong style="text-transform: capitalize;">${newStatus.replace(/_/g, ' ')}</strong>.</p>
      ${newStatus === 'resolved' || newStatus === 'closed' ? '<p style="color: #059669;">Your issue has been resolved. If you need further assistance, please open a new ticket.</p>' : ''}
      ${newStatus === 'waiting_client' ? '<p style="color: #d97706;">Our team is waiting for your response. Please log in to your portal to continue.</p>' : ''}
      <div style="margin: 32px 0;">
        <a href="${portalLink}" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Ticket</a>
      </div>
      <p style="margin-top: 32px;">Regards,<br /><strong style="color: #1e293b;">The LeoTheTechGuy Support Team</strong></p>
    `),

  newMessageNotification: (clientName: string, senderName: string, preview: string, portalLink: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 24px;">New Message from ${senderName}</h2>
      <p>Hello ${clientName},</p>
      <p>You have received a new message in your client portal.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0; color: #475569; font-style: italic; line-height: 1.6;">"${preview}${preview.length >= 100 ? '…' : ''}"</p>
      </div>
      <div style="margin: 32px 0;">
        <a href="${portalLink}" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Read Message</a>
      </div>
      <p style="margin-top: 32px;">Regards,<br /><strong style="color: #1e293b;">The LeoTheTechGuy Team</strong></p>
    `),

  contractSent: (clientName: string, contractNumber: string, title: string, portalLink: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Contract Ready for Your Signature</h2>
      <p>Hello ${clientName},</p>
      <p>A contract has been prepared for your review and signature.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 140px;">Contract Number</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px; font-family: monospace;">${contractNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Title</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px;">${title}</td>
          </tr>
        </table>
      </div>
      <p>Please log in to your client portal to review and sign the contract at your earliest convenience.</p>
      <div style="margin: 32px 0;">
        <a href="${portalLink}" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Review &amp; Sign Contract</a>
      </div>
      <p style="margin-top: 32px;">Regards,<br /><strong style="color: #1e293b;">The LeoTheTechGuy Team</strong></p>
    `),

  contractResent: (clientName: string, contractNumber: string, title: string, portalLink: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Contract Resent for Signature</h2>
      <p>Hello ${clientName},</p>
      <p>A refreshed signing link has been issued for the following contract. This link is valid for <strong>72 hours</strong>.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 140px;">Contract Number</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px; font-family: monospace;">${contractNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Title</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px;">${title}</td>
          </tr>
        </table>
      </div>
      <p>Please log in to your client portal to review and sign the contract before the link expires.</p>
      <div style="margin: 32px 0;">
        <a href="${portalLink}" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Review &amp; Sign Contract</a>
      </div>
      <p style="margin-top: 32px;">Regards,<br /><strong style="color: #1e293b;">The LeoTheTechGuy Team</strong></p>
    `),

  contractSigned: (adminName: string, clientName: string, contractNumber: string, title: string, signedAt: string, adminLink: string) =>
    BaseTemplate(`
      <h2 style="color: #059669; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Contract Signed</h2>
      <p>Hello ${adminName},</p>
      <p><strong>${clientName}</strong> has signed a contract.</p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 140px;">Contract Number</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px; font-family: monospace;">${contractNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Title</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px;">${title}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Signed By</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px;">${clientName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Signed At</td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 13px;">${signedAt}</td>
          </tr>
        </table>
      </div>
      <div style="margin: 32px 0;">
        <a href="${adminLink}" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Contract</a>
      </div>
      <p style="margin-top: 32px;">Regards,<br /><strong style="color: #1e293b;">The LeoTheTechGuy Platform</strong></p>
    `),

  quotationSent: (
    clientName: string,
    quotationNumber: string,
    amount: number,
    currency: string,
    validUntil: string | null,
    lineItems: { description: string; quantity: number; unitPrice: number; total: number }[],
    message: string | null,
    notes: string | null,
    portalLink: string,
  ) => `
    <div style="background-color: #f1f5f9; padding: 40px 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background-color: #7c3aed; padding: 28px 36px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="vertical-align: middle;">
                <img src="${LOGO_URL}" alt="LeoTheTechGuy" style="height: 34px; width: auto; filter: brightness(0) invert(1);" />
                <div style="margin-top: 6px;">
                  <span style="color: #ffffff; font-weight: 700; font-size: 14px;">LeoTheTechGuy</span><br />
                  <span style="color: #ddd6fe; font-size: 11px;">contact@leothetechguy.com &nbsp;·&nbsp; Warsaw, Poland</span>
                </div>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <div style="color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 2px;">QUOTATION</div>
                <div style="color: #ddd6fe; font-size: 13px; font-family: monospace; margin-top: 4px;">${quotationNumber}</div>
              </td>
            </tr>
          </table>
        </div>
        <div style="padding: 28px 36px 0 36px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="vertical-align: top; width: 50%;">
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px 18px;">
                  <p style="margin: 0 0 8px 0; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;">Prepared For</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">${clientName}</p>
                </div>
              </td>
              <td style="vertical-align: top; width: 50%; padding-left: 16px;">
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px 18px;">
                  ${validUntil ? `<p style="margin: 0 0 4px 0; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;">Valid Until</p><p style="margin: 0; font-size: 13px; font-weight: 700; color: #dc2626;">${validUntil}</p>` : '<p style="margin: 0; font-size: 12px; color: #94a3b8;">No expiry set</p>'}
                </div>
              </td>
            </tr>
          </table>
        </div>
        ${message ? `<div style="padding: 20px 36px 0 36px;"><div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 16px;"><p style="margin: 0 0 6px 0; font-size: 10px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.08em;">Message</p><p style="margin: 0; font-size: 14px; color: #4c1d95; line-height: 1.6;">${message}</p></div></div>` : ''}
        <div style="padding: 24px 36px 0 36px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background-color: #7c3aed;">
                <th style="text-align: left; padding: 10px 14px; color: #ede9fe; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; border-radius: 6px 0 0 0;">Description</th>
                <th style="text-align: center; padding: 10px 10px; color: #ede9fe; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; width: 50px;">Qty</th>
                <th style="text-align: right; padding: 10px 14px; color: #ede9fe; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; width: 100px;">Unit Price</th>
                <th style="text-align: right; padding: 10px 14px; color: #ede9fe; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; width: 100px; border-radius: 0 6px 0 0;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${lineItems.map((item, i) => `
                <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 14px; color: #334155; font-weight: 500;">${item.description}</td>
                  <td style="padding: 12px 10px; text-align: center; color: #64748b;">${item.quantity}</td>
                  <td style="padding: 12px 14px; text-align: right; color: #64748b; font-family: monospace;">${currency} ${item.unitPrice.toFixed(2)}</td>
                  <td style="padding: 12px 14px; text-align: right; font-weight: 600; color: #1e293b; font-family: monospace;">${currency} ${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="background-color: #7c3aed; border-radius: 0 0 8px 8px; padding: 14px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #ede9fe; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">Total</td>
                <td style="text-align: right; color: #ffffff; font-size: 20px; font-weight: 900; font-family: monospace;">${currency} ${amount.toFixed(2)}</td>
              </tr>
            </table>
          </div>
        </div>
        ${notes ? `<div style="padding: 20px 36px 0 36px;"><div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px;"><p style="margin: 0 0 6px 0; font-size: 10px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.08em;">Notes</p><p style="margin: 0; font-size: 13px; color: #78350f; line-height: 1.6;">${notes}</p></div></div>` : ''}
        <div style="padding: 28px 36px; color: #334155; font-size: 14px; line-height: 1.7;">
          <p style="margin: 0 0 12px 0;">Hello <strong>${clientName}</strong>,</p>
          <p style="margin: 0 0 20px 0;">Please review this quotation and let us know if you'd like to proceed. You can accept or reject it directly from your client portal.</p>
          <div style="margin: 28px 0;">
            <a href="${portalLink}" style="background-color: #7c3aed; color: #ffffff; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">Review Quotation</a>
          </div>
          <p style="font-size: 13px; color: #94a3b8;">If you have any questions, reply to this email or contact us at contact@leothetechguy.com.</p>
          <p style="margin-top: 28px; margin-bottom: 0;">Best regards,<br /><strong style="color: #1e293b;">The LeoTheTechGuy Team</strong></p>
        </div>
        <div style="background-color: #f8fafc; padding: 32px 36px; text-align: center; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; line-height: 1.6;">
          <p style="margin: 0; font-weight: 600; color: #1e293b;">LeoTheTechGuy</p>
          <p style="margin: 4px 0;">Warsaw, Poland. Serving clients worldwide.</p>
          <p style="margin: 4px 0;"><a href="mailto:contact@leothetechguy.com" style="color: #64748b; text-decoration: none;">contact@leothetechguy.com</a></p>
          <div style="margin-top: 20px; font-size: 10px; color: #94a3b8;">&copy; ${new Date().getFullYear()} LeoTheTechGuy. All rights reserved.</div>
        </div>
      </div>
    </div>
  `,

  quotationAcceptedInvoice: (
    clientName: string,
    quotationNumber: string,
    invoiceNumber: string,
    amount: number,
    currency: string,
    lineItems: { description: string; quantity: number; unitPrice: number; total: number }[],
    notes: string | null,
    invoiceLink: string,
  ) =>
    BaseTemplate(`
      <h2 style="color: #059669; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Quotation Accepted — Invoice Created</h2>
      <p>Hello ${clientName},</p>
      <p>Thank you for accepting quotation <strong>${quotationNumber}</strong>. An invoice has been automatically generated for you.</p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr><td style="color: #64748b; padding-bottom: 6px;">Quotation</td><td style="text-align: right; font-weight: 600; color: #1e293b; padding-bottom: 6px;">${quotationNumber}</td></tr>
          <tr><td style="color: #64748b; padding-bottom: 6px;">Invoice Number</td><td style="text-align: right; font-weight: 600; color: #1e293b; padding-bottom: 6px;">${invoiceNumber}</td></tr>
          <tr><td style="color: #64748b;">Amount Due</td><td style="text-align: right; font-weight: 700; color: #059669; font-size: 16px;">${currency} ${amount.toFixed(2)}</td></tr>
        </table>
      </div>
      ${notes ? `<div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;"><p style="margin: 0 0 6px 0; font-size: 10px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.08em;">Notes</p><p style="margin: 0; font-size: 13px; color: #78350f; line-height: 1.6;">${notes}</p></div>` : ''}
      <p>Please log in to your portal to view and pay this invoice.</p>
      <div style="margin: 32px 0;">
        <a href="${invoiceLink}" style="background-color: #059669; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Invoice</a>
      </div>
      <p style="margin-top: 32px;">Best regards,<br /><strong style="color: #1e293b;">The LeoTheTechGuy Team</strong></p>
    `),

  quotationAcceptedAdmin: (
    clientName: string,
    quotationNumber: string,
    invoiceNumber: string,
    currency: string,
    amount: number,
  ) =>
    BaseTemplate(`
      <h2 style="color: #059669; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Quotation Accepted</h2>
      <p><strong>${clientName}</strong> has accepted quotation <strong>${quotationNumber}</strong>.</p>
      <p>Invoice <strong>${invoiceNumber}</strong> for <strong>${currency} ${amount.toFixed(2)}</strong> has been automatically created and sent to the client.</p>
      <p style="margin-top: 32px;">— LeoTheTechGuy Platform</p>
    `),

  quotationRejectedAdmin: (
    clientName: string,
    quotationNumber: string,
    currency: string,
    amount: number,
  ) =>
    BaseTemplate(`
      <h2 style="color: #dc2626; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Quotation Rejected</h2>
      <p><strong>${clientName}</strong> has rejected quotation <strong>${quotationNumber}</strong> (${currency} ${amount.toFixed(2)}).</p>
      <p>You may want to follow up with the client to understand their concerns and revise the quotation if appropriate.</p>
      <p style="margin-top: 32px;">— LeoTheTechGuy Platform</p>
    `),
};
