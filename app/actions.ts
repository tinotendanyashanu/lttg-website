'use server';

import dbConnect from '@/lib/mongodb';
import Contact from '@/models/Contact';

export type ContactState = {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    project?: string[];
    message?: string[];
  };
};

export async function submitContactForm(prevState: ContactState, formData: FormData): Promise<ContactState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const project = formData.get('project') as string;
  const budget = formData.get('budget') as string;
  const message = formData.get('message') as string;

  // Basic validation
  if (!name || !email || !project || !message) {
    return {
      success: false,
      message: 'Please fill in all required fields.',
    };
  }

  try {
    await dbConnect();

    await Contact.create({
      name,
      email,
      project,
      budget,
      message,
    });

    return {
      success: true,
      message: 'Message sent successfully! I will get back to you soon.',
    };
  } catch (error) {
    console.error('Contact form error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again later.',
    };
  }
}
