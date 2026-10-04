/**
 * One-time backfill script — populates `userStatsByExam` from historical
 * `attempts` data so per-exam-type cumulative leaderboards are correct
 * after switching reads away from full-collection scans.
 * Run once from the browser console or a temporary admin button.
 * Idempotent: recomputes fully from `attempts` each run, safe to re-run.
 */

import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

export async function backfillUserStatsByExam() {
  const snap = await getDocs(collection(db, 'attempts'));
  const agg = {};

  snap.docs.forEach((d) => {
    const a = d.data();
    const examType = a.examType || 'UPSC';
    const key = `${a.userId}_${examType}`;
    if (!agg[key]) {
      agg[key] = {
        userId: a.userId, examType,
        displayName: a.displayName || 'Anonymous',
        email: a.email || '', phone: a.phone || a.userId,
        totalScore: 0, bestScore: 0, attemptCount: 0,
        totalCorrect: 0, totalIncorrect: 0,
        lastAttemptDate: a.date, lastAttemptAt: a.attemptedAt,
      };
    }
    const s = agg[key];
    s.totalScore = parseFloat((s.totalScore + (a.score || 0)).toFixed(2));
    s.bestScore = Math.max(s.bestScore, a.score || 0);
    s.attemptCount += 1;
    s.totalCorrect += (a.correct || 0);
    s.totalIncorrect += (a.incorrect || 0);
    if (!s.lastAttemptAt || (a.attemptedAt && a.attemptedAt > s.lastAttemptAt)) {
      s.lastAttemptDate = a.date;
      s.lastAttemptAt = a.attemptedAt;
      s.displayName = a.displayName || s.displayName;
      s.email = a.email || s.email;
    }
  });

  const entries = Object.entries(agg);
  console.log(`Backfilling ${entries.length} userStatsByExam docs from ${snap.size} attempts...`);

  const CHUNK = 450; // Firestore batched writes cap at 500 ops
  for (let i = 0; i < entries.length; i += CHUNK) {
    const batch = writeBatch(db);
    entries.slice(i, i + CHUNK).forEach(([key, stats]) => {
      batch.set(doc(db, 'userStatsByExam', key), stats);
    });
    await batch.commit();
    console.log(`  ...wrote ${Math.min(i + CHUNK, entries.length)}/${entries.length}`);
  }
  console.log('✅ Backfill complete.');
  return { attemptsScanned: snap.size, statsWritten: entries.length };
}
