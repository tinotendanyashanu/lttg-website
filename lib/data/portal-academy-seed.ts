export const portalAcademySeed = [
  {
    title: 'Operations Readiness Bootcamp',
    slug: 'operations-readiness-bootcamp',
    summary: 'The mandatory onboarding track for employees entering the portal workspace.',
    description:
      'Build the baseline operating discipline required for internal delivery work: security, communication standards, case hygiene, and escalation flow.',
    difficultyLevel: 'Beginner',
    category: 'Operations',
    targetRoles: ['all'],
    isPublished: true,
    isRequired: true,
    estimatedDurationMinutes: 95,
    orderIndex: 1,
    heroIcon: 'rocket_launch',
    thumbnailUrl: '',
    quiz: {
      title: 'Final readiness check',
      passingScore: 80,
      attemptLimit: 3,
      questions: [
        {
          id: 'ops-final-1',
          question: 'When a client request is unclear, what is the best first step?',
          options: [
            'Start building immediately to save time',
            'Clarify scope and capture missing requirements before execution',
            'Wait for another team member to notice the issue',
            'Archive the request and reopen it later',
          ],
          correctAnswerIndex: 1,
          explanation: 'The platform expects disciplined intake before execution.',
        },
        {
          id: 'ops-final-2',
          question: 'Which behavior best protects delivery quality?',
          options: [
            'Skipping status updates when work feels on track',
            'Using the same process for every request regardless of risk',
            'Escalating blockers early and keeping records current',
            'Only updating systems after a project closes',
          ],
          correctAnswerIndex: 2,
        },
      ],
    },
    modules: [
      {
        title: 'Portal Foundations',
        slug: 'portal-foundations',
        description: 'Learn the operating model of the internal portal.',
        orderIndex: 1,
        unlockStrategy: 'sequential',
        estimatedDurationMinutes: 35,
        lessons: [
          {
            title: 'How work moves through the portal',
            slug: 'how-work-moves-through-the-portal',
            lessonType: 'text',
            summary: 'A high-level map of the internal delivery flow.',
            estimatedDuration: 12,
            orderIndex: 1,
            content: `## Workflow map

- New requests enter through structured intake, not ad hoc chat threads.
- Every active item needs a clear owner, current status, and next action.
- Escalations should happen before delivery risk turns into client-visible delay.
- Notes should be written for continuity, not memory.`
          },
          {
            title: 'Case hygiene and status discipline',
            slug: 'case-hygiene-and-status-discipline',
            lessonType: 'text',
            summary: 'How to keep operational records accurate and useful.',
            estimatedDuration: 11,
            orderIndex: 2,
            content: `## Case hygiene rules

- Status should reflect reality, not intention.
- Internal notes should explain decisions, blockers, and next steps.
- Handovers must leave enough context for another teammate to continue work cleanly.
- If evidence, files, or approvals are missing, the record is incomplete.`
          },
          {
            title: 'Communication standards for execution teams',
            slug: 'communication-standards-for-execution-teams',
            lessonType: 'text',
            summary: 'The expected standard for internal updates and escalation.',
            estimatedDuration: 12,
            orderIndex: 3,
            content: `## Communication standards

- Raise delivery risk early with concrete facts.
- Communicate in terms of impact, owner, and next step.
- Avoid vague status messages such as "working on it" without timeframe or blocker detail.
- Client-facing confidence starts with internal clarity.`
          },
        ],
      },
      {
        title: 'Security and Compliance Basics',
        slug: 'security-and-compliance-basics',
        description: 'Mandatory internal standards for secure work handling.',
        orderIndex: 2,
        unlockStrategy: 'quiz',
        estimatedDurationMinutes: 30,
        quiz: {
          title: 'Security checkpoint',
          passingScore: 80,
          attemptLimit: 2,
          questions: [
            {
              id: 'ops-module-2-1',
              question: 'Which approach is acceptable for handling sensitive client data?',
              options: [
                'Store it anywhere convenient if the work is urgent',
                'Use approved systems and keep access limited to necessary roles',
                'Share it in public chat if the team is moving fast',
                'Keep a private local copy indefinitely',
              ],
              correctAnswerIndex: 1,
            },
          ],
        },
        lessons: [
          {
            title: 'Data handling expectations',
            slug: 'data-handling-expectations',
            lessonType: 'text',
            summary: 'The minimum operating standard for client and company information.',
            estimatedDuration: 10,
            orderIndex: 1,
            content: `## Data handling

- Use approved systems for client information.
- Keep access limited to the people who need it.
- Remove ambiguity around ownership of sensitive records.
- Escalate security concerns immediately.`
          },
          {
            title: 'Incident reporting and escalation',
            slug: 'incident-reporting-and-escalation',
            lessonType: 'text',
            summary: 'How to respond when risk appears.',
            estimatedDuration: 10,
            orderIndex: 2,
            content: `## Incident response

- Report the issue as soon as you see it.
- Preserve evidence and avoid improvising a cover-up fix.
- Document the timeline and who is involved.
- Follow the escalation path, not informal side channels.`
          },
        ],
      },
      {
        title: 'Execution Excellence',
        slug: 'execution-excellence',
        description: 'Habits that improve quality, predictability, and delivery confidence.',
        orderIndex: 3,
        unlockStrategy: 'sequential',
        estimatedDurationMinutes: 30,
        lessons: [
          {
            title: 'Planning before implementation',
            slug: 'planning-before-implementation',
            lessonType: 'text',
            summary: 'Why clear planning reduces rework.',
            estimatedDuration: 10,
            orderIndex: 1,
            content: `## Plan before build

- Confirm scope, dependencies, and success criteria.
- Decide what must be done now versus later.
- Record assumptions so they can be reviewed openly.
- Good execution starts with fewer hidden decisions.`
          },
          {
            title: 'Closing loops and documenting outcomes',
            slug: 'closing-loops-and-documenting-outcomes',
            lessonType: 'text',
            summary: 'How strong teams reduce follow-up chaos.',
            estimatedDuration: 10,
            orderIndex: 2,
            content: `## Close the loop

- Mark work complete only when the system and stakeholders reflect reality.
- Capture what changed, why it changed, and what remains open.
- Make handoff quality a deliberate output, not an afterthought.`
          },
        ],
      },
    ],
  },
  {
    title: 'Client Delivery Fundamentals',
    slug: 'client-delivery-fundamentals',
    summary: 'A structured path for employees working on active client-facing delivery.',
    description:
      'Learn the habits behind reliable delivery execution: expectation setting, risk management, and evidence-based progress communication.',
    difficultyLevel: 'Intermediate',
    category: 'Customer Success',
    targetRoles: ['employee', 'admin'],
    isPublished: true,
    isRequired: false,
    estimatedDurationMinutes: 70,
    orderIndex: 2,
    heroIcon: 'support_agent',
    thumbnailUrl: '',
    modules: [
      {
        title: 'Expectation Management',
        slug: 'expectation-management',
        description: 'How to maintain trust without overpromising.',
        orderIndex: 1,
        unlockStrategy: 'sequential',
        estimatedDurationMinutes: 25,
        lessons: [
          {
            title: 'Setting the right delivery expectation',
            slug: 'setting-the-right-delivery-expectation',
            lessonType: 'text',
            summary: 'Underpromise less, communicate better.',
            estimatedDuration: 13,
            orderIndex: 1,
            content: `## Expectation management

- Confidence comes from clarity, not speed alone.
- Commit to what can actually be delivered with current constraints.
- Explain tradeoffs when scope, quality, and time are in tension.`
          },
          {
            title: 'Handling timeline pressure professionally',
            slug: 'handling-timeline-pressure-professionally',
            lessonType: 'text',
            summary: 'Respond to pressure with structure, not guesswork.',
            estimatedDuration: 12,
            orderIndex: 2,
            content: `## Timeline pressure

- Break pressure into choices, not panic.
- Identify the critical path and what can move.
- Escalate risk with a concrete recommendation.`
          },
        ],
      },
      {
        title: 'Escalation and Recovery',
        slug: 'escalation-and-recovery',
        description: 'What strong operators do when delivery slips.',
        orderIndex: 2,
        unlockStrategy: 'quiz',
        estimatedDurationMinutes: 25,
        quiz: {
          title: 'Recovery checkpoint',
          passingScore: 80,
          attemptLimit: 3,
          questions: [
            {
              id: 'delivery-2-1',
              question: 'What should happen first when a delivery commitment is at risk?',
              options: [
                'Stay silent until you know everything',
                'Escalate the risk with context and a recommended next step',
                'Change the due date without explanation',
                'Wait for the client to ask for an update',
              ],
              correctAnswerIndex: 1,
            },
          ],
        },
        lessons: [
          {
            title: 'Escalate before the deadline is lost',
            slug: 'escalate-before-the-deadline-is-lost',
            lessonType: 'text',
            summary: 'Why late escalation is usually worse than bad news.',
            estimatedDuration: 13,
            orderIndex: 1,
            content: `## Escalation timing

- Early escalation expands options.
- Hidden delay destroys trust faster than hard truth.
- Recovery plans need owners and dates.`
          },
          {
            title: 'Recovery plans clients can trust',
            slug: 'recovery-plans-clients-can-trust',
            lessonType: 'text',
            summary: 'What a credible recovery plan looks like.',
            estimatedDuration: 12,
            orderIndex: 2,
            content: `## Recovery plans

- State what changed.
- Explain the impact clearly.
- Offer a realistic path forward with milestones.
- Keep the next checkpoint explicit.`
          },
        ],
      },
    ],
  },
  {
    title: 'Leadership Coaching for Team Leads',
    slug: 'leadership-coaching-for-team-leads',
    summary: 'For team leads and managers responsible for training visibility and follow-through.',
    description:
      'Use Academy data to coach performance, drive required-training completion, and intervene before delivery quality drops.',
    difficultyLevel: 'Advanced',
    category: 'Leadership',
    targetRoles: ['manager', 'admin'],
    isPublished: true,
    isRequired: false,
    estimatedDurationMinutes: 55,
    orderIndex: 3,
    heroIcon: 'insights',
    thumbnailUrl: '',
    modules: [
      {
        title: 'Reading Training Signals',
        slug: 'reading-training-signals',
        description: 'Interpret course completion and quiz performance like an operator.',
        orderIndex: 1,
        unlockStrategy: 'sequential',
        estimatedDurationMinutes: 25,
        lessons: [
          {
            title: 'What incomplete training usually signals',
            slug: 'what-incomplete-training-usually-signals',
            lessonType: 'text',
            summary: 'Completion lag often points to execution friction, not laziness alone.',
            estimatedDuration: 12,
            orderIndex: 1,
            content: `## Reading completion lag

- Missed training often points to unclear priorities, poor follow-through, or overloaded workflows.
- Look for patterns across the team before treating issues as isolated.
- Coaching should connect training behavior to delivery outcomes.`
          },
          {
            title: 'Using scores to guide coaching',
            slug: 'using-scores-to-guide-coaching',
            lessonType: 'text',
            summary: 'Use assessment data as a coaching signal, not a punishment tool.',
            estimatedDuration: 13,
            orderIndex: 2,
            content: `## Coaching with data

- Low scores show where knowledge is weak or rushed.
- Repeated failed attempts can indicate poor comprehension or poor training design.
- Coaching works best when paired with a concrete next step.`
          },
        ],
      },
    ],
  },
];
