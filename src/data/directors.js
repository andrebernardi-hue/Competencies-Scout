/**
 * Directors: derived from personnel (unique "Director" values). Each has an id (slug) and a list of reports.
 */

import { getAllPeople } from './personnel.js';
import { slugify } from '../lib/slug.js';

/** @typedef {{ id: string, name: string }} Director */

/** @type {Director[]} */
let directors = [];
/** @type {Map<string, Director>} */
let byId = new Map();
/** @type {Map<string, import('./personnel.js').Person[]>} director id -> people who report to them */
let reportsByDirector = new Map();

/**
 * Build director list and reports index from personnel. Call after loadPersonnel().
 */
export function buildDirectorsIndex() {
  const people = getAllPeople();
  const seen = new Set();
  directors = [];
  for (const p of people) {
    const name = p.director?.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const id = slugify(name);
    directors.push({ id, name });
  }
  directors.sort((a, b) => a.name.localeCompare(b.name));
  byId = new Map(directors.map((d) => [d.id, d]));

  reportsByDirector = new Map();
  for (const d of directors) {
    reportsByDirector.set(d.id, people.filter((p) => (p.director ?? '').trim() === d.name));
  }
}

/**
 * @returns {Director[]}
 */
export function getAllDirectors() {
  return directors;
}

/**
 * @param {string} id - Director slug
 * @returns {Director | undefined}
 */
export function getDirectorById(id) {
  return byId.get(id);
}

/**
 * People who report to this director.
 * @param {string} directorId - Director slug
 * @returns {import('./personnel.js').Person[]}
 */
export function getReportsToDirector(directorId) {
  return reportsByDirector.get(directorId) ?? [];
}

/**
 * Director id from name (for linking).
 * @param {string} name
 * @returns {string | undefined}
 */
export function getDirectorIdByName(name) {
  const trimmed = name?.trim();
  if (!trimmed) return undefined;
  const id = slugify(trimmed);
  return byId.has(id) ? id : undefined;
}
