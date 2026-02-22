require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function fixUser() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Partner = mongoose.model('Partner', new mongoose.Schema({}, { strict: false }));
  const user = await Partner.findOneAndUpdate(
    { email: 'tinotendanyashfx@gmail.com' },
    { $set: { emailVerified: true } },
    { new: true }
  );
  console.log("Updated user:", user.email, "emailVerified:", user.emailVerified);
  process.exit(0);
}

fixUser();
