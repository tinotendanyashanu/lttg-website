import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Setup models
import { Account } from '../models/Account';
import { Case } from '../models/Case';
import Commission from '../models/Commission';
import CommissionLedger from '../models/CommissionLedger';

const MONGODB_URI = process.env.MONGODB_URI;

async function testInternalCommissions() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  try {
    // 1. Find or create an employee account
    let employee = await Account.findOne({ roles: 'employee' });
    if (!employee) {
      employee = await Account.create({
        email: 'test_employee@example.com',
        fullName: 'Test Employee',
        authId: 'test_emp_auth',
        provider: 'email',
        roles: ['employee'],
        commissionStats: {
          pendingCommission: 0,
          approvedBalance: 0,
          paidCommission: 0,
          totalEarned: 0
        }
      });
      console.log('Created test employee account:', employee.email);
    } else {
      console.log('Found employee account:', employee.email);
    }

    // 2. Find or create an admin account (for case manager)
    const admin = await Account.findOne({ roles: 'admin' });
    if (!admin) {
        console.error("No admin account found. Cannot create case.");
        return;
    }

    // 3. Create a dummy case
    const testCase = await Case.create({
      caseId: `TEST-COMM-${Date.now()}`,
      email: 'client@example.com',
      contactName: 'Test Client',
      phone: '1234567890', 
      businessName: 'Internal Commission Test Inc',
      serviceInterest: 'TEST_SERVICE',
      ownerId: admin._id,
      status: 'active' as any, // Trying 'active' right away instead of pending
      managerId: admin._id,
      description: 'Testing internal commissions flow',
      participants: [employee._id], // Assuming it's an array of ObjectIds based on the generic CastError
      dealValue: 5000,
      paymentStatus: 'pending'
    });
    
    // forcefully update status if active is invalid too
    testCase.status = 'active'; 
    await testCase.save();
    console.log(`Created test case: ${testCase.caseId} with deal value $5000`);

    // --- Simulating Admin Actions from portal-admin.ts ---

    // A. Update payment status to received
    console.log('Updating payment status to received...');
    testCase.paymentStatus = 'received';
    testCase.paymentReceivedAt = new Date();
    await testCase.save();

    // B. Close Administration Case
    console.log('Closing case and calculating commissions...');
    testCase.status = 'closed';
    testCase.closedAt = new Date();
    await testCase.save();

    // Commission logic mimicking actions/portal-admin.ts closeAdminCase()
    for (const participantId of testCase.participants) {
        // Find by either standard accountId or if participant is just the string ID 
        const accId = typeof participantId === 'object' && 'accountId' in participantId ? (participantId as any).accountId : participantId;
        const participantAccount = await Account.findById(accId);
        
        if (!participantAccount) {
             console.log('Participant account not found for id:', accId)
             continue;
        }

        let commissionRate = 0;
        let roleType = participantAccount.roles[0] || 'employee';

        if (participantAccount.roles.includes('employee')) {
            commissionRate = 0.20; // 20%
            roleType = 'employee';
        } else if (participantAccount.roles.includes('intern')) {
            commissionRate = 0.10; // 10%
            roleType = 'intern';
        }

        if (commissionRate > 0) {
            const amount = testCase.dealValue * commissionRate;
            
            // Create Commission Record
            const comm = await Commission.create({
                accountId: accId,
                caseId: testCase._id,
                amount,
                status: 'pending', // 14-day hold
                commissionRate,
                role: roleType
            });

            // Create Ledger Entry
            await CommissionLedger.create({
                accountId: accId,
                relatedCaseId: testCase._id,
                type: 'commission_earned',
                amount,
                description: `Commission earned for case ${testCase.caseId} at ${commissionRate*100}% rate`,
                status: 'pending'
            });

            // Update Account Stats
            await Account.findByIdAndUpdate(accId, {
                $inc: { 
                   'commissionStats.pendingCommission': amount,
                   'commissionStats.totalEarned': amount
                }
            });

            console.log(`✅ Granted $${amount} commission to ${participantAccount.email} (${roleType})`);
        }
    }

    // C. Verify resulting state
    const updatedEmployee = await Account.findById(employee._id);
    console.log('\n--- Final State ---');
    console.log('Employee Commission Stats:', updatedEmployee?.commissionStats);
    
    const dbCommissions = await Commission.find({ caseId: testCase._id });
    console.log(`Generated Commissions: ${dbCommissions.length}`);
    console.log(dbCommissions);

  } catch (err) {
    console.error('Test script failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testInternalCommissions();
