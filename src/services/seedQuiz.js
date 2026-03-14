/**
 * Seed script — pushes a sample quiz to Firestore for testing.
 * Run once from the browser console or a temporary button in the app.
 */

import { publishQuiz } from './quizService';

const SAMPLE_DATE = '2026-03-14';

const SAMPLE_META = {
  title: 'Daily Quiz — 14 March 2026',
  subject: 'General Studies',
};

const SAMPLE_QUESTIONS = [
  {
    question: 'Which Article of the Indian Constitution deals with the Right to Education?',
    options: ['Article 19', 'Article 21A', 'Article 32', 'Article 45'],
    correct: 1,
  },
  {
    question: 'Who wrote "The Discovery of India"?',
    options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Patel', 'B.R. Ambedkar'],
    correct: 1,
  },
  {
    question: 'Which river is known as the "Sorrow of Bihar"?',
    options: ['Ganga', 'Kosi', 'Son', 'Gandak'],
    correct: 1,
  },
  {
    question: 'The Preamble of the Indian Constitution was amended by which Amendment Act?',
    options: ['42nd Amendment', '44th Amendment', '52nd Amendment', '61st Amendment'],
    correct: 0,
  },
  {
    question: 'Which organization publishes the Human Development Index (HDI)?',
    options: ['World Bank', 'IMF', 'UNDP', 'WHO'],
    correct: 2,
  },
  {
    question: 'The "Green Revolution" in India was primarily associated with which crop?',
    options: ['Rice', 'Wheat', 'Maize', 'Sugarcane'],
    correct: 1,
  },
  {
    question: 'Which Article of the Constitution empowers the President to proclaim National Emergency?',
    options: ['Article 352', 'Article 356', 'Article 360', 'Article 368'],
    correct: 0,
  },
  {
    question: 'The Headquarters of the International Monetary Fund (IMF) is located in:',
    options: ['New York', 'Geneva', 'Washington D.C.', 'London'],
    correct: 2,
  },
  {
    question: 'Which Mughal emperor built the Taj Mahal?',
    options: ['Akbar', 'Jahangir', 'Shah Jahan', 'Aurangzeb'],
    correct: 2,
  },
  {
    question: 'The "Doctrine of Lapse" was introduced by which Governor-General?',
    options: ['Lord Dalhousie', 'Lord Wellesley', 'Lord Cornwallis', 'Lord Hastings'],
    correct: 0,
  },
];

export async function seedSampleQuiz() {
  const result = await publishQuiz(SAMPLE_DATE, SAMPLE_META, SAMPLE_QUESTIONS);
  console.log('✅ Seed quiz published:', result);
  return result;
}
