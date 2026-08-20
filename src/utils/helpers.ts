// ============================================================
// Utility functions
// ============================================================

/** Generate a unique complaint ID in the format CR-YYYY-XXXXXX */
export function generateComplaintId(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 900000) + 100000;
  return `CR-${year}-${num}`;
}

/** Format a date string to a human-readable format */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Format a date string to include time */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/** Get relative time string */
export function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

/** Merge class names (simple utility) */
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Simulate an async delay */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Get priority color classes */
export function getPriorityColor(priority: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (priority) {
    case 'HIGH':
    case 'CRITICAL':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200',
        dot: 'bg-gray-400',
      };
  }
}

/** Get status color classes */
export function getStatusColor(status: string): {
  bg: string;
  text: string;
} {
  switch (status) {
    case 'Resolved':
    case 'Closed':
      return { bg: 'bg-green-50', text: 'text-green-700' };
    case 'In Progress':
    case 'Inspection':
      return { bg: 'bg-blue-50', text: 'text-blue-700' };
    case 'Escalated':
      return { bg: 'bg-red-50', text: 'text-red-700' };
    case 'Assigned':
    case 'Routed':
      return { bg: 'bg-purple-50', text: 'text-purple-700' };
    case 'Submitted':
    case 'AI_Analysis':
      return { bg: 'bg-yellow-50', text: 'text-yellow-700' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-600' };
  }
}

/** Get category icon name (for display purposes) */
export function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Roads: '🛣️',
    Garbage: '🗑️',
    Drainage: '🌊',
    Water: '💧',
    Streetlights: '💡',
    Infrastructure: '🏗️',
    Other: '📋',
  };
  return map[category] || '📋';
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
