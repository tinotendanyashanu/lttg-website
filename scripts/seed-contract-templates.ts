import mongoose from 'mongoose';
import { ContractTemplate } from '../models/ContractTemplate';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

// Modern minimal branded template wrapper
const createBrandedHeader = () => `
<header style="background: linear-gradient(135deg, #EAF1FB 0%, #DCE8F8 100%); padding: 34px 50px; border-bottom: 3px solid #2D2D2D; margin-bottom: 50px;">
  <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
    <img src="https://leothetechguy.com/images/logo_symbo.png" alt="LeoTheTechGuy Logo" style="width: 34px; height: 34px; object-fit: contain;" />
    <span style="font-size: 22px; font-weight: 700; color: #111827; font-family: 'Inter', sans-serif; letter-spacing: 0.2px;">LeoTheTechGuy</span>
  </div>
  <p style="margin: 0; color: #1F2937; font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 0.8px;">Professional Services Agreement</p>
</header>
`;

const createSection = (title: string, content: string) => `
<section style="margin: 40px 0; font-family: 'Inter', sans-serif;">
  <h2 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 16px 0; padding-bottom: 10px; border-bottom: 2px solid #D1D5DB;">
    ${title}
  </h2>
  <div style="color: #111827; line-height: 1.75; font-size: 14px; font-weight: 500;">
    ${content}
  </div>
</section>
`;

const createSignatureBlock = () => `
<section style="margin-top: 80px; margin-bottom: 40px; font-family: 'Inter', sans-serif;">
  <h2 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 40px 0;">Signature</h2>
  
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px;">
    <div>
      <p style="margin: 0 0 60px 0; font-weight: 700; color: #111827;">Client Signature</p>
      <div style="border-top: 2px solid #2D2D2D; width: 100%; margin-bottom: 12px;"></div>
      <p style="margin: 0; font-size: 14px; color: #1F2937;">{{client_name}}</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #1F2937;">Date: {{date}}</p>
    </div>
    
    <div>
      <p style="margin: 0 0 60px 0; font-weight: 700; color: #111827;">LeoTheTechGuy</p>
      <div style="border-top: 2px solid #2D2D2D; width: 100%; margin-bottom: 12px;"></div>
      <p style="margin: 0; font-size: 14px; color: #1F2937;">Authorized Representative</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #1F2937;">Date: {{date}}</p>
    </div>
  </div>
</section>
`;

interface ContractTemplate {
  name: string;
  description: string;
  category: string;
  content: string;
  isActive: boolean;
}

const templates: ContractTemplate[] = [
  {
    name: 'Master Service Agreement',
    description: 'General service agreement for most client engagements',
    category: 'Professional Services',
    content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 0;
      background: #F4F5F7;
      color: #111827;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #FFFFFF;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .content {
      padding: 0 50px 50px 50px;
    }
  </style>
</head>
<body>
  <div class="container">
    ${createBrandedHeader()}
    
    <div class="content">
      ${createSection('1. Parties', `
        <p>This Service Agreement ("Agreement") is entered into between <strong>LeoTheTechGuy</strong> ("Company") and <strong>{{client_name}}</strong> {{business_name}} ("Client").</p>
      `)}
      
      ${createSection('2. Scope of Services', `
        <p>The Company agrees to provide the following services:</p>
        <p>{{service_description}}</p>
      `)}
      
      ${createSection('3. Term', `
        <p>This Agreement shall commence on {{start_date}} and continue until completion of the services, or {{end_date}}, unless terminated earlier in accordance with this Agreement.</p>
      `)}
      
      ${createSection('4. Fees and Payment', `
        <p>The Client agrees to pay {{amount}} {{currency}} for the services provided.</p>
        <p>Payment terms shall be as follows:</p>
        <ul style="margin: 12px 0; padding-left: 20px;">
          <li>Invoice issued upon service commencement</li>
          <li>Payment due within 30 days of invoice date</li>
          <li>Failure to pay may result in suspension of services</li>
        </ul>
      `)}
      
      ${createSection('5. Client Responsibilities', `
        <p>The Client agrees to provide all necessary information, access, and cooperation required for the Company to perform the services effectively and on schedule.</p>
      `)}
      
      ${createSection('6. Confidentiality', `
        <p>Both parties agree to maintain confidentiality of all sensitive business, technical, and financial information exchanged during the course of this Agreement. This obligation survives termination for a period of 2 years.</p>
      `)}
      
      ${createSection('7. Intellectual Property', `
        <p>All deliverables, documentation, and work product shall remain the property of the Company until full payment is received. Upon full payment, ownership transfers to the Client unless otherwise agreed in writing.</p>
      `)}
      
      ${createSection('8. Limitation of Liability', `
        <p>The Company shall not be liable for any indirect, incidental, consequential, or punitive damages arising from the services provided, even if advised of the possibility of such damages.</p>
      `)}
      
      ${createSection('9. Termination', `
        <p>Either party may terminate this Agreement with 14 days written notice. Any outstanding payments remain due. Upon termination, the Company shall deliver all work in its current state.</p>
      `)}
      
      ${createSection('10. Governing Law', `
        <p>This Agreement shall be governed by the applicable laws of the jurisdiction in which the Company operates.</p>
      `)}
      
      ${createSignatureBlock()}
    </div>
  </div>
</body>
</html>
    `,
    isActive: true,
  },

  {
    name: 'Website & Software Development Agreement',
    description: 'Specialized contract for web development, app development, and custom software projects',
    category: 'Professional Services',
    content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 0;
      background: #F4F5F7;
      color: #111827;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #FFFFFF;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .content {
      padding: 0 50px 50px 50px;
    }
  </style>
</head>
<body>
  <div class="container">
    ${createBrandedHeader()}
    
    <div class="content">
      ${createSection('1. Parties', `
        <p>This Website & Software Development Agreement ("Agreement") is entered into between <strong>LeoTheTechGuy</strong> ("Developer") and <strong>{{client_name}}</strong> ("Client").</p>
      `)}
      
      ${createSection('2. Project Scope', `
        <p>The Developer agrees to deliver the following:</p>
        <p>{{service_description}}</p>
      `)}
      
      ${createSection('3. Timeline', `
        <p><strong>Project Commencement:</strong> {{start_date}}</p>
        <p><strong>Target Completion:</strong> {{end_date}}</p>
        <p>Timeline is subject to client timely delivery of content and feedback. Delays in client response may extend the project deadline.</p>
      `)}
      
      ${createSection('4. Payment Terms', `
        <p><strong>Total Project Cost:</strong> {{amount}} {{currency}}</p>
        <ul style="margin: 12px 0; padding-left: 20px;">
          <li>50% deposit due upon agreement signature (non-refundable)</li>
          <li>50% upon project completion and delivery</li>
          <li>Late payments may incur 1.5% monthly interest</li>
        </ul>
      `)}
      
      ${createSection('5. Revisions', `
        <p>Up to 3 rounds of revisions are included in the project cost. Revisions requested after deployment or substantial changes to scope will incur additional fees at $75/hour.</p>
      `)}
      
      ${createSection('6. Client Obligations', `
        <p>The Client must provide all required content, assets, access credentials, and timely feedback. Delays in providing necessary materials may extend the project timeline.</p>
      `)}
      
      ${createSection('7. Ownership & Delivery', `
        <p>Ownership of all deliverables transfers to the Client upon receipt of final payment. The Developer provides the work "as-is" without warranty of specific results or performance metrics.</p>
      `)}
      
      ${createSection('8. Maintenance & Support', `
        <p>Post-launch support for 30 days is included. Extended support, hosting, domain management, or ongoing maintenance is available at additional cost to be discussed separately.</p>
      `)}
      
      ${createSection('9. Limitation of Liability', `
        <p>The Developer is not responsible for third-party hosting failures, domain registration issues, security breaches from third-party services, or client-caused website breakdowns.</p>
      `)}
      
      ${createSection('10. Termination', `
        <p>Either party may terminate with written notice. Work completed to date remains the property of the Developer until final payment is received. Payments made are non-refundable once work has commenced.</p>
      `)}
      
      ${createSignatureBlock()}
    </div>
  </div>
</body>
</html>
    `,
    isActive: true,
  },

  {
    name: 'IT Support & Maintenance Agreement',
    description: 'Ongoing IT support, system maintenance, and technical assistance contract',
    category: 'Professional Services',
    content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 0;
      background: #F4F5F7;
      color: #111827;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #FFFFFF;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .content {
      padding: 0 50px 50px 50px;
    }
  </style>
</head>
<body>
  <div class="container">
    ${createBrandedHeader()}
    
    <div class="content">
      ${createSection('1. Services', `
        <p>LeoTheTechGuy agrees to provide the following IT support services:</p>
        <p>{{service_description}}</p>
      `)}
      
      ${createSection('2. Term', `
        <p>This agreement begins on {{start_date}} and continues on a monthly basis, automatically renewing unless terminated with 30 days written notice by either party.</p>
      `)}
      
      ${createSection('3. Monthly Fee', `
        <p><strong>Cost:</strong> {{amount}} {{currency}} per month</p>
        <p>Monthly payments are due in advance on the first business day of each month.</p>
      `)}
      
      ${createSection('4. Support Coverage', `
        <ul style="margin: 12px 0; padding-left: 20px;">
          <li>System maintenance and patching</li>
          <li>Technical troubleshooting and issue resolution</li>
          <li>Security monitoring and updates</li>
          <li>Data backup management</li>
          <li>Performance optimization</li>
          <li>User account and access management</li>
        </ul>
      `)}
      
      ${createSection('5. Response Time', `
        <p>Standard issues: Response within 24 business hours</p>
        <p>Critical issues (system down): Response within 4 business hours</p>
        <p>Emergency support available at additional cost</p>
      `)}
      
      ${createSection('6. Escalation & Major Projects', `
        <p>Work beyond the scope of monthly support (hardware upgrades, major infrastructure changes, etc.) will be quoted separately at $100/hour.</p>
      `)}
      
      ${createSection('7. Client Responsibilities', `
        <p>Client agrees to provide timely access to systems, communicate issues clearly, and implement recommended security practices.</p>
      `)}
      
      ${createSection('8. Limitation of Liability', `
        <p>LeoTheTechGuy is not liable for data loss, hardware failures beyond its control, security breaches from client negligence, or server/hosting provider outages.</p>
      `)}
      
      ${createSection('9. Termination', `
        <p>Either party may terminate with 30 days written notice. Upon termination, all support ceases and no refunds are issued for the current month.</p>
      `)}
      
      ${createSignatureBlock()}
    </div>
  </div>
</body>
</html>
    `,
    isActive: true,
  },

  {
    name: 'Affiliate & Partner Agreement',
    description: 'Commission-based referral and partnership agreement',
    category: 'Professional Services',
    content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 0;
      background: #F4F5F7;
      color: #111827;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #FFFFFF;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .content {
      padding: 0 50px 50px 50px;
    }
  </style>
</head>
<body>
  <div class="container">
    ${createBrandedHeader()}
    
    <div class="content">
      ${createSection('1. Relationship', `
        <p>This Affiliate & Partner Agreement ("Agreement") establishes a referral and partnership relationship between <strong>LeoTheTechGuy</strong> ("Company") and <strong>{{client_name}}</strong> ("Partner").</p>
        <p><strong>Role:</strong> {{service_description}}</p>
      `)}
      
      ${createSection('2. Commission Structure', `
        <p>The Partner will receive {{amount}}% commission on successful referred clients who engage the Company for services and complete to contract value.</p>
        <p>Commission is calculated as a percentage of the total project fee or service contract value paid by the referred client.</p>
      `)}
      
      ${createSection('3. Payment Terms', `
        <ul style="margin: 12px 0; padding-left: 20px;">
          <li>Commission is paid ONLY after the Company receives full payment from the referred client</li>
          <li>Payments are processed monthly, within 15 days of month-end</li>
          <li>Minimum commission threshold: {{amount}} {{currency}} (below threshold, payment is held until next month)</li>
          <li>Payment method: Direct deposit or invoice as agreed</li>
        </ul>
      `)}
      
      ${createSection('4. Referral Requirements', `
        <ul style="margin: 12px 0; padding-left: 20px;">
          <li>All referrals must be documented and tracked via the Partner Portal</li>
          <li>Partner must obtain Company's prior approval for marketing methods</li>
          <li>Partner shall not misrepresent the Company or its capabilities</li>
          <li>All referrals must be new business (not existing clients of the Company)</li>
        </ul>
      `)}
      
      ${createSection('5. Confidentiality', `
        <p>The Partner agrees to maintain strict confidentiality of all shared business, technical, and financial information. This obligation survives termination.</p>
      `)}
      
      ${createSection('6. Independent Contractor Status', `
        <p>The Partner is an independent contractor. The Company does not provide benefits, withhold taxes, or provide equipment. The Partner is responsible for all applicable taxes.</p>
      `)}
      
      ${createSection('7. Restrictions', `
        <ul style="margin: 12px 0; padding-left: 20px;">
          <li>Partner shall not resell Company services without written authorization</li>
          <li>Partner shall not use Company name or logo without approval</li>
          <li>Partner shall not solicit Company employees</li>
          <li>Partner shall not disparage Company or compete directly</li>
        </ul>
      `)}
      
      ${createSection('8. Termination', `
        <p>The Company may terminate this agreement at any time with 30 days written notice. Upon termination, no further commissions are earned, but unpaid commissions from completed referrals are paid within 30 days.</p>
      `)}
      
      ${createSignatureBlock()}
    </div>
  </div>
</body>
</html>
    `,
    isActive: true,
  },

  {
    name: 'Non-Disclosure Agreement (NDA)',
    description: 'Confidentiality and non-disclosure agreement for sensitive business information',
    category: 'Professional Services',
    content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 0;
      background: #F4F5F7;
      color: #111827;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #FFFFFF;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .content {
      padding: 0 50px 50px 50px;
    }
  </style>
</head>
<body>
  <div class="container">
    ${createBrandedHeader()}
    
    <div class="content">
      ${createSection('1. Parties & Purpose', `
        <p>This Non-Disclosure Agreement ("NDA") is entered into between <strong>LeoTheTechGuy</strong> ("Disclosing Party") and <strong>{{client_name}}</strong> ("Receiving Party").</p>
        <p><strong>Purpose:</strong> {{service_description}}</p>
      `)}
      
      ${createSection('2. Confidential Information', `
        <p>"Confidential Information" includes all non-public business, technical, financial, or strategic information disclosed between the parties, including but not limited to:</p>
        <ul style="margin: 12px 0; padding-left: 20px;">
          <li>Business plans, strategies, and financial data</li>
          <li>Technical specifications, code, and system architecture</li>
          <li>Client lists and business relationships</li>
          <li>Pricing, costs, and commercial terms</li>
          <li>Any information marked as confidential or identified as confidential in writing</li>
        </ul>
      `)}
      
      ${createSection('3. Obligations of Receiving Party', `
        <p>The Receiving Party agrees to:</p>
        <ul style="margin: 12px 0; padding-left: 20px;">
          <li>Maintain strict confidentiality of all Confidential Information</li>
          <li>Protect the information with the same care as its own confidential information</li>
          <li>Not disclose the information to third parties without written consent</li>
          <li>Use the information only for the stated purpose</li>
          <li>Return or destroy all confidential materials upon request or termination</li>
        </ul>
      `)}
      
      ${createSection('4. Exclusions', `
        <p>This NDA does not apply to information that:</p>
        <ul style="margin: 12px 0; padding-left: 20px;">
          <li>Was publicly available at the time of disclosure or becomes public through no breach by Receiving Party</li>
          <li>Was rightfully possessed by Receiving Party prior to disclosure</li>
          <li>Is independently developed without reference to Confidential Information</li>
          <li>Is rightfully received by Receiving Party from a third party without breach obligations</li>
          <li>Must be disclosed by law or court order (with prompt notice to Disclosing Party)</li>
        </ul>
      `)}
      
      ${createSection('5. Term', `
        <p>This NDA remains in effect for <strong>2 years</strong> from the date of this agreement, unless earlier terminated by either party with written notice. However, obligations regarding already-disclosed information continue for an additional 2 years after termination.</p>
      `)}
      
      ${createSection('6. No License or Rights', `
        <p>Disclosure of Confidential Information does not grant any license, ownership, or rights to the Receiving Party.</p>
      `)}
      
      ${createSection('7. Breach & Remedies', `
        <p>The Receiving Party acknowledges that breach of this NDA may cause irreparable harm for which monetary damages are an inadequate remedy. The Disclosing Party is entitled to seek injunctive relief and other legal remedies.</p>
      `)}
      
      ${createSection('8. Termination', `
        <p>Either party may terminate this NDA with 14 days written notice. Termination does not relieve the Receiving Party of its obligations regarding already-disclosed information.</p>
      `)}
      
      ${createSignatureBlock()}
    </div>
  </div>
</body>
</html>
    `,
    isActive: true,
  },
];

async function seedContractTemplates() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Delete existing templates in Professional Services category (for clean reset)
    const deleteResult = await ContractTemplate.deleteMany({ category: 'Professional Services' });
    console.log(`✓ Deleted ${deleteResult.deletedCount} existing Professional Services templates`);

    // Insert new templates
    const result = await ContractTemplate.insertMany(templates);
    console.log(`✓ Successfully inserted ${result.length} new contract templates:`);
    result.forEach((template: any) => {
      console.log(`  - ${template.name}`);
    });

    console.log('\n✓ Contract templates seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding contract templates:', error);
    process.exit(1);
  }
}

seedContractTemplates();
