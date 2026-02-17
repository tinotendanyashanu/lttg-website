import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Leo Systems <noreply@leothetechguy.com>'; // Verified domain
const ADMIN_EMAIL = 'contact@leothetechguy.com'; 

const LOGO_URL = 'https://leothetechguy.com/logo_transparent.png'; // Using smaller, transparent logo for better email compatibility

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
      replyTo,
    });
    console.log(`Email sent to ${to}:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return { success: false, error };
  }
}

// ... (previous code)

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
          replyTo,
      });
      console.log(`Admin notification sent:`, data);
  } catch (error) {
      console.error('Failed to send admin notification', error);
  }
}

// --- TEMPLATES ---

const EMAIL_STYLES = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #334155;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

function BaseTemplate(content: string) {
  return `
    <div style="${EMAIL_STYLES}">
      <div style="margin-bottom: 30px; text-align: center;">
        <img src="${LOGO_URL}" alt="Leo Systems" style="height: 40px; width: auto;" />
      </div>
      <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
        ${content}
      </div>
      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8;">
        <p>Leo Systems &bull; <a href="https://leosystems.ai" style="color: #94a3b8; text-decoration: none;">leosystems.ai</a></p>
        <p>You received this email because you contacted Leo Systems.</p>
      </div>
    </div>
  `;
}

export const EmailTemplates = {
  contactConfirmation: (name: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 16px;">We've received your message</h2>
      <p>Hi ${name},</p>
      <p>Thanks for reaching out to Leo Systems. I've received your message and will get back to you shortly.</p>
      <p>If your matter is urgent, please feel free to follow up.</p>
      <br/>
      <p>Best regards,<br/>Leo</p>
    `),

  projectInquiryConfirmation: (name: string, project: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 16px;">Project Inquiry Received</h2>
      <p>Hi ${name},</p>
      <p>Thank you for inquiring about building <strong>${project}</strong> with Leo Systems.</p>
      <p>I am reviewing your project details. If it looks like a good fit, I'll send you a link to schedule a discovery call so we can discuss the scope and next steps.</p>
      <p>You can expect to hear from me within 1-2 business days.</p>
      <br/>
      <p>Best regards,<br/>Leo</p>
    `),

  partnerApplicationReceived: (name: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 16px;">Partner Application Received</h2>
      <p>Hi ${name},</p>
      <p>Thanks for applying to the Leo Systems Partner Network.</p>
      <p>We review applications weekly. You'll hear from us soon regarding the status of your application.</p>
      <br/>
      <p>Best,<br/>The Partner Team</p>
    `),
    
  consultationConfirmation: (name: string, date?: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 16px;">Strategy Session Request</h2>
      <p>Hi ${name},</p>
      <p>Your request for a strategy session has been received.</p>
      ${date ? `<p><strong>Requested Date:</strong> ${date}</p>` : ''}
      <p>I'll be in touch shortly to confirm the time or suggest available slots.</p>
      <br/>
      <p>Talk soon,<br/>Leo</p>
    `),
    
   partnerApproved: (name: string) =>
    BaseTemplate(`
      <h2 style="color: #10b981; font-size: 20px; margin-bottom: 16px;">Welcome to the Partner Network!</h2>
      <p>Hi ${name},</p>
      <p>Congratulations! Your application has been approved.</p>
      <p>You can now access your partner dashboard to start referring clients and tracking commissions.</p>
      <p><a href="https://leosystems.ai/partner/login" style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 10px;">Access Dashboard</a></p>
      <br/>
      <p>Welcome aboard,<br/>Leo</p>
    `),

  partnerRejected: (name: string) => 
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 16px;">Update on your Partner Application</h2>
      <p>Hi ${name},</p>
      <p>Thank you for your interest in the Leo Systems Partner Network.</p>
      <p>After careful review, we are unable to accept your application at this time. We encourage you to apply again in the future as your business grows.</p>
      <br/>
      <p>Best regards,<br/>The Partner Team</p>
    `),
    
  adminNotification: (type: string, details: string) =>
    BaseTemplate(`
      <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 16px;">New ${type}</h2>
      <p><strong>Type:</strong> ${type}</p>
      <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; font-family: monospace; white-space: pre-wrap;">
${details}
      </div>
      <p>Check the admin dashboard for more info.</p>
    `)
};
