import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayCircle, ArrowLeft, Youtube, Layers, Star, 
  BookOpen, Loader2
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
      { id: "uppcs-7", title: "Ghatnachakra Marathon Videos - One Shot", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8YhQgdTXstJW5QmcZcP_ZPY", listId: "PLt-EyYJP3Q8YhQgdTXstJW5QmcZcP_ZPY", lessons: 30, rating: "4.8" },
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

const ExamPage = () => {
  const { examName } = useParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const currentExam = examPlaylists[examName?.toLowerCase()];

  // Custom function to open YouTube directly via Popup
  const handlePlaylistClick = (video) => {
    setIsRedirecting(true);
    
    // Simulate loading for UX, then open YouTube
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

  // Animation variants for the Grid
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
      <div className="pt-28 pb-20 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors relative overflow-hidden font-sans">
        
        {/* Deep Glassmorphism Animated Background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px]" />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3], rotate: [0, -90, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[30%] -right-[10%] w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-[1600px]">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary mb-8 transition-colors font-bold text-sm bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/50 dark:border-slate-700/50">
             <ArrowLeft size={16} /> Back to Home
          </Link>
          
          {/* Header Section */}
          <div className="mb-12 border-b border-slate-200/50 dark:border-slate-800/50 pb-10">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 text-primary dark:text-purple-400 font-extrabold text-sm mb-6 shadow-sm">
               <BookOpen size={16} /> Official Playlists
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">
              {currentExam.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Playlists</span>
            </motion.h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl font-medium">{currentExam.description}</p>
          </div>

          {/* --- MATRIX GRID COMPONENT --- */}
          {/* 4 columns on extra large screens, perfectly spaced grid */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 mb-20"
          >
            {currentExam.videos.map((video, idx) => (
              <motion.div 
                key={video.id}
                variants={fadeInUp}
                onClick={() => handlePlaylistClick(video)}
                className="relative group cursor-pointer h-full"
              >
                {/* Glowing Hover Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-primary rounded-[2rem] blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>
                
                {/* Main Card */}
                <div className="h-full flex flex-col bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                  
                  {/* YouTube Iframe Thumbnail Area */}
                  <div className="relative h-48 overflow-hidden p-2">
                    <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative bg-black flex items-center justify-center">
                        
                        {/* Embedded YouTube Playlist (Pointer Events None to allow card click) */}
                        <iframe 
                          src={video.embed} 
                          title={video.title}
                          loading="lazy"
                          className="w-[120%] h-[120%] pointer-events-none scale-[1.2]" 
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent"></div>
                        
                        {/* Stats Indicator */}
                        <div className="absolute top-0 right-0 bottom-0 w-[35%] bg-black/70 backdrop-blur-md flex flex-col items-center justify-center text-white border-l border-white/10 group-hover:bg-primary/90 transition-colors duration-300">
                          <Layers size={24} className="mb-1.5" />
                          <span className="font-bold text-sm">{video.lessons}</span>
                          <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold text-center">Videos</span>
                        </div>

                        {/* Play Button Hover Effect */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-14 h-14 bg-red-600/90 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/40 shadow-[0_0_30px_rgba(255,0,0,0.5)]">
                              <PlayCircle size={30} className="text-white fill-white/80" />
                          </div>
                        </div>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="p-5 flex-1 flex flex-col relative z-10">
                    <div className="flex justify-between items-start mb-3">
                        <span className="px-2.5 py-1 bg-blue-100/50 dark:bg-blue-900/30 backdrop-blur-md text-blue-700 dark:text-blue-300 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-200/50 dark:border-blue-700/50">
                          {examName.toUpperCase()} Series
                        </span>
                        <span className="flex items-center gap-1 text-yellow-500 font-bold text-xs bg-yellow-50/50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                          <Star size={12} fill="currentColor"/> {video.rating}
                        </span>
                    </div>
                    
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all leading-snug line-clamp-3">
                      {video.title}
                    </h3>
                    
                    <div className="mt-auto pt-5 flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
                        <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <Youtube size={14} className="text-red-600 dark:text-red-400"/>
                        </div>
                        Watch on YouTube
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>

      {/* --- REDIRECTING POPUP MODAL --- */}
      <AnimatePresence>
        {isRedirecting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 relative">
                <Youtube size={40} className="text-red-600 dark:text-red-500 relative z-10" />
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 border-4 border-transparent border-t-red-500 rounded-full"
                />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Redirecting...</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Taking you to the official YouTube playlist.</p>
              
              <div className="mt-8 flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
                <Loader2 size={16} className="animate-spin" /> Please wait
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExamPage;