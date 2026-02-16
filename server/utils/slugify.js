/**
 * Convert string to URL-friendly slug
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start
    .replace(/-+$/, '');         // Trim - from end
}

/**
 * Generate unique slug from event name
 */
export function generateEventSlug(eventName) {
  const baseSlug = slugify(eventName);
  const randomSuffix = Math.random().toString(36).substring(2, 8); // 6 random chars
  return `${baseSlug}-${randomSuffix}`;
}
