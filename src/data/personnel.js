/**
 * Personnel: source of truth from public/data/personnel.csv.
 * Each person has a stable id (slug from name) for routing and matching with other CSVs.
 */

import { loadDataset } from './store.js';
import { slugify } from '../lib/slug.js';

const PERSONNEL_PATH = '/data/personnel.csv';
const NAME_COLUMN = 'Design Leader';

/** @typedef {{ id: string, name: string, director: string, location: string, role: string, yearsOfExperience: string, [key: string]: string }} Person */

/** @type {Person[]} */
let people = [];
/** @type {Map<string, Person>} */
let byId = new Map();

/**
 * Load personnel from CSV and index by stable id. Call once at app init.
 * @returns {Promise<Person[]>}
 */
export async function loadPersonnel() {
  const dataset = await loadDataset(PERSONNEL_PATH);
  const rows = dataset.rows.filter((r) => r[NAME_COLUMN]?.trim());
  people = rows.map((row) => {
    const name = row[NAME_COLUMN]?.trim() || '';
    const id = slugify(name);
    const person = {
      id,
      name,
      director: row['Director'] ?? '',
      location: row['Location'] ?? '',
      role: row['Role'] ?? '',
      yearsOfExperience: row['Years of Experience'] ?? '',
      ...row,
    };
    return person;
  });
  byId = new Map(people.map((p) => [p.id, p]));
  return people;
}

/**
 * @returns {Person[]}
 */
export function getAllPeople() {
  return people;
}

/**
 * @param {string} id - Slug (from name)
 * @returns {Person | undefined}
 */
export function getPersonById(id) {
  return byId.get(id);
}

/**
 * Resolve person id (slug) from full name. For matching competencies and other CSVs by name.
 * @param {string} name - Full name as in CSV (e.g. "Teresa Ceballos")
 * @returns {string | undefined}
 */
export function getPersonIdByName(name) {
  const trimmed = name?.trim();
  if (!trimmed) return undefined;
  const person = people.find((p) => p.name === trimmed);
  return person?.id;
}

/**
 * Person id column name for matching other CSVs (e.g. "Design Leader" or "Person ID").
 * Use the same name or id in other datasets to join.
 */
export const PERSON_ID_FIELD = 'Design Leader';
export const PERSON_SLUG_FIELD = 'id';
