import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import ReferralClick from '@/models/ReferralClick';

export async function POST(request: Request) {
  try {
    const { refCode, userAgent, ip } = await request.json();

    if (!refCode) {
      return NextResponse.json({ success: false, message: 'Missing refCode' }, { status: 400 });
    }

    await dbConnect();

    const partner = await Partner.findOne({ referralCode: refCode });
    if (!partner) {
      return NextResponse.json({ success: false, message: 'Partner not found' }, { status: 404 });
    }

    // Save click
    await ReferralClick.create({
      partnerId: partner._id,
      ip,
      userAgent
    });

    // Increment stats
    await Partner.findByIdAndUpdate(partner._id, {
      $inc: { 'stats.referralClicks': 1 }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Referral tracking error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
