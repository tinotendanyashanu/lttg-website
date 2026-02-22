require('dotenv').config({ path: '.env.local' });
const { registerPartner, verifyEmail } = require('./lib/actions/auth');
const mongoose = require('mongoose');

async function testSignFlow() {
  const Partner = require('./models/Partner').default;
  console.log("Starting test flow...");

  const testEmail = `test_${Date.now()}@test.com`;
  const testPassword = 'password123';

  console.log('Registering user:', testEmail);
  const formData = new FormData();
  formData.append('name', 'Integration Test');
  formData.append('email', testEmail);
  formData.append('password', testPassword);
  formData.append('country', 'USA');
  formData.append('partnerType', 'partner');
  formData.append('termsAccepted', 'true');

  const regResult = await registerPartner(null, formData);
  console.log('Registration result:', regResult);

  // Retrieve user to get token
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await Partner.findOne({ email: testEmail });
  if (!user) {
    console.error("User not found after registration!");
    process.exit(1);
  }

  console.log('User created:', user._id);
  console.log('Status before verify:', user.status);
  console.log('Verified before verify:', user.emailVerified);
  console.log('Verification token:', user.verificationToken);

  console.log('\nVerifying email...');
  const verResult = await verifyEmail(user.verificationToken);
  console.log('Verification result:', verResult);

  const updatedUser = await Partner.findOne({ email: testEmail });
  console.log('Status after verify:', updatedUser.status);
  console.log('Verified after verify:', updatedUser.emailVerified);

  process.exit(0);
}

testSignFlow().catch(err => {
  console.error(err);
  process.exit(1);
});
