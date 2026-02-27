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

/**
 * Spectrum report: one bar per competency (category › skill), value = average rank across roster.
 * @param {{ allowedPersonIds?: Set<string> }} [options] - When set, only scores from these person ids are included.
 * @returns {{ labels: string[], fullLabels: string[], values: number[], categoryBoundaries: number[], categoryIndices: number[], categoryNames: string[] }}
 */
export function getSpectrumData(options = {}) {
  const { allowedPersonIds } = options;
  const labels = [];
  const fullLabels = [];
  const values = [];
  const categoryBoundaries = [];
  const categoryIndices = [];
  const categoryNames = [];
  let index = 0;
  for (let c = 0; c < categories.length; c++) {
    const category = categories[c];
    const skills = getSkillsInCategory(category);
    if (skills.length) categoryNames.push(category);
    for (const skill of skills) {
      let personScores = getScoresForSkill(category, skill);
      if (allowedPersonIds != null) {
        personScores = personScores.filter((ps) => allowedPersonIds.has(ps.personId));
      }
      const sum = personScores.reduce((a, { score }) => a + score, 0);
      const avg = personScores.length ? sum / personScores.length : 0;
      labels.push(skill);
      fullLabels.push(`${category} › ${skill}`);
      values.push(Math.round(avg * 100) / 100);
      categoryIndices.push(c);
      index++;
    }
    if (c < categories.length - 1 && skills.length) {
      categoryBoundaries.push(index - 0.5);
    }
  }
  return { labels, fullLabels, values, categoryBoundaries, categoryIndices, categoryNames };
}

/**
 * Top n competencies by average rank (highest first). Uses same filtering as getSpectrumData.
 * @param {number} n
 * @param {{ allowedPersonIds?: Set<string> }} [options]
 * @returns {{ fullLabel: string, value: number }[]}
 */
export function getTopCompetencies(n, options = {}) {
  const data = getSpectrumData(options);
  const combined = data.labels.map((label, i) => ({
    fullLabel: data.fullLabels[i],
    value: data.values[i],
  }));
  return combined
    .sort((a, b) => b.value - a.value)
    .slice(0, n);
}

/**
 * Bottom n competencies by average rank (lowest first). Uses same filtering as getSpectrumData.
 * @param {number} n
 * @param {{ allowedPersonIds?: Set<string> }} [options]
 * @returns {{ fullLabel: string, value: number }[]}
 */
export function getBottomCompetencies(n, options = {}) {
  const data = getSpectrumData(options);
  const combined = data.labels.map((label, i) => ({
    fullLabel: data.fullLabels[i],
    value: data.values[i],
  }));
  return combined
    .sort((a, b) => a.value - b.value)
    .slice(0, n);
}

/**
 * People with their overall average score (average of all competency scores). Only includes people in allowedPersonIds when set.
 * @param {{ allowedPersonIds?: Set<string> }} [options]
 * @returns {{ personId: string, average: number }[]}
 */
export function getPersonAverageScores(options = {}) {
  const { allowedPersonIds } = options;
  const personIds = allowedPersonIds != null
    ? [...allowedPersonIds].filter((id) => scoresByPerson.has(id))
    : [...scoresByPerson.keys()];
  return personIds.map((personId) => {
    const entries = scoresByPerson.get(personId) ?? [];
    const sum = entries.reduce((a, e) => a + e.score, 0);
    const average = entries.length ? Math.round((sum / entries.length) * 100) / 100 : 0;
    return { personId, average };
  });
}

/**
 * Average rank per category (average of all competency scores in that category). For radar by role.
 * @param {{ allowedPersonIds?: Set<string> }} [options]
 * @returns {{ labels: string[], values: number[] }}
 */
export function getCategoryAverages(options = {}) {
  const { allowedPersonIds } = options;
  const labels = [];
  const values = [];
  for (const category of categories) {
    const skills = getSkillsInCategory(category);
    let sum = 0;
    let count = 0;
    for (const skill of skills) {
      let personScores = getScoresForSkill(category, skill);
      if (allowedPersonIds != null) {
        personScores = personScores.filter((ps) => allowedPersonIds.has(ps.personId));
      }
      for (const { score } of personScores) {
        sum += score;
        count += 1;
      }
    }
    const avg = count ? Math.round((sum / count) * 100) / 100 : 0;
    labels.push(category);
    values.push(avg);
  }
  return { labels, values };
}
