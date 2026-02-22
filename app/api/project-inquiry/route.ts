import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProjectInquiry from '@/models/ProjectInquiry';
import { sendEmail, EmailTemplates, sendAdminNotification } from '@/lib/email';
import { cookies } from 'next/headers';
import Partner from '@/models/Partner';
import Lead from '@/models/Lead';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { name, email, project, initiative, timeline, message } = body;

    if (!name || !email || !project) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to DB (ProjectInquiry model uses 'projectDescription', mapping 'message' or 'project' to it)
    // The frontend currently sends 'project' as the type/title and 'message' as the description.
    // We'll combine them for the description or use message.
    
    const projectInquiry = await ProjectInquiry.create({
      name,
      email,
      projectDescription: message || project, // Fallback
      budget: initiative, // Mapping initiative to budget field for now to avoid DB schema migration if possible, or we can add a new field
      timeline,
      status: 'new'
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
                    source: 'project_inquiry',
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

    // Email to User
    await sendEmail({
      to: email,
      subject: 'Project Inquiry Received',
      html: EmailTemplates.projectInquiryConfirmation(name, project),
      replyTo: 'contact@leothetechguy.com' // Explicitly set support email
    });

    // Email to Admin
    await sendAdminNotification({
      subject: 'Project Inquiry (New Engagement Model)',
      text: `Name: ${name}\nEmail: ${email}\nProject: ${project}\nInitiative Type: ${initiative}\nTimeline: ${timeline}\nDescription: ${message}`,
      replyTo: email
    });

    return NextResponse.json({ success: true, data: projectInquiry }, { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
