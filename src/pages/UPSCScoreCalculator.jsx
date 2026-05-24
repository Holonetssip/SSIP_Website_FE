import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, CheckCircle, XCircle, RotateCcw, ShieldAlert,
  Info, BookOpen, Target, TrendingUp, BarChart2, Check, ArrowLeft, 
  ChevronLeft, ChevronRight, Filter, Sparkles
} from 'lucide-react';

import { GS_SETS } from '../data/upsc/gs';
import { CSAT_SETS } from '../data/upsc/csat';

// Dynamic category list for GS and CSAT
const GS_CATEGORIES = ["Polity", "History", "Economy", "Geography", "Science"];
const CSAT_CATEGORIES = ["Quantitative Aptitude", "Reading Comprehension", "Logical Reasoning", "Data Interpretation"];

// Dynamic loader helper to construct visual questions array from set answer keys
const loadQuestionsFromSet = (setExport, sectionName) => {
  if (!setExport) return [];
  const list = [];
  const masterKey = setExport.masterKey || {};
  const metadata = setExport.questionMetadata || {};
  const totalQuestions = sectionName === "GS" ? 100 : 80;
  
  const defaultCategories = sectionName === "GS" ? GS_CATEGORIES : CSAT_CATEGORIES;
    
  for (let i = 1; i <= totalQuestions; i++) {
    const qKey = `Q${i}`;
    const correctAnswer = (masterKey[qKey] || "A").toUpperCase();
    const meta = metadata[qKey] || {};
    const category = meta.category || defaultCategories[(i - 1) % defaultCategories.length];
    const topic = meta.topic || `${category} Question ${i}`;
    
    list.push({
      id: i,
      correctAnswer,
      category,
      topic
    });
  }
  return list;
};

// Dynamic loader helper to construct visual coaching comparison keys
const loadCoachingKeysFromSet = (setExport, sectionName) => {
  if (!setExport) return [];
  const list = [];
  const coachingKeys = setExport.coachingKeys || {};
  const totalQuestions = sectionName === "GS" ? 100 : 80;
  
  const institutes = ["Vision IAS", "Vajiram & Ravi", "Insights IAS"];
  
  for (let i = 1; i <= totalQuestions; i++) {
    const qKey = `Q${i}`;
    const row = { id: i };
    
    institutes.forEach(inst => {
      const instKey = coachingKeys[inst] || {};
      const keyVal = instKey[qKey] || setExport.masterKey[qKey] || "A";
      
      if (inst === "Vision IAS") row.vision = keyVal.toUpperCase();
      else if (inst === "Vajiram & Ravi") row.vajiram = keyVal.toUpperCase();
      else if (inst === "Insights IAS") row.insights = keyVal.toUpperCase();
    });
    
    list.push(row);
  }
  return list;
};

const UPSCScoreCalculator = () => {
  // 1 = Configuration, 2 = OMR Input Panel, 3 = Performance Diagnostics
  const [currentStep, setCurrentStep] = useState(1);
  
  // Section: General Studies (GS) vs CSAT
  const [selectedSection, setSelectedSection] = useState(() => {
    return localStorage.getItem('upsc_omr_section') || "GS";
  });

  // Selected paper Set: Set A, Set B, Set C, Set D
  const [selectedSet, setSelectedSet] = useState(() => {
    return localStorage.getItem('upsc_omr_active_set') || "";
  });
  
  // OMR Grid pagination states (Step 2)
  const [currentPage, setCurrentPage] = useState(1);
  const QUESTIONS_PER_PAGE = 10;
  
  // Ledger table pagination states (Step 3)
  const [ledgerPage, setLedgerPage] = useState(1);
  const LEDGER_QUESTIONS_PER_PAGE = 10;

  // Defensive Maps question ID to user response. Ensures it resolves to an object even with corrupted local caches.
  const [userResponses, setUserResponses] = useState(() => {
    try {
      const saved = localStorage.getItem('upsc_omr_responses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
      return {};
    } catch {
      return {};
    }
  });

  // Keep track of which set responses belong to. Clears progress on mismatch to prevent grading errors.
  const [activeResponsesSet, setActiveResponsesSet] = useState(() => {
    return localStorage.getItem('upsc_omr_active_section_set') || "";
  });

  // Persistent Aspirant Profile state
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('upsc_omr_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            name: parsed.name || "",
            rollNumber: parsed.rollNumber || "",
            targetYear: parsed.targetYear || "2026",
            category: parsed.category || "General"
          };
        }
      }
    } catch {}
    return {
      name: "",
      rollNumber: "",
      targetYear: "2026",
      category: "General"
    };
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    rollNumber: ""
  });

  // Saved assessment notification popup modal
  const [showStoredNoticeModal, setShowStoredNoticeModal] = useState(false);

  // Step 3 optional filter by category
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  // Reset results page pagination to 1 when changing category filter
  useEffect(() => {
    setLedgerPage(1);
  }, [selectedCategoryFilter]);

  // Synchronize category list whenever section changes
  const categoriesList = selectedSection === "GS" ? GS_CATEGORIES : CSAT_CATEGORIES;

  // Resolve active sets
  const getSets = () => {
    return selectedSection === "GS" ? GS_SETS : CSAT_SETS;
  };

  const getQuestions = () => {
    if (!selectedSet) return [];
    const sets = getSets();
    const setExport = sets[selectedSet];
    return loadQuestionsFromSet(setExport, selectedSection);
  };

  const getCoachingKeys = () => {
    if (!selectedSet) return [];
    const sets = getSets();
    const setExport = sets[selectedSet];
    return loadCoachingKeysFromSet(setExport, selectedSection);
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setSelectedSet("");
    localStorage.setItem('upsc_omr_section', section);
    localStorage.removeItem('upsc_omr_active_set');
    setUserResponses({});
    localStorage.removeItem('upsc_omr_responses');
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem('upsc_omr_profile', JSON.stringify(updated));
      return updated;
    });
  };

  // Profile validation (Name and 7-digit UPSC Roll number are mandatory)
  const validateProfile = () => {
    const errors = { name: "", rollNumber: "" };
    let isValid = true;

    if (!profile.name.trim()) {
      errors.name = "Name is required.";
      isValid = false;
    }

    const rollRegex = /^\d{7}$/;
    if (!profile.rollNumber.trim()) {
      errors.rollNumber = "UPSC Roll number is required.";
      isValid = false;
    } else if (!rollRegex.test(profile.rollNumber)) {
      errors.rollNumber = "Roll Number must be exactly 7 digits.";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Sync user responses to localStorage
  const handleOptionSelect = (questionId, option) => {
    setUserResponses(prev => {
      const updated = { ...prev, [questionId]: option };
      localStorage.setItem('upsc_omr_responses', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearOption = (questionId) => {
    setUserResponses(prev => {
      const updated = { ...prev };
      delete updated[questionId];
      localStorage.setItem('upsc_omr_responses', JSON.stringify(updated));
      return updated;
    });
  };

  // Reset session answers
  const handleReset = () => {
    setUserResponses({});
    setSelectedSet("");
    setCurrentStep(1);
    setCurrentPage(1);
    setLedgerPage(1);
    setSelectedCategoryFilter("All");
    setValidationErrors({ name: "", rollNumber: "" });
    localStorage.removeItem('upsc_omr_responses');
    localStorage.removeItem('upsc_omr_active_set');
    localStorage.removeItem('upsc_omr_active_section_set');
    setActiveResponsesSet("");
  };

  const handleInitializeSet = () => {
    if (!validateProfile()) {
      return;
    }

    const compositeKey = `${selectedSection}_${selectedSet}`;
    // If set is different from last active set, clear previous responses
    if (activeResponsesSet !== compositeKey) {
      setUserResponses({});
      localStorage.removeItem('upsc_omr_responses');
      localStorage.setItem('upsc_omr_active_set', selectedSet);
      localStorage.setItem('upsc_omr_active_section_set', compositeKey);
      setActiveResponsesSet(compositeKey);
    }
    setCurrentStep(2);
    setCurrentPage(1);
  };

  // Marking engine parameters (GS: +2/-0.66, CSAT: +2.50/-0.83)
  const MARKS_CORRECT = selectedSection === "GS" ? 2.00 : 2.50;
  const MARKS_INCORRECT = selectedSection === "GS" ? -0.66 : -0.83;

  // Valuation engine calculations with complete defensive safety checks
  const gradingEngine = () => {
    const questions = getQuestions();
    if (questions.length === 0) {
      return {
        totalMarks: 0,
        correctCount: 0,
        incorrectCount: 0,
        omittedCount: 0,
        accuracyRate: 0,
        categoryBreakdown: {}
      };
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let omittedCount = 0;
    const categoryMetrics = {};

    questions.forEach(q => {
      const userAnswer = userResponses ? userResponses[q.id] : undefined;
      const isAttempted = userAnswer !== undefined;
      const isCorrect = isAttempted && userAnswer === q.correctAnswer;
      const isIncorrect = isAttempted && userAnswer !== q.correctAnswer;

      if (isCorrect) correctCount++;
      else if (isIncorrect) incorrectCount++;
      else omittedCount++;

      // Category tracking initialization
      if (!categoryMetrics[q.category]) {
        categoryMetrics[q.category] = {
          total: 0,
          attempted: 0,
          correct: 0,
          incorrect: 0,
          marks: 0
        };
      }

      categoryMetrics[q.category].total++;
      if (isAttempted) {
        categoryMetrics[q.category].attempted++;
        if (isCorrect) {
          categoryMetrics[q.category].correct++;
          categoryMetrics[q.category].marks += MARKS_CORRECT;
        } else {
          categoryMetrics[q.category].incorrect++;
          categoryMetrics[q.category].marks += MARKS_INCORRECT;
        }
      }
    });

    const totalMarks = (correctCount * MARKS_CORRECT) + (incorrectCount * MARKS_INCORRECT);
    const attemptedCount = correctCount + incorrectCount;
    const accuracyRate = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;

    return {
      totalMarks,
      correctCount,
      incorrectCount,
      omittedCount,
      accuracyRate,
      categoryBreakdown: categoryMetrics
    };
  };

  // Computes score compared to specific prep key
  const computeInstituteScore = (instName) => {
    const questions = getQuestions();
    const coachingKeysList = getCoachingKeys();
    if (questions.length === 0) return 0;
    
    let correctCount = 0;
    let incorrectCount = 0;

    questions.forEach(q => {
      const userAnswer = userResponses ? userResponses[q.id] : undefined;
      if (userAnswer === undefined) return; // Omit

      let instKey = q.correctAnswer; // Default fallback to master key

      const mockQ = coachingKeysList.find(k => k.id === q.id);
      if (mockQ) {
        if (instName === "Vision IAS") instKey = mockQ.vision;
        else if (instName === "Vajiram & Ravi") instKey = mockQ.vajiram;
        else if (instName === "Insights IAS") instKey = mockQ.insights;
      }

      if (userAnswer === instKey) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    return (correctCount * MARKS_CORRECT) + (incorrectCount * MARKS_INCORRECT);
  };

  const getInstituteAnswerKeyLabel = (questionId, instName) => {
    const coachingKeysList = getCoachingKeys();
    const mockQ = coachingKeysList.find(k => k.id === questionId);
    if (mockQ) {
      if (instName === "Vision") return mockQ.vision;
      if (instName === "Vajiram") return mockQ.vajiram;
      if (instName === "Insights") return mockQ.insights;
    }
    const questions = getQuestions();
    return questions.find(q => q.id === questionId)?.correctAnswer || "-";
  };

  const results = gradingEngine();
  const questionsList = getQuestions();
  const totalSetQuestions = questionsList.length;
  const attemptedCount = totalSetQuestions - results.omittedCount;

  // Paginated questions slicing for Step 2
  const indexOfLastQuestion = currentPage * QUESTIONS_PER_PAGE;
  const indexOfFirstQuestion = indexOfLastQuestion - QUESTIONS_PER_PAGE;
  const currentQuestions = questionsList.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(totalSetQuestions / QUESTIONS_PER_PAGE);

  // Institute comparative scores
  const scoreVision = computeInstituteScore("Vision IAS");
  const scoreVajiram = computeInstituteScore("Vajiram & Ravi");
  const scoreInsights = computeInstituteScore("Insights IAS");

  // Step 3 filter application
  const filteredLedger = questionsList.filter(q => {
    if (selectedCategoryFilter === "All") return true;
    return q.category === selectedCategoryFilter;
  });

  // Step 3 Ledger Table pagination slicing
  const ledgerLastIndex = ledgerPage * LEDGER_QUESTIONS_PER_PAGE;
  const ledgerFirstIndex = ledgerLastIndex - LEDGER_QUESTIONS_PER_PAGE;
  const paginatedLedgerList = filteredLedger.slice(ledgerFirstIndex, ledgerLastIndex);
  const totalLedgerPages = Math.max(1, Math.ceil(filteredLedger.length / LEDGER_QUESTIONS_PER_PAGE));

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50 to-transparent dark:from-indigo-950/10 pointer-events-none"></div>

      <div className="container mx-auto px-3 sm:px-6 relative z-10 max-w-6xl">
        
        {/* Step Navigation Progress Bar */}
        <div className="mb-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between relative">
            {/* Background Line */}
            <div className="absolute left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 top-1/2 z-0 rounded-full"></div>
            
            {/* Filled Progress Line */}
            <div 
              className="absolute left-0 h-1 bg-indigo-600 dark:bg-indigo-500 -translate-y-1/2 top-1/2 z-0 transition-all duration-500 rounded-full"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            ></div>

            {/* Step 1 Node */}
            <div className="z-10 flex flex-col items-center">
              <button 
                onClick={() => currentStep > 1 && setCurrentStep(1)}
                disabled={currentStep === 1}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  currentStep >= 1 
                    ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100 dark:ring-indigo-950' 
                    : 'bg-slate-200 dark:bg-slate-850 text-slate-500'
                }`}
              >
                {currentStep > 1 ? <Check size={16} /> : "1"}
              </button>
              <span className="text-xs font-semibold mt-2 text-slate-600 dark:text-slate-400 hidden sm:block">Configure</span>
            </div>

            {/* Step 2 Node */}
            <div className="z-10 flex flex-col items-center">
              <button 
                onClick={() => currentStep > 2 && setCurrentStep(2)}
                disabled={currentStep <= 2 || !selectedSet}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  currentStep >= 2 
                    ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100 dark:ring-indigo-950' 
                    : 'bg-slate-200 dark:bg-slate-850 text-slate-500'
                }`}
              >
                {currentStep > 2 ? <Check size={16} /> : "2"}
              </button>
              <span className="text-xs font-semibold mt-2 text-slate-600 dark:text-slate-400 hidden sm:block">OMR Matrix</span>
            </div>

            {/* Step 3 Node */}
            <div className="z-10 flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  currentStep === 3 
                    ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100 dark:ring-indigo-950' 
                    : 'bg-slate-200 dark:bg-slate-850 text-slate-500'
                }`}
              >
                3
              </div>
              <span className="text-xs font-semibold mt-2 text-slate-600 dark:text-slate-400 hidden sm:block">Diagnostics</span>
            </div>
          </div>
        </div>

        {/* Step Contents */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              {/* Header */}
              <div className="text-center mb-8 md:mb-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-100 dark:border-indigo-900/50">
                  <Sparkles size={13} /> OMR Assessment Module
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                  Civil Services Preliminary Examination Assessment Node
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium">
                  Evaluate GS & CSAT exam sets and cross-reference your scores against prominent prep institute answer keys.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                {/* Configuration controls */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Step 1.1: Select Section */}
                  <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Sparkles size={18} className="text-indigo-500" />
                      1. Select Exam Paper Section
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 sm:mb-6 font-medium">
                      Select which Civil Services Preliminary Exam section you wish to evaluate.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* GS Section Option */}
                      <button
                        type="button"
                        onClick={() => handleSectionSelect("GS")}
                        className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all relative overflow-hidden ${
                          selectedSection === "GS"
                            ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-950'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850/50 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className={`p-2.5 rounded-lg shrink-0 ${
                          selectedSection === "GS" ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          <BookOpen size={20} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            General Studies (GS)
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            100 Qs • 200 Marks • +2.00 / -0.66 marking scheme
                          </p>
                        </div>
                        {selectedSection === "GS" && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </button>

                      {/* CSAT Section Option */}
                      <button
                        type="button"
                        onClick={() => handleSectionSelect("CSAT")}
                        className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all relative overflow-hidden ${
                          selectedSection === "CSAT"
                            ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-950'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850/50 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className={`p-2.5 rounded-lg shrink-0 ${
                          selectedSection === "CSAT" ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          <Target size={20} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            Civil Services Aptitude Test (CSAT)
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            80 Qs • 200 Marks • +2.50 / -0.83 marking scheme
                          </p>
                        </div>
                        {selectedSection === "CSAT" && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Step 1.2: Select Set */}
                  <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <BookOpen size={18} className="text-indigo-500" />
                      2. Select Exam Paper Set
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 sm:mb-6 font-medium">
                      Pick one of the 4 distinct mock {selectedSection === "GS" ? "GS Paper-1" : "CSAT Paper-2"} sets to benchmark your preparation. Answers are pulled dynamically from dedicated set files.
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.keys(getSets()).map((setName) => {
                        const isSelected = selectedSet === setName;
                        return (
                          <button
                            key={setName}
                            type="button"
                            onClick={() => setSelectedSet(setName)}
                            className={`py-3.5 rounded-xl font-bold transition-all border text-center flex flex-col items-center justify-center relative overflow-hidden group ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-400 ring-2 ring-indigo-100 dark:ring-indigo-950'
                                : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="text-[10px] opacity-75 font-semibold">SET</span>
                            <span className="text-xl sm:text-2xl font-extrabold mt-0.5">{setName.split(" ")[1]}</span>
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center scale-90">
                                <Check size={10} strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 1.3: Profile config */}
                  <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Target size={18} className="text-indigo-500" />
                        3. Aspirant Profile Configuration
                      </h3>
                      <span className="text-[10px] font-black text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Mandatory to evaluate
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {/* Name input */}
                      <div>
                        <label htmlFor="aspirantName" className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                          Aspirant Name *
                        </label>
                        <input
                          id="aspirantName"
                          type="text"
                          placeholder="Enter your name"
                          value={profile.name}
                          onChange={(e) => {
                            handleProfileChange("name", e.target.value);
                            if (validationErrors.name) {
                              setValidationErrors(prev => ({ ...prev, name: "" }));
                            }
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border ${
                            validationErrors.name 
                              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' 
                              : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                          } focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 text-slate-900 dark:text-slate-100 font-bold text-sm transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner`}
                        />
                        {validationErrors.name && (
                          <span className="text-[11px] font-bold text-rose-550 mt-1 block">
                            {validationErrors.name}
                          </span>
                        )}
                      </div>

                      {/* UPSC Roll Number input */}
                      <div>
                        <label htmlFor="rollNumber" className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                          UPSC Roll Number (7 digits) *
                        </label>
                        <input
                          id="rollNumber"
                          type="text"
                          placeholder="e.g. 0812345"
                          value={profile.rollNumber}
                          onChange={(e) => {
                            handleProfileChange("rollNumber", e.target.value);
                            if (validationErrors.rollNumber) {
                              setValidationErrors(prev => ({ ...prev, rollNumber: "" }));
                            }
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border ${
                            validationErrors.rollNumber 
                              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' 
                              : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                          } focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 text-slate-900 dark:text-slate-100 font-bold text-sm transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner`}
                        />
                        {validationErrors.rollNumber && (
                          <span className="text-[11px] font-bold text-rose-550 mt-1 block">
                            {validationErrors.rollNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="targetYear" className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                          Target CSE Year
                        </label>
                        <select
                          id="targetYear"
                          value={profile.targetYear}
                          onChange={(e) => handleProfileChange("targetYear", e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-bold text-sm cursor-pointer transition-all duration-300 shadow-inner"
                        >
                          <option value="2026" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">2026</option>
                          <option value="2027" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">2027</option>
                          <option value="2028" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">2028</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="socialCategory" className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                          Social Category
                        </label>
                        <select
                          id="socialCategory"
                          value={profile.category}
                          onChange={(e) => handleProfileChange("category", e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-bold text-sm cursor-pointer transition-all duration-300 shadow-inner"
                        >
                          <option value="General" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">General</option>
                          <option value="EWS" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">EWS</option>
                          <option value="OBC" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">OBC</option>
                          <option value="SC" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">SC</option>
                          <option value="ST" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">ST</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scoring Parameters Widget */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <TrendingUp size={18} className="text-indigo-400" />
                      Marking Protocol ({selectedSection})
                    </h3>
                    <ul className="space-y-3.5 text-sm text-slate-300 font-medium">
                      <li className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                        <span>Right Response</span>
                        <span className="text-emerald-400 font-extrabold">+{MARKS_CORRECT.toFixed(2)} Marks</span>
                      </li>
                      <li className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                        <span>Negative Penalization</span>
                        <span className="text-rose-400 font-extrabold">{MARKS_INCORRECT.toFixed(2)} Marks</span>
                      </li>
                      <li className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                        <span>Omitted/Skipped Item</span>
                        <span className="text-slate-400 font-extrabold">0.00 Marks</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Simulated Scale</span>
                        <span className="text-indigo-300 font-extrabold">{selectedSection === "GS" ? "100 Qs (200 Marks)" : "80 Qs (200 Marks)"}</span>
                      </li>
                    </ul>

                    <div className="mt-6 flex items-start gap-2 bg-indigo-950/40 p-3 rounded-xl border border-indigo-900/30 text-xs text-indigo-300">
                      <Info size={14} className="shrink-0 mt-0.5" />
                      <span>
                        {selectedSection === "GS" 
                          ? "UPSC GS Paper-1 evaluation requires +2.00 for correct and -0.66 for incorrect items."
                          : "UPSC CSAT Paper-2 evaluation requires +2.50 for correct and -0.83 for incorrect items."
                        }
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!selectedSet}
                    onClick={handleInitializeSet}
                    className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-sm uppercase tracking-wider ${
                      selectedSet 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-98' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <span>Initialize Evaluation Matrix</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Back Link */}
              <div className="mb-6">
                <button 
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-bold"
                >
                  <ArrowLeft size={16} />
                  <span>Modify Configuration / Set selection</span>
                </button>
              </div>

              {/* Step Header */}
              <div className="mb-6 md:mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-850 pb-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/30">
                      {selectedSection} {selectedSet} Evaluation Matrix
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                      Interactive Answer Input Grid
                    </h2>
                  </div>
                  {profile.name && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">ASPIRANT</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-350">{profile.name} (Roll: {profile.rollNumber})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                
                {/* Left Side: OMR Grid list (Paginated to 10 questions per page) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="hidden sm:flex p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <span>Question Details & simulated syllabus categories</span>
                      <span>Bubble Options</span>
                    </div>
                    
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {currentQuestions.map((question) => {
                        const selectedOption = userResponses ? userResponses[question.id] : undefined;
                        const isAnswered = selectedOption !== undefined;
                        
                        return (
                          <div 
                            key={question.id} 
                            className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                              isAnswered ? 'bg-indigo-50/10 dark:bg-indigo-950/5' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/10'
                            }`}
                          >
                            {/* Question Details Block (Responsive font resizing) */}
                            <div className="max-w-md">
                              <div className="flex items-center gap-2.5 mb-1.5">
                                <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                                  Q{String(question.id).padStart(2, '0')}
                                </span>
                                <span className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                  question.category.includes("Polity") || question.category.includes("Quantitative") ? "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900" :
                                  question.category.includes("History") || question.category.includes("Reading") ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900" :
                                  question.category.includes("Economy") || question.category.includes("Logical") ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900" :
                                  "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900"
                                }`}>
                                  {question.category}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-350">
                                {question.topic}
                              </p>
                            </div>

                            {/* OMR Bubble selector options & touch-friendly tap targets */}
                            <div className="flex items-center justify-between sm:justify-start gap-2 border-t border-slate-100 dark:border-slate-850 sm:border-0 pt-3 sm:pt-0">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                {["A", "B", "C", "D"].map((option) => {
                                  const isCurrentOptionSelected = selectedOption === option;
                                  return (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={() => handleOptionSelect(question.id, option)}
                                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center justify-center border ${
                                        isCurrentOptionSelected
                                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-955/30 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                                      }`}
                                    >
                                      {option}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Clear / Omit Button */}
                              {isAnswered ? (
                                <button
                                  type="button"
                                  onClick={() => handleClearOption(question.id)}
                                  className="ml-2 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors px-2 py-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-indigo-950/20 border border-transparent hover:border-rose-200"
                                  title="Clear Response"
                                >
                                  Omit
                                </button>
                              ) : (
                                <span className="ml-2 text-xs font-semibold text-slate-400 italic select-none px-2 py-1.5">
                                  Omitted
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sleek YouTube-style Pagination Bar */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mt-4">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-750 flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-800"
                    >
                      <ChevronLeft size={14} />
                      <span>Previous 10 Qs</span>
                    </button>

                    <div className="text-xs font-bold text-slate-500 order-first sm:order-none">
                      Viewing questions <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{indexOfFirstQuestion + 1} - {Math.min(indexOfLastQuestion, totalSetQuestions)}</span> of <span className="font-extrabold text-slate-800 dark:text-slate-200">{totalSetQuestions}</span>
                    </div>

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-750 flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-800"
                    >
                      <span>Next 10 Qs</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Right Side: Sticky Summary Widget */}
                <div className="lg:sticky lg:top-28 space-y-6 w-full">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <BarChart2 size={18} className="text-indigo-500" />
                      OMR Summary Panel
                    </h3>
                    
                    {/* Completion Circular Progress Ring Simulation */}
                    <div className="flex flex-col items-center justify-center my-6">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          {/* Track */}
                          <circle 
                            cx="56" 
                            cy="56" 
                            r="48" 
                            className="stroke-slate-100 dark:stroke-slate-800 fill-none" 
                            strokeWidth="8"
                          />
                          {/* Progress */}
                          <circle 
                            cx="56" 
                            cy="56" 
                            r="48" 
                            className="stroke-indigo-600 dark:stroke-indigo-500 fill-none transition-all duration-300" 
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 48}
                            strokeDashoffset={2 * Math.PI * 48 * (1 - attemptedCount / totalSetQuestions)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">{attemptedCount}</span>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">/ {totalSetQuestions} Qs</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-500 mt-3">Attempt progress indicator</span>
                    </div>

                    <div className="space-y-3.5 mb-6 text-sm">
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 font-medium">
                        <span className="text-slate-500">Total Set Questions</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{totalSetQuestions}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 font-medium">
                        <span className="text-indigo-600 dark:text-indigo-400">Attempted Responses</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{attemptedCount}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 font-medium">
                        <span className="text-slate-400">Omitted (Skipped)</span>
                        <span className="font-bold text-slate-400">{results.omittedCount}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowStoredNoticeModal(true)}
                      className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 active:scale-98 transition-all uppercase tracking-wider text-xs"
                    >
                      <Award size={16} />
                      <span>Run Grading Protocol</span>
                    </button>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 flex items-start gap-2.5">
                    <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">
                      All responses are automatically saved locally. You can close this tab and resume your OMR evaluation sheet anytime without losing progress.
                    </span>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              {/* Header */}
              <div className="text-center mb-8 md:mb-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-900/30 mb-3">
                  <CheckCircle size={13} /> Evaluation completed successfully
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Performance Diagnostics Dashboard
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs sm:text-sm font-medium">
                  {profile.name ? `Aspirant: ${profile.name} (Roll No: ${profile.rollNumber}) • ` : ""} Section: <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedSection}</span> • Exam Set: <span className="font-bold text-slate-705 dark:text-slate-350">{selectedSet}</span> ({profile.category} Category)
                </p>
              </div>

              {/* Three Metric Panel Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                {/* Metric 1: Total Marks Scaled */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-full translate-x-8 -translate-y-8"></div>
                  <div>
                    <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Master Key Scaled Score
                    </h4>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className={`text-3xl sm:text-4xl font-black ${
                        results.totalMarks > (selectedSection === "GS" ? 90 : 66.67) ? "text-emerald-600 dark:text-emerald-400" :
                        results.totalMarks > 40 ? "text-indigo-600 dark:text-indigo-400" :
                        results.totalMarks >= 0 ? "text-amber-500" : "text-rose-500"
                      }`}>
                        {results.totalMarks >= 0 ? "+" : ""}{results.totalMarks.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400 font-extrabold">/ 200.00</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-semibold">
                    <span>Performance Rating:</span>
                    <span className={`font-bold ${
                      results.totalMarks >= 130 ? "text-emerald-500" :
                      results.totalMarks >= 100 ? "text-indigo-500" :
                      results.totalMarks >= 67 ? "text-amber-500" : "text-rose-500"
                    }`}>
                      {results.totalMarks >= 130 ? "Outstanding" :
                       results.totalMarks >= 100 ? "Proficient" :
                       results.totalMarks >= 67 ? "Developing" :
                       "Revision Needed"}
                    </span>
                  </div>
                </div>

                {/* Metric 2: Accuracy Percentage Rate */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-full translate-x-8 -translate-y-8"></div>
                  <div>
                    <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Accuracy Percentage Rate
                    </h4>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className={`text-3xl sm:text-4xl font-black ${
                        results.accuracyRate >= 75 ? "text-emerald-600 dark:text-emerald-400" :
                        results.accuracyRate >= 50 ? "text-indigo-600 dark:text-indigo-400" :
                        results.accuracyRate > 0 ? "text-amber-500" : "text-slate-400"
                      }`}>
                        {results.accuracyRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-semibold">
                    <span>Correct Ratio:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {results.correctCount} / {attemptedCount} Attempts
                    </span>
                  </div>
                </div>

                {/* Metric 3: Attempt Breakdown */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between col-span-1 sm:col-span-2 lg:col-span-1">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50/50 dark:bg-slate-900/10 rounded-full translate-x-8 -translate-y-8"></div>
                  <div>
                    <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Total Attempted vs. Omitted
                    </h4>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white">
                        {attemptedCount}
                      </span>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase">Attempted</span>
                      <span className="text-slate-350 mx-1">|</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-slate-400">
                        {results.omittedCount}
                      </span>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase">Omitted</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-semibold">
                    <span>Negative Deductions:</span>
                    <span className="font-bold text-rose-500">
                      {(results.incorrectCount * MARKS_INCORRECT).toFixed(2)} Marks ({results.incorrectCount} Incorrect)
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparative Institute Scorecards */}
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp size={18} className="text-indigo-505" />
                      Comparative Key Analysis
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Assess your score deviations across different answer keys compiled by premium institutions.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Vision IAS Compare card */}
                  <div className="bg-gradient-to-br from-slate-50 to-indigo-50/10 dark:from-slate-950 dark:to-indigo-950/5 p-5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-extrabold bg-indigo-100/60 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Vision IAS
                    </span>
                    <div className="text-3xl font-black text-slate-800 dark:text-white my-3.5">
                      {scoreVision >= 0 ? "+" : ""}{scoreVision.toFixed(2)}
                    </div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 leading-relaxed">
                      Your score compared to Vision IAS key is <strong className="text-slate-800 dark:text-slate-200">{scoreVision >= 0 ? "+" : ""}{scoreVision.toFixed(2)}</strong>
                    </p>
                  </div>

                  {/* Vajiram Compare card */}
                  <div className="bg-gradient-to-br from-slate-50 to-indigo-50/10 dark:from-slate-950 dark:to-indigo-950/5 p-5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-extrabold bg-indigo-100/60 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Vajiram & Ravi
                    </span>
                    <div className="text-3xl font-black text-slate-800 dark:text-white my-3.5">
                      {scoreVajiram >= 0 ? "+" : ""}{scoreVajiram.toFixed(2)}
                    </div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 leading-relaxed">
                      Your score compared to Vajiram & Ravi is <strong className="text-slate-800 dark:text-slate-200">{scoreVajiram >= 0 ? "+" : ""}{scoreVajiram.toFixed(2)}</strong>
                    </p>
                  </div>

                  {/* Insights Compare card */}
                  <div className="bg-gradient-to-br from-slate-50 to-indigo-50/10 dark:from-slate-950 dark:to-indigo-950/5 p-5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-extrabold bg-indigo-100/60 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Insights IAS
                    </span>
                    <div className="text-3xl font-black text-slate-800 dark:text-white my-3.5">
                      {scoreInsights >= 0 ? "+" : ""}{scoreInsights.toFixed(2)}
                    </div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 leading-relaxed">
                      Your score compared to Insights IAS is <strong className="text-slate-800 dark:text-slate-200">{scoreInsights >= 0 ? "+" : ""}{scoreInsights.toFixed(2)}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Category-wise diagnostics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
                
                {/* Category breakdown (2/3 width) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <BarChart2 size={18} className="text-indigo-505" />
                    Syllabus Category Diagnostics
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {Object.entries(results.categoryBreakdown).map(([categoryName, data]) => {
                      const accuracy = data.attempted > 0 ? (data.correct / data.attempted) * 100 : 0;
                      return (
                        <div key={categoryName} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-extrabold text-sm text-slate-800 dark:text-white">{categoryName}</span>
                            <span className={`text-xs font-bold ${
                              accuracy >= 75 ? 'text-emerald-500' :
                              accuracy >= 50 ? 'text-indigo-505' :
                              data.attempted > 0 ? 'text-amber-500' : 'text-slate-400'
                            }`}>
                              {data.attempted > 0 ? `${accuracy.toFixed(0)}% Accuracy` : "Unattempted"}
                            </span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-3.5">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                accuracy >= 75 ? 'bg-emerald-500' :
                                accuracy >= 50 ? 'bg-indigo-500' : 'bg-amber-400'
                              }`}
                              style={{ width: `${data.attempted > 0 ? accuracy : 0}%` }}
                            ></div>
                          </div>

                          <div className="grid grid-cols-3 text-center text-[10px] text-slate-500 font-bold uppercase gap-2">
                            <div className="bg-white dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                              <span className="block text-slate-800 dark:text-slate-350 font-black">{data.correct} / {data.total}</span>
                              Correct
                            </div>
                            <div className="bg-white dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                              <span className="block text-rose-500 font-black">{data.incorrect}</span>
                              Incorrect
                            </div>
                            <div className="bg-white dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                              <span className="block text-slate-900 dark:text-slate-300 font-black">{data.marks.toFixed(2)}</span>
                              Score
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Diagnostics side advice & cutoff status (1/3 width) */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between gap-6">
                  <div>
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <ShieldAlert size={18} className="text-indigo-405 animate-bounce" />
                      Cutoff Prognostics
                    </h3>

                    <div className="space-y-4 text-sm text-slate-300 font-medium">
                      <p className="leading-relaxed text-xs sm:text-sm">
                        {selectedSection === "GS" 
                          ? "Historically, the general category cutoff in the GS-1 Prelims paper floats around 43% - 48% scaled percentage (86 - 96 marks out of 200)."
                          : "CSAT is a qualifying paper. You must secure a minimum of 33.33% (66.67 marks out of 200) to qualify for the GS paper evaluation."
                        }
                      </p>
                      
                      <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
                        {selectedSection === "GS" ? (
                          results.totalMarks >= 90 ? (
                            <>
                              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                <Check size={12} strokeWidth={4} className="text-white" />
                              </div>
                              <div className="text-xs">
                                <span className="block font-bold text-white mb-0.5">PROGNOSIS: QUALIFIED (GS)</span>
                                Your score of {results.totalMarks.toFixed(2)} is above standard safety cutoffs (approx 90 marks). Excellent work!
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                                <Info size={12} strokeWidth={3} className="text-white" />
                              </div>
                              <div className="text-xs text-slate-200">
                                <span className="block font-bold text-white mb-0.5">PROGNOSIS: REVISION KEY</span>
                                Your score of {results.totalMarks.toFixed(2)} is below target threshold standards. Strengthen high-yielding subjects.
                              </div>
                            </>
                          )
                        ) : (
                          results.totalMarks >= 66.67 ? (
                            <>
                              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                <Check size={12} strokeWidth={4} className="text-white" />
                              </div>
                              <div className="text-xs">
                                <span className="block font-bold text-white mb-0.5">PROGNOSIS: QUALIFIED (CSAT)</span>
                                Your score of {results.totalMarks.toFixed(2)} is above the mandatory 33.33% threshold (66.67 marks). You have qualified CSAT!
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                                <XCircle size={12} strokeWidth={3} className="text-white" />
                              </div>
                              <div className="text-xs text-slate-200">
                                <span className="block font-bold text-white mb-0.5">PROGNOSIS: NOT QUALIFIED</span>
                                Your score of {results.totalMarks.toFixed(2)} is below the mandatory 66.67 qualifying marks. Focus on Quantitative and RC fundamentals.
                              </div>
                            </>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800/50 text-white font-bold flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider active:scale-95"
                    >
                      <RotateCcw size={14} />
                      <span>Clear Session & Restart</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Paginated Analytical Ledger/Table (Hides on mobile, displays card grid on mobile) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-10">
                <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white">
                      Detailed Itemized Assessment Ledger
                    </h3>
                    <p className="text-xs text-slate-505 dark:text-slate-400 mt-1 font-semibold">
                      Filter questions by core UPSC syllabus categories to isolate and study performance in target domains.
                    </p>
                  </div>

                  {/* Subject Filter selector */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Filter size={16} className="text-indigo-500" />
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="All">All Categories</option>
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* 1. Desktop Layout: Wide 9-column Ledger Table (Hidden on small screens) */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Q.No.</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Topic / Focus</th>
                        <th className="py-4 px-6 text-center">Your Response</th>
                        <th className="py-4 px-6 text-center">Master Key</th>
                        <th className="py-4 px-6 text-center">Vision Key</th>
                        <th className="py-4 px-6 text-center">Vajiram Key</th>
                        <th className="py-4 px-6 text-center">Insights Key</th>
                        <th className="py-4 px-6 text-right">Delta (Master)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm font-semibold text-slate-750 dark:text-slate-355">
                      {paginatedLedgerList.length > 0 ? (
                        paginatedLedgerList.map((question) => {
                          const userAnswer = userResponses ? userResponses[question.id] : undefined;
                          const isAttempted = userAnswer !== undefined;
                          const isCorrect = isAttempted && userAnswer === question.correctAnswer;
                          const isIncorrect = isAttempted && userAnswer !== question.correctAnswer;
                          
                          return (
                            <tr key={question.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                              <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                                {String(question.id).padStart(2, '0')}
                              </td>
                              <td className="py-4 px-6 text-xs font-bold">
                                <span className={`px-2 py-0.5 rounded-md ${
                                  question.category.includes("Polity") || question.category.includes("Quantitative") ? "bg-purple-100/50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400" :
                                  question.category.includes("History") || question.category.includes("Reading") ? "bg-amber-100/50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
                                  question.category.includes("Economy") || question.category.includes("Logical") ? "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" :
                                  "bg-blue-100/50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                                }`}>
                                  {question.category}
                                </span>
                              </td>
                              <td className="py-4 px-6 font-medium text-slate-505 dark:text-slate-400 text-xs">
                                {question.topic}
                              </td>
                              <td className="py-4 px-6 text-center font-extrabold">
                                {isAttempted ? (
                                  <span className={`inline-block w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                                    isCorrect 
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" 
                                      : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
                                  }`}>
                                    {userAnswer}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-center font-extrabold text-slate-900 dark:text-white">
                                <span className="inline-block w-6 h-6 rounded-full text-xs flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                  {question.correctAnswer}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center font-bold text-slate-500 dark:text-slate-400 text-xs">
                                {getInstituteAnswerKeyLabel(question.id, "Vision")}
                              </td>
                              <td className="py-4 px-6 text-center font-bold text-slate-500 dark:text-slate-400 text-xs">
                                {getInstituteAnswerKeyLabel(question.id, "Vajiram")}
                              </td>
                              <td className="py-4 px-6 text-center font-bold text-slate-500 dark:text-slate-400 text-xs">
                                {getInstituteAnswerKeyLabel(question.id, "Insights")}
                              </td>
                              <td className="py-4 px-6 text-right">
                                {isCorrect ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/30">
                                    <CheckCircle size={12} /> Correct (+{MARKS_CORRECT.toFixed(2)})
                                  </span>
                                ) : isIncorrect ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-md border border-rose-100 dark:border-rose-900/30">
                                    <XCircle size={12} /> Incorrect ({MARKS_INCORRECT.toFixed(2)})
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-900/40 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                                    Omitted (0.00)
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="9" className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold italic">
                            No questions found matching this subject filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 2. Mobile Layout: Visual ledger card list (Strictly displays on small viewports) */}
                <div className="block lg:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                  {paginatedLedgerList.length > 0 ? (
                    paginatedLedgerList.map((question) => {
                      const userAnswer = userResponses ? userResponses[question.id] : undefined;
                      const isAttempted = userAnswer !== undefined;
                      const isCorrect = isAttempted && userAnswer === question.correctAnswer;
                      const isIncorrect = isAttempted && userAnswer !== question.correctAnswer;
                      
                      return (
                        <div key={question.id} className="p-4 space-y-3 bg-slate-50/20 dark:bg-slate-900/10">
                          {/* Q.No & Category Badges */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                QUESTION {String(question.id).padStart(2, '0')}
                              </span>
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                                question.category.includes("Polity") || question.category.includes("Quantitative") ? "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400" :
                                question.category.includes("History") || question.category.includes("Reading") ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400" :
                                question.category.includes("Economy") || question.category.includes("Logical") ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" :
                                "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400"
                              }`}>
                                {question.category}
                              </span>
                            </div>

                            {/* Marks badge */}
                            <div>
                              {isCorrect ? (
                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/20">
                                  +{MARKS_CORRECT.toFixed(2)}
                                </span>
                              ) : isIncorrect ? (
                                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1 rounded-md border border-rose-100 dark:border-rose-900/20">
                                  {MARKS_INCORRECT.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                  0.00
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Topic title */}
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 leading-relaxed">
                            {question.topic}
                          </p>

                          {/* Answers and key grids */}
                          <div className="grid grid-cols-2 xs:grid-cols-5 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] font-bold">
                            {/* Your Answer */}
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                              <span className="block text-[8px] text-slate-400 mb-1">YOUR KEY</span>
                              <span className={`inline-block w-5 h-5 rounded-full text-[10px] flex items-center justify-center mx-auto ${
                                isAttempted 
                                  ? (isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white") 
                                  : "text-slate-400 bg-slate-100 dark:bg-slate-800"
                              }`}>
                                {userAnswer || "-"}
                              </span>
                            </div>

                            {/* Master Key */}
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="block text-[8px] text-slate-400 mb-1">MASTER KEY</span>
                              <span className="inline-block w-5 h-5 rounded-full text-[10px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-805 dark:text-slate-150 mx-auto">
                                {question.correctAnswer}
                              </span>
                            </div>

                            {/* Vision Key */}
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="block text-[8px] text-slate-400 mb-1">VISION</span>
                              <span className="text-slate-805 dark:text-slate-300 block text-xs mt-1">
                                {getInstituteAnswerKeyLabel(question.id, "Vision")}
                              </span>
                            </div>

                            {/* Vajiram Key */}
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="block text-[8px] text-slate-400 mb-1">VAJIRAM</span>
                              <span className="text-slate-805 dark:text-slate-300 block text-xs mt-1">
                                {getInstituteAnswerKeyLabel(question.id, "Vajiram")}
                              </span>
                            </div>

                            {/* Insights Key */}
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="block text-[8px] text-slate-400 mb-1">INSIGHTS</span>
                              <span className="text-slate-805 dark:text-slate-300 block text-xs mt-1">
                                {getInstituteAnswerKeyLabel(question.id, "Insights")}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold italic">
                      No questions found matching this subject filter.
                    </div>
                  )}
                </div>

                {/* Graded Ledger Table Pagination Bar */}
                {filteredLedger.length > LEDGER_QUESTIONS_PER_PAGE && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      disabled={ledgerPage === 1}
                      onClick={() => setLedgerPage(prev => Math.max(prev - 1, 1))}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-800"
                    >
                      <ChevronLeft size={14} />
                      <span>Previous 10 Rows</span>
                    </button>

                    <div className="text-xs font-bold text-slate-500 order-first sm:order-none">
                      Viewing <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{ledgerFirstIndex + 1} - {Math.min(ledgerLastIndex, filteredLedger.length)}</span> of <span className="font-extrabold text-slate-800 dark:text-slate-200">{filteredLedger.length}</span> rows
                    </div>

                    <button
                      type="button"
                      disabled={ledgerPage === totalLedgerPages}
                      onClick={() => setLedgerPage(prev => Math.min(prev + 1, totalLedgerPages))}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-800"
                    >
                      <span>Next 10 Rows</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Dynamic Stored Details Notification Modal popup */}
      <AnimatePresence>
        {showStoredNoticeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowStoredNoticeModal(false);
                setCurrentStep(3);
              }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative z-10 overflow-hidden text-center"
            >
              {/* Dynamic decorative light beam */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Icon Container */}
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 dark:border-emerald-900/50 shadow-md">
                <CheckCircle size={32} />
              </div>

              {/* Heading */}
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">
                OMR Assessment saved!
              </h3>

              {/* Body */}
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6">
                Hi <strong className="text-indigo-600 dark:text-indigo-400">{profile.name}</strong> (Roll No: <strong className="text-slate-800 dark:text-slate-200">{profile.rollNumber}</strong>), we have successfully saved your details and OMR assessment locally.
                <br /><br />
                You can safely return to this dashboard to cross-verify your performance when other coaching answer keys are released!
              </p>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  setShowStoredNoticeModal(false);
                  setCurrentStep(3);
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-600/15 active:scale-98 text-sm uppercase tracking-wider"
              >
                Proceed to Diagnostics
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UPSCScoreCalculator;
