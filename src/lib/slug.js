/**
 * Stable URL-safe id from a person's name. Used for routing and for matching across CSVs.
 * @param {string} name
 * @returns {string}
 */
export function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
