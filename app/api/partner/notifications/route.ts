import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import PartnerNotification from '@/models/PartnerNotification';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  
  const notifications = await PartnerNotification.find({ partnerId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return NextResponse.json(notifications);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  await dbConnect();

  if (id) {
    await PartnerNotification.findOneAndUpdate(
      { _id: id, partnerId: session.user.id },
      { read: true }
    );
  } else {
    // Mark all as read
    await PartnerNotification.updateMany(
      { partnerId: session.user.id, read: false },
      { read: true }
    );
  }

  return NextResponse.json({ success: true });
}
