// Runtime test script for auth actions
import 'dotenv/config';
import { registerPartner, verifyEmail } from './lib/actions/auth';
import mongoose from 'mongoose';

async function testAuthFlow() {
  const Partner = (await import('./models/Partner')).default;
  console.log('Starting auth runtime test...');

  const testEmail = `test_${Date.now()}@test.com`;
  const testPassword = 'password123';

  const formData = new FormData();
  formData.append('name', 'Runtime Test');
  formData.append('email', testEmail);
  formData.append('password', testPassword);
  formData.append('country', 'USA');
  formData.append('partnerType', 'partner');
  formData.append('termsAccepted', 'true');

  const regResult = await registerPartner(null, formData);
  console.log('Register result:', regResult);

  await mongoose.connect(process.env.MONGODB_URI!);
  const user = await Partner.findOne({ email: testEmail });
  if (!user) {
    console.error('User not found after registration');
    process.exit(1);
  }
  console.log('User created, verification token:', user.verificationToken);

  const verResult = await verifyEmail(user.verificationToken!);
  console.log('Verification result:', verResult);

  const updatedUser = await Partner.findOne({ email: testEmail });
  console.log('Post verification status:', updatedUser?.status, updatedUser?.emailVerified);
  process.exit(0);
}

testAuthFlow().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
