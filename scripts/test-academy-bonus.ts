import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';
import dbConnect from '../lib/mongodb';
import Partner from '../models/Partner';
import Deal from '../models/Deal';
import Course from '../models/Course';
import { recordLedgerEntry, getPartnerBalances } from '../lib/services/ledger';

async function main() {
  await dbConnect();

  console.log('--- STARTING ACADEMY BONUS TESTS ---');

  // Ensure there's at least one course
  let course = await Course.findOne({ published: true });
  if (!course) {
    course = await Course.create({
      title: 'Test Course',
      slug: 'test-course',
      description: 'A test course',
      thumbnailUrl: '/test',
      level: 'beginner',
      category: 'sales',
      targetAudience: ['all'],
      lessons: [{ title: 'Intro', slug: 'intro', content: 'Intro', duration: '10:00' }],
      exam: {
        questions: [{ question: 'Q1', options: ['A', 'B'], correctAnswer: 0 }],
        passingScore: 100
      },
      published: true
    });
  }

  const dummyEmail = 'test-academy-bonus@example.com';
  
  // Clean up previous runs
  await Partner.deleteOne({ email: dummyEmail });
  const testPartner = await Partner.create({
    name: 'Academy Bonus Test Partner',
    email: dummyEmail,
    role: 'partner',
    status: 'active',
    partnerType: 'partner',
    tier: 'referral'
  });

  console.log('\\n[Setup] Cleaned up and created test partner:', testPartner._id);

  // We need to simulate the submitExam logic.
  // Actually, wait, let's call the actual `submitExam` function from academy.ts?
  // We can't easily mock auth() inside a script unless we mock it globally.
  // Instead, let's extract the core logic or just replicate the test using the exact same code block.
  // Wait, I can just mock auth() or inject the session for testing?
  // Alternatively, just replicate the exact logic from submitExam to test the DB side.

  async function simulateSubmitExam(partnerId: string, passed: boolean) {
     const p = await Partner.findById(partnerId);
     if (!p) return;

     const allCourses = await Course.find({ published: true });
     
     // Simulate passing ALL courses
     for (const c of allCourses) {
         const existingIndex = p.partnerProgress.findIndex((x) => x.courseId === c._id.toString());
         if (existingIndex > -1) {
           if (passed) {
               p.partnerProgress[existingIndex].isCompleted = true;
               p.partnerProgress[existingIndex].progressPercentage = 100;
           }
         } else {
           p.partnerProgress.push({
             courseId: c._id.toString(),
             completedLessons: [],
             progressPercentage: passed ? 100 : 0,
             isCompleted: passed,
             examScore: passed ? 100 : 0,
             examAttempts: 1
           });
         }
     }

     // Now the exact Academy Bonus logic from academy.ts
     console.log(`Evaluating passed: ${passed}, hasReceived: ${p.hasReceivedAcademyBonus}`);
     if (passed && !p.hasReceivedAcademyBonus) {
        console.log(`Total Published Courses: ${allCourses.length}`);
        const allCompleted = allCourses.every((c) => 
            p.partnerProgress.some((prog) => {
              return prog.courseId === c._id.toString() && prog.isCompleted;
            })
        );
        
        console.log(`All completed: ${allCompleted}`);

        if (allCompleted) {
            const mSession = await mongoose.startSession();
            mSession.startTransaction();

            try {
              // 1. Create separate Deal entry for bonus
              const bonusDeal = new Deal({
                partnerId: p._id,
                clientName: "Internal Reward",
                serviceType: "Internal",
                dealStatus: "closed",
                paymentStatus: "received",
                commissionStatus: "Approved",
                commissionAmount: 10,
                commissionSource: "ACADEMY_BONUS",
                estimatedValue: 0,
                commissionRate: 0,
                paymentReceivedAt: new Date(),
                closedAt: new Date()
              });
              await bonusDeal.save({ session: mSession });

              // 2. Update Partner
              p.hasReceivedAcademyBonus = true;
              p.academyBonusIssuedAt = new Date();
              await p.save({ session: mSession });

              await recordLedgerEntry({
                  partnerId: p._id.toString(),
                  type: 'academy_bonus',
                  amount: 10,
                  relatedDealId: bonusDeal._id.toString()
              }, mSession);

              await mSession.commitTransaction();
            } catch (error) {
              await mSession.abortTransaction();
              throw error; 
            } finally {
              mSession.endSession();
            }
        } else {
           await p.save();
        }
    } else {
       await p.save();
    }
  }

  // TEST 1: First-time academy completion
  console.log('\\n--- Test 1: First-time academy completion ---');
  let dealsBefore = await Deal.countDocuments({ partnerId: testPartner._id, commissionSource: 'ACADEMY_BONUS' });
  let pStats = await Partner.findById(testPartner._id);
  let balances = await getPartnerBalances(testPartner._id);
  console.log(`Before: Bonus Deal Count: ${dealsBefore}, hasReceived: ${pStats?.hasReceivedAcademyBonus}, approvedBalance: ${balances.approvedBalance}`);

  await simulateSubmitExam(testPartner._id.toString(), true);

  dealsBefore = await Deal.countDocuments({ partnerId: testPartner._id, commissionSource: 'ACADEMY_BONUS' });
  pStats = await Partner.findById(testPartner._id);
  balances = await getPartnerBalances(testPartner._id);
  console.log(`After: Bonus Deal Count: ${dealsBefore}, hasReceived: ${pStats?.hasReceivedAcademyBonus}, approvedBalance: ${balances.approvedBalance}`);

  if (dealsBefore === 1 && pStats?.hasReceivedAcademyBonus === true && balances.approvedBalance === 10) {
      console.log('✅ TEST 1 PASSED');
  } else {
      console.log('❌ TEST 1 FAILED');
  }

  // TEST 2: Completion logic runs again
  console.log('\\n--- Test 2: Completion logic runs again ---');
  await simulateSubmitExam(testPartner._id.toString(), true);
  
  dealsBefore = await Deal.countDocuments({ partnerId: testPartner._id, commissionSource: 'ACADEMY_BONUS' });
  pStats = await Partner.findById(testPartner._id);
  balances = await getPartnerBalances(testPartner._id);
  console.log(`After 2nd Run: Bonus Deal Count: ${dealsBefore}, hasReceived: ${pStats?.hasReceivedAcademyBonus}, approvedBalance: ${balances.approvedBalance}`);
  
  if (dealsBefore === 1 && balances.approvedBalance === 10) {
      console.log('✅ TEST 2 PASSED (No duplicates)');
  } else {
      console.log('❌ TEST 2 FAILED');
  }

  // TEST 3: Partner already received bonus (hasReceivedAcademyBonus = true)
  console.log('\\n--- Test 3: Partner already received bonus (hasReceivedAcademyBonus = true) ---');
  
  // Just to be absolutely sure, create a new partner but pre-emptively set hasReceivedAcademyBonus to true
  const dummyEmail2 = 'test-academy-bonus-2@example.com';
  await Partner.deleteOne({ email: dummyEmail2 });
  const testPartner2 = await Partner.create({
    name: 'Academy Bonus Test Partner 2',
    email: dummyEmail2,
    role: 'partner',
    status: 'active',
    partnerType: 'partner',
    tier: 'referral',
    hasReceivedAcademyBonus: true, // Already true
    stats: {
        totalReferredRevenue: 0,
        totalCommissionEarned: 0,
        pendingCommission: 0,
        approvedBalance: 0,
        paidCommission: 0,
        referralClicks: 0,
        referralLeads: 0,
    }
  });

  await simulateSubmitExam(testPartner2._id.toString(), true);
  
  let dealsT3 = await Deal.countDocuments({ partnerId: testPartner2._id, commissionSource: 'ACADEMY_BONUS' });
  let pStatsT3 = await Partner.findById(testPartner2._id);
  let balancesT3 = await getPartnerBalances(testPartner2._id);
  console.log(`After setup run: Bonus Deal Count: ${dealsT3}, hasReceived: ${pStatsT3?.hasReceivedAcademyBonus}, approvedBalance: ${balancesT3.approvedBalance}`);

  if (dealsT3 === 0 && balancesT3.approvedBalance === 0) {
      console.log('✅ TEST 3 PASSED');
  } else {
      console.log('❌ TEST 3 FAILED');
  }

  process.exit(0);
}

main().catch(console.error);
