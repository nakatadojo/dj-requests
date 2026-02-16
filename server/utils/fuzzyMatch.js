/**
 * Normalize string for fuzzy matching
 * - Convert to lowercase
 * - Trim whitespace
 * - Replace multiple spaces with single space
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

/**
 * Check if a song (name + artist) matches another song
 */
export function songMatches(song1, song2) {
  return fuzzyMatch(song1.song_name, song2.song_name) &&
         fuzzyMatch(song1.artist, song2.artist);
}

/**
 * Check if a song name matches a block pattern (case-insensitive partial match)
 */
export function matchesBlockPattern(songName, pattern) {
  const normalizedSong = normalize(songName);
  const normalizedPattern = normalize(pattern);
  return normalizedSong.includes(normalizedPattern);
}
