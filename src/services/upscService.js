import {
  collection, doc, setDoc, deleteDoc, getDocs, query, where,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Paper config ────────────────────────────────────────────────────────────

export const PAPER_CONFIG = {
  gs: {
    name: 'GS Paper 1',
    questions: 100,
    correctMark: 2,
    wrongMark: 2 / 3,
  },
  csat: {
    name: 'CSAT Paper 2',
    questions: 80,
    correctMark: 2.5,
    wrongMark: 2.5 / 3,
    passMark: 66.67,
  },
};

// ─── Scoring ──────────────────────────────────────────────────────────────────

export function calculateScore(studentAnswers, keyAnswers, paper) {
  const { correctMark, wrongMark } = PAPER_CONFIG[paper];
  let correct = 0, wrong = 0, skipped = 0;
  for (let i = 0; i < keyAnswers.length; i++) {
    const s = (studentAnswers[i] || '').toLowerCase();
    const k = (keyAnswers[i] || '').toLowerCase();
    if (k === 'n') continue; // unknown in key — skip entirely, no marks either way
    if (!s) skipped++;
    else if (s === k) correct++;
    else wrong++;
  }
  const score = parseFloat((correct * correctMark - wrong * wrongMark).toFixed(2));
  return { score, correct, wrong, skipped };
}

// ─── Admin: Answer Keys ───────────────────────────────────────────────────────

export async function saveAnswerKey(coachingName, paper, set, answers) {
  const id = `${coachingName.toLowerCase().replace(/\s+/g, '_')}_${paper}_${set}`;
  await setDoc(doc(db, 'upsc_keys', id), {
    coachingName,
    paper,
    set,
    answers,
    uploadedAt: new Date().toISOString(),
  });
  return id;
}

export async function fetchAnswerKeys(paper, set) {
  const snap = await getDocs(
    query(collection(db, 'upsc_keys'), where('paper', '==', paper), where('set', '==', set))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchAllAnswerKeys() {
  const snap = await getDocs(collection(db, 'upsc_keys'));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function deleteAnswerKey(id) {
  await deleteDoc(doc(db, 'upsc_keys', id));
}

// ─── Student: Save Attempt ────────────────────────────────────────────────────

export async function saveUpscAttempt(name, rollNo, paper, set, answers, scores) {
  const id = `${rollNo}_${paper}_${set}_${Date.now()}`;
  await setDoc(doc(db, 'upsc_attempts', id), {
    name,
    rollNo,
    paper,
    set,
    answers,
    scores,
    submittedAt: new Date().toISOString(),
  });
}
