import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const SignupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  country: z.string().min(2, { message: "Country is required" }),
  partnerType: z.enum(['partner', 'influencer']).default('partner'),
  primaryPlatform: z.enum(['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin', 'blog', 'other']).optional(),
  profileUrl: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
  audienceSize: z.enum(['under_1k', '1k_10k', '10k_50k', '50k_100k', 'over_100k']).optional(),
  termsAccepted: z.literal('true', {
    message: "You must accept the Affiliate Agreement",
  }),
});
