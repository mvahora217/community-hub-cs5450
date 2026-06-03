// src/utils/helpers.js

export const CAT_COLORS = {
  Tech:        '#6366f1',
  Outdoors:    '#10b981',
  Art:         '#f59e0b',
  Music:       '#ec4899',
  Gaming:      '#8b5cf6',
  Fitness:     '#f97316',
  Photography: '#06b6d4',
  Design:      '#14b8a6',
  Environment: '#22c55e',
};

const PALETTE = ['#6366f1','#10b981','#f59e0b','#ec4899','#8b5cf6','#f97316','#06b6d4','#ef4444'];

export function avatarBg(initials = '??') {
  const code = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
  return PALETTE[code % PALETTE.length];
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-CA', {
    weekday:'long', year:'numeric', month:'long', day:'numeric',
  });
}

export function timeAgo(timestamp) {
  if (!timestamp?.toDate) return 'just now';
  const diff = (Date.now() - timestamp.toDate().getTime()) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return Math.floor(diff/60)+'m ago';
  if (diff < 86400)return Math.floor(diff/3600)+'h ago';
  return Math.floor(diff/86400)+'d ago';
}
