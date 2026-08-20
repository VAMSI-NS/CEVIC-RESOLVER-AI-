import type { Complaint, AIAnalysis, Category, ImageAnalysis } from '../types';
import { getDepartmentByCategory } from '../data/mockDepartments';
import { delay } from '../utils/helpers';

// ============================================================
// Simulated AI service
// Replace these functions with real API calls (Gemini, OpenAI, etc.)
// ============================================================

// Keywords â†’ Category mapping
const categoryKeywords: Record<Category, string[]> = {
  Roads: ['pothole', 'road', 'highway', 'street', 'tarmac', 'pavement', 'lane', 'traffic', 'marking', 'footpath'],
  Garbage: ['garbage', 'trash', 'waste', 'litter', 'rubbish', 'dump', 'bin', 'stench', 'smell', 'filth', 'sanitation'],
  Drainage: ['drain', 'drainage', 'flood', 'water logging', 'waterlogging', 'sewage', 'sewer', 'blockage', 'clog', 'overflow'],
  Water: ['water', 'pipeline', 'pipe', 'supply', 'tap', 'leak', 'burst', 'contaminated', 'murky', 'dirty water'],
  Streetlights: ['light', 'streetlight', 'lamp', 'dark', 'bulb', 'illumination', 'flickering'],
  Electricity: ['electricity', 'wire', 'pole', 'power', 'transformer', 'shock', 'spark', 'blackout', 'short circuit'],
  Infrastructure: ['bridge', 'footpath', 'sidewalk', 'bench', 'park', 'building', 'wall', 'structure', 'crack', 'collapse', 'broken'],
  Other: [],
};

// Severity keywords for priority detection
const highPriorityKeywords = [
  'accident', 'dangerous', 'emergency', 'urgent', 'collapsed', 'burst', 'gushing', 'flooding', 'injured',
  'severe', 'critical', 'huge', 'major', 'serious', 'unsafe', 'blocked road', 'no supply',
];
const mediumPriorityKeywords = [
  'overflowing', 'accumulating', 'days', 'week', 'multiple', 'continuous', 'ongoing', 'residents', 'colony',
];

/** Detect category from complaint text */
function detectCategory(text: string): Category {
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
  return bestCategory;
}

/** Detect priority from complaint text */
function detectPriority(text: string): 'HIGH' | 'MEDIUM' | 'LOW' {
  const lower = text.toLowerCase();
  const highCount = highPriorityKeywords.filter((kw) => lower.includes(kw)).length;
  const medCount = mediumPriorityKeywords.filter((kw) => lower.includes(kw)).length;

  if (highCount >= 2) return 'HIGH';
  if (highCount >= 1) return 'HIGH';
  if (medCount >= 2) return 'MEDIUM';
  if (medCount >= 1) return 'MEDIUM';
  return 'LOW';
}

/** Generate a human-readable issue title */
function generateTitle(text: string, category: Category): string {
  const lower = text.toLowerCase();

  const titleMap: Partial<Record<Category, string[]>> = {
    Roads: ['Large pothole causing unsafe conditions', 'Road damage requiring urgent repair', 'Road surface deterioration reported'],
    Garbage: ['Garbage overflow requiring sanitation', 'Waste accumulation in public area', 'Illegal dumping reported'],
    Drainage: ['Drainage blockage causing flooding', 'Clogged drain creating waterlogging', 'Storm drain overflow reported'],
    Water: ['Water pipeline break requiring repair', 'Water supply disruption reported', 'Contaminated water supply issue'],
    Streetlights: ['Non-functional streetlights reported', 'Street lighting failure in public area', 'Electrical lighting issue'],
    Infrastructure: ['Public infrastructure damage reported', 'Civic structure requiring repair', 'Public facility damage'],
  };

  const options = titleMap[category] || ['Civic issue reported'];

  // Try to pick relevant title
  if (lower.includes('pothole')) return 'Large pothole causing unsafe road conditions';
  if (lower.includes('burst') || lower.includes('gushing')) return 'Water pipeline burst causing supply disruption';
  if (lower.includes('flood')) return 'Drainage blockage causing severe flooding';
  if (lower.includes('dark') || lower.includes('light')) return 'Streetlight failure creating safety hazard';
  if (lower.includes('garbage') || lower.includes('waste')) return 'Garbage accumulation causing public health concern';

  return options[Math.floor(Math.random() * options.length)];
}

/** Generate AI reasoning for the decision */
function generateReason(text: string, category: Category, priority: string): string {
  const reasonMap: Record<string, string> = {
    Roads_HIGH: 'Large road damage near high-traffic area creates significant safety risk for vehicles and pedestrians.',
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
    Infrastructure_HIGH: 'Critical infrastructure damage posing immediate danger to public safety.',
    Infrastructure_MEDIUM: 'Infrastructure damage that requires prompt repair to prevent worsening.',
    Infrastructure_LOW: 'Infrastructure maintenance required to maintain public facility standards.',
  };

  const key = `${category}_${priority}`;
  return reasonMap[key] || 'Civic issue identified requiring appropriate departmental action.';
}

/** Get estimated response time based on priority */
function getEstimatedResponse(priority: string): string {
  switch (priority) {
    case 'HIGH': return '24-48 hours';
    case 'MEDIUM': return '48-72 hours';
    default: return '72-96 hours';
  }
}

// ============================================================
// Public API
// ============================================================

/**
 * Analyze a complaint text and return AI analysis.
 * This simulates a call to an LLM (e.g., Gemini, GPT-4).
 */
export async function analyzeComplaint(
  description: string,
  location: string,
  _imageUrl?: string
): Promise<AIAnalysis> {
  // Simulate network + AI processing delay
  await delay(3500);

  const category = detectCategory(description);
  const priority = detectPriority(description);
  const department = getDepartmentByCategory(category);
  const title = generateTitle(description, category);
  const reason = generateReason(description, category, priority);
  const confidence = 80 + Math.floor(Math.random() * 17); // 80-96%

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
 * Simulate computer vision analysis of an uploaded image.
 * In production, this would call a Vision model (Gemini Vision, GPT-4V, etc.)
 */
export async function analyzeImage(_imageFile: File): Promise<ImageAnalysis> {
  await delay(2000);

  // Return simulated vision analysis
  // In real implementation, send image bytes to vision API
  const analyses: ImageAnalysis[] = [
    {
      detectedObjects: ['Road surface damage', 'Pothole', 'Vehicle traffic', 'Asphalt crack'],
      severity: 'High',
      suggestedCategory: 'Roads',
      confidence: 92,
    },
    {
      detectedObjects: ['Garbage pile', 'Overflowing bin', 'Waste material', 'Rodent activity'],
      severity: 'High',
      suggestedCategory: 'Garbage',
      confidence: 88,
    },
    {
      detectedObjects: ['Water flow', 'Flooded road', 'Blocked drain', 'Standing water'],
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
      detectedObjects: ['Water pipe', 'Leaking joint', 'Water seepage', 'Wet ground'],
      severity: 'High',
      suggestedCategory: 'Water',
      confidence: 90,
    },
  ];

  return analyses[Math.floor(Math.random() * analyses.length)];
}

// ============================================================
// AI Chat responses
// ============================================================

interface ChatContext {
  lastCategory?: string;
  locationAsked?: boolean;
  locationProvided?: boolean;
}

const chatContext: ChatContext = {};

/**
 * Generate an AI chat response.
 * In production, replace with Gemini/GPT-4 streaming API call.
 */
export async function getChatResponse(
  userMessage: string,
  _conversationHistory: Array<{ role: string; content: string }>
): Promise<{ message: string; suggestComplaint?: boolean; category?: string }> {
  await delay(1000 + Math.random() * 1000);

  const lower = userMessage.toLowerCase();

  // Detect intent
  const isGreeting = /^(hi|hello|hey|good|namaste)/i.test(lower);
  const mentionsWater = lower.includes('water') || lower.includes('pipe') || lower.includes('leak');
  const mentionsRoad = lower.includes('pothole') || lower.includes('road') || lower.includes('street');
  const mentionsGarbage = lower.includes('garbage') || lower.includes('waste') || lower.includes('trash');
  const mentionsDrain = lower.includes('drain') || lower.includes('flood') || lower.includes('waterlog');
  const mentionsLight = lower.includes('light') || lower.includes('dark') || lower.includes('lamp');
  const mentionsLocation = lower.includes('near') || lower.includes('road') || lower.includes('street') || lower.includes('colony') || lower.includes('area') || /\d/.test(lower);
  const isTracking = lower.includes('track') || lower.includes('status') || lower.includes('complaint');

  if (isGreeting) {
    return {
      message: "Hello! ðŸ‘‹ I'm **Civic AI**, your smart assistant for civic complaints. I can help you:\n\nâ€¢ ðŸ“ **Report a civic problem** (potholes, garbage, drainage, lights, water)\nâ€¢ ðŸ” **Track your complaint** status\nâ€¢ ðŸ“Š **Understand AI routing** decisions\n\nWhat civic issue can I help you with today?",
    };
  }

  if (isTracking) {
    return {
      message: "To track your complaint, you can:\n\n1. Visit the **Track Complaint** page\n2. Enter your **Complaint ID** (format: CR-2026-XXXXXX)\n\nYou can also check the timeline of any complaint to see real-time status updates. Would you like to report a new issue instead?",
    };
  }

  if (mentionsWater && !chatContext.locationAsked) {
    chatContext.lastCategory = 'Water';
    chatContext.locationAsked = true;
    return {
      message: "ðŸ” I understand this as a **Water Supply / Infrastructure issue**.\n\nThis could involve:\nâ€¢ Broken pipelines\nâ€¢ Water supply disruption\nâ€¢ Water contamination\nâ€¢ Leakage\n\nCan you tell me the **exact location or a nearby landmark**? This helps route your complaint to the correct zone team.",
    };
  }

  if (mentionsRoad && !chatContext.locationAsked) {
    chatContext.lastCategory = 'Roads';
    chatContext.locationAsked = true;
    return {
      message: "ðŸ” I understand this as a **Road Infrastructure issue**.\n\nThis likely involves:\nâ€¢ Pothole or road damage\nâ€¢ Road surface deterioration\nâ€¢ Safety hazard for vehicles\n\nCan you provide the **location or nearest landmark**? Our AI will determine the exact zone and assign the right team.",
    };
  }

  if (mentionsGarbage && !chatContext.locationAsked) {
    chatContext.lastCategory = 'Garbage';
    chatContext.locationAsked = true;
    return {
      message: "ðŸ” I understand this as a **Sanitation / Garbage issue**.\n\nThis involves:\nâ€¢ Garbage accumulation\nâ€¢ Overflowing bins\nâ€¢ Illegal dumping\n\nWhere is this happening? Please share the **location or nearby landmark**.",
    };
  }

  if (mentionsDrain && !chatContext.locationAsked) {
    chatContext.lastCategory = 'Drainage';
    chatContext.locationAsked = true;
    return {
      message: "ðŸ” I understand this as a **Drainage / Flooding issue**.\n\nThis involves:\nâ€¢ Clogged drains\nâ€¢ Waterlogging\nâ€¢ Flooding during rain\n\nPlease share the **location** so I can route it to the correct drainage team.",
    };
  }

  if (mentionsLight && !chatContext.locationAsked) {
    chatContext.lastCategory = 'Streetlights';
    chatContext.locationAsked = true;
    return {
      message: "ðŸ” I understand this as a **Street Lighting issue**.\n\nThis involves:\nâ€¢ Non-functional streetlights\nâ€¢ Flickering lights\nâ€¢ Dark zones at night\n\nCan you tell me the **street or area name** where the lights are not working?",
    };
  }

  if (mentionsLocation && chatContext.locationAsked && !chatContext.locationProvided) {
    chatContext.locationProvided = true;
    const category = chatContext.lastCategory || 'Roads';
    const deptMap: Record<string, string> = {
      Water: 'Water Supply & Distribution Department',
      Roads: 'Municipal Roads & Infrastructure Department',
      Garbage: 'Sanitation & Waste Management Department',
      Drainage: 'Drainage & Stormwater Management',
      Streetlights: 'Electrical & Street Lighting Division',
    };

    return {
      message: `âœ… **AI Analysis Complete!**\n\nðŸ“ **Location:** ${userMessage}\n\nðŸ·ï¸ **Category:** ${category}\nâš¡ **Priority:** HIGH\nðŸ¢ **Department:** ${deptMap[category] || 'Municipal Department'}\n\n*"Your complaint has been analyzed and the responsible department has been identified. Would you like me to create a complaint ticket for you?"*`,
      suggestComplaint: true,
      category,
    };
  }

  // Default helpful response
  chatContext.lastCategory = undefined;
  chatContext.locationAsked = false;
  chatContext.locationProvided = false;

  return {
    message: "I can help you report civic issues like:\n\nðŸ›£ï¸ **Roads** â€” Potholes, road damage\nðŸ—‘ï¸ **Garbage** â€” Waste accumulation\nðŸŒŠ **Drainage** â€” Flooding, blockages\nðŸ’§ **Water** â€” Pipeline issues, supply\nðŸ’¡ **Streetlights** â€” Broken lights\nðŸ—ï¸ **Infrastructure** â€” Public facility damage\n\nDescribe the problem you're facing and I'll help you report it or track an existing complaint.",
  };
}
