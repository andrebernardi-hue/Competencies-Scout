/**
 * Competencies: scores 1–4 per person per skill. Load from public/data/competencies.csv.
 * Categories contain skills; person columns match roster by name (Design Leader).
 */

import { loadDataset } from './store.js';
import { getPersonIdByName } from './personnel.js';

const COMPETENCIES_PATH = '/data/competencies.csv';
const CATEGORY_COLUMN = '';
const SKILL_COLUMN = 'Skill';

/** @typedef {{ category: string, skill: string, score: number }} ScoreEntry */
/** @typedef {{ personId: string, score: number }} PersonScore */

/** @type {Map<string, ScoreEntry[]>} personId -> list of { category, skill, score } */
let scoresByPerson = new Map();
/** @type {Map<string, PersonScore[]>} "category|skill" -> list of { personId, score } */
let scoresBySkill = new Map();
/** @type {string[]} category order */
let categories = [];
/** @type {Map<string, string[]>} category -> skill names in order */
let skillsByCategory = new Map();

/**
 * Load competencies CSV and build indexes. Call after loadPersonnel().
 * @returns {Promise<{ categories: string[], skillsByCategory: Map<string, string[]> }>}
 */
export async function loadCompetencies() {
  const dataset = await loadDataset(COMPETENCIES_PATH);
  const rows = dataset.rows;
  const headers = dataset.headers;

  const categoryIdx = headers.indexOf(CATEGORY_COLUMN) >= 0 ? headers.indexOf(CATEGORY_COLUMN) : 0;
  const skillIdx = headers.indexOf(SKILL_COLUMN) >= 0 ? headers.indexOf(SKILL_COLUMN) : 1;
  const personColumns = headers.filter((h, i) => i !== categoryIdx && i !== skillIdx && String(h ?? '').trim());

  scoresByPerson = new Map();
  scoresBySkill = new Map();
  categories = [];
  skillsByCategory = new Map();

  let currentCategory = '';

  for (const row of rows) {
    const catCell = row[headers[categoryIdx]] ?? row[headers[0]];
    if (catCell?.trim()) currentCategory = catCell.trim();
    const skill = (row[headers[skillIdx]] ?? row[headers[1]])?.trim();
    if (!skill) continue;

    if (!skillsByCategory.has(currentCategory)) {
      categories.push(currentCategory);
      skillsByCategory.set(currentCategory, []);
    }
    skillsByCategory.get(currentCategory).push(skill);

    const skillKey = `${currentCategory}|${skill}`;
    const personScores = /** @type {PersonScore[]} */ ([]);

    for (const personName of personColumns) {
      const personId = getPersonIdByName(personName);
      if (!personId) continue;
      const raw = row[personName];
      const score = parseScore(raw);
      if (score == null) continue;

      personScores.push({ personId, score });
      const list = scoresByPerson.get(personId) ?? [];
      list.push({ category: currentCategory, skill, score });
      scoresByPerson.set(personId, list);
    }
    scoresBySkill.set(skillKey, personScores);
  }

  return { categories, skillsByCategory };
}

/**
 * @param {string} raw
 * @returns {number | null}
 */
function parseScore(raw) {
  const n = parseInt(String(raw).trim(), 10);
  if (Number.isNaN(n) || n < 1 || n > 4) return null;
  return n;
}

/**
 * All scores for one person, grouped by category and skill.
 * @param {string} personId - From personnel (slug)
 * @returns {ScoreEntry[]}
 */
export function getScoresForPerson(personId) {
  return scoresByPerson.get(personId) ?? [];
}

/**
 * Scores for one skill (all people who have a score).
 * @param {string} category
 * @param {string} skill
 * @returns {PersonScore[]}
 */
export function getScoresForSkill(category, skill) {
  const key = `${category}|${skill}`;
  return scoresBySkill.get(key) ?? [];
}

/**
 * Get a single score for a person and skill.
 * @param {string} personId
 * @param {string} category
 * @param {string} skill
 * @returns {number | undefined}
 */
export function getScore(personId, category, skill) {
  const list = scoresByPerson.get(personId) ?? [];
  const entry = list.find((e) => e.category === category && e.skill === skill);
  return entry?.score;
}

/**
 * @returns {string[]}
 */
export function getCategories() {
  return categories;
}

/**
 * @param {string} category
 * @returns {string[]}
 */
export function getSkillsInCategory(category) {
  return skillsByCategory.get(category) ?? [];
}
