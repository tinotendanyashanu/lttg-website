
export const courses = [
  // ── Course 0: Dashboard Walkthrough (FIRST — shown to all new partners) ──
  {
    title: "How to Use Your Partner Dashboard",
    slug: "dashboard-walkthrough",
    description: "A complete step-by-step walkthrough of the Partner Dashboard. Learn how to register deals, track earnings, generate referral links, and master every feature in your account.",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    level: "beginner",
    category: "sales",
    targetAudience: ["all"],
    sortOrder: 0,
    published: true,
    lessons: [
      {
        title: "Lesson 1: Getting Oriented — The Dashboard Overview",
        slug: "dashboard-overview",
        duration: "4 mins",
        content: `## Getting Oriented — The Dashboard Overview

Welcome to the Leo Systems Partner Dashboard. This is your command centre for everything related to your partnership — deals, earnings, referrals, and more.

### What You'll See on the Overview Page

When you first log in, you land on the **Overview** page. Here's what each section does:

#### 📊 The 4 Stats Cards (Top of Page)
| Card | What It Shows |
|------|----------------|
| **Total Revenue Referred** | The combined value of all deals you've brought in |
| **Lifetime Commission** | Total commission you've ever earned (including paid amounts) |
| **Pending Commission** | Earnings that are approved but not yet transferred to you |
| **Academy Progress** | How many courses you've completed out of the total available |

#### ✅ Onboarding Checklist
Just below the stats, you'll see a quick checklist. It tracks whether you've:
- Set up your payout method
- Completed an Academy course
- Registered your first deal
- Reviewed the Program Rules

Complete all steps to unlock your full earning potential.

#### 📈 Commission Forecast & Performance
Further down, you'll find two analytical panels:
- **Commission Forecast** — tells you whether you're eligible for a payout and why/why not
- **Performance Analytics** — shows trends in your deals, approvals, and earnings over time

#### 📢 Program Announcements
The bottom section keeps you up to date on program changes, payout schedule updates, and new features.

> **Tip:** Bookmark your dashboard URL. You'll be visiting it regularly.`,
      },
      {
        title: "Lesson 2: Registering Your First Deal",
        slug: "register-a-deal",
        duration: "6 mins",
        content: `## Registering Your First Deal

Registering a deal is the single most important action you can take as a partner. It **protects your commission rights** on that client.

### Step-by-Step: How to Register a Deal

1. **Click "Register Deal"** in the sidebar (or the "+ Register Deal" button on the Overview page)
2. **Fill in the Client Name** — use the business's full legal name or the contact's full name
3. **Enter Client Email** — this is used for duplicate-checking, so accuracy matters
4. **Enter Estimated Deal Value** — your best guess in USD. Your commission is calculated on the final actual value, not this estimate
5. **Select Service Type** — choose from SME, Startup, Enterprise, or Individual
6. **Add Notes** — describe the client's pain point, your relationship with them, and any urgency. More detail = faster admin review
7. **Click Submit**

### What Happens After Submission?

- ✅ You'll receive an in-dashboard notification confirming registration
- 📧 An email is sent to the admin team for review
- 🔒 The deal is **timestamped under your name** within seconds

### Deal Protection Rule
Once registered, no other partner can claim commission on that same client for **90 days**.

> ⚠️ **Never delay registering a deal.** Even if you're still in early conversations with the prospect, register immediately to protect your claim.`,
      },
      {
        title: "Lesson 3: Tracking Your Deals",
        slug: "tracking-deals",
        duration: "5 mins",
        content: `## Tracking Your Deals

The **Deals** section gives you a full view of every opportunity you've registered.

### How to Access It
Click **Deals** in the sidebar.

### What You'll See
Each deal has the following information:
- **Client Name** — the company or individual you registered
- **Deal Value** — the estimated or confirmed final value
- **Status** — the current lifecycle stage of the deal
- **Date** — when the deal was registered

### Understanding Deal Statuses

| Status | Meaning |
|--------|---------|
| 🟡 **registered** | Submitted and awaiting admin review |
| 🟢 **approved** | Accepted into our pipeline — our sales team is now engaged |
| 🔵 **closed** | Client has signed the contract |
| 🔴 **rejected** | Did not meet our criteria (you'll be notified with a reason) |

### Commission Statuses (Separate from Deal Status)

| Commission Status | Meaning |
|------------------|---------|
| **Pending** | Commission earned but not yet approved |
| **Approved** | Verified and queued for payout |
| **Paid** | Transferred to your bank account |

### Viewing a Deal's Full Details
Click any deal row to open its detail page. You'll see:
- Full status history
- Commission breakdown
- Payout batch reference (once paid)

> **Tip:** If a deal has been under review for more than 5 business days with no update, open Settings and contact your partner manager.`,
      },
      {
        title: "Lesson 4: Using Your Referral Link",
        slug: "referral-links",
        duration: "5 mins",
        content: `## Using Your Referral Link

The **Referral Links** section allows you to earn commissions passively — without manually registering each deal.

### What Is a Referral Link?
Your referral link is a unique URL tied to your account. When someone visits it and becomes a client, the commission is automatically attributed to you.

> Format: \`leosystems.com?ref=your-unique-code\`

### How to Generate Your Link
1. Click **Referral Links** in the sidebar
2. If you don't have a referral code yet, click **"Generate My Referral Code"**
3. Your unique link is created instantly and shown on the page

### What Can You Do With It?
- Share it on social media (LinkedIn, Twitter/X, Instagram)
- Add it to your email signature
- Put it in your bio or website
- Include it in content you create about Leo Systems

### Tracking Your Referral Performance
The Referral Links page shows:
- **Total Clicks** — how many people visited using your link
- **Conversions** — how many became qualified leads
- **Referral Code** — your unique identifier

### Referral vs. Deal Registration
| Method | Best For |
|--------|---------|
| **Referral Link** | High-volume, passive sharing — social media, public content |
| **Deal Registration** | Warm introductions — direct one-on-one referrals to specific businesses |

You can use **both methods simultaneously**. They are complementary, not mutually exclusive.`,
      },
      {
        title: "Lesson 5: Analytics & Payouts",
        slug: "analytics-and-payouts",
        duration: "6 mins",
        content: `## Analytics & Payouts

The **Analytics** and **Payouts** sections in the sidebar both take you to your **Earnings page** — your financial command centre.

### What's on the Earnings Page?

#### Your Balance Summary
- **Approved Balance** — funds ready for payout
- **Pending Commission** — earned but still in the verification window
- **Lifetime Earned** — total all-time commission

#### Commission Eligibility
We evaluate whether you're eligible for a payout based on:
- ✅ Your email is verified
- ✅ Your payout method is set up
- ✅ You have a positive approved balance
- ✅ Your account is in good standing (not suspended)

If you're not eligible, the system will tell you **exactly why** so you can fix it.

#### Payout Hold Period
Commissions go through a **14-day hold** after the client pays, before being approved for payout. This protects against refunds and chargebacks.

#### Payout History
Once paid, each payout shows:
- Amount transferred
- Payout batch reference number
- Date processed

### Setting Up Your Payout Method
Go to **Settings** → scroll to the **Payout Details** section → fill in your bank details or local remittance information.

> ⚠️ **Important:** Payouts cannot be processed without a valid payout method on file. Set this up on your first day.`,
      },
      {
        title: "Lesson 6: Academy, Settings & Notifications",
        slug: "academy-settings-notifications",
        duration: "5 mins",
        content: `## Academy, Settings & Notifications

### 🎓 The Academy
Click **Academy** in the sidebar to access your training courses.

Completing Academy courses helps you:
- Understand Leo Systems' services deeply so you can sell more effectively
- Earn the **$10 Academy Bonus** upon completing all courses
- Build real expertise that clients will sense in your conversations

Each course has:
- **Multiple lessons** — readable, structured content
- **An exam at the end** — must pass with 80%+ to complete the course
- **A progress tracker** on the Academy overview page

### 🔔 Notifications
Your notification bell (top-right of every page) alerts you to:
- Deal status changes (approved, rejected, closed)
- Commission approved or paid
- New platform announcements

Click the bell to view all notifications. They're stored in your account permanently.

### ⚙️ Settings
The **Settings** page is where you manage your account:

| Section | Purpose |
|---------|---------|
| **Profile** | Update your name and contact details |
| **Payout Details** | Add bank account or local remittance info |
| **Tier Info** | See your current tier and commission rate |
| **Security** | Change password, review account status |

### 📋 Tier Progress
Click **Tier Progress** in the sidebar to see:
- Your current tier (Referral → Agency → Enterprise)
- How much referred revenue you've generated
- How close you are to the next tier upgrade

Tiers affect your **commission percentage only** — not what features you can access.

> **Summary:** You now know every major section of your Partner Dashboard. Start by setting up your payout method, registering your first deal, and completing at least one Academy course!`,
      },
    ],
    exam: {
      passingScore: 80,
      questions: [
        {
          question: "What is the primary purpose of registering a deal immediately after speaking to a prospect?",
          options: [
            "To get a notification",
            "To protect your commission rights by timestamping the lead under your name",
            "To trigger an automatic payout",
            "To assign the deal to an admin",
          ],
          correctAnswer: 1,
        },
        {
          question: "Which dashboard stat shows earnings that are approved but not yet transferred to your bank?",
          options: [
            "Total Revenue Referred",
            "Lifetime Commission",
            "Pending Commission",
            "Academy Progress",
          ],
          correctAnswer: 2,
        },
        {
          question: "What does a deal status of 'Approved' mean?",
          options: [
            "The client has paid their invoice",
            "Your commission has been transferred",
            "The deal has been accepted into the sales pipeline",
            "The deal registration was received",
          ],
          correctAnswer: 2,
        },
        {
          question: "How long is the commission hold period after client payment before it becomes eligible for payout?",
          options: [
            "7 days",
            "30 days",
            "14 days",
            "Immediately",
          ],
          correctAnswer: 2,
        },
        {
          question: "What does your partner Tier affect?",
          options: [
            "Which sidebar links you can see",
            "Your commission percentage and tier badge only",
            "Whether you can register deals",
            "Your access to the Academy",
          ],
          correctAnswer: 1,
        },
      ],
    },
  },

  // ── Course 1: Partner Fundamentals ───────────────────────────────────
  {
    title: "Partner Fundamentals",
    slug: "partner-fundamentals",
    description: "The essential guide to the Leo Systems Partner Network. Learn how the program works, how commissions are calculated, and how to manage your deals effectively.",
    thumbnailUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
    level: "beginner",
    category: "sales",
    published: true,
    lessons: [
      {
        title: "Module 1 - Lesson 1: What Is the Leo Systems Partner Network?",
        slug: "what-is-partner-network",
        content: `## What Is the Leo Systems Partner Network?

The Leo Systems Partner Network is a structured collaboration model designed for professionals to monetize their network by introducing high-value digital infrastructure projects.

This program goes beyond a standard affiliate system. It is a professional ecosystem built on:

*   **Enterprise-grade systems**: We use top-tier technology stacks and infrastructure.
*   **Structured deal tracking**: Every lead you register is tracked transparently from inception to close.
*   **Transparent commission calculation**: No hidden fees or ambiguous terms.
*   **Long-term recurring revenue**: Opportunities for ongoing earnings through maintenance and support contracts.

### Your Role vs. Our Role

**Your Role:**
Your primary objective is to identify businesses and individuals who have a genuine need for intelligent digital systems. You act as the bridge, connecting problems with our solutions. You are not expected to be a technical expert or a project manager.

**Our Role:**
We handle the heavy lifting. Once a deal is registered and approved, our team takes over to:
*   Conduct technical discovery and scoping.
*   Architect the solution.
*   Develop and deploy the system.
*   Provide ongoing support and maintenance.

By clearly defining these roles, we ensure you can focus on what you do best—networking and business development—while we deliver world-class technical execution.`,
        duration: "5 mins",
      },
      {
        title: "Module 1 - Lesson 2: How Commission Works",
        slug: "how-commission-works",
        content: `## How Commission Works

Understanding your earnings is crucial. At Leo Systems, we prioritize transparency in our commission structure.

### The Calculation Formula

Your commission is straightforward and calculated based on the **final deal value**—the actual amount the client pays for the project.

**Formula:**
\`\`\`
Commission = Final Project Value × Assigned Commission Rate
\`\`\`

*   **Final Project Value**: The total contract value signed by the client (excluding taxes).
*   **Assigned Commission Rate**: The percentage determined by your partner tier.

### Variables Affecting Your Rate

Your specific commission rate is dynamic and can vary based on:

1.  **Your Partner Tier**: Higher tiers (Agency, Enterprise) command higher base rates.
2.  **Your Involvement**: Are you simply referring a lead (Referral) or actively helping to close the deal (Closing)? Active involvement often yields a higher percentage.
3.  **Deal Complexity**: exceptionally large or complex enterprise deals may have custom commission structures negotiated upfront.

### Triggering the Commission

Commission payments are not automatic upon registration. They are triggered only when the following conditions are met:

1.  **Deal is Closed**: The client has signed the contract.
2.  **Payment is Received**: The client has paid the initial invoice or the project fee.
3.  **Commission Status is Approved**: Our finance team has verified the transaction.

This ensures a fair and sustainable model for all parties.`,
        duration: "7 mins",
      },
      {
        title: "Module 1 - Lesson 3: Deal Lifecycle Explained",
        slug: "deal-lifecycle",
        content: `## Deal Lifecycle Explained

Every opportunity you bring to Leo Systems follows a structured lifecycle. Understanding this process ensures you know exactly where your deals stand at any moment.

### The 7 Stages of a Deal

1.  **Registered**: You submit the deal through the dashboard. It enters our system and is timestamped to protect your lead.
2.  **Under Review**: Our partnership team reviews the submission to ensure it meets our criteria (valid business, budget potential, not a duplicate).
3.  **Approved**: The deal is accepted into our pipeline. Our sales team is assigned to reach out to the prospect.
4.  **Closed**: Success! The client has signed the contract.
5.  **Payment Received**: funds have cleared in our bank account.
6.  **Commission Calculated**: The finance team calculates your final payout based on the actual received amount.
7.  **Commission Paid**: The funds are transferred to your account.

### Why Registration Matters

Stage 1 is the most critical for you. You **must** register all deals inside the dashboard immediately. This "locks in" the lead under your name, protecting your commission rights even if another partner speaks to them later.`,
        duration: "6 mins",
      },
      {
        title: "Module 1 - Lesson 4: How to Register a Deal",
        slug: "how-to-register-deal",
        content: `## How to Register a Deal

Registering a deal is a simple but vital process. Follow this step-by-step guide to ensure your leads are tracked correctly.

### Step-by-Step Guide

1.  **Navigate to the Deals Tab**: Log in to your Partner Dashboard and click on "Deals" in the sidebar.
2.  **Click "Register New Deal"**: Look for the primary action button, usually at the top right.
3.  **Enter Client Name**: Provide the full legal name of the business or contact person. Accuracy here prevents duplicate disputes.
4.  **Enter Estimated Value**: Give your best guess of the project's budget. This helps us prioritize, but your commission will be based on the *final* actual value.
5.  **Select Service Category**: Choose the most relevant service (e.g., SME, Startup, Enterprise).
6.  **Add Notes**: Context is king. Add details about the client's pain points, urgency, and your relationship to them.

### What Happens After Submission?

*   **Admin Review**: A partner manager reviews the details.
*   **Notification**: You will receive an email and dashboard notification once the status changes to "Approved" or "Rejected".
*   **Protection**: Once registered, the client is "protected" for you for 90 days, meaning no other partner can claim commission on them.

*(Note: Screenshots of the registration form and status indicators would typically appear here in the visual course materials to guide you.)*`,
        duration: "8 mins",
      },
      {
        title: "Module 1 - Lesson 5: Understanding Payouts",
        slug: "understanding-payouts",
        content: `## Understanding Payouts

We believe in predictable and transparent compensation.

### Tracking Your Money

Your dashboard provides a real-time financial overview:

*   **Total Earned**: The cumulative gross commission you have generated since joining.
*   **Pending Commission**: Money that has been earned (deal closed & paid) but is currently in the processing window (e.g., Net-30 or bi-weekly cycles).
*   **Paid Commission**: Funds that have successfully been transferred to your connected bank account or wallet.
*   **Payout History**: A detailed ledger of every transaction, date, and reference number.

### Payout Cycles

Payouts are processed in structured cycles (typically monthly or bi-weekly, depending on your agreement). This ensures:
*   Accuracy in accounting.
*   Verification of client funds clearing (to prevent clawbacks).
*   Predictability for your own cash flow planning.

There are no hidden calculations or "black box" metrics. What you see on your dashboard matches what hits your bank account.`,
        duration: "5 mins",
      },
    ],
  },

  // ── Course 2: SME Systems ───────────────────────────────────────────
  {
    title: "SME Systems",
    slug: "sme-systems",
    description: "Master the three pillars of SME infrastructure: AI Workflow Automation, Sales Engines, and Business Intelligence. Learn to build structured operational systems.",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", // Data analysis for SME
    level: "intermediate",
    category: "product",
    published: true,
    lessons: [
      {
        title: "Module 1: Foundations of SME Systems",
        slug: "foundations-sme-systems",
        content: `## What SME Systems Actually Means
 
 SME Systems are structured operational and revenue infrastructure for growing businesses that are generating income but operating inefficiently.
 
 We are not selling “AI tools.”
 
 We are delivering:
 
 - **Operational clarity**
 - **Revenue structure**
 - **Automation architecture**
 - **Data visibility**
 
 ### Core SME Service Offerings
 
 We focus on three primary SME service pillars:
 
 1. **AI Workflow Automation**
 2. **AI Sales Engine System**
 3. **Business Intelligence Dashboard**`,
        duration: "5 mins",
      },
      {
        title: "Module 2: AI Workflow Automation System",
        slug: "ai-workflow-automation",
        content: `## 1️⃣ AI Workflow Automation System
 
 ### What It Is
 
 A structured automation architecture that removes repetitive manual tasks inside a business.
 
 This is **operational system design** — not random automation.
 
 ### What We Deliver
 
 - Business process audit
 - Workflow mapping
 - Automation blueprint
 - CRM integration
 - Lead routing system
 - Email automation sequences
 - Tool-to-tool data synchronization
 - KPI reporting dashboard
 
 ### Who It’s For
 
 - Marketing agencies
 - E-commerce businesses
 - Real estate firms
 - Logistics SMEs
 - Consulting firms
 - Service businesses with consistent revenue
 
 ### Problem It Solves
 
 - Manual data entry
 - Missed or lost leads
 - Staff inefficiency
 - Inconsistent follow-ups
 - Lack of performance visibility
 
 ### What It Is NOT
 
 - Installing a single automation tool
 - Adding a chatbot plugin
 - Connecting random apps
 
 **This is architecture.**
 
 ### How to Position It
 
 **Do NOT say:**
 “We build automation.”
 
 **Say:**
 “We help businesses eliminate operational inefficiencies and build predictable internal systems.”`,
        duration: "10 mins",
      },
      {
        title: "Module 3: AI Sales Engine System",
        slug: "ai-sales-engine",
        content: `## 2️⃣ AI Sales Engine System
 
 ### What It Is
 
 A structured system that turns inbound or outbound leads into organized revenue pipelines.
 
 This is **revenue infrastructure**.
 
 ### What We Deliver
 
 - CRM architecture design
 - Lead qualification logic
 - Automated follow-up sequences
 - Calendar integration
 - Pipeline visibility dashboard
 - Conversion tracking
 
 ### Who It’s For
 
 - Businesses receiving consistent leads
 - Agencies
 - Coaches
 - Service providers
 - Companies with sales teams
 
 ### Problem It Solves
 
 - Leads going cold
 - Poor follow-up structure
 - Sales process chaos
 - Revenue unpredictability
 
 ### What It Is NOT
 
 - Cold email software
 - A chatbot gimmick
 - A marketing campaign
 
 It is a **structured sales system**.
 
 ### Positioning Language
 
 “Turn scattered leads into a **predictable sales machine**.”`,
        duration: "8 mins",
      },
      {
        title: "Module 4: Business Intelligence Dashboard",
        slug: "business-intelligence-dashboard",
        content: `## 3️⃣ Business Intelligence Dashboard
 
 ### What It Is
 
 A centralized data visibility system that allows SME owners to make informed decisions based on real metrics.
 
 ### What We Deliver
 
 - KPI definition and mapping
 - Data integration from CRM and tools
 - Custom dashboard development
 - Automated reporting
 - Performance metric tracking
 
 ### Who It’s For
 
 - Owners lacking clarity
 - Managers needing real-time visibility
 - Growing companies scaling operations
 
 ### Problem It Solves
 
 - Decision-making based on guesswork
 - No real-time performance tracking
 - Disconnected spreadsheets
 
 ### What It Is NOT
 
 - A simple chart
 - A manual Excel file
 - A static report template
 
 This is **performance intelligence infrastructure**.`,
        duration: "7 mins",
      },
      {
        title: "Module 5: Client Strategy & Sales",
        slug: "sme-client-strategy",
        content: `## Ongoing Optimization & Support
 
 SME Systems can include recurring support such as:
 
 - Automation monitoring
 - CRM optimization
 - Reporting updates
 - System improvements
 
 **This supports long-term recurring revenue.**
 
 ---
 
 ## Ideal SME Client Profile
 
 Partners should look for businesses that:
 
 - Generate steady revenue
 - Have 3+ team members
 - Use multiple digital tools
 - Receive consistent leads
 - Experience operational inefficiencies
 - Are actively scaling
 
 **Avoid extremely early-stage or non-operational businesses.**
 
 ---
 
 ## SME Systems — Selling Framework
 
 When speaking to SMEs, focus on:
 
 - **Efficiency**
 - **Revenue predictability**
 - **Reduced manual workload**
 - **Increased visibility**
 - **Scalable operations**
 
 **Never focus on tools.**
 **Always focus on outcomes.**
 
 ---
 
 ### Summary
 
 SME Systems are:
 
 - Operational infrastructure
 - Revenue systems
 - Data visibility architecture
 - Automation blueprinting
 
 We build **structured systems** — not quick fixes.`,
        duration: "8 mins",
      },
    ],
  },

  // ── Course 3: Startup Systems ────────────────────────────────────────
  {
    title: "Startup Systems",
    slug: "startup-systems",
    description: "Architect and deploy scalable digital products. From MVP engineering to full SaaS platform infrastructure and AI integration.",
    thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80", // Replace with startup image
    level: "advanced",
    category: "product",
    published: true,
    lessons: [
      {
        title: "Module 1: Foundations of Startup Systems",
        slug: "foundations-startup-systems",
        content: `## What Startup Systems Actually Means
 
 Startup Systems are structured product engineering and scalable infrastructure builds for founders and early-stage companies.
 
 We are not building “websites.”
 
 We are designing and deploying scalable digital products.
 
 ### Startup Systems Focus On:
 
 - **Correct architecture from day one**
 - **Scalable backend systems**
 - **Secure infrastructure**
 - **AI-ready integration**
 - **Long-term growth foundations**
 
 ---
 
 ### Core Startup Service Offerings
 
 We focus on two primary startup pillars:
 
 1. **MVP Development**
 2. **Full SaaS Platform Architecture**
 
 *Optional Expansion:*
 **AI Product Integration**`,
        duration: "5 mins",
      },
      {
        title: "Module 2: MVP Development",
        slug: "mvp-development",
        content: `## 1️⃣ MVP Development
 
 ### What It Is
 
 MVP (Minimum Viable Product) Development is building the first working version of a startup’s product with scalable architecture.
 
 This is **not** a prototype mockup.
 
 It is a **production-ready system** with real backend logic.
 
 ### What We Deliver
 
 - Backend architecture design
 - API development
 - Authentication system
 - Database structure
 - Core feature implementation
 - Cloud deployment
 - Basic DevOps setup
 
 ### Who It’s For
 
 - Early-stage founders
 - Funded startups
 - Technical and non-technical founders
 - SaaS builders
 - Product-based startups
 
 ### Problem It Solves
 
 - Poor early architecture
 - Technical uncertainty
 - Hiring random freelancers
 - Building without scalability in mind
 - Rebuilding the product later
 
 ### What It Is NOT
 
 - A landing page
 - A design-only prototype
 - A no-code quick hack
 - A basic website
 
 This is **real product engineering**.
 
 ### How to Position It
 
 **Do NOT say:**
 “We build apps.”
 
 **Say:**
 “We architect and build scalable digital products correctly from day one.”`,
        duration: "8 mins",
      },
      {
        title: "Module 3: Full SaaS Platform Development",
        slug: "full-saas-platform",
        content: `## 2️⃣ Full SaaS Platform Development
 
 ### What It Is
 
 Complete development of scalable SaaS infrastructure including backend, frontend, and subscription systems.
 
 This is **long-term product architecture**.
 
 ### What We Deliver
 
 - Multi-tenant architecture
 - Admin dashboard
 - User management system
 - Subscription billing integration
 - Payment processing integration
 - DevOps pipeline
 - Monitoring & deployment configuration
 
 ### Who It’s For
 
 - Growing startups
 - SaaS founders
 - Companies transitioning to subscription models
 - Funded startups preparing to scale
 
 ### Problem It Solves
 
 - Scaling limitations
 - Poor system structure
 - Technical debt
 - Unstable infrastructure
 
 ### What It Is NOT
 
 - A basic CRUD app
 - A one-feature build
 - A freelance quick project
 
 This is **infrastructure engineering**.
 
 ### Positioning Language
 
 “Build your product foundation for scale, not short-term launch.”`,
        duration: "9 mins",
      },
      {
        title: "Module 4: AI Product Integration",
        slug: "ai-product-integration",
        content: `## 3️⃣ AI Product Integration (Optional Expansion)
 
 ### What It Is
 
 Adding intelligent AI functionality to startup products.
 
 This may include:
 
 - AI assistants
 - Document querying systems
 - Smart automation
 - Predictive features
 
 ### What We Deliver
 
 - RAG system architecture
 - Secure AI integration
 - API-based model deployment
 - Scalable AI infrastructure
 
 ### Who It’s For
 
 - SaaS startups
 - Knowledge platforms
 - Fintech startups
 - AI-driven products
 
 ### Problem It Solves
 
 - Manual feature limitations
 - Lack of intelligent automation
 - Competitive disadvantage`,
        duration: "7 mins",
      },
      {
        title: "Module 5: Startup Client Strategy",
        slug: "startup-client-strategy",
        content: `## Ideal Startup Client Profile
 
 Partners should look for founders who:
 
 - Have validated ideas
 - Have early traction
 - Have funding or clear budget
 - Are serious about long-term product growth
 - Understand technology is an investment
 
 **Avoid:**
 
 - Idea-only founders with no validation
 - “Build my app for cheap” clients
 - Extremely unclear product vision
 
 ---
 
 ## Startup Selling Framework
 
 When speaking to startup founders, focus on:
 
 - **Scalability**
 - **Technical debt prevention**
 - **Investor confidence**
 - **Infrastructure quality**
 - **Long-term cost efficiency**
 
 **Never position this as cheap development.**
 **Position it as foundational architecture.**
 
 ---
 
 ### Summary
 
 Startup Systems are:
 
 - Product architecture
 - Backend engineering
 - SaaS infrastructure
 - AI integration systems
 
 We build **scalable digital products** — not temporary solutions.`,
        duration: "7 mins",
      },
    ],
  },

  // ── Course 4: Enterprise Systems ─────────────────────────────────────
  {
    title: "Enterprise Systems",
    slug: "enterprise-systems",
    description: "Lead strategic digital transformation. From modernizing legacy infrastructure to deploying secure Enterprise AI Knowledge Systems.",
    thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", // Replace with enterprise image
    level: "advanced",
    category: "technical",
    published: true,
    lessons: [
      {
        title: "Module 1: Foundations of Enterprise Systems",
        slug: "foundations-enterprise-systems",
        content: `## What Enterprise Systems Actually Means
 
 Enterprise Systems are structured, organization-level infrastructure modernization and AI deployment initiatives.
 
 This is **not** “building software.”
 
 This is **strategic digital transformation**.
 
 ### Enterprise Engagements Involve:
 
 - **Multi-department coordination**
 - **Security architecture**
 - **Infrastructure modernization**
 - **Process redesign**
 - **AI implementation at scale**
 
 These projects are complex, high-value, and long-term.
 
 ---
 
 ### Core Enterprise Service Offerings
 
 We focus on three primary enterprise pillars:
 
 1. **Digital Transformation Architecture**
 2. **Enterprise AI Knowledge Systems**
 3. **Secure Cloud & Infrastructure Modernization**`,
        duration: "6 mins",
      },
      {
        title: "Module 2: Digital Transformation Architecture",
        slug: "digital-transformation-architecture",
        content: `## 1️⃣ Digital Transformation Architecture
 
 ### What It Is
 
 A structured modernization plan and execution process that upgrades outdated internal systems, workflows, and infrastructure.
 
 This includes redesigning how departments operate digitally.
 
 ### What We Deliver
 
 - Full system audit
 - Process mapping & redesign
 - Internal tool architecture
 - Workflow automation strategy
 - Infrastructure upgrade roadmap
 - Implementation oversight
 
 ### Who It’s For
 
 - Large organizations
 - Multi-department companies
 - Corporations with legacy systems
 - Logistics firms
 - Financial institutions
 - Growing mid-market enterprises
 
 ### Problem It Solves
 
 - Outdated systems
 - Manual inter-department workflows
 - Data silos
 - Operational inefficiency
 - Scalability constraints
 
 ### What It Is NOT
 
 - Installing a new SaaS subscription
 - Replacing one tool
 - A short consulting engagement
 
 This is **structured transformation**.
 
 ### How to Position It
 
 **Do NOT say:**
 “We modernize your software.”
 
 **Say:**
 “We help organizations modernize their internal infrastructure for efficiency, scalability, and long-term competitiveness.”`,
        duration: "10 mins",
      },
      {
        title: "Module 3: Enterprise AI Knowledge Systems",
        slug: "enterprise-ai-knowledge-systems",
        content: `## 2️⃣ Enterprise AI Knowledge Systems
 
 ### What It Is
 
 A secure internal AI system that allows employees to query company knowledge, documents, and structured data intelligently.
 
 Often implemented using secure **Retrieval-Augmented Generation (RAG)** architecture.
 
 ### What We Deliver
 
 - Secure AI architecture design
 - Document ingestion pipelines
 - Access control implementation
 - Role-based permissions
 - Encrypted deployment
 - Internal AI assistant interface
 
 ### Who It’s For
 
 - Legal firms
 - Financial institutions
 - Corporate knowledge-heavy environments
 - Enterprises with large documentation bases
 - Compliance-sensitive organizations
 
 ### Problem It Solves
 
 - Knowledge silos
 - Slow document search
 - Inconsistent internal information access
 - Decision inefficiency
 
 ### What It Is NOT
 
 - A public chatbot
 - A ChatGPT wrapper
 - A marketing gimmick
 
 It is **secure enterprise AI infrastructure**.
 
 ### Positioning Language
 
 “Deploy secure internal AI that transforms how your organization accesses and uses knowledge.”`,
        duration: "9 mins",
      },
      {
        title: "Module 4: Secure Cloud & Infrastructure Modernization",
        slug: "secure-cloud-infrastructure",
        content: `## 3️⃣ Secure Cloud & Infrastructure Modernization
 
 ### What It Is
 
 A structured upgrade of cloud architecture, DevOps pipelines, and system security practices.
 
 This ensures reliability, scalability, and compliance.
 
 ### What We Deliver
 
 - Cloud architecture redesign
 - DevOps pipeline implementation
 - Infrastructure as Code setup
 - Monitoring & logging systems
 - Disaster recovery planning
 - Access control and IAM structuring
 
 ### Who It’s For
 
 - Enterprises scaling rapidly
 - Companies with unstable infrastructure
 - Organizations handling sensitive data
 - Mid-to-large tech teams
 
 ### Problem It Solves
 
 - Downtime risk
 - Security vulnerabilities
 - Poor deployment practices
 - Scaling bottlenecks
 
 ### What It Is NOT
 
 - Hosting setup
 - A basic cloud migration
 - A temporary server fix
 
 This is **enterprise infrastructure engineering**.`,
        duration: "9 mins",
      },
      {
        title: "Module 5: Enterprise Strategy & Sales",
        slug: "enterprise-strategy-sales",
        content: `## Ideal Enterprise Client Profile
 
 Partners should look for organizations that:
 
 - Have multiple departments
 - Have structured leadership
 - Operate with significant revenue
 - Experience operational inefficiencies
 - Have internal technical teams or IT leadership
 - Have allocated budgets for modernization
 
 **Avoid:**
 
 - Very small companies
 - Clients looking for quick fixes
 - Budget-restricted businesses
 
 ---
 
 ## How to Speak to Enterprise Decision-Makers
 
 When engaging enterprise leaders, focus on:
 
 - **Efficiency**
 - **Security**
 - **Risk mitigation**
 - **Competitive advantage**
 - **Long-term infrastructure**
 - **Organizational performance**
 
 **Avoid heavy technical jargon.**
 **Speak in business impact language.**
 
 ---
 
 ## Enterprise Selling Framework
 
 1.  **Identify operational bottlenecks**
 2.  **Understand system maturity**
 3.  **Position modernization as strategic advantage**
 4.  **Register deal inside dashboard**
 5.  **Coordinate structured discovery**
 
 Enterprise deals require patience and credibility.
 
 ---
 
 ### Summary
 
 Enterprise Systems are:
 
 - Organizational modernization
 - Secure AI infrastructure
 - Department automation
 - Cloud architecture redesign
 
 We deliver **structured transformation** — not short-term solutions.`,
        duration: "8 mins",
      },
    ],
  },

  // ── Course 5: Individual Systems ─────────────────────────────────────
  {
    title: "Individual Systems",
    slug: "individual-systems",
    description: "Build high-performance digital infrastructure for professionals and creators. From custom portfolios to e-commerce engines.",
    thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80", // Replace with individual image
    level: "intermediate",
    category: "product",
    published: true,
    lessons: [
      {
        title: "Module 1: Foundations of Individual Systems",
        slug: "foundations-individual-systems",
        content: `## What Individual Systems Actually Means
 
 Individual Systems are structured, high-performance digital platforms built for professionals, creators, and small operators who need a serious online presence.
 
 This is **not** cheap web design.
 
 This is building **scalable digital infrastructure** for individuals who want to operate professionally online.
 
 We focus on:
 
 - **Performance**
 - **Structure**
 - **Scalability**
 - **Brand credibility**
 - **Revenue enablement**
 
 ---
 
 ### Core Individual Service Offerings
 
 We focus on three primary pillars:
 
 1. **Custom Website Development**
 2. **Personal Brand & Portfolio Platforms**
 3. **E-commerce & Booking Systems**`,
        duration: "5 mins",
      },
      {
        title: "Module 2: Custom Website Development",
        slug: "custom-website-development",
        content: `## 1️⃣ Custom Website Development
 
 ### What It Is
 
 A fully custom, high-performance website built with scalable architecture and optimized structure.
 
 This is **not** a template install.
 
 It is **engineered digital presence**.
 
 ### What We Deliver
 
 - Custom front-end build
 - Responsive layout (mobile optimized)
 - SEO-ready structure
 - Performance optimization
 - Hosting setup
 - Basic analytics integration
 
 ### Who It’s For
 
 - Professionals
 - Consultants
 - Creators
 - Small business owners
 - Personal brands
 - Service providers
 
 ### Problem It Solves
 
 - Poor online presence
 - Outdated websites
 - Slow load times
 - Unstructured branding
 - Lack of credibility
 
 ### What It Is NOT
 
 - A Fiverr gig
 - A $200 template website
 - A one-day landing page
 - A drag-and-drop quick build
 
 This is **structured digital infrastructure**.
 
 ### How to Position It
 
 **Do NOT say:**
 “We build websites.”
 
 **Say:**
 “We design structured, high-performance digital platforms that position you professionally online.”`,
        duration: "8 mins",
      },
      {
        title: "Module 3: Personal Brand & Portfolio Platforms",
        slug: "personal-brand-portfolio",
        content: `## 2️⃣ Personal Brand & Portfolio Platforms
 
 ### What It Is
 
 A structured online presence system designed to showcase expertise, projects, and credibility.
 
 ### What We Deliver
 
 - Professional portfolio layout
 - Case study structure
 - Content-ready architecture
 - Blog or insight integration
 - Lead capture integration
 
 ### Who It’s For
 
 - Developers
 - Designers
 - Consultants
 - Creators
 - Coaches
 - Freelancers
 
 ### Problem It Solves
 
 - Weak online positioning
 - Poor self-presentation
 - No structured portfolio
 - Inconsistent brand presence
 
 ### What It Is NOT
 
 - A simple resume page
 - A static about page
 - A generic theme template
 
 It is a **credibility platform**.`,
        duration: "7 mins",
      },
      {
        title: "Module 4: E-commerce & Booking Systems",
        slug: "ecommerce-booking-systems",
        content: `## 3️⃣ E-commerce & Booking Systems
 
 ### What It Is
 
 A structured online system that enables individuals to sell products or services directly through their website.
 
 ### What We Deliver
 
 - Online store setup
 - Payment integration
 - Checkout optimization
 - Booking system integration
 - Email automation setup
 - Order or appointment management system
 
 ### Who It’s For
 
 - Coaches
 - Consultants
 - Creators selling digital products
 - Small product-based businesses
 
 ### Problem It Solves
 
 - Manual payment handling
 - No online selling capability
 - Disorganized appointment scheduling
 - Poor checkout experience
 
 ### What It Is NOT
 
 - A simple plugin install
 - A low-effort Shopify theme
 - A basic PayPal button
 
 It is **structured revenue infrastructure**.`,
        duration: "9 mins",
      },
      {
        title: "Module 5: Strategies for Individual Growth",
        slug: "strategies-individual-growth",
        content: `## Ideal Individual Client Profile
 
 Partners should look for individuals who:
 
 - Take their brand seriously
 - Have clear professional goals
 - Want long-term digital presence
 - Understand online credibility matters
 - Are willing to invest in quality
 
 **Avoid:**
 
 - Extremely low-budget clients
 - People looking for the cheapest option
 - Clients with unclear goals
 
 ---
 
 ## Selling Framework for Individual Systems
 
 When speaking to individuals, focus on:
 
 - **Professional positioning**
 - **Long-term credibility**
 - **Performance and speed**
 - **Structured brand presentation**
 - **Revenue enablement**
 
 **Never compete on price.**
 **Always compete on structure and quality.**.
 
 ---
 
 ### Summary
 
 Individual Systems are:
 
 - High-performance websites
 - Structured personal platforms
 - Online revenue systems
 - Professional digital infrastructure
 
 We build **structured platforms** that elevate individuals — not quick websites.`,
        duration: "7 mins",
      },
    ],
  },

  // ── Course 6: Sales Enablement ───────────────────────────────────────
  {
    title: "Sales Enablement",
    slug: "sales-enablement",
    description: "Sharpen your sales skills. Learn to identify qualified leads, handle objections, and structure deals like a pro.",
    thumbnailUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80", // Replace with sales image
    level: "intermediate",
    category: "sales",
    published: true,
    lessons: [
      {
        title: "Module 1 - Lesson 1: Identifying Qualified Leads",
        slug: "identifying-qualified-leads",
        content: `## Identifying Qualified Leads

Not every prospect is a good lead. Time is your most valuable asset. Spend it on **Qualified Leads**.

### Ideal Client Characteristics

*   **Revenue-Generating Businesses**: Companies making money can afford to pay for solutions. Avoid "pre-revenue" ideas unless they have investment.
*   **Growth-Focused Leadership**: Look for owners who use words like "scale," "invest," "grow," and "modernize."
*   **Operational Bottlenecks**: Companies experiencing "growing pains" (can't keep up with orders, support is overwhelmed) are prime candidates for automation.
*   **Budget Capacity**: They don't need millions, but they must have a budget for professional services.

### Red Flags to Avoid

*   **Extremely Early-Stage**: "I have an idea for the next Facebook but no money."
*   **"Just Curious" Inquiries**: People who want "free advice" or "just a quote" with no intent to buy.
*   **Micromanagers**: Clients who want to control every pixel usually drain profitability.`,
        duration: "6 mins",
      },
      {
        title: "Module 2 - Lesson 1: Discovery Questions",
        slug: "discovery-questions",
        content: `## Discovery Questions

The quality of your answers depends on the quality of your questions. Use this structured approach to uncover pain points.

### The Toolkit

*   **"What systems are currently manual?"**
    *   *Goal*: Identify automation opportunities.
*   **"How do you track internal performance?"**
    *   *Goal*: Identify a need for dashboards or reporting tools.
*   **"What slows down your team the most?"**
    *   *Goal*: Find the bottleneck we can solve with software.
*   **"Are you planning to scale or hire soon?"**
    *   *Goal*: Position our systems as a cheaper/better alternative to hiring more administrative staff.

Discovery is about *listening*. Ask the question, then stop talking. Let them tell you where it hurts.`,
        duration: "7 mins",
      },
      {
        title: "Module 3 - Lesson 1: Objection Handling",
        slug: "objection-handling-advanced",
        content: `## Objection Handling

Objections are not "No." They are "I need more information/trust."

### Common Objections

**1. "It's too expensive."**
*   *Response*: "Price is what you pay. Value is what you get. Compared to the cost of manual inefficiencies—lost leads, wasted hours, errors—what is the long-term cost of *not* fixing this? Our solutions typically pay for themselves within 6-12 months."

**2. "We can do this in-house."**
*   *Response*: "You absolutely could. But do you want your best people distracted by building internal tools, or focused on your core business? We let you focus on what you do best, while we deploy best-in-class infrastructure."

**3. "Now isn't the right time."**
*   *Response*: "I understand. When do you foresee having the bandwidth to address [Specific Pain Point]? Because that problem isn't going away—it's likely costing you money every day."`,
        duration: "8 mins",
      },
      {
        title: "Module 4 - Lesson 1: Structuring a Deal",
        slug: "structuring-deal",
        content: `## Structuring a Deal

Closing isn't magic. It's a sequence of logical steps.

### The 5-Step Process

1.  **Identify Need**: Confirm a clear pain point exists.
2.  **Confirm Budget Alignment**: "We typically work with budgets between $X and $Y. Does that sound aligned with your expectations?" (Do this early!)
3.  **Introduce Leo Systems**: "Based on what you've said, Leo Systems has a solution that fits perfectly..."
4.  **Register Deal in Dashboard**: Secure your commission rights immediately.
5.  **Coordinate Call**: "I'm going to introduce you to our technical director. When are you free for a 15-minute discovery chat?"

Don't overcomplicate it. Identify, Qualify, Register, Handoff.`,
        duration: "7 mins",
      },
    ],
  },
  
  // ── BONUS: Advanced Partner Strategy ─────────────────────────────────
  {
    title: "Advanced Partner Strategy",
    slug: "advanced-partner-strategy",
    description: "Bonus material for top-tier partners. Long-term relationship building and enterprise positioning.",
    thumbnailUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80", // Strategy/Leadership
    level: "advanced",
    category: "marketing",
    published: true,
    lessons: [
      {
        title: "Strategy: Long-Term Relationship Building",
        slug: "long-term-relationships",
        content: `## Long-Term Relationship Building

The biggest commissions come from repeat clients. The "Hunter" lands the deal; the "Farmer" grows the account. Be both.

*   **Check in quarterly**: "How is the system running? Any new challenges?"
*   **Be a resource, not just a salesperson**: Send them news articles relevant to their industry.
*   **Protect Deal Ownership**: By staying in touch, you ensure that when they need Phase 2, they call *you*, and you register the new deal.

### Enterprise Positioning

Move from "Vendor" to "Partner."
*   Vendors sell things.
*   Partners solve business problems.

Adopting a specialized niche (e.g., "Digital Transformation for Logistics Companies") can make you the go-to expert in that field, allowing you to command higher respect and higher commissions.`,
        duration: "5 mins",
      },
    ],
  },
];
