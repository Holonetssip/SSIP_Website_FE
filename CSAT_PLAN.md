# CSAT-2026 Quiz Tab: Implementation Plan

## Decisions (confirmed)

| Question | Decision |
|---|---|
| Exam ID | `CSAT-2026` |
| Telegram link | Same as UPPCS: `https://t.me/uppcswithssip` |
| Isolation from UPSC / UPPCS | Fully isolated (own collections, own leaderboard, excluded from overall `userStats`) |
| Time limit / marking scheme | Same as existing quizzes (no change) |
| Quizzes per day | One per date (same as today) |
| Users collection | CSAT gets its own: `csat_users` |

## Current architecture (summary)

- Data layer: `src/services/quizService.js`. Firebase init: `src/services/firebase.js`.
- Existing collections: `users`, `quizzes` (+ `questions` subcollection), `attempts`, `userStats` (all exams combined), `userStatsByExam`.
- The "tab" is the `?exam=` query param, chosen from the Navbar Quiz dropdown (`src/components/Navbar.jsx:36-39`, mobile `:179`). There is no in-page tab bar.
- No Firestore rules or indexes are in the repo; they are managed in the Firebase console.

## New Firestore collections (CSAT only)

| Existing | CSAT-2026 |
|---|---|
| `users` | `csat_users` |
| `quizzes` | `csat_quizzes` |
| `quizzes/{date}/questions` | `csat_quizzes/{date}/questions` |
| `attempts` | `csat_attempts` |
| `userStatsByExam` | `csat_userStats` |

Doc shapes are identical to the existing ones. Keep `examType: 'CSAT-2026'` in the docs for uniform UI/export code.

- `csat_userStats/{phone}`: same fields as `userStatsByExam`. The doc ID is just the phone number, since the whole collection is CSAT.
- CSAT attempts never write to the legacy `userStats`.
- CSAT queries do not need `where('examType', ...)`, so the cumulative leaderboard is a plain `orderBy(totalScore desc)` with no composite index.

## Code approach: collection-name resolver

In `quizService.js`:

```js
export const EXAM_TYPES = ['UPSC', 'UPPCS-2026', 'CSAT-2026'];

const COLLECTIONS = {
  default:      { users: 'users',      quizzes: 'quizzes',      attempts: 'attempts',      stats: 'userStatsByExam', sharedExamField: true },
  'CSAT-2026':  { users: 'csat_users', quizzes: 'csat_quizzes', attempts: 'csat_attempts', stats: 'csat_userStats',  sharedExamField: false },
};
export const getCollections = (exam) => COLLECTIONS[exam] || COLLECTIONS.default;
```

- Every exam-aware function takes `examType` (default `'UPSC'`) and uses `getCollections(examType)`.
- For default collections the existing `where('examType', '==', ...)` clauses and `${userId}_${examType}` stats IDs stay exactly as they are. For CSAT the clause is skipped and the stats doc ID is `userId`.
- Functions to make exam-aware:
  `upsertUser`, `toggleQuizPublished`, `fetchAllQuizzes`, `fetchQuizForEdit`, `publishQuiz`, `fetchQuiz`, `fetchRecentQuizzes`, `saveAttempt`, `fetchUserAttempt`, `fetchUserAttempts`, `fetchLeaderboard`, `fetchUserDailyRank`, `fetchDailyAttemptsAll`, `fetchCumulativeLeaderboard`, `fetchUserCumulativeRank`, `fetchUserExamStats`, `fetchAllUserStatsByExamType`, `fetchAdminStats`.
- `fetchAdminStats` for CSAT reads only `csat_attempts`, `csat_quizzes`, `csat_userStats` (count = total students).
- Rule for the refactor: the UPSC and UPPCS-2026 code paths must behave exactly as before.

## File-by-file changes

1. **`src/services/quizService.js`**: resolver above, thread `examType` through all functions, CSAT branches (no exam filter, stats ID = phone, skip legacy `userStats` write, write profile to `csat_users`). `saveAttempt` keeps the same return shape.
2. **`src/components/Navbar.jsx`** (`:36-39`): add `{ id: 'CSAT-2026', link: '/quiz?exam=CSAT-2026', icon: <Award/>, desc: 'Civil Services Aptitude Test' }`. The mobile menu reads the same array.
3. **`src/pages/QuizPage.jsx`**
   - `:17` validate against `EXAM_TYPES` instead of the UPPCS-only check.
   - `:18` map the Telegram link: CSAT-2026 uses the UPPCS link.
   - `:149` add a CSAT subtitle.
   - `:219`, `:338`, `:342` append `&exam=${examType}` to the attempt and review links.
4. **`src/pages/QuizAttempt.jsx`**: read `exam` from the URL and pass it to `fetchQuiz` (`:60`), `fetchUserAttempt` (`:130`), `saveAttempt` (`:179-184`) and the leaderboard/rank calls (`:201-213`). Replace `quizData?.examType || 'UPSC'` with the URL exam. Back-link (`:283`) becomes `/quiz?exam=${exam}`. Keep the `'UPSC'` fallback so old links work.
5. **`src/pages/QuizReview.jsx`**: read `exam`, pass it to `fetchQuiz` (`:103`), fix back-links (`:121`, `:130`), check the PDF filename/title for hardcoded exam labels.
6. **`src/pages/GlobalLeaderboard.jsx`**: use `EXAM_TYPES` for the toggle (`:117`) and validate the `exam` param (`:12`).
7. **`src/pages/QuizAdmin.jsx`**
   - Replace the hardcoded toggles (`:696`, `:749`) and the `<option>` list (`:1023-1027`) with `EXAM_TYPES`.
   - Manage list: add an exam selector; pass the exam to `fetchAllQuizzes` (`:306`), `fetchQuizForEdit` (`:350`), `toggleQuizPublished` (`:337`), `publishQuiz` (`:407`).
   - Lock the exam-type select while editing (`editingDate` set) to avoid duplicates across collections.
   - Daily report (`:226-231`): add an exam selector, call `fetchDailyAttemptsAll(reportDate, exam)`, include the exam in the filename.
8. **`src/App.jsx`**: no route changes (exam travels as a query param).
9. **Leave unchanged**: `migrateUserStatsByExam.js`, `seedQuiz.js`, the UPSC calculator files.

## Firestore rules (draft)

The repo has no rules file and I don't know your current rules, so this draft covers **only the four new collections**. Merge it into your existing rules in the Firebase console, mirroring whatever access you already give `users`, `quizzes`, `attempts` and `userStatsByExam`. The version below is a permissive placeholder matching a client-only-auth app; tighten it to match your existing rules.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /csat_users/{phone} {
      allow read, write: if true;
    }

    match /csat_quizzes/{date} {
      allow read: if true;
      allow write: if request.auth != null;   // admin publish
      match /questions/{qid} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }

    match /csat_attempts/{attemptId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }

    match /csat_userStats/{phone} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

Without these, CSAT calls fail with "permission denied".

## Indexes

- `csat_userStats`: none (single-field `orderBy(totalScore)`).
- `csat_attempts`: composite `date ASC, score DESC` for the daily leaderboard, and `date, score, timeTaken` for rank queries. Existing code falls back to client-side sorting if missing, so this is a performance concern, not a breakage.

## Risks

- **Main risk:** regressing UPSC / UPPCS-2026 while refactoring shared functions. Mitigate by defaulting `examType` to `'UPSC'`, keeping the default path unchanged, and manually testing publish, attempt, leaderboard and admin exports for UPSC and UPPCS-2026 before shipping.
- **Rules:** CSAT is blocked until the rules are applied.
- **One quiz per date** within CSAT (doc ID is the date), same as today.
- **Old links** without `exam` resolve to UPSC, which is correct. CSAT links must include `&exam=CSAT-2026`.
- **No migration:** existing data is untouched and CSAT starts empty.
- **Bot (phase 7, not built):** should reuse the same resolver/config when built, so collection names aren't hardcoded twice.

## Test checklist

- [ ] CSAT-2026 appears in the Navbar Quiz dropdown (desktop and mobile).
- [ ] Publish a CSAT quiz in admin; it lands in `csat_quizzes`, not `quizzes`.
- [ ] `/quiz?exam=CSAT-2026` lists only CSAT quizzes; UPSC and UPPCS lists are unchanged.
- [ ] Attempt and submit; docs appear in `csat_attempts`, `csat_userStats`, `csat_users`; the legacy `userStats` is untouched.
- [ ] Daily and cumulative leaderboards show CSAT-only data.
- [ ] Admin stats, daily report and cumulative report work for CSAT-2026.
- [ ] Regression: UPSC and UPPCS-2026 flows still work end to end.
- [ ] Rules and indexes applied in the Firebase console.
