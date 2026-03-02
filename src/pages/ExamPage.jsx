import React, { useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayCircle, ArrowLeft, Youtube, Layers, Star, 
  ChevronLeft, ChevronRight, BookOpen, Loader2
} from 'lucide-react';

// --- CENTRALIZED COURSE DATA WITH 2026 PLAYLISTS ---
export const examPlaylists = {
  upsc: {
    title: "UPSC Preparatory",
    description: "Master the UPSC Civil Services Examination with our complete 2026 syllabus coverage.",
    videos: [
      { id: "upsc-1", title: "UPSC Indian Polity 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8b3enPRi4pHeQy4sIPhRK3I", listId: "PLt-EyYJP3Q8b3enPRi4pHeQy4sIPhRK3I", lessons: 45, rating: "4.9" },
      { id: "upsc-2", title: "UPSC Geography 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8a1ELMxCTwBxuUyvQgmqMG-", listId: "PLt-EyYJP3Q8a1ELMxCTwBxuUyvQgmqMG-", lessons: 38, rating: "4.8" },
      { id: "upsc-3", title: "UPSC Environment & Ecology 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8ZgukarD8p_jnKa3XIZ8tRa", listId: "PLt-EyYJP3Q8ZgukarD8p_jnKa3XIZ8tRa", lessons: 32, rating: "4.7" },
      { id: "upsc-4", title: "UPSC Modern History 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8ZnDdDO1_Dyc3m9N2sxtNSW", listId: "PLt-EyYJP3Q8ZnDdDO1_Dyc3m9N2sxtNSW", lessons: 50, rating: "4.9" },
      { id: "upsc-5", title: "UPSC Ancient & Medieval 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8YQB-9bzdwJ7myHZka1yuN8", listId: "PLt-EyYJP3Q8YQB-9bzdwJ7myHZka1yuN8", lessons: 41, rating: "4.8" },
      { id: "upsc-6", title: "UPSC Economy 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8bbWT0Ih0D6lQHIVePxWAmj", listId: "PLt-EyYJP3Q8bbWT0Ih0D6lQHIVePxWAmj", lessons: 48, rating: "4.9" },
      { id: "upsc-7", title: "UPSC Art & Culture 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8bmYq6R4DxXmdoHFuKiYQ2e", listId: "PLt-EyYJP3Q8bmYq6R4DxXmdoHFuKiYQ2e", lessons: 25, rating: "4.7" },
      { id: "upsc-8", title: "UPSC Science & Tech 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8YCTS-GnsoXEM3noeUjndcZ", listId: "PLt-EyYJP3Q8YCTS-GnsoXEM3noeUjndcZ", lessons: 30, rating: "4.8" },
      { id: "upsc-9", title: "UPSC Current Affairs 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8bVq0wT7q5SI5iyk4Jre_kY", listId: "PLt-EyYJP3Q8bVq0wT7q5SI5iyk4Jre_kY", lessons: 60, rating: "4.9" },
    ]
  },
  uppcs: {
    title: "UPPCS Special Batch",
    description: "Targeted content for Uttar Pradesh Provincial Civil Services (Prelims & Mains).",
    videos: [
      { id: "uppcs-1", title: "UPPCS GS Paper 1 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8byIm_KGKAkT3tJIFb9chjK", listId: "PLt-EyYJP3Q8byIm_KGKAkT3tJIFb9chjK", lessons: 40, rating: "4.9" },
      { id: "uppcs-2", title: "UPPCS GS Paper 2 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8YgR_xY1BsjOUF-Ux1IX0qx", listId: "PLt-EyYJP3Q8YgR_xY1BsjOUF-Ux1IX0qx", lessons: 35, rating: "4.8" },
      { id: "uppcs-3", title: "UP Special GK 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8aTSfSBE2NjBzGnqjLqcBwU", listId: "PLt-EyYJP3Q8aTSfSBE2NjBzGnqjLqcBwU", lessons: 28, rating: "4.9" },
      { id: "uppcs-4", title: "UPPCS Current Affairs 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8bEIhM9AwnUk9ORC6IuhOnV", listId: "PLt-EyYJP3Q8bEIhM9AwnUk9ORC6IuhOnV", lessons: 55, rating: "4.7" },
      { id: "uppcs-5", title: "UPPCS Hindi Compulsory 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8aGTPeI2LuhfaTf7kgNiCZb", listId: "PLt-EyYJP3Q8aGTPeI2LuhfaTf7kgNiCZb", lessons: 20, rating: "4.8" },
      { id: "uppcs-6", title: "UPPCS Essay Writing 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8Z43gvprCF73kbiriYeDFT6", listId: "PLt-EyYJP3Q8Z43gvprCF73kbiriYeDFT6", lessons: 15, rating: "4.9" },
      { id: "uppcs-7", title: "UPPCS PYQ Analysis 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8YhQgdTXstJW5QmcZcP_ZPY", listId: "PLt-EyYJP3Q8YhQgdTXstJW5QmcZcP_ZPY", lessons: 30, rating: "4.8" },
    ]
  },
  csat: {
    title: "CSAT Comprehensive",
    description: "Crack the Civil Services Aptitude Test with proven strategies for 2026.",
    videos: [
      { id: "csat-1", title: "CSAT Quantitative Aptitude 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8aK-O6L1mD8TQc2nC16B9DC", listId: "PLt-EyYJP3Q8aK-O6L1mD8TQc2nC16B9DC", lessons: 35, rating: "4.9" },
      { id: "csat-2", title: "CSAT Logical Reasoning 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8Z1M-hFX4pQTq4YGYr4PJFu", listId: "PLt-EyYJP3Q8Z1M-hFX4pQTq4YGYr4PJFu", lessons: 28, rating: "4.8" },
      { id: "csat-3", title: "CSAT Reading Comprehension 2026", embed: "https://www.youtube.com/embed/videoseries?list=PLt-EyYJP3Q8aQ5nzsTxKqQOSoEzjzbWx3", listId: "PLt-EyYJP3Q8aQ5nzsTxKqQOSoEzjzbWx3", lessons: 20, rating: "4.7" },
    ]
  }
};

// --- PLAYLIST SLIDER COMPONENT ---
const PlaylistSlider = ({ videos, examName, onPlayClick }) => {
  const sliderRef = useRef(null);

  const slide = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 320 : 800;
      sliderRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative mb-20 group/slider">
      {/* Slider Controls */}
      <div className="flex justify-end gap-3 mb-6 px-4">
        <button onClick={() => slide('left')} className="p-3 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition shadow-sm hover:scale-110 active:scale-95">
          <ChevronLeft size={24} />
        </button>
        <button onClick={() => slide('right')} className="p-3 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition shadow-sm hover:scale-110 active:scale-95">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Scrollable Row */}
      <div 
        ref={sliderRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-12 pt-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
      >
        {videos.map((video, idx) => (
          <motion.div 
            key={video.id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: idx * 0.05, duration: 0.5, ease: "easeOut" }}
            onClick={() => onPlayClick(video)}
            className="snap-start shrink-0 w-[320px] md:w-[400px] relative group cursor-pointer"
          >
            {/* Glowing Hover Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-primary rounded-[2rem] blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>
            
            {/* Main Card (Deep Glassmorphism) */}
            <div className="h-full flex flex-col bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
              
              {/* Actual YouTube Iframe as Thumbnail Area */}
              <div className="relative h-56 overflow-hidden p-2">
                 <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative bg-black flex items-center justify-center">
                    
                    {/* Embedded YouTube Playlist (Pointer Events None to allow card click) */}
                    <iframe 
                      src={video.embed} 
                      title={video.title}
                      loading="lazy"
                      className="w-[120%] h-[120%] pointer-events-none scale-[1.2]" // Scaled slightly to hide black borders of the iframe
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    
                    {/* Glassy Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent"></div>
                    
                    {/* YouTube Playlist Indicator */}
                    <div className="absolute top-0 right-0 bottom-0 w-[30%] bg-black/70 backdrop-blur-md flex flex-col items-center justify-center text-white border-l border-white/10 group-hover:bg-primary/90 transition-colors duration-300">
                       <Layers size={28} className="mb-2" />
                       <span className="font-bold text-sm">{video.lessons}</span>
                       <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Videos</span>
                    </div>

                    {/* Play Button Hover Effect */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <div className="w-16 h-16 bg-red-600/90 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/40 shadow-[0_0_30px_rgba(255,0,0,0.5)]">
                          <PlayCircle size={36} className="text-white fill-white/80" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Text Content */}
              <div className="p-6 flex-1 flex flex-col relative z-10">
                 <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1.5 bg-blue-100/50 dark:bg-blue-900/30 backdrop-blur-md text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold uppercase tracking-wider border border-blue-200/50 dark:border-blue-700/50">
                      {examName} Series
                    </span>
                    <span className="flex items-center gap-1.5 text-yellow-500 font-bold text-sm bg-yellow-50/50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                      <Star size={14} fill="currentColor"/> {video.rating}
                    </span>
                 </div>
                 
                 <h3 className="font-extrabold text-xl md:text-2xl text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all leading-tight">
                   {video.title}
                 </h3>
                 
                 <div className="mt-auto pt-6 flex items-center gap-3 text-red-600 dark:text-red-400 font-bold text-sm group-hover:translate-x-2 transition-transform">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                       <Youtube size={16} className="text-red-600 dark:text-red-400"/>
                    </div>
                    Watch on YouTube
                 </div>
              </div>
            </div>
          </motion.div>
        ))}
        {/* Padding Spacer */}
        <div className="shrink-0 w-4 md:w-8"></div>
      </div>
    </div>
  );
};

// --- MAIN EXAM PAGE ---
const ExamPage = () => {
  const { examName } = useParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const currentExam = examPlaylists[examName?.toLowerCase()];

  // Custom function to bypass login and open YouTube directly via Popup
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
          <div className="mb-16 border-b border-slate-200/50 dark:border-slate-800/50 pb-10">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 text-primary dark:text-purple-400 font-extrabold text-sm mb-6 shadow-sm">
               <BookOpen size={16} /> Official Playlists
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">
              {currentExam.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Playlists</span>
            </motion.h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl font-medium">{currentExam.description}</p>
          </div>

          {/* Horizontal Slider Component */}
          <PlaylistSlider 
            videos={currentExam.videos} 
            examName={examName.toUpperCase()} 
            onPlayClick={handlePlaylistClick} 
          />

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