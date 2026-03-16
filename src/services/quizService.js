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
  getCountFromServer,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── User Management ─────────────────────────────────────────────────────────

/**
 * Create or update a user profile keyed by phone number.
 * Phone is the stable identity across daily quiz sessions.
 */
export async function upsertUser(phone, displayName, email) {
  const userRef = doc(db, 'users', phone);
  const snap = await getDoc(userRef);
  const now = new Date().toISOString();
  if (snap.exists()) {
    await setDoc(userRef, { displayName, email, lastSeen: now }, { merge: true });
  } else {
    await setDoc(userRef, { phone, displayName, email, createdAt: now, lastSeen: now });
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns today's date string in YYYY-MM-DD format (IST) */
export function getTodayDate() {
  return new Date()
    .toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

// ─── Admin: Write ────────────────────────────────────────────────────────────

/**
 * Toggle a quiz's published state (hide/unhide).
 */
export async function toggleQuizPublished(date, published) {
  await setDoc(doc(db, 'quizzes', date), { published }, { merge: true });
}

/**
 * Fetch ALL quizzes (including hidden) for admin management.
 */
export async function fetchAllQuizzes() {
  const snap = await getDocs(collection(db, 'quizzes'));
  return snap.docs
    .map((d) => ({ date: d.id, ...d.data() }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Fetch a quiz with all its questions for editing.
 */
export async function fetchQuizForEdit(date) {
  const metaSnap = await getDoc(doc(db, 'quizzes', date));
  if (!metaSnap.exists()) return null;
  const questionsSnap = await getDocs(
    query(collection(db, 'quizzes', date, 'questions'), orderBy('__name__'))
  );
  return {
    ...metaSnap.data(),
    questions: questionsSnap.docs.map((d) => d.data()),
  };
}

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
 * Save a student's quiz attempt result and update cumulative userStats.
 * userId should be the user's phone number (stable across sessions).
 * @param {string} userId - phone number
 * @param {string} date
 * @param {{ score, correct, incorrect, skipped, timeTaken }} result
 * @param {{ displayName, email, phone }} userInfo
 */
export async function saveAttempt(userId, date, result, userInfo = {}) {
  const { score, correct, incorrect, skipped, timeTaken } = result;
  const now = new Date().toISOString();

  // Check if already attempted — don't double-count userStats
  const attemptRef = doc(db, 'attempts', `${userId}_${date}`);
  const existingAttempt = await getDoc(attemptRef);
  const isFirstAttempt = !existingAttempt.exists();

  await setDoc(attemptRef, {
    userId,
    date,
    displayName: userInfo.displayName || 'Anonymous',
    email: userInfo.email || '',
    phone: userInfo.phone || userId,
    score, correct, incorrect, skipped, timeTaken,
    attemptedAt: now,
  });

  // Only update userStats on first attempt for this date
  if (!isFirstAttempt) return { totalScore: (await getDoc(doc(db, 'userStats', userId))).data()?.totalScore ?? score };

  const statsRef = doc(db, 'userStats', userId);
  const statsSnap = await getDoc(statsRef);
  let newTotalScore;
  if (statsSnap.exists()) {
    const existing = statsSnap.data();
    newTotalScore = parseFloat(((existing.totalScore || 0) + score).toFixed(2));
    await setDoc(statsRef, {
      displayName: userInfo.displayName || existing.displayName,
      email: userInfo.email || existing.email,
      phone: userId,
      totalScore: newTotalScore,
      bestScore: Math.max(existing.bestScore || 0, score),
      attemptCount: (existing.attemptCount || 0) + 1,
      totalCorrect: (existing.totalCorrect || 0) + correct,
      totalIncorrect: (existing.totalIncorrect || 0) + incorrect,
      lastAttemptDate: date,
      lastAttemptAt: now,
    });
  } else {
    newTotalScore = score;
    await setDoc(statsRef, {
      displayName: userInfo.displayName || 'Anonymous',
      email: userInfo.email || '',
      phone: userId,
      totalScore: newTotalScore,
      bestScore: score,
      attemptCount: 1,
      totalCorrect: correct,
      totalIncorrect: incorrect,
      lastAttemptDate: date,
      lastAttemptAt: now,
    });
  }
  return { totalScore: newTotalScore };
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

/**
 * Fetch top 10 scores for a given quiz date.
 * Tries server-side sort (needs composite index: date ASC, score DESC).
 * Falls back to client-side sort if index is not ready yet.
 */
export async function fetchLeaderboard(date) {
  const sortWithTiebreaker = (arr) =>
    arr.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken).slice(0, 10);
  try {
    const snap = await getDocs(
      query(
        collection(db, 'attempts'),
        where('date', '==', date),
        orderBy('score', 'desc'),
        limit(10)
      )
    );
    return sortWithTiebreaker(snap.docs.map((d) => d.data()));
  } catch {
    const snap = await getDocs(
      query(collection(db, 'attempts'), where('date', '==', date))
    );
    return sortWithTiebreaker(snap.docs.map((d) => d.data()));
  }
}

/**
 * Get a user's daily rank and total participants for a given date.
 * Uses count queries — always 2 reads regardless of participant count.
 * Requires same composite index as fetchLeaderboard: date ASC, score DESC
 * @returns {{ rank: number, total: number }}
 */
export async function fetchUserDailyRank(phone, date, userScore, userTimeTaken) {
  try {
    const [higherScoreSnap, sameScoreFasterSnap, totalSnap] = await Promise.all([
      // People who scored strictly higher
      getCountFromServer(query(
        collection(db, 'attempts'),
        where('date', '==', date),
        where('score', '>', userScore)
      )),
      // People with same score but faster time (tiebreaker)
      getCountFromServer(query(
        collection(db, 'attempts'),
        where('date', '==', date),
        where('score', '==', userScore),
        where('timeTaken', '<', userTimeTaken)
      )),
      getCountFromServer(query(
        collection(db, 'attempts'),
        where('date', '==', date)
      )),
    ]);
    return {
      rank: higherScoreSnap.data().count + sameScoreFasterSnap.data().count + 1,
      total: totalSnap.data().count,
    };
  } catch {
    const snap = await getDocs(
      query(collection(db, 'attempts'), where('date', '==', date))
    );
    const all = snap.docs.map((d) => d.data());
    const rank = all.filter((a) => a.score > userScore || (a.score === userScore && a.timeTaken < userTimeTaken)).length + 1;
    return { rank, total: all.length };
  }
}

/**
 * Fetch top 10 users by cumulative total score.
 * Requires single-field index in Firebase Console:
 *   Collection: userStats | Field: totalScore DESC
 */
export async function fetchCumulativeLeaderboard() {
  const snap = await getDocs(
    query(
      collection(db, 'userStats'),
      orderBy('totalScore', 'desc'),
      limit(10)
    )
  );
  return snap.docs.map((d) => d.data());
}

/**
 * Get a user's all-time rank and total registered users.
 * Uses count queries — always 2 reads regardless of user count.
 * @returns {{ rank: number, total: number }}
 */
export async function fetchUserCumulativeRank(phone, userTotalScore) {
  const [higherSnap, totalSnap] = await Promise.all([
    getCountFromServer(query(
      collection(db, 'userStats'),
      where('totalScore', '>', userTotalScore)
    )),
    getCountFromServer(collection(db, 'userStats')),
  ]);
  return {
    rank: higherSnap.data().count + 1,
    total: totalSnap.data().count,
  };
}

// ─── Admin: Download Reports ──────────────────────────────────────────────────

/**
 * Fetch ALL attempts for a given date (for admin download).
 * Returns sorted array: score DESC, timeTaken ASC.
 */
export async function fetchDailyAttemptsAll(date) {
  const snap = await getDocs(
    query(collection(db, 'attempts'), where('date', '==', date))
  );
  return snap.docs
    .map((d) => d.data())
    .sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);
}

/**
 * Fetch ALL userStats sorted by totalScore DESC (for admin download).
 */
export async function fetchAllUserStats() {
  const snap = await getDocs(
    query(collection(db, 'userStats'), orderBy('totalScore', 'desc'))
  );
  return snap.docs.map((d) => d.data());
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
