import { NextResponse } from 'next/server';
import { sendEmail, EmailTemplates, sendAdminNotification } from '@/lib/email';
import dbConnect from '@/lib/mongodb';
import Contact from '@/models/Contact';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Log the audit request as a contact for follow-up
    await Contact.create({
      name: 'Audit Request',
      email: email,
      project: 'AI Readiness Protocol Audit',
      message: 'User requested the AI Readiness Protocol 10-point architectural audit.',
      timeline: 'ASAP',
      budget: 'N/A'
    });

    // Send confirmation to user
    await sendEmail({
      to: email,
      subject: 'AI Readiness Protocol Requested',
      html: EmailTemplates.auditConfirmation(email),
    });

    // Notify admin
    await sendAdminNotification({
      subject: 'New AI Audit Request',
      text: `A new user (${email}) has requested the AI Readiness Protocol.`,
      replyTo: email
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Audit API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
