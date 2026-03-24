import mongoose from 'mongoose';
import { ContractTemplate } from '../models/ContractTemplate';
import { interpolateTemplate } from '../lib/contract-utils';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testRendering() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    const template = await ContractTemplate.findOne({ name: 'Master Service Agreement' });

    if (!template) {
      console.log('Template not found');
      process.exit(1);
    }

    // Test with sample data
    const rendered = interpolateTemplate(template.content, {
      client_name: 'Acme Corporation',
      business_name: 'Tech Solutions Inc.',
      service_description: 'Full-stack web development for enterprise platform',
      amount: '25,000',
      currency: 'USD',
      start_date: '2026-04-01',
      end_date: '2026-06-30',
      date: '2026-03-24',
      company_name: 'LeoTheTechGuy',
    });

    // Check for key elements
    const hasLogo = rendered.includes('LeoTheTechGuy');
    const hasStyle = rendered.includes('font-family');
    const hasSignatures = rendered.includes('Client Signature') && rendered.includes('Acme Corporation');
    const hasPlaceholders = rendered.includes('{{');

    console.log('\n✓ Rendering Test Results:');
    console.log(`  - Contains LeoTheTechGuy branding: ${hasLogo ? '✓' : '✗'}`);
    console.log(`  - Has styling (Modern minimal): ${hasStyle ? '✓' : '✗'}`);
    console.log(`  - Signatures rendered: ${hasSignatures ? '✓' : '✗'}`);
    console.log(`  - All placeholders replaced: ${!hasPlaceholders ? '✓' : '✗'}`);
    console.log(`  - Template size: ${(template.content.length / 1024).toFixed(1)} KB`);

    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

testRendering();
