import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';
import { auth } from '@/auth';
import { uploadFileToR2 } from '@/lib/r2';

export async function GET() {
  try {
    await dbConnect();
    const testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only clients can submit feedback
    if (session.user.role !== 'client') {
       return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const clientName = formData.get('clientName') as string;
    const clientRole = formData.get('clientRole') as string;
    const clientCompany = formData.get('clientCompany') as string;
    const content = formData.get('content') as string;
    const rating = parseInt(formData.get('rating') as string) || 5;
    const imageFile = formData.get('image') as File | null;

    if (!clientName || !clientRole || !content) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    let imageUrl = '';
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const fileName = `testimonials/${Date.now()}-${imageFile.name}`;
      imageUrl = await uploadFileToR2(buffer, fileName, imageFile.type);
    }

    await dbConnect();
    const testimonial = await Testimonial.create({
      clientName,
      clientRole,
      clientCompany,
      content,
      rating,
      image: imageUrl,
      isApproved: false, // Default to false for moderation
      userId: session.user.id,
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error('Failed to submit testimonial:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
