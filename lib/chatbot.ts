import { services } from '@/data/services';

export interface BotResponse {
  content: string;
  confidence: number; // 0-1
  shouldEscalate: boolean;
  actions?: { label: string; type: 'booking' | 'service' | 'escalate'; href?: string }[];
}

type Intent =
  | 'greeting'
  | 'farewell'
  | 'pricing'
  | 'booking'
  | 'services_general'
  | 'service_ai'
  | 'service_dev'
  | 'service_security'
  | 'service_marketing'
  | 'support'
  | 'escalation_request'
  | 'knowledge'
  | 'unknown';

const INTENTS: { intent: Intent; patterns: RegExp[] }[] = [
  {
    intent: 'greeting',
    patterns: [/\b(hi|hello|hey|howdy|good\s*(morning|afternoon|evening)|sup|what'?s up)\b/i],
  },
  {
    intent: 'farewell',
    patterns: [/\b(bye|goodbye|see\s*you|later|thanks?\s*(you|so much)?|cheers|take\s*care)\b/i],
  },
  {
    intent: 'pricing',
    patterns: [/\b(price|pricing|cost|quote|how\s*much|rates?|fee|budget|afford|expensive|cheap|package)\b/i],
  },
  {
    intent: 'booking',
    patterns: [/\b(book|schedule|meeting|call|consultation|demo|appointment|talk|speak|discuss|free\s*session|strategy)\b/i],
  },
  {
    intent: 'service_ai',
    patterns: [/\b(ai|artificial intelligence|machine learning|ml|chatbot|automation|llm|gpt|claude|predict|nlp|computer vision|intelligent)\b/i],
  },
  {
    intent: 'service_dev',
    patterns: [/\b(website|web\s*(app|application|development|design)|app|mobile|frontend|backend|api|build|develop|software|platform|saas)\b/i],
  },
  {
    intent: 'service_security',
    patterns: [/\b(security|cyber|pentest|penetration|audit|vulnerability|hack|protect|compliance|gdpr|iso|risk)\b/i],
  },
  {
    intent: 'service_marketing',
    patterns: [/\b(marketing|seo|social media|brand|content|ads|campaign|growth|lead generation|digital marketing)\b/i],
  },
  {
    intent: 'support',
    patterns: [/\b(help|support|problem|issue|stuck|error|broken|bug|not working|trouble|question)\b/i],
  },
  {
    intent: 'escalation_request',
    patterns: [/\b(human|person|agent|real person|speak to someone|talk to someone|connect me|escalate|team member|representative)\b/i],
  },
  {
    intent: 'services_general',
    patterns: [/\b(services?|what do you (do|offer)|what can you|offerings?|solutions?|capabilities)\b/i],
  },
];

function detectIntent(message: string): Intent {
  for (const { intent, patterns } of INTENTS) {
    for (const pattern of patterns) {
      if (pattern.test(message)) return intent;
    }
  }
  return 'unknown';
}

function getServiceByIntent(intent: Intent) {
  const map: Record<string, string> = {
    service_ai: 'ai-automation',
    service_dev: 'web-development',
    service_security: 'cybersecurity',
    service_marketing: 'digital-marketing',
  };
  const id = map[intent];
  return id ? services.find(s => s.id === id) : null;
}

export async function getBotResponse(
  message: string,
  messageCount: number
): Promise<BotResponse> {
  const intent = detectIntent(message);

  // Greeting
  if (intent === 'greeting') {
    return {
      content:
        "Hi there! I'm Leo, the LeoTheTechGuy AI assistant. I can help you learn about our services, get pricing info, or book a strategy session. What brings you here today?",
      confidence: 1,
      shouldEscalate: false,
      actions: [
        { label: 'View Services', type: 'service', href: '/services' },
        { label: 'Book a Free Call', type: 'booking', href: 'https://cal.com/leothetechguy' },
      ],
    };
  }

  // Farewell
  if (intent === 'farewell') {
    return {
      content:
        "Thanks for stopping by! If you ever need help with AI, web development, security, or any tech project — we're here. Have a great day!",
      confidence: 1,
      shouldEscalate: false,
    };
  }

  // Escalation request
  if (intent === 'escalation_request') {
    return {
      content:
        "Absolutely — I'll connect you with a real team member right away. Just share your name and email and someone will get back to you, usually within a few hours.",
      confidence: 1,
      shouldEscalate: true,
    };
  }

  // Pricing
  if (intent === 'pricing') {
    return {
      content:
        "Happy to help you scope this out. Pricing depends on your project's requirements and the region it's for, so before I point you in the right direction — which country is your business based in?",
      confidence: 0.9,
      shouldEscalate: false,
      actions: [
        { label: 'Talk to Our Team', type: 'escalate' },
        { label: 'Book a Free Call', type: 'booking', href: 'https://cal.com/leothetechguy' },
      ],
    };
  }

  // Booking
  if (intent === 'booking') {
    return {
      content:
        "I'd love to set up a call! You can book a free 30-minute strategy session directly on our calendar — pick a slot that works for you and we'll talk through your project in detail.",
      confidence: 1,
      shouldEscalate: false,
      actions: [
        { label: 'Book Free Strategy Session', type: 'booking', href: 'https://cal.com/leothetechguy' },
      ],
    };
  }

  // General services
  if (intent === 'services_general') {
    const list = services.map(s => `• **${s.title}** — ${s.subtitle}`).join('\n');
    return {
      content: `Here's what we do:\n\n${list}\n\nWhich area interests you most? I can go deeper on any of them.`,
      confidence: 1,
      shouldEscalate: false,
      actions: [{ label: 'Explore All Services', type: 'service', href: '/services' }],
    };
  }

  // Specific service intent
  const specificService = getServiceByIntent(intent);
  if (specificService) {
    const faqs = specificService.faqs.slice(0, 2).map(f => `**Q: ${f.question}**\nA: ${f.answer}`).join('\n\n');
    return {
      content: `We offer **${specificService.title}** — ${specificService.description}\n\n**What's included:**\n${specificService.offerings.slice(0, 4).map(o => `• ${o}`).join('\n')}\n\n**Outcome:** ${specificService.outcome}${faqs ? `\n\n${faqs}` : ''}`,
      confidence: 0.95,
      shouldEscalate: false,
      actions: [
        { label: `Learn More`, type: 'service', href: `/services/${specificService.id}` },
        { label: 'Book a Call', type: 'booking', href: 'https://cal.com/leothetechguy' },
      ],
    };
  }

  // Knowledge base search — try MongoDB
  try {
    const { searchKnowledge } = await import('./chatbot-kb');
    const result = await searchKnowledge(message);
    if (result) return result;
  } catch {
    // KB search unavailable, fall through
  }

  // Support — try to help but offer escalation
  if (intent === 'support') {
    return {
      content:
        "I want to make sure you get the right help. Could you describe what you're running into in a bit more detail? If it's complex, I can connect you with a team member who'll be able to sort it out.",
      confidence: 0.7,
      shouldEscalate: false,
      actions: [{ label: 'Talk to Our Team', type: 'escalate' }],
    };
  }

  // Unknown / low confidence — after 2+ exchanges, suggest escalation
  if (messageCount >= 2) {
    return {
      content:
        "Hmm, I want to make sure I give you the right answer on that. Let me connect you with one of our team members who can help you properly — they're usually available within a few hours.",
      confidence: 0.3,
      shouldEscalate: true,
    };
  }

  return {
    content:
      "That's a great question! I can help with info about our services, pricing, booking a call, or answer questions about AI, web development, security, and digital marketing. What would you like to know?",
    confidence: 0.5,
    shouldEscalate: false,
    actions: [
      { label: 'View Services', type: 'service', href: '/services' },
      { label: 'Book a Free Call', type: 'booking', href: 'https://cal.com/leothetechguy' },
      { label: 'Talk to a Human', type: 'escalate' },
    ],
  };
}
