import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { sendEmail, EmailTemplates, sendAdminNotification } from '@/lib/email';
import { cookies } from 'next/headers';
import Partner from '@/models/Partner';
import Lead from '@/models/Lead';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    // Parse body
    const body = await request.json();
    const { name, email, message, project, timeline, budget } = body;

    // Validate
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to DB
    const contact = await Contact.create({
      name, 
      email, 
      message,
      project: project || 'General Inquiry',
      timeline, // Optional
      budget    // Optional
    });

    // Check for referral cookie
    const cookieStore = await cookies();
    const referralCode = cookieStore.get('leo_partner_ref')?.value;

    if (referralCode) {
        try {
            const partner = await Partner.findOne({ referralCode });
            if (partner) {
                // Create Lead
                await Lead.create({
                    partnerId: partner._id,
                    clientName: name,
                    clientEmail: email,
                    source: 'contact_form',
                    status: 'new',
                });
                
                // Increment stats
                await Partner.findByIdAndUpdate(partner._id, {
                    $inc: { 'stats.referralLeads': 1 }
                });
            }
        } catch (err) {
            console.error('Error processing referral:', err);
        }
    }

    // Send User Confirmation
    await sendEmail({
      to: email,
      subject: "We've received your message",
      html: EmailTemplates.contactConfirmation(name),
      replyTo: 'contact@leothetechguy.com'
    });

    // Send Admin Notification
    await sendAdminNotification({
      subject: 'Contact Form Submission',
      text: `Name: ${name}\nEmail: ${email}\nProject: ${project}\nMessage: ${message}`,
      replyTo: email
    });

    return NextResponse.json({ success: true, data: contact }, { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
