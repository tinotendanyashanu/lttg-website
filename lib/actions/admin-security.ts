'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import crypto from 'crypto';
import { sendEmail, EmailTemplates } from '@/lib/email';
import AuditLog from '@/models/AuditLog';

// Helper to check admin
async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return session.user;
}

export async function adminSendPasswordReset(partnerId: string) {
    try {
        const admin = await checkAdmin();
        await dbConnect();
        
        const partner = await Partner.findById(partnerId);
        if (!partner) return { success: false, message: 'Partner not found.' };

        // Generate Token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour

        partner.resetPasswordToken = resetToken;
        partner.resetPasswordTokenExpiry = resetTokenExpiry;
        await partner.save();

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const resetLink = `${baseUrl}/partner/reset-password?token=${resetToken}`;

        // Send Email
        await sendEmail({
            to: partner.email,
            subject: 'Admin Requested: Reset your Password',
            html: EmailTemplates.resetPassword(partner.name, resetLink),
        });
        
        // Log it
        await AuditLog.create({
            entityType: 'partner',
            entityId: partnerId,
            action: 'admin_password_reset_sent',
            performedBy: admin.id,
            metadata: { partnerEmail: partner.email }
        });

        return { success: true, message: `Password reset link sent to ${partner.email}` };
    } catch (error: any) {
        console.error('Admin Password Reset Error:', error);
        return { success: false, message: error.message || 'Failed to send reset link.' };
    }
}
