import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, AlertCircle, Search,
  BarChart2, Trophy, Target,
  Brain, Sparkles, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Stats Component
const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
  >
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
    </div>
  </motion.div>
);

const Tests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/exams`);
        const data = await res.json();
        const safeData = Array.isArray(data) ? data : [];
        const formattedTests = safeData.map(test => ({
          id: test.id || test._id,
          title: test.title,
          subject: test.category || "General",
          questions: test.questions_count || 0,
          time: `${test.time_limit} Mins`,
          marks: test.total_marks || 200,
          difficulty: test.difficulty || "Medium",
          tags: test.is_free ? ["Free Test", "Mock"] : ["Premium", "Full Length"],
          is_free: test.is_free,
          price: test.price
        }));
        setTests(formattedTests);
      } catch (error) {
        console.error("Failed to load Quiz", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const categories = ["All", "General Studies", "CSAT", "Current Affairs", "History", "Economy"];

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          test.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "All" || test.subject === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'Easy': return 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'Hard': return 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default: return 'text-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-slate-500 font-medium">Loading Test Series...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-50 to-transparent dark:from-purple-900/10 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <Sparkles size={14} /> Exam Ready 2026
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4"
          >
            Quiz Section
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-400"
          >
            Benchmark your performance against thousands of serious aspirants.
          </motion.p>
        </div>

        {/* --- STATS --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <StatCard icon={Target} label="Quiz Available" value={tests.length} color="bg-blue-500" delay={0.1} />
          <StatCard icon={Trophy} label="Exam Ready" value="2026" color="bg-purple-500" delay={0.2} />
          <StatCard icon={BarChart2} label="Categories" value="6+" color="bg-orange-500" delay={0.3} />
          <StatCard icon={Brain} label="Practice Tests" value="Free" color="bg-green-500" delay={0.4} />
        </motion.div>

        {/* --- FILTERS --- */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full lg:w-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                  activeFilter === cat 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80 group">
            <input 
              type="text" 
              placeholder="Search Quiz.." 
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm group-hover:shadow-md text-slate-900 dark:text-white"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" size={20} />
          </div>
        </div>

        {/* --- GRID --- */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredTests.length > 0 ? (
              filteredTests.map((test, idx) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
                >
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getDifficultyColor(test.difficulty)}`}>
                        {test.difficulty}
                      </span>
                      {test.is_free ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">
                          FREE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full">
                          <Lock size={10} /> ₹{test.price}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {test.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {test.tags.map((tag, i) => (
                        <span key={i} className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-4">
                      <div className="flex items-center gap-1.5"><Clock size={16} className="text-primary" /><span>{test.time}</span></div>
                      <div className="flex items-center gap-1.5"><AlertCircle size={16} className="text-orange-500" /><span>{test.questions} Qs</span></div>
                      <div className="flex items-center gap-1.5"><Target size={16} className="text-green-500" /><span>{test.marks} M</span></div>
                    </div>
                  </div>

                  <div className="mt-auto p-6 pt-0">
                    <div className="flex items-center justify-between mb-4 text-xs font-semibold text-slate-400">
                      <span>Subject: {test.subject}</span>
                    </div>
                    <Link to="/contact" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2">
                      Enquire Now
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-slate-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Quiz found</h3>
                <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or search query</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Tests;