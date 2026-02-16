/**
 * Normalize string for fuzzy matching
 */
export function normalize(str) {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Check if two strings match after normalization
 */
export function fuzzyMatch(str1, str2) {
  return normalize(str1) === normalize(str2);
}
