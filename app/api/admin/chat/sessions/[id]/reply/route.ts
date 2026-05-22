import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { ChatSession } from '@/models/ChatSession';
import { sendEmail } from '@/lib/email';

const SITE_URL = process.env.NEXTAUTH_URL || 'https://leothetechguy.com';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSession = await auth();
    const role = (authSession?.user as any)?.role;
    if (!authSession?.user || !['admin', 'employee'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await request.json();

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }

    await dbConnect();

    const chatSession = await ChatSession.findById(id);
    if (!chatSession) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const employeeName = (authSession.user as any)?.name || 'Team';

    chatSession.messages.push({
      role: 'employee',
      content: content.trim().slice(0, 2000),
      senderName: employeeName,
      timestamp: new Date(),
    });

    chatSession.status = 'human_active';
    chatSession.assignedEmployeeName = employeeName;
    chatSession.visitorNotifiedAt = new Date();

    await chatSession.save();

    // Email visitor if we have their email
    if (chatSession.visitorEmail) {
      const returnUrl = `${SITE_URL}/?chatSession=${chatSession.sessionId}`;
      await sendEmail({
        to: chatSession.visitorEmail,
        subject: `${employeeName} replied to your message`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #fff; padding: 40px 36px; border-radius: 16px; border: 1px solid #e5e7eb;">
            <img src="${SITE_URL}/logo_transparent.png" alt="LeoTheTechGuy" style="height: 40px; margin-bottom: 28px;" />
            <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0 0 8px;">You have a new reply</h2>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;"><strong>${employeeName}</strong> from the LeoTheTechGuy team replied to your message.</p>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
              <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">${content.trim().slice(0, 300)}${content.length > 300 ? '...' : ''}</p>
            </div>
            <a href="${returnUrl}" style="display: inline-block; background: #7c3aed; color: #fff; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none; margin-bottom: 28px;">Continue Conversation</a>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">LeoTheTechGuy · contact@leothetechguy.com</p>
          </div>`,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: {
        role: 'employee',
        content: content.trim(),
        senderName: employeeName,
        timestamp: new Date(),
      },
    });
  } catch (err) {
    console.error('Admin chat reply error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
