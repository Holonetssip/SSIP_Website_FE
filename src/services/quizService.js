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

// ─── Exam types & collection resolver ───────────────────────────────────────

export const EXAM_TYPES = ['UPSC', 'UPPCS-2026', 'CSAT-2026'];

// UPSC / UPPCS-2026 share the default collections (separated by an `examType`
// field). CSAT-2026 lives in its own physically separate collections.
const DEFAULT_COLLECTIONS = {
  users: 'users',
  quizzes: 'quizzes',
  attempts: 'attempts',
  stats: 'userStatsByExam',
  separate: false,
};
const COLLECTIONS = {
  'CSAT-2026': {
    users: 'csat_users',
    quizzes: 'csat_quizzes',
    attempts: 'csat_attempts',
    stats: 'csat_userStats',
    separate: true,
  },
};

export const getCollections = (examType) => COLLECTIONS[examType] || DEFAULT_COLLECTIONS;

/** `where('examType', ...)` clause — not needed inside a CSAT-only collection. */
const examFilter = (examType) =>
  getCollections(examType).separate ? [] : [where('examType', '==', examType)];

/** Stats doc id: plain phone inside a separate collection, `${phone}_${exam}` otherwise. */
const statsDocId = (userId, examType) =>
  getCollections(examType).separate ? userId : `${userId}_${examType}`;

// ─── User Management ─────────────────────────────────────────────────────────

/**
 * Create or update a user profile keyed by phone number.
 * Phone is the stable identity across daily quiz sessions.
 */
export async function upsertUser(phone, displayName, email, examType = 'UPSC') {
  const userRef = doc(db, getCollections(examType).users, phone);
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
export async function toggleQuizPublished(date, published, examType = 'UPSC') {
  await setDoc(doc(db, getCollections(examType).quizzes, date), { published }, { merge: true });
}

/**
 * Fetch ALL quizzes (including hidden) for admin management.
 */
export async function fetchAllQuizzes(examType = null) {
  const cols = getCollections(examType);
  const snap = await getDocs(collection(db, cols.quizzes));
  let quizzes = snap.docs.map((d) => ({ date: d.id, ...d.data() }));
  if (examType && !cols.separate) {
    quizzes = quizzes.filter((q) => (q.examType || 'UPSC') === examType);
  }
  return quizzes.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Fetch a quiz with all its questions for editing.
 */
export async function fetchQuizForEdit(date, examType = 'UPSC') {
  const { quizzes } = getCollections(examType);
  const metaSnap = await getDoc(doc(db, quizzes, date));
  if (!metaSnap.exists()) return null;
  const questionsSnap = await getDocs(
    query(collection(db, quizzes, date, 'questions'), orderBy('__name__'))
  );
  return {
    ...metaSnap.data(),
    questions: questionsSnap.docs.map((d) => d.data()),
  };
}

/**
 * Publish a quiz for a given date.
 * @param {string} date - "YYYY-MM-DD"
 * @param {{ title: string, subject: string, publishAt?: string, examType?: string }} meta
 * @param {Array<{ question, options, correct }>} questions
 */
export async function publishQuiz(date, meta, questions) {
  const { quizzes } = getCollections(meta.examType || 'UPSC');
  const quizRef = doc(db, quizzes, date);
  const { publishAt, ...restMeta } = meta;

  await setDoc(quizRef, {
    ...restMeta,
    examType: meta.examType || 'UPSC',
    totalQuestions: questions.length,
    published: !publishAt,
    ...(publishAt ? { publishAt } : {}),
    createdAt: new Date().toISOString(),
  });

  const questionsRef = collection(db, quizzes, date, 'questions');

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
export async function fetchQuiz(date = getTodayDate(), examType = 'UPSC') {
  const { quizzes } = getCollections(examType);
  const quizRef = doc(db, quizzes, date);
  const metaSnap = await getDoc(quizRef);

  if (!metaSnap.exists()) return null;
  const data = metaSnap.data();
  const isLive = data.published || (data.publishAt && new Date() >= new Date(data.publishAt));
  if (!isLive) return null;

  const meta = data;

  const questionsSnap = await getDocs(
    query(collection(db, quizzes, date, 'questions'), orderBy('__name__'))
  );

  const questions = questionsSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return { date, ...meta, questions };
}

/**
 * Fetch list of recent published quizzes (for the quiz listing page).
 * @param {number} count - Number of quizzes to return
 * @param {string} examType - Filter by exam type (e.g., 'UPSC', 'UPPCS-2026'). If not provided, returns all exams.
 */
export async function fetchRecentQuizzes(count = 30, examType = null) {
  // Fetch all, filter + sort client-side to avoid composite index requirement
  const cols = getCollections(examType);
  const snap = await getDocs(collection(db, cols.quizzes));
  let quizzes = snap.docs
    .map((d) => ({ date: d.id, ...d.data() }))
    .filter((q) => q.published || (q.publishAt && new Date() >= new Date(q.publishAt)));

  // Filter by examType if provided
  if (examType && !cols.separate) {
    quizzes = quizzes.filter((q) => (q.examType || 'UPSC') === examType);
  }

  return quizzes
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
 * @param {string} examType - exam type (UPSC, UPPCS-2026, etc)
 */
export async function saveAttempt(userId, date, result, userInfo = {}, examType = 'UPSC') {
  const { score, correct, incorrect, skipped, timeTaken } = result;
  const now = new Date().toISOString();
  const cols = getCollections(examType);

  // Check if already attempted — don't double-count userStats
  const attemptRef = doc(db, cols.attempts, `${userId}_${date}`);
  const existingAttempt = await getDoc(attemptRef);
  const isFirstAttempt = !existingAttempt.exists();

  await setDoc(attemptRef, {
    userId,
    date,
    examType,
    displayName: userInfo.displayName || 'Anonymous',
    email: userInfo.email || '',
    phone: userInfo.phone || userId,
    score, correct, incorrect, skipped, timeTaken,
    attemptedAt: now,
  });

  const examStatsRef = doc(db, cols.stats, statsDocId(userId, examType));

  // Only update stats on first attempt for this date
  if (!isFirstAttempt) {
    const examStatsSnap = await getDoc(examStatsRef);
    const examTypeTotalScore = examStatsSnap.data()?.totalScore ?? score;
    if (cols.separate) return { totalScore: examTypeTotalScore, examTypeTotalScore };
    const allStatsSnap = await getDoc(doc(db, 'userStats', userId));
    return {
      totalScore: allStatsSnap.data()?.totalScore ?? score,
      examTypeTotalScore,
    };
  }

  // Merge this attempt into a stats doc; returns the new total score.
  const applyStats = async (ref, snap, extra) => {
    const ex = snap.exists() ? snap.data() : null;
    const newTotal = ex ? parseFloat(((ex.totalScore || 0) + score).toFixed(2)) : score;
    await setDoc(ref, {
      ...extra,
      displayName: userInfo.displayName || ex?.displayName || 'Anonymous',
      email: userInfo.email || ex?.email || '',
      phone: userId,
      totalScore: newTotal,
      bestScore: Math.max(ex?.bestScore || 0, score),
      attemptCount: (ex?.attemptCount || 0) + 1,
      totalCorrect: (ex?.totalCorrect || 0) + correct,
      totalIncorrect: (ex?.totalIncorrect || 0) + incorrect,
      lastAttemptDate: date,
      lastAttemptAt: now,
    });
    return newTotal;
  };

  const examStatsSnap = await getDoc(examStatsRef);

  // Separate collections (CSAT) never touch the all-exams `userStats` aggregate.
  if (cols.separate) {
    const total = await applyStats(examStatsRef, examStatsSnap, { userId, examType });
    return { totalScore: total, examTypeTotalScore: total };
  }

  const statsRef = doc(db, 'userStats', userId);
  const statsSnap = await getDoc(statsRef);
  const newTotalScore = await applyStats(statsRef, statsSnap, {});
  const newExamTypeTotalScore = await applyStats(examStatsRef, examStatsSnap, { userId, examType });

  return { totalScore: newTotalScore, examTypeTotalScore: newExamTypeTotalScore };
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

/**
 * Fetch top 10 scores for a given quiz date and exam type.
 * Tries server-side sort (needs composite index: date ASC, score DESC).
 * Falls back to client-side sort if index is not ready yet.
 * @param {string} date - quiz date
 * @param {string} examType - exam type filter (UPSC, UPPCS-2026, etc)
 */
export async function fetchLeaderboard(date, examType = 'UPSC') {
  const attemptsCol = getCollections(examType).attempts;
  const filters = examFilter(examType);
  const sortWithTiebreaker = (arr) =>
    arr.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken).slice(0, 10);
  try {
    const snap = await getDocs(
      query(
        collection(db, attemptsCol),
        where('date', '==', date),
        ...filters,
        orderBy('score', 'desc'),
        limit(10)
      )
    );
    return sortWithTiebreaker(snap.docs.map((d) => d.data()));
  } catch {
    const snap = await getDocs(
      query(
        collection(db, attemptsCol),
        where('date', '==', date),
        ...filters
      )
    );
    return sortWithTiebreaker(snap.docs.map((d) => d.data()));
  }
}

/**
 * Get a user's daily rank and total participants for a given date and exam type.
 * Uses count queries — always 2 reads regardless of participant count.
 * Requires same composite index as fetchLeaderboard: date ASC, score DESC
 * @param {string} examType - exam type filter
 * @returns {{ rank: number, total: number }}
 */
export async function fetchUserDailyRank(phone, date, userScore, userTimeTaken, examType = 'UPSC') {
  const attemptsCol = getCollections(examType).attempts;
  const filters = examFilter(examType);
  try {
    const [higherScoreSnap, sameScoreFasterSnap, totalSnap] = await Promise.all([
      // People who scored strictly higher
      getCountFromServer(query(
        collection(db, attemptsCol),
        where('date', '==', date),
        ...filters,
        where('score', '>', userScore)
      )),
      // People with same score but faster time (tiebreaker)
      getCountFromServer(query(
        collection(db, attemptsCol),
        where('date', '==', date),
        ...filters,
        where('score', '==', userScore),
        where('timeTaken', '<', userTimeTaken)
      )),
      getCountFromServer(query(
        collection(db, attemptsCol),
        where('date', '==', date),
        ...filters
      )),
    ]);
    return {
      rank: higherScoreSnap.data().count + sameScoreFasterSnap.data().count + 1,
      total: totalSnap.data().count,
    };
  } catch {
    const snap = await getDocs(
      query(
        collection(db, attemptsCol),
        where('date', '==', date),
        ...filters
      )
    );
    const all = snap.docs.map((d) => d.data());
    const rank = all.filter((a) => a.score > userScore || (a.score === userScore && a.timeTaken < userTimeTaken)).length + 1;
    return { rank, total: all.length };
  }
}

/**
 * Fetch top users by cumulative total score for a specific exam type.
 * Reads the incrementally-maintained `userStatsByExam` collection (kept up to
 * date by saveAttempt) instead of scanning all `attempts`.
 * Requires composite index: userStatsByExam — examType Ascending, totalScore Descending.
 * @param {number} count - number of users to return
 * @param {string} examType - filter by exam type (UPSC, UPPCS-2026, etc). Defaults to 'UPSC'.
 */
export async function fetchCumulativeLeaderboard(count = 10, examType = null) {
  const effectiveExamType = examType || 'UPSC';
  const snap = await getDocs(
    query(
      collection(db, getCollections(effectiveExamType).stats),
      ...examFilter(effectiveExamType),
      orderBy('totalScore', 'desc'),
      limit(count || 10)
    )
  );
  return snap.docs.map((d) => d.data());
}

/**
 * Get a user's all-time rank and total participants for an exam type.
 * Reads the incrementally-maintained `userStatsByExam` collection via count
 * queries (always exactly 2 reads regardless of collection size) instead of
 * scanning all `attempts`.
 * Requires composite index: userStatsByExam — examType Ascending, totalScore Descending.
 * @param {string} examType - exam type for ranking (UPSC, UPPCS-2026, etc). Defaults to 'UPSC'.
 * @returns {{ rank: number, total: number }}
 */
export async function fetchUserCumulativeRank(phone, userTotalScore, examType = null) {
  const effectiveExamType = examType || 'UPSC';
  const statsCol = getCollections(effectiveExamType).stats;
  const filters = examFilter(effectiveExamType);
  try {
    const [higherSnap, totalSnap] = await Promise.all([
      getCountFromServer(query(
        collection(db, statsCol),
        ...filters,
        where('totalScore', '>', userTotalScore || 0)
      )),
      getCountFromServer(query(
        collection(db, statsCol),
        ...filters
      )),
    ]);
    return {
      rank: higherSnap.data().count + 1,
      total: totalSnap.data().count,
    };
  } catch (err) {
    return { rank: 0, total: 0 };
  }
}

/**
 * Fetch a single user's cumulative stats for a specific exam type.
 */
export async function fetchUserExamStats(phone, examType = 'UPSC') {
  const snap = await getDoc(doc(db, getCollections(examType).stats, statsDocId(phone, examType)));
  return snap.exists() ? snap.data() : null;
}

// ─── Admin: Download Reports ──────────────────────────────────────────────────

/**
 * Fetch ALL attempts for a given date (for admin download).
 * Returns sorted array: score DESC, timeTaken ASC.
 */
export async function fetchDailyAttemptsAll(date, examType = null) {
  const cols = getCollections(examType);
  const snap = await getDocs(
    query(collection(db, cols.attempts), where('date', '==', date))
  );
  let attempts = snap.docs.map((d) => d.data());
  // Client-side filter so legacy attempts without an examType count as 'UPSC'
  if (examType && !cols.separate) {
    attempts = attempts.filter((a) => (a.examType || 'UPSC') === examType);
  }
  return attempts
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

/**
 * Fetch cumulative stats filtered by exam type (for admin downloads).
 * Reads the incrementally-maintained `userStatsByExam` collection instead of
 * scanning all `attempts`.
 * Requires composite index: userStatsByExam — examType Ascending, totalScore Descending.
 */
export async function fetchAllUserStatsByExamType(examType = 'UPSC') {
  const snap = await getDocs(
    query(
      collection(db, getCollections(examType).stats),
      ...examFilter(examType),
      orderBy('totalScore', 'desc')
    )
  );
  return snap.docs.map((d) => d.data());
}

// ─── Admin: Stats ────────────────────────────────────────────────────────────

/**
 * Fetch admin dashboard stats:
 * - totalStudents, totalAttempts
 * - perQuizAttempts: [{ date, attempts, avgScore }]
 * - scoreDistribution: [{ range, count }]
 */
export async function fetchAdminStats(examType = 'UPSC') {
  const cols = getCollections(examType);
  // Separate collections (CSAT) have their own student count; the default
  // collections use the all-exams `userStats` count as before.
  const [attemptsSnap, usersSnap] = await Promise.all([
    getDocs(collection(db, cols.attempts)),
    getCountFromServer(collection(db, cols.separate ? cols.stats : 'userStats')),
  ]);

  // Client-side filter (not a Firestore `where`) so legacy attempts written
  // before the examType field existed still count as 'UPSC' instead of being
  // silently excluded by an equality filter that can't match a missing field.
  const allAttempts = attemptsSnap.docs.map(d => d.data());
  const attempts = cols.separate
    ? allAttempts
    : allAttempts.filter(a => (a.examType || 'UPSC') === examType);
  const totalStudents = usersSnap.data().count;
  const totalAttempts = attempts.length;

  // Per-quiz attempt counts + avg score
  const quizMap = {};
  attempts.forEach(a => {
    if (!quizMap[a.date]) quizMap[a.date] = { date: a.date, attempts: 0, totalScore: 0 };
    quizMap[a.date].attempts++;
    quizMap[a.date].totalScore += a.score || 0;
  });
  const perQuizAttempts = Object.values(quizMap)
    .map(q => ({ date: q.date, attempts: q.attempts, avgScore: parseFloat((q.totalScore / q.attempts).toFixed(1)) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Score distribution buckets
  const buckets = { '≤0': 0, '1-5': 0, '6-10': 0, '11-15': 0, '16-20': 0, '20+': 0 };
  attempts.forEach(a => {
    const s = a.score || 0;
    if (s <= 0) buckets['≤0']++;
    else if (s <= 5) buckets['1-5']++;
    else if (s <= 10) buckets['6-10']++;
    else if (s <= 15) buckets['11-15']++;
    else if (s <= 20) buckets['16-20']++;
    else buckets['20+']++;
  });
  const scoreDistribution = Object.entries(buckets).map(([range, count]) => ({ range, count }));

  return { totalStudents, totalAttempts, perQuizAttempts, scoreDistribution };
}

// ─── User History ─────────────────────────────────────────────────────────────

/**
 * Fetch all attempts by a specific user, ordered by date descending.
 */
export async function fetchUserAttempts(userId, limitCount = 30, examType = 'UPSC') {
  const snap = await getDocs(
    query(collection(db, getCollections(examType).attempts), where('userId', '==', userId))
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
export async function fetchUserAttempt(userId, date, examType = 'UPSC') {
  const snap = await getDoc(doc(db, getCollections(examType).attempts, `${userId}_${date}`));
  return snap.exists() ? snap.data() : null;
}
