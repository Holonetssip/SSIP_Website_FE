import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns today's date string in YYYY-MM-DD format (IST) */
export function getTodayDate() {
  return new Date()
    .toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

// ─── Admin: Write ────────────────────────────────────────────────────────────

/**
 * Publish a quiz for a given date.
 * @param {string} date - "YYYY-MM-DD"
 * @param {{ title: string, subject: string }} meta
 * @param {Array<{ question, options, correct }>} questions
 */
export async function publishQuiz(date, meta, questions) {
  const quizRef = doc(db, 'quizzes', date);

  await setDoc(quizRef, {
    ...meta,
    totalQuestions: questions.length,
    published: true,
    createdAt: new Date().toISOString(),
  });

  const questionsRef = collection(db, 'quizzes', date, 'questions');

  // Delete all existing questions first to avoid stale data
  const existingSnap = await getDocs(questionsRef);
  await Promise.all(existingSnap.docs.map((d) => deleteDoc(d.ref)));

  // Write new questions
  const writes = questions.map((q, i) =>
    setDoc(doc(questionsRef, String(i + 1).padStart(3, '0')), {
      question: q.question,
      options: q.options,
      correct: Number(q.correct),
    })
  );

  await Promise.all(writes);
  return { date, totalQuestions: questions.length };
}

// ─── Student: Read ───────────────────────────────────────────────────────────

/**
 * Fetch quiz metadata + all questions for a given date.
 * Returns null if no quiz exists for that date.
 */
export async function fetchQuiz(date = getTodayDate()) {
  const quizRef = doc(db, 'quizzes', date);
  const metaSnap = await getDoc(quizRef);

  if (!metaSnap.exists() || !metaSnap.data().published) return null;

  const meta = metaSnap.data();

  const questionsSnap = await getDocs(
    query(collection(db, 'quizzes', date, 'questions'), orderBy('__name__'))
  );

  const questions = questionsSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return { date, ...meta, questions };
}

/**
 * Fetch list of recent published quizzes (for the quiz listing page).
 */
export async function fetchRecentQuizzes(count = 30) {
  // Fetch all, filter + sort client-side to avoid composite index requirement
  const snap = await getDocs(collection(db, 'quizzes'));
  return snap.docs
    .map((d) => ({ date: d.id, ...d.data() }))
    .filter((q) => q.published)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
}

// ─── Student: Save Attempt ───────────────────────────────────────────────────

/**
 * Save a student's quiz attempt result.
 * @param {string} userId
 * @param {string} date
 * @param {{ score, correct, incorrect, skipped, timeTaken }} result
 * @param {{ displayName, photoURL }} userInfo
 */
export async function saveAttempt(userId, date, result, userInfo = {}) {
  const attemptRef = doc(db, 'attempts', `${userId}_${date}`);
  await setDoc(attemptRef, {
    userId,
    date,
    displayName: userInfo.displayName || 'Anonymous',
    photoURL: userInfo.photoURL || null,
    ...result,
    attemptedAt: new Date().toISOString(),
  });
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

/**
 * Fetch top N scores for a given quiz date.
 * Requires a Firestore composite index: attempts — date ASC, score DESC
 * Create at: Firebase Console → Firestore → Indexes → Add composite index
 */
export async function fetchLeaderboard(date, limitCount = 10) {
  // Filter by date client-side to avoid composite index requirement
  const snap = await getDocs(
    query(collection(db, 'attempts'), where('date', '==', date))
  );
  return snap.docs
    .map((d) => d.data())
    .sort((a, b) => b.score - a.score)
    .slice(0, limitCount);
}

// ─── User History ─────────────────────────────────────────────────────────────

/**
 * Fetch all attempts by a specific user, ordered by date descending.
 */
export async function fetchUserAttempts(userId, limitCount = 30) {
  const snap = await getDocs(
    query(collection(db, 'attempts'), where('userId', '==', userId))
  );
  return snap.docs
    .map((d) => d.data())
    .sort((a, b) => b.attemptedAt.localeCompare(a.attemptedAt))
    .slice(0, limitCount);
}

/**
 * Check if a user has already attempted a quiz for a given date.
 * Returns the attempt data or null.
 */
export async function fetchUserAttempt(userId, date) {
  const snap = await getDoc(doc(db, 'attempts', `${userId}_${date}`));
  return snap.exists() ? snap.data() : null;
}
