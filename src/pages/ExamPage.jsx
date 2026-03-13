import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  PlayCircle, ArrowLeft, Youtube, Layers, Star, 
  BookOpen, Loader2, Play, Sparkles
} from 'lucide-react';

// --- CENTRALIZED COURSE DATA WITH 2026 PLAYLISTS ---
export const examPlaylists = {
  upsc: {
    title: "UPSC Preparatory",
    description: "Master the UPSC Civil Services Examination with our complete 2026 syllabus coverage.",
    videos: [
      { id: "upsc-1", title: "PYQs Decoded - UPSC Prelims 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8b3enPRi4pHeQy4sIPhRK3I", listId: "PLt-EyYJP3Q8b3enPRi4pHeQy4sIPhRK3I", lessons: 45, rating: "4.9" },
      { id: "upsc-2", title: "Lakshya 120 - UPSC Prelims 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8a1ELMxCTwBxuUyvQgmqMG-", listId: "PLt-EyYJP3Q8a1ELMxCTwBxuUyvQgmqMG-", lessons: 38, rating: "4.8" },
      { id: "upsc-3", title: "Complete PT365 for UPSC Prelims 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8ZgukarD8p_jnKa3XIZ8tRa", listId: "PLt-EyYJP3Q8ZgukarD8p_jnKa3XIZ8tRa", lessons: 32, rating: "4.7" },
      { id: "upsc-4", title: "UPSC Prelims 2026 - High Impact Topics", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8ZnDdDO1_Dyc3m9N2sxtNSW", listId: "PLt-EyYJP3Q8ZnDdDO1_Dyc3m9N2sxtNSW", lessons: 50, rating: "4.9" },
      { id: "upsc-5", title: "Rattafication - UPSC CSE 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8YQB-9bzdwJ7myHZka1yuN8", listId: "PLt-EyYJP3Q8YQB-9bzdwJ7myHZka1yuN8", lessons: 41, rating: "4.8" },
      { id: "upsc-6", title: "GS - UPSC Prelims 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8bbWT0Ih0D6lQHIVePxWAmj", listId: "PLt-EyYJP3Q8bbWT0Ih0D6lQHIVePxWAmj", lessons: 48, rating: "4.9" },
      { id: "upsc-7", title: "PYQ Hacks - UPSC Prelims 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8bmYq6R4DxXmdoHFuKiYQ2e", listId: "PLt-EyYJP3Q8bmYq6R4DxXmdoHFuKiYQ2e", lessons: 25, rating: "4.7" },
      { id: "upsc-8", title: "Terms in News Series", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8YCTS-GnsoXEM3noeUjndcZ", listId: "PLt-EyYJP3Q8YCTS-GnsoXEM3noeUjndcZ", lessons: 30, rating: "4.8" },
      { id: "upsc-9", title: "Ancient, Medieval & Art & Culture 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8bVq0wT7q5SI5iyk4Jre_kY", listId: "PLt-EyYJP3Q8bVq0wT7q5SI5iyk4Jre_kY", lessons: 60, rating: "4.9" },
    ]
  },
  uppcs: {
    title: "UPPCS Special Batch",
    description: "Targeted content for Uttar Pradesh Provincial Civil Services (Prelims & Mains).",
    videos: [
      { id: "uppcs-1", title: "Smart Adhyayan - 30 Days Challenge", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8byIm_KGKAkT3tJIFb9chjK", listId: "PLt-EyYJP3Q8byIm_KGKAkT3tJIFb9chjK", lessons: 40, rating: "4.9"},
      { id: "uppcs-2", title: "Complete Eye Drishti 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8YgR_xY1BsjOUF-Ux1IX0qx", listId: "PLt-EyYJP3Q8YgR_xY1BsjOUF-Ux1IX0qx", lessons: 35, rating: "4.8" },
      { id: "uppcs-3", title: "Important Themes - UPPCS & RO/ARO 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8aTSfSBE2NjBzGnqjLqcBwU", listId: "PLt-EyYJP3Q8aTSfSBE2NjBzGnqjLqcBwU", lessons: 28, rating: "4.9" },
      { id: "uppcs-4", title: "Score Booster - Complete GS Revision 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8bEIhM9AwnUk9ORC6IuhOnV", listId: "PLt-EyYJP3Q8bEIhM9AwnUk9ORC6IuhOnV", lessons: 55, rating: "4.7" },
      { id: "uppcs-5", title: "Sureshot Series - UPPCS & BPSC", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8aGTPeI2LuhfaTf7kgNiCZb", listId: "PLt-EyYJP3Q8aGTPeI2LuhfaTf7kgNiCZb", lessons: 20, rating: "4.8" },
      { id: "uppcs-6", title: "GS Revision - UPPCS 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8Z43gvprCF73kbiriYeDFT6", listId: "PLt-EyYJP3Q8Z43gvprCF73kbiriYeDFT6", lessons: 15, rating: "4.9" },
      { id: "uppcs-7", title: "GHATNACHAKRA Marathon Videos - One Shot", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8YhQgdTXstJW5QmcZcP_ZPY", listId: "PLt-EyYJP3Q8YhQgdTXstJW5QmcZcP_ZPY", lessons: 30, rating: "4.8" },
    ]
  },
  csat: {
    title: "CSAT Comprehensive",
    description: "Crack the Civil Services Aptitude Test with proven strategies for 2026.",
    videos: [
      { id: "csat-1", title: "CONQUER CSAT 2026 - UPSC, UPPCS & MPPSC", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8aK-O6L1mD8TQc2nC16B9DC", listId: "PLt-EyYJP3Q8aK-O6L1mD8TQc2nC16B9DC", lessons: 35, rating: "4.9" },
      { id: "csat-2", title: "CSAT - UPSC Prelims 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8Z1M-hFX4pQTq4YGYr4PJFu", listId: "PLt-EyYJP3Q8Z1M-hFX4pQTq4YGYr4PJFu", lessons: 28, rating: "4.8" },
      { id: "csat-3", title: "Reading Comprehension Algo - UPSC CSAT 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8aQ5nzsTxKqQOSoEzjzbWx3", listId: "PLt-EyYJP3Q8aQ5nzsTxKqQOSoEzjzbWx3", lessons: 20, rating: "4.7" },
    ]
  }
};

// --- LAZY IFRAME COMPONENT ---
const LazyIframe = ({ embedUrl, title, isPageLoading }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "100px" });

  return (
    <div ref={ref} className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
      {isInView && !isPageLoading ? (
        <iframe 
          src={embedUrl} 
          title={title}
          className="w-[120%] h-[120%] pointer-events-none scale-[1.2] transform-gpu" 
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <div className="flex flex-col items-center justify-center animate-pulse opacity-40">
          <Youtube size={48} className="text-slate-500 dark:text-slate-600 mb-2" />
        </div>
      )}
    </div>
  );
};

const ExamPage = () => {
  const { examName } = useParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  const currentExam = examPlaylists[examName?.toLowerCase()];

  // --- THE FIX: FORCE RELOAD ON URL CHANGE ---
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsPageLoading(true);
    
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 2500); 
    
    return () => clearTimeout(timer);
  }, [examName]); 

  // Custom function to open YouTube directly via Popup
  const handlePlaylistClick = (video) => {
    setIsRedirecting(true);
    setTimeout(() => {
      window.open(`https://www.youtube.com/playlist?list=${video.listId}`, '_blank');
      setIsRedirecting(false);
    }, 1500);
  };

  if (!currentExam) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center flex-col">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Exam category not found</h2>
        <Link to="/" className="text-primary hover:underline flex items-center gap-2"><ArrowLeft size={16}/> Go Home</Link>
      </div>
    );
  }

  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <>
      {/* --- RESPONSIVE & THEME-AWARE FULL-SCREEN PAGE LOADER --- */}
      <AnimatePresence>
        {isPageLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
            // FIXED: Now natively supports light mode (bg-slate-50) and dark mode (bg-slate-950)
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transform-gpu overflow-hidden"
          >
            {/* Ambient Background for Loader */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
               <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-[80vh] h-[80vh] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(59,130,246,0.15)_360deg)] dark:bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(59,130,246,0.25)_360deg)] rounded-full blur-3xl"></motion.div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center px-4 text-center">
              <div className="relative w-20 sm:w-24 h-20 sm:h-24 mb-6 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} 
                  // FIXED: Ring border colors adapt to light/dark themes
                  className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 border-t-blue-500 border-r-purple-500 rounded-full"
                />
                <Sparkles size={28} className="text-blue-600 dark:text-blue-400 animate-pulse sm:w-[32px] sm:h-[32px]" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-6 tracking-tight">Loading Exam Vault</h2>
              
              {/* FIXED: Highly responsive, elegant, theme-aware Pro Tip box */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-3 shadow-lg max-w-[90vw]">
                 <Loader2 size={18} className="animate-spin text-purple-600 dark:text-purple-400 shrink-0 hidden sm:block" />
                 <p className="text-slate-600 dark:text-slate-400 text-[11px] sm:text-sm font-medium tracking-wide">
                   <span className="font-bold text-slate-900 dark:text-white block sm:inline mb-0.5 sm:mb-0">Pro Tip: </span>
                   Please wait a moment while we fetch the latest playlists for your exam.
                 </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN PAGE CONTENT --- */}
      <div className="pt-24 md:pt-28 pb-32 md:pb-48 min-h-screen relative overflow-x-hidden font-sans w-full">
        
        {/* Background layer absolute so it stops where footer begins */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-300"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="hidden md:block absolute top-[0%] left-[-10%] w-[600px] lg:w-[800px] h-[600px] lg:h-[800px] bg-blue-600/10 rounded-full blur-[150px] transform-gpu" />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3], rotate: [0, -90, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className="hidden md:block absolute top-[40%] right-[-10%] w-[600px] lg:w-[800px] h-[600px] lg:h-[800px] bg-purple-600/10 rounded-full blur-[150px] transform-gpu" />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-10 relative z-10 max-w-[1400px]">
          
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary mb-6 md:mb-8 transition-colors font-bold text-xs md:text-sm bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/50 dark:border-slate-700/50 transform-gpu active:scale-95">
             <ArrowLeft size={16} /> Back to Home
          </Link>
          
          {/* Header Section */}
          <div className="mb-10 md:mb-12 border-b border-slate-200/50 dark:border-slate-800/50 pb-8 md:pb-10 text-center md:text-left">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 text-primary dark:text-purple-400 font-extrabold text-xs md:text-sm mb-4 md:mb-6 shadow-sm transform-gpu">
               <BookOpen size={16} /> Official Playlists
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-4 md:mb-6 tracking-tighter leading-tight">
              {currentExam.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block sm:inline">Playlists</span>
            </motion.h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl font-medium mx-auto md:mx-0">{currentExam.description}</p>
          </div>

          {/* --- MATRIX GRID COMPONENT --- */}
          {!isPageLoading && (
            <motion.div 
              key={examName} 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 mb-16 md:mb-20"
            >
              {currentExam.videos.map((video, idx) => (
                <motion.div 
                  key={video.id}
                  variants={fadeInUp}
                  onClick={() => handlePlaylistClick(video)}
                  className="relative group cursor-pointer h-full flex flex-col transform-gpu"
                >
                  {/* Glowing Hover Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-primary rounded-[2rem] blur-xl opacity-0 md:group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>
                  
                  {/* Main Card */}
                  <div className="flex-1 flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 rounded-[2rem] overflow-hidden shadow-lg md:hover:shadow-2xl transition-all duration-300 md:group-hover:-translate-y-2">
                    
                    {/* YouTube Iframe Thumbnail Area */}
                    <div className="relative h-52 sm:h-60 overflow-hidden p-2 shrink-0 bg-slate-100 dark:bg-slate-800">
                      <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative bg-black flex items-center justify-center">
                          
                          <LazyIframe embedUrl={video.embed} title={video.title} isPageLoading={isPageLoading} />
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent pointer-events-none"></div>
                          
                          {/* Stats Indicator */}
                          <div className="absolute top-0 right-0 bottom-0 w-[35%] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white border-l border-white/10 md:group-hover:bg-primary/90 transition-colors duration-300 pointer-events-none">
                            <Layers size={24} className="mb-1.5 md:w-8 md:h-8" />
                            <span className="font-bold text-sm md:text-base">{video.lessons}</span>
                            <span className="text-[10px] md:text-xs text-white/70 uppercase tracking-wider font-semibold text-center">Videos</span>
                          </div>

                          {/* Play Button Hover Effect */}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-red-600/90 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/40 shadow-[0_0_30px_rgba(255,0,0,0.5)]">
                                <Play size={24} className="text-white fill-white/80 md:w-8 md:h-8 translate-x-0.5" />
                            </div>
                          </div>
                      </div>
                    </div>

                    {/* Text Content Area */}
                    <div className="p-5 md:p-6 lg:p-8 flex-1 flex flex-col relative z-10 justify-between bg-white dark:bg-slate-900">
                      <div>
                        <div className="flex justify-between items-start mb-4 gap-2">
                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-700/50">
                              {examName.toUpperCase()} Series
                            </span>
                            <span className="flex items-center gap-1.5 text-yellow-500 font-bold text-xs sm:text-sm bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-lg border border-yellow-100 dark:border-yellow-700/30">
                              <Star size={14} className="sm:w-4 sm:h-4" fill="currentColor"/> {video.rating}
                            </span>
                        </div>
                        
                        <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white md:group-hover:text-transparent md:group-hover:bg-clip-text md:group-hover:bg-gradient-to-r md:group-hover:from-blue-600 md:group-hover:to-purple-600 transition-all leading-snug">
                          {video.title}
                        </h3>
                      </div>
                      
                      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 text-red-600 dark:text-red-400 font-bold text-xs sm:text-sm md:group-hover:translate-x-1 transition-transform">
                          <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0 border border-red-100 dark:border-red-800/50">
                            <Youtube size={16} className="text-red-600 dark:text-red-400"/>
                          </div>
                          Watch Complete Series
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

        </div>
      </div>

      {/* --- REDIRECTING POPUP MODAL --- */}
      <AnimatePresence>
        {isRedirecting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 transform-gpu"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-[90vw] sm:max-w-sm w-full text-center flex flex-col items-center transform-gpu"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 md:mb-6 relative border border-red-100 dark:border-red-800">
                <Youtube size={32} className="md:w-10 md:h-10 text-red-600 dark:text-red-500 relative z-10" />
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 border-4 border-transparent border-t-red-500 rounded-full transform-gpu"
                />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2">Redirecting...</h3>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">Taking you to the official YouTube playlist.</p>
              
              <div className="mt-6 md:mt-8 flex items-center gap-2 text-xs md:text-sm text-slate-400 dark:text-slate-500">
                <Loader2 size={14} className="md:w-4 md:h-4 animate-spin" /> Please wait
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExamPage;