require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkUser() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Partner = mongoose.model('Partner', new mongoose.Schema({}, { strict: false }));
  const user = await Partner.findOne({ email: 'tinotendanyashfx@gmail.com' });
  console.log("Email:", user.email);
  console.log("emailVerified:", user.emailVerified);
  console.log("verificationToken:", user.verificationToken);
  console.log("status:", user.status);
  process.exit(0);
}

checkUser();
