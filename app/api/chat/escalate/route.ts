import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ChatSession } from '@/models/ChatSession';
import { sendEmail, sendAdminNotification } from '@/lib/email';

const SITE_URL = process.env.NEXTAUTH_URL || 'https://leothetechguy.com';

export async function POST(request: Request) {
  try {
    const { sessionId, visitorName, visitorEmail } = await request.json();

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }
    if (!visitorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitorEmail)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const safeName = (visitorName || 'Visitor').trim().slice(0, 100);
    const safeEmail = visitorEmail.trim().toLowerCase().slice(0, 200);

    await dbConnect();

    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    session.visitorName = safeName;
    session.visitorEmail = safeEmail;
    session.status = 'pending_human';
    session.employeeNotifiedAt = new Date();

    session.messages.push({
      role: 'bot',
      content: `${safeName} has requested to speak with a team member.`,
      timestamp: new Date(),
    });

    await session.save();

    const sessionUrl = `${SITE_URL}/portal/employee/chat/${session._id}`;
    const visitorReturnUrl = `${SITE_URL}/?chatSession=${sessionId}`;

    // Notify admin/team
    await sendAdminNotification({
      subject: `💬 New chat escalation from ${safeName}`,
      text: `${safeName} (${safeEmail}) requested a human agent on the website chat.\n\nView & reply: ${sessionUrl}`,
    }).catch(() => {});

    // Confirm to visitor
    await sendEmail({
      to: safeEmail,
      subject: 'We received your message — we\'ll be in touch soon',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #fff; padding: 40px 36px; border-radius: 16px; border: 1px solid #e5e7eb;">
          <img src="${SITE_URL}/logo_transparent.png" alt="LeoTheTechGuy" style="height: 40px; margin-bottom: 28px;" />
          <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0 0 12px;">Hey ${safeName}, message received!</h2>
          <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">A team member will review your conversation and get back to you — usually within a few hours. When they reply, you'll get another email.</p>
          <a href="${visitorReturnUrl}" style="display: inline-block; background: #7c3aed; color: #fff; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none; margin-bottom: 28px;">Continue the Conversation</a>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">LeoTheTechGuy · contact@leothetechguy.com</p>
        </div>`,
    }).catch(() => {});

    return NextResponse.json({ success: true, sessionDbId: String(session._id) });
  } catch (err) {
    console.error('Chat escalate error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
