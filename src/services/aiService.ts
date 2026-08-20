import type { Complaint, AIAnalysis, Category, Priority, ImageAnalysis } from '../types';
import { getDepartmentByCategory } from '../data/mockDepartments';
import { delay } from '../utils/helpers';

// ============================================================
// Civic AI Service - Analysis & Civic Assistant Logic
// ============================================================

// Keywords -> Category mapping
const categoryKeywords: Record<Category, string[]> = {
  Roads: ['pothole', 'road', 'highway', 'street', 'tarmac', 'pavement', 'lane', 'traffic', 'marking', 'footpath', 'crater', 'asphalt'],
  Garbage: ['garbage', 'trash', 'waste', 'litter', 'rubbish', 'dump', 'bin', 'stench', 'smell', 'filth', 'sanitation', 'debris'],
  Drainage: ['drain', 'drainage', 'flood', 'water logging', 'waterlogging', 'sewage', 'sewer', 'blockage', 'clog', 'overflow', 'manhole'],
  Water: ['water', 'pipeline', 'pipe', 'supply', 'tap', 'leak', 'burst', 'contaminated', 'murky', 'dirty water', 'pressure', 'tanker'],
  Streetlights: ['streetlight', 'lamp', 'dark', 'bulb', 'illumination', 'flickering', 'street light', 'night lamp'],
  Electricity: ['electricity', 'wire', 'pole', 'power', 'transformer', 'shock', 'spark', 'blackout', 'short circuit', 'voltage'],
  Infrastructure: ['bridge', 'footpath', 'sidewalk', 'bench', 'park', 'building', 'wall', 'structure', 'crack', 'collapse', 'broken'],
  Other: [],
};

// Severity keywords for priority detection
const highPriorityKeywords = [
  'accident', 'dangerous', 'emergency', 'urgent', 'collapsed', 'burst', 'gushing', 'flooding', 'injured',
  'severe', 'critical', 'huge', 'major', 'serious', 'unsafe', 'blocked road', 'no supply', 'shock', 'live wire',
];
const mediumPriorityKeywords = [
  'overflowing', 'accumulating', 'days', 'week', 'multiple', 'continuous', 'ongoing', 'residents', 'colony', 'dark',
];

/** Detect category from complaint text */
export function detectCategory(text: string): Category {
  const lower = text.toLowerCase();
  let bestCategory: Category = 'Other';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const score = keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category as Category;
    }
  }

  // Fallback defaults based on common terms
  if (bestScore === 0) {
    if (lower.includes('light') || lower.includes('pole')) return 'Streetlights';
    if (lower.includes('water') || lower.includes('leak')) return 'Water';
    if (lower.includes('road') || lower.includes('hole')) return 'Roads';
    if (lower.includes('garbage') || lower.includes('clean')) return 'Garbage';
    if (lower.includes('drain') || lower.includes('gutter')) return 'Drainage';
  }

  return bestCategory;
}

/** Detect priority from complaint text */
export function detectPriority(text: string): Priority {
  const lower = text.toLowerCase();

  if (highPriorityKeywords.some((kw) => lower.includes(kw))) return 'HIGH';
  if (mediumPriorityKeywords.some((kw) => lower.includes(kw))) return 'MEDIUM';
  if (lower.includes('spark') || lower.includes('wire') || lower.includes('burst')) return 'CRITICAL';

  return 'MEDIUM';
}

function generateTitle(text: string, category: Category): string {
  const lower = text.toLowerCase();

  const titleMap: Partial<Record<Category, string[]>> = {
    Roads: ['Large pothole causing unsafe conditions', 'Road damage requiring urgent repair', 'Road surface deterioration reported'],
    Garbage: ['Garbage overflow requiring sanitation', 'Waste accumulation in public area', 'Illegal dumping reported'],
    Drainage: ['Drainage blockage causing flooding', 'Clogged drain creating waterlogging', 'Storm drain overflow reported'],
    Water: ['Water pipeline break requiring repair', 'Water supply disruption reported', 'Contaminated water supply issue'],
    Streetlights: ['Non-functional streetlights reported', 'Street lighting failure in public area', 'Dark street lighting issue'],
    Electricity: ['Electrical line issue reported', 'Damaged power line or pole', 'Electricity hazard reported'],
    Infrastructure: ['Public infrastructure damage reported', 'Civic structure requiring repair', 'Public facility damage'],
  };

  const options = titleMap[category] || ['Civic issue reported'];

  if (lower.includes('pothole')) return 'Large pothole causing unsafe road conditions';
  if (lower.includes('burst') || lower.includes('gushing')) return 'Water pipeline burst causing supply disruption';
  if (lower.includes('flood')) return 'Drainage blockage causing severe flooding';
  if (lower.includes('dark') || lower.includes('light')) return 'Streetlight failure creating safety hazard';
  if (lower.includes('garbage') || lower.includes('waste')) return 'Garbage accumulation causing public health concern';

  return options[Math.floor(Math.random() * options.length)];
}

function generateReason(text: string, category: Category, priority: string): string {
  const reasonMap: Record<string, string> = {
    Roads_HIGH: 'Large road damage near traffic area creates significant safety risk for vehicles and pedestrians.',
    Roads_MEDIUM: 'Road surface damage in moderately trafficked area requires timely repair to prevent worsening.',
    Roads_LOW: 'Minor road issue that needs attention to prevent escalation.',
    Garbage_HIGH: 'Waste accumulation near high-footfall area poses immediate public health and hygiene risk.',
    Garbage_MEDIUM: 'Accumulated waste requires sanitation intervention to prevent health hazards.',
    Garbage_LOW: 'Garbage management issue that requires standard sanitation response.',
    Drainage_HIGH: 'Severe drainage blockage causing active flooding poses risk to property and public safety.',
    Drainage_MEDIUM: 'Drainage issue causing waterlogging requires prompt intervention.',
    Drainage_LOW: 'Drainage maintenance issue that should be addressed to prevent future flooding.',
    Water_HIGH: 'Active water pipeline failure causing supply disruption requires emergency response.',
    Water_MEDIUM: 'Water supply issue affecting residents requires prompt investigation and repair.',
    Water_LOW: 'Water supply irregularity that needs investigation.',
    Streetlights_HIGH: 'Complete streetlight failure creating dangerous dark zones in public areas.',
    Streetlights_MEDIUM: 'Street lighting issues affecting public safety in residential or commercial areas.',
    Streetlights_LOW: 'Minor street lighting issue requiring routine maintenance.',
    Electricity_HIGH: 'Electrical hazard reported requiring immediate power grid inspection and repair.',
    Infrastructure_HIGH: 'Critical infrastructure damage posing immediate danger to public safety.',
    Infrastructure_MEDIUM: 'Infrastructure damage that requires prompt repair to prevent worsening.',
    Infrastructure_LOW: 'Infrastructure maintenance required to maintain public facility standards.',
  };

  const key = `${category}_${priority}`;
  return reasonMap[key] || 'Civic issue identified requiring appropriate departmental action.';
}

function getEstimatedResponse(priority: string): string {
  switch (priority) {
    case 'CRITICAL': return '12-24 hours';
    case 'HIGH': return '24-48 hours';
    case 'MEDIUM': return '48-72 hours';
    default: return '72-96 hours';
  }
}

/**
 * Analyze a complaint text and return AI analysis.
 */
export async function analyzeComplaint(
  description: string,
  location: string,
  _imageUrl?: string
): Promise<AIAnalysis> {
  await delay(2500);

  const category = detectCategory(description);
  const priority = detectPriority(description);
  const department = getDepartmentByCategory(category);
  const title = generateTitle(description, category);
  const reason = generateReason(description, category, priority);
  const confidence = 85 + Math.floor(Math.random() * 12); // 85-97%

  return {
    title,
    category,
    priority,
    department: department.name,
    location: location || 'Location not specified',
    confidence,
    reason,
    assignedTeam: department.teams[0],
    estimatedResponse: getEstimatedResponse(priority),
  };
}

/**
 * Image analysis simulation
 */
export async function analyzeImage(_imageFile: File): Promise<ImageAnalysis> {
  await delay(1500);

  const analyses: ImageAnalysis[] = [
    {
      detectedObjects: ['Road surface damage', 'Pothole', 'Vehicle traffic', 'Asphalt crack'],
      severity: 'High',
      suggestedCategory: 'Roads',
      confidence: 92,
    },
    {
      detectedObjects: ['Garbage pile', 'Overflowing bin', 'Waste material'],
      severity: 'High',
      suggestedCategory: 'Garbage',
      confidence: 88,
    },
    {
      detectedObjects: ['Water flow', 'Flooded road', 'Blocked drain'],
      severity: 'Medium',
      suggestedCategory: 'Drainage',
      confidence: 85,
    },
    {
      detectedObjects: ['Broken lamp post', 'Non-functional light', 'Dark area'],
      severity: 'Medium',
      suggestedCategory: 'Streetlights',
      confidence: 81,
    },
    {
      detectedObjects: ['Water pipe', 'Leaking joint', 'Water seepage'],
      severity: 'High',
      suggestedCategory: 'Water',
      confidence: 90,
    },
  ];

  return analyses[Math.floor(Math.random() * analyses.length)];
}

// ============================================================
// AI Civic Chatbot Engine
// ============================================================

export interface ChatBotResponse {
  message: string;
  suggestComplaint?: boolean;
  suggestTracking?: boolean;
  suggestedCategory?: string;
  suggestedPriority?: string;
  ticketIdDetected?: string;
  quickOptions?: Array<{ label: string; text: string }>;
}

/**
 * Generate intelligent AI responses for CivicResolve AI Assistant 🤖
 */
export async function getChatResponse(
  userMessage: string,
  _conversationHistory: Array<{ role: string; content: string }>
): Promise<ChatBotResponse> {
  await delay(400);

  const lower = userMessage.toLowerCase().trim();

  // 1. Check if user typed a Ticket ID (e.g. CR-2026-000001 or CR-2026-004821 or 6-digit id)
  const ticketIdMatch = userMessage.match(/CR-\d{4}-\d{6}/i) || userMessage.match(/CR-\d{4}-\d+/i);
  if (ticketIdMatch) {
    return {
      message: `🔍 Fetching live details from PostgreSQL for Ticket **${ticketIdMatch[0].toUpperCase()}**...`,
      ticketIdDetected: ticketIdMatch[0].toUpperCase(),
    };
  }

  // 2. FAQ: "What can I report?"
  if (
    lower.includes('what can i report') ||
    lower.includes('types of complaint') ||
    lower.includes('categories') ||
    lower.includes('what issues')
  ) {
    return {
      message: `🏛️ **What You Can Report on CivicResolve AI:**\n\n` +
        `• 🛣️ **Roads & Footpaths:** Potholes, broken tarmac, uneven pavements, open manholes.\n` +
        `• 🗑️ **Garbage & Sanitation:** Overflowing dustbins, uncollected trash, illegal dumping.\n` +
        `• 🌊 **Drainage & Sewage:** Blocked storm drains, waterlogging, sewage overflow.\n` +
        `• 💧 **Water Supply:** Pipe bursts, contaminated supply, low pressure, leaks.\n` +
        `• 💡 **Streetlights & Power:** Dark zones, broken lamp posts, exposed wires.\n` +
        `• 🏢 **Public Infrastructure:** Damaged park benches, broken walls, bridges.\n\n` +
        `Describe any of these issues and I'll help you submit it right away!`,
      quickOptions: [
        { label: '📝 Report an Issue', text: 'I want to report an issue' },
        { label: '🔎 Track Complaint', text: 'How do I track my complaint?' },
      ],
    };
  }

  // 3. FAQ: "How do I report a pothole?" or "How to report"
  if (
    lower.includes('how do i report') ||
    lower.includes('how to report') ||
    lower.includes('report a pothole') ||
    lower.includes('submit complaint')
  ) {
    return {
      message: `📝 **How to Report a Civic Issue (3 Easy Steps):**\n\n` +
        `1️⃣ **Describe Issue:** Enter your name, phone, and describe the problem.\n` +
        `2️⃣ **AI Auto-Analysis:** Our AI automatically detects the category, priority, and routes it to the right department.\n` +
        `3️⃣ **Get Ticket ID:** You receive a unique Ticket ID (e.g. \`CR-2026-000001\`) to track live progress.\n\n` +
        `Would you like to start a complaint now?`,
      suggestComplaint: true,
      quickOptions: [
        { label: '📝 Report Now', text: 'I want to report an issue' },
      ],
    };
  }

  // 4. FAQ: "How can I track my complaint?"
  if (
    lower.includes('how can i track') ||
    lower.includes('how to track') ||
    lower.includes('where to track') ||
    lower === 'track complaint' ||
    lower === '🔎 track complaint'
  ) {
    return {
      message: `🔎 **How to Track Your Complaint:**\n\n` +
        `1. **Type your Ticket ID right here in the chat** (e.g. \`CR-2026-000001\`) and I'll query PostgreSQL live for you!\n` +
        `2. Or visit the **Track Complaint** page directly to see the complete resolution timeline.\n\n` +
        `Do you have a Ticket ID handy? Type it below!`,
      suggestTracking: true,
      quickOptions: [
        { label: '🔎 Go to Tracking Page', text: 'Track Complaint' },
      ],
    };
  }

  // 5. FAQ: "What does Under Review mean?" or status meanings
  if (
    lower.includes('under review') ||
    lower.includes('status mean') ||
    lower.includes('what does status')
  ) {
    return {
      message: `📊 **Complaint Status Guide:**\n\n` +
        `• 🟡 **REGISTERED:** Complaint successfully recorded in the PostgreSQL database.\n` +
        `• 🔍 **UNDER REVIEW:** Authority has opened your ticket and is assessing the site.\n` +
        `• 👷 **ASSIGNED:** Field inspection officer and maintenance team dispatched.\n` +
        `• 🛠️ **IN PROGRESS:** Active repair and resolution work is underway.\n` +
        `• 🟢 **RESOLVED:** Issue fixed and verified by municipal authority.\n` +
        `• 🔴 **REJECTED:** Duplicate or out-of-jurisdiction report.`,
      quickOptions: [
        { label: '🔎 Track My Ticket', text: 'How do I track my complaint?' },
        { label: '📝 Report New Issue', text: 'I want to report an issue' },
      ],
    };
  }

  // 6. FAQ: "Which category should I select for garbage?"
  if (
    lower.includes('which category') ||
    lower.includes('category for garbage') ||
    lower.includes('select category')
  ) {
    return {
      message: `🗑️ **For Garbage & Waste Issues:**\n\n` +
        `Select the **Garbage** category for:\n` +
        `• Overflowing public dustbins\n` +
        `• Street waste accumulation\n` +
        `• Missed door-to-door garbage collection\n` +
        `• Illegal open dumping\n\n` +
        `Our AI automatically routes this to the **Solid Waste Management & Sanitation Department**.`,
      suggestComplaint: true,
    };
  }

  // 7. Greetings
  const isGreeting = /^(hi|hello|hey|good morning|good evening|namaste|start)/i.test(lower);
  if (isGreeting || lower === '💡 civic help' || lower === 'civic help') {
    return {
      message: `👋 Hello! I'm your **CivicResolve AI Assistant 🤖**.\n\n` +
        `I can help you report local civic issues, track existing complaints from our PostgreSQL database, or answer any municipal resolution questions.\n\n` +
        `How can I assist you today?`,
      quickOptions: [
        { label: '📝 Report an Issue', text: 'I want to report an issue' },
        { label: '🔎 Track Complaint', text: 'How do I track my complaint?' },
        { label: '💡 Civic Help', text: 'What can I report?' },
      ],
    };
  }

  // 8. Issue Description Detection (e.g. "There is a large pothole near my college")
  const category = detectCategory(lower);
  const priority = detectPriority(lower);
  const isIssueDescription =
    category !== 'Other' ||
    lower.includes('pothole') ||
    lower.includes('garbage') ||
    lower.includes('water') ||
    lower.includes('drain') ||
    lower.includes('light') ||
    lower.includes('broken') ||
    lower.includes('leak') ||
    lower.includes('dark');

  if (isIssueDescription && category !== 'Other') {
    const dept = getDepartmentByCategory(category);
    return {
      message: `🛠️ **I can help you report this issue!**\n\n` +
        `• 🏷️ **Suggested Category:** ${category}\n` +
        `• ⚡ **Suggested Priority:** ${priority}\n` +
        `• 🏢 **Responsible Department:** ${dept.name}\n\n` +
        `Click **"Report This Issue"** below to review and submit it to our central system!`,
      suggestComplaint: true,
      suggestedCategory: category,
      suggestedPriority: priority,
      quickOptions: [
        { label: '📝 Report This Issue', text: 'Report This Issue' },
        { label: '💡 Ask Another Question', text: 'What can I report?' },
      ],
    };
  }

  // Default fallback
  return {
    message: `🤖 I'm here to help with civic problem reporting and tracking.\n\n` +
      `You can tell me about:\n` +
      `• A civic issue (e.g., *"Large pothole on MG Road"*)\n` +
      `• A ticket ID (e.g., \`CR-2026-000001\`) to track live status\n` +
      `• Or ask *"What can I report?"* for category guidance.`,
    quickOptions: [
      { label: '📝 Report an Issue', text: 'I want to report an issue' },
      { label: '🔎 Track Complaint', text: 'How do I track my complaint?' },
      { label: '💡 Civic Help', text: 'What can I report?' },
    ],
  };
}