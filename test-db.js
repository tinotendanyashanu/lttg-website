const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('leotech'); // Adjust DB name if needed, mongoose uses URI
    const accounts = await db.collection('accounts').find({ email: 'dev@leotech.com' }).toArray();
    console.log("Accounts for dev@leotech.com:", accounts);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
