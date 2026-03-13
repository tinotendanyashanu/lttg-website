/**
 * cleanup-test-data.js
 * Removes all test/seed data from MongoDB, leaving only real records.
 *
 * Run: node --env-file=.env.local scripts/cleanup-test-data.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// ── Test identifiers ──────────────────────────────────────────────────────────

// Accounts seeded by seed-accounts.js and seed-test-clients.js / test-intern-commission.ts
const TEST_ACCOUNT_EMAILS = [
  'alice@testclient.com',
  'bob@testclient.com',
  'admin@leotech.com',
  'employee@leotech.com',
  'intern@leotech.com',
  'test_employee@example.com',
];

// Partners seeded by test-academy-bonus.ts
const TEST_PARTNER_EMAILS = [
  'test-academy-bonus@example.com',
  'test-academy-bonus-2@example.com',
];

// Cases created by test-intern-commission.ts all start with "TEST-COMM-"
const TEST_CASE_ID_PREFIX = /^TEST-COMM-/;

// ── Minimal schemas (enough to find & delete) ─────────────────────────────────

const AccountSchema = new mongoose.Schema({ email: String });
const CaseSchema = new mongoose.Schema({ caseId: String });
const CommissionSchema = new mongoose.Schema({ caseId: mongoose.Schema.Types.ObjectId });
const CommissionLedgerSchema = new mongoose.Schema({ relatedCaseId: mongoose.Schema.Types.ObjectId });
const PartnerSchema = new mongoose.Schema({ email: String });
const DealSchema = new mongoose.Schema({ partnerId: mongoose.Schema.Types.ObjectId });

const Account = mongoose.models.Account || mongoose.model('Account', AccountSchema);
const Case = mongoose.models.Case || mongoose.model('Case', CaseSchema);
const Commission = mongoose.models.Commission || mongoose.model('Commission', CommissionSchema);
const CommissionLedger = mongoose.models.CommissionLedger || mongoose.model('CommissionLedger', CommissionLedgerSchema);
const Partner = mongoose.models.Partner || mongoose.model('Partner', PartnerSchema);
const Deal = mongoose.models.Deal || mongoose.model('Deal', DealSchema);

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB\n');

  // 1. Find test cases first so we can clean up linked records
  const testCases = await Case.find({ caseId: TEST_CASE_ID_PREFIX });
  const testCaseIds = testCases.map((c) => c._id);
  console.log(`Found ${testCases.length} test case(s): ${testCases.map((c) => c.caseId).join(', ') || 'none'}`);

  // 2. Delete commissions and ledger entries linked to test cases
  if (testCaseIds.length > 0) {
    const commResult = await Commission.deleteMany({ caseId: { $in: testCaseIds } });
    console.log(`Deleted ${commResult.deletedCount} commission record(s) linked to test cases`);

    const ledgerResult = await CommissionLedger.deleteMany({ relatedCaseId: { $in: testCaseIds } });
    console.log(`Deleted ${ledgerResult.deletedCount} commission ledger entry/ies linked to test cases`);
  }

  // 3. Delete test cases
  const caseResult = await Case.deleteMany({ caseId: TEST_CASE_ID_PREFIX });
  console.log(`Deleted ${caseResult.deletedCount} test case(s)`);

  // 4. Delete test accounts
  const accountResult = await Account.deleteMany({ email: { $in: TEST_ACCOUNT_EMAILS } });
  console.log(`Deleted ${accountResult.deletedCount} test account(s)`);

  // 5. Find test partners so we can also remove their deals
  const testPartners = await Partner.find({ email: { $in: TEST_PARTNER_EMAILS } });
  const testPartnerIds = testPartners.map((p) => p._id);
  console.log(`Found ${testPartners.length} test partner(s): ${testPartners.map((p) => p.email).join(', ') || 'none'}`);

  // 6. Delete deals belonging to test partners
  if (testPartnerIds.length > 0) {
    const dealResult = await Deal.deleteMany({ partnerId: { $in: testPartnerIds } });
    console.log(`Deleted ${dealResult.deletedCount} deal(s) linked to test partners`);
  }

  // 7. Delete test partners
  const partnerResult = await Partner.deleteMany({ email: { $in: TEST_PARTNER_EMAILS } });
  console.log(`Deleted ${partnerResult.deletedCount} test partner(s)`);

  console.log('\nDone. All test data removed.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
