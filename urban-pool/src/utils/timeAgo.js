/**
 * Returns a human-readable relative time string from a timestamp.
 * @param {number|string} ts - Unix ms timestamp or ISO string
 */
export function timeAgo(ts) {
  // Treat missing, 0, or very old epoch as unknown
  if (!ts || ts === 0) return '';
  const t = typeof ts === 'string' ? new Date(ts).getTime() : Number(ts);
  if (isNaN(t) || t <= 0) return '';

  const diff = Date.now() - t;
  if (diff < 0) return 'Just now';

  const secs  = Math.floor(diff / 1000);
  if (secs < 45)  return 'Just now';

  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days  = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7)   return `${days} days ago`;
  if (days < 30)  return `${Math.floor(days / 7)} week${days >= 14 ? 's' : ''} ago`;

  return new Date(t).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

/**
 * Returns best available timestamp from a notification object.
 * Handles both new (createdAt) and old (id as timestamp) formats.
 */
export function notifTimestamp(n) {
  if (!n) return null;
  // createdAt: real timestamp stored by new code
  if (n.createdAt && n.createdAt > 0) return n.createdAt;
  // id: Date.now() at creation time for newer notifications
  if (typeof n.id === 'number' && n.id > 1_577_836_800_000) return n.id;
  return null; // truly unknown — caller will fall back to n.time string
}
