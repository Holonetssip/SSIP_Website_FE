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
 * @param {{ title: string, subject: string, publishAt?: string, examType?: string }} meta
 * @param {Array<{ question, options, correct }>} questions
 */
export async function publishQuiz(date, meta, questions) {
  const quizRef = doc(db, 'quizzes', date);
  const { publishAt, ...restMeta } = meta;

  await setDoc(quizRef, {
    ...restMeta,
    examType: meta.examType || 'UPSC',
    totalQuestions: questions.length,
    published: !publishAt,
    ...(publishAt ? { publishAt } : {}),
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

  if (!metaSnap.exists()) return null;
  const data = metaSnap.data();
  const isLive = data.published || (data.publishAt && new Date() >= new Date(data.publishAt));
  if (!isLive) return null;

  const meta = data;

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
 * @param {number} count - Number of quizzes to return
 * @param {string} examType - Filter by exam type (e.g., 'UPSC', 'UPPCS-2026'). If not provided, returns all exams.
 */
export async function fetchRecentQuizzes(count = 30, examType = null) {
  // Fetch all, filter + sort client-side to avoid composite index requirement
  const snap = await getDocs(collection(db, 'quizzes'));
  let quizzes = snap.docs
    .map((d) => ({ date: d.id, ...d.data() }))
    .filter((q) => q.published || (q.publishAt && new Date() >= new Date(q.publishAt)));

  // Filter by examType if provided
  if (examType) {
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

  // Check if already attempted — don't double-count userStats
  const attemptRef = doc(db, 'attempts', `${userId}_${date}`);
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

  // Only update userStats on first attempt for this date
  if (!isFirstAttempt) return { totalScore: (await getDoc(doc(db, 'userStats', userId))).data()?.totalScore ?? score };

  const statsRef = doc(db, 'userStats', userId);
  const statsSnap = await getDoc(statsRef);
  let newTotalScore;

  // Create exam-type specific field names
  const examSpecificFields = {
    [`totalScore_${examType}`]: 0,
    [`bestScore_${examType}`]: 0,
    [`attemptCount_${examType}`]: 0,
    [`totalCorrect_${examType}`]: 0,
    [`totalIncorrect_${examType}`]: 0,
  };

  if (statsSnap.exists()) {
    const existing = statsSnap.data();
    newTotalScore = parseFloat(((existing.totalScore || 0) + score).toFixed(2));
    const examSpecificScore = parseFloat(((existing[`totalScore_${examType}`] || 0) + score).toFixed(2));

    await setDoc(statsRef, {
      displayName: userInfo.displayName || existing.displayName,
      email: userInfo.email || existing.email,
      phone: userId,
      // Overall stats (all exams combined)
      totalScore: newTotalScore,
      bestScore: Math.max(existing.bestScore || 0, score),
      attemptCount: (existing.attemptCount || 0) + 1,
      totalCorrect: (existing.totalCorrect || 0) + correct,
      totalIncorrect: (existing.totalIncorrect || 0) + incorrect,
      // Exam-type specific stats
      [`totalScore_${examType}`]: examSpecificScore,
      [`bestScore_${examType}`]: Math.max(existing[`bestScore_${examType}`] || 0, score),
      [`attemptCount_${examType}`]: (existing[`attemptCount_${examType}`] || 0) + 1,
      [`totalCorrect_${examType}`]: (existing[`totalCorrect_${examType}`] || 0) + correct,
      [`totalIncorrect_${examType}`]: (existing[`totalIncorrect_${examType}`] || 0) + incorrect,
      lastAttemptDate: date,
      lastAttemptAt: now,
    }, { merge: true });
  } else {
    newTotalScore = score;
    await setDoc(statsRef, {
      displayName: userInfo.displayName || 'Anonymous',
      email: userInfo.email || '',
      phone: userId,
      // Overall stats
      totalScore: newTotalScore,
      bestScore: score,
      attemptCount: 1,
      totalCorrect: correct,
      totalIncorrect: incorrect,
      // Exam-type specific stats
      [`totalScore_${examType}`]: score,
      [`bestScore_${examType}`]: score,
      [`attemptCount_${examType}`]: 1,
      [`totalCorrect_${examType}`]: correct,
      [`totalIncorrect_${examType}`]: incorrect,
      lastAttemptDate: date,
      lastAttemptAt: now,
    });
  }
  return { totalScore: newTotalScore };
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
  const sortWithTiebreaker = (arr) =>
    arr.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken).slice(0, 10);
  try {
    const snap = await getDocs(
      query(
        collection(db, 'attempts'),
        where('date', '==', date),
        where('examType', '==', examType),
        orderBy('score', 'desc'),
        limit(10)
      )
    );
    return sortWithTiebreaker(snap.docs.map((d) => d.data()));
  } catch {
    const snap = await getDocs(
      query(
        collection(db, 'attempts'),
        where('date', '==', date),
        where('examType', '==', examType)
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
  try {
    const [higherScoreSnap, sameScoreFasterSnap, totalSnap] = await Promise.all([
      // People who scored strictly higher
      getCountFromServer(query(
        collection(db, 'attempts'),
        where('date', '==', date),
        where('examType', '==', examType),
        where('score', '>', userScore)
      )),
      // People with same score but faster time (tiebreaker)
      getCountFromServer(query(
        collection(db, 'attempts'),
        where('date', '==', date),
        where('examType', '==', examType),
        where('score', '==', userScore),
        where('timeTaken', '<', userTimeTaken)
      )),
      getCountFromServer(query(
        collection(db, 'attempts'),
        where('date', '==', date),
        where('examType', '==', examType)
      )),
    ]);
    return {
      rank: higherScoreSnap.data().count + sameScoreFasterSnap.data().count + 1,
      total: totalSnap.data().count,
    };
  } catch {
    const snap = await getDocs(
      query(
        collection(db, 'attempts'),
        where('date', '==', date),
        where('examType', '==', examType)
      )
    );
    const all = snap.docs.map((d) => d.data());
    const rank = all.filter((a) => a.score > userScore || (a.score === userScore && a.timeTaken < userTimeTaken)).length + 1;
    return { rank, total: all.length };
  }
}

/**
 * Fetch top users by cumulative total score for a specific exam type.
 * @param {number} count - number of users to return
 * @param {string} examType - filter by exam type (UPSC, UPPCS-2026, etc). If null, returns all-time scores
 */
export async function fetchCumulativeLeaderboard(count = 10, examType = null) {
  const snap = await getDocs(collection(db, 'userStats'));
  let results = snap.docs.map((d) => d.data());

  // Sort by exam-type specific score if provided, otherwise by overall score
  if (examType) {
    const scoreField = `totalScore_${examType}`;
    results = results
      .map(user => ({
        ...user,
        totalScore: user[scoreField] || 0,
        bestScore: user[`bestScore_${examType}`] || 0,
        attemptCount: user[`attemptCount_${examType}`] || 0,
        totalCorrect: user[`totalCorrect_${examType}`] || 0,
      }))
      .filter(user => user.totalScore > 0) // Only show users with attempts in this exam
      .sort((a, b) => b.totalScore - a.totalScore);
  } else {
    results = results.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  }

  return results.slice(0, count || 10);
}

/**
 * Get a user's all-time rank and total registered users.
 * @param {string} examType - exam type for ranking (UPSC, UPPCS-2026, etc). If null, returns overall rank
 * @returns {{ rank: number, total: number }}
 */
export async function fetchUserCumulativeRank(phone, userTotalScore, examType = null) {
  try {
    if (examType) {
      // Get exam-type specific rank
      const scoreField = `totalScore_${examType}`;
      const snap = await getDocs(collection(db, 'userStats'));
      const allUsers = snap.docs.map(d => d.data());

      const usersWithScore = allUsers.filter(u => (u[scoreField] || 0) > 0);
      const higherCount = usersWithScore.filter(u => (u[scoreField] || 0) > userTotalScore).length;

      return {
        rank: higherCount + 1,
        total: usersWithScore.length,
      };
    } else {
      // Get overall rank across all exams
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
  } catch {
    // Fallback: calculate client-side
    const snap = await getDocs(collection(db, 'userStats'));
    const allUsers = snap.docs.map(d => d.data());

    if (examType) {
      const scoreField = `totalScore_${examType}`;
      const usersWithScore = allUsers.filter(u => (u[scoreField] || 0) > 0);
      const higherCount = usersWithScore.filter(u => (u[scoreField] || 0) > userTotalScore).length;
      return { rank: higherCount + 1, total: usersWithScore.length };
    }

    const higherCount = allUsers.filter(u => (u.totalScore || 0) > userTotalScore).length;
    return { rank: higherCount + 1, total: allUsers.length };
  }
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

// ─── Admin: Stats ────────────────────────────────────────────────────────────

/**
 * Fetch admin dashboard stats:
 * - totalStudents, totalAttempts
 * - perQuizAttempts: [{ date, attempts, avgScore }]
 * - scoreDistribution: [{ range, count }]
 */
export async function fetchAdminStats() {
  const [attemptsSnap, usersSnap, quizzesSnap] = await Promise.all([
    getDocs(collection(db, 'attempts')),
    getCountFromServer(collection(db, 'userStats')),
    getDocs(collection(db, 'quizzes')),
  ]);

  const attempts = attemptsSnap.docs.map(d => d.data());
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
