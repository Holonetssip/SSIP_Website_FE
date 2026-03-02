import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, ExternalLink, Sparkles, ChevronLeft, ChevronRight, 
  PlayCircle, Users, Clock, ShieldCheck, Flame, AlertCircle, Calendar, Lock 
} from 'lucide-react';

// --- EXACT COURSE DATA & LINKS PROVIDED ---
const allCourses = [
  // ==========================================
  // UPSC PRELIMS
  // ==========================================
  { 
    id: "upsc-1", category: "UPSC Prelims", title: "Rapid Revision Course (VOD) for UPSC 2026", 
    desc: "Complete video-on-demand rapid revision covering all essential UPSC Prelims topics.", 
    price: "Explore", oldPrice: "Premium", rating: "4.9", students: "2.5k+", 
    duration: "VOD", badge: "Bestseller", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F8a5251da-b7d3-4683-b40c-ee5c684debec.png&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/770966?mainCategory=0&subCatList=%5B342039%5D" 
  },
  { 
    id: "upsc-2", category: "UPSC Prelims", title: "PYQ Reverse Engineering", 
    desc: "Master the art of decoding previous year questions to predict future exam patterns.", 
    price: "Explore", oldPrice: "Premium", rating: "4.8", students: "1.8k+", 
    duration: "Self Paced", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F1371c1ec-703b-4fcc-a4e7-3234da55c3e9.png&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/770945?mainCategory=0&subCatList=%5B342039%5D" 
  },
  { 
    id: "upsc-3", category: "UPSC Prelims", title: "General Studies Magazine", 
    desc: "Comprehensive monthly current affairs compilation for UPSC aspirants.", 
    price: "Explore", oldPrice: "Premium", rating: "4.9", students: "4k+", 
    duration: "Monthly", badge: "Must Have", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F31e8217d-9f60-4a73-8fd7-9c4c743a1cae.png&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/770970?mainCategory=0&subCatList=%5B342039%5D" 
  },
  { 
    id: "upsc-4", category: "UPSC Prelims", title: "NCERT Concept Roots", 
    desc: "Line-by-line coverage of fundamental NCERTs to build a rock-solid base.", 
    price: "Explore", oldPrice: "Premium", rating: "4.8", students: "3.2k+", 
    duration: "Foundation", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F9f984dc3-87d2-43cc-ab84-7998ff6ed627.png&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/770972?mainCategory=0&subCatList=%5B342039%5D" 
  },
  { 
    id: "upsc-5", category: "UPSC Prelims", title: "ESSAY FOR UPPCS AND UPSC", 
    desc: "Real-life case studies, philosophical essay decoding, and high-scoring structures.", 
    price: "Explore", oldPrice: "Premium", rating: "4.9", students: "1.5k+", 
    duration: "Mains Focus", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F71f37137-cbbb-447b-84ae-86a29f315864.jpg&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/804293?filterId=1&sortId=7" 
  },

  // ==========================================
  // UPPCS PRELIMS
  // ==========================================
  { 
    id: "uppcs-p-1", category: "UPPCS Prelims", title: "UPPCS QUIZ BATCH 2026", 
    desc: "Daily rigorous MCQs perfectly aligned with the UPPCS exam pattern.", 
    price: "Explore", oldPrice: "Premium", rating: "4.8", students: "2.1k+", 
    duration: "Practice", badge: "Trending", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fali-cdn-cp-assets-public.classplus.co%2Fcams%2Fcards-icon%2Fdefault_course.png&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/798613" 
  },
  { 
    id: "uppcs-p-2", category: "UPPCS Prelims", title: "Granth (UPPCS 2025)", 
    desc: "The ultimate preparatory material tailored for UPPCS 2025 Prelims.", 
    price: "Explore", oldPrice: "Premium", rating: "4.9", students: "5k+", 
    duration: "Targeted", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F2721431a-b9e8-44d3-8680-c9d26fd45c1b.jpeg&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/721212?mainCategory=0&subCatList=%5B343651%5D" 
  },
  { 
    id: "uppcs-p-3", category: "UPPCS Prelims", title: "Score Boosters", 
    desc: "High-yield topics and short tricks to instantly elevate your Prelims score.", 
    price: "Explore", oldPrice: "Premium", rating: "4.7", students: "3.5k+", 
    duration: "Crash Course", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F3efdccd2-a0c1-46ee-ae8d-19adf2062e67.jpeg&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/770990?mainCategory=0&subCatList=%5B343651%5D" 
  },
  { 
    id: "uppcs-p-4", category: "UPPCS Prelims", title: "CAC 3.0", 
    desc: "Current Affairs Compilation version 3.0 optimized for UPPCS specific events.", 
    price: "Explore", oldPrice: "Premium", rating: "4.8", students: "2.8k+", 
    duration: "Current Affairs", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F0dea98a0-dc7f-451b-be2f-dc990fd8a4d3.png&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/770996?mainCategory=0&subCatList=%5B343651%5D" 
  },
  { 
    id: "uppcs-p-5", category: "UPPCS Prelims", title: "Granth 2.0", 
    desc: "The upgraded foundation batch ensuring complete coverage for the State PCS.", 
    price: "Explore", oldPrice: "Premium", rating: "4.9", students: "1.2k+", 
    duration: "Foundation", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2Fe398879c-5cea-4eba-a65d-c30f98ec5218.png&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/770985?mainCategory=0&subCatList=%5B343651%5D" 
  },
  { 
    id: "uppcs-p-6", category: "UPPCS Prelims", title: "UPPCS QUIZ BATCH 2 2026", 
    desc: "Second iteration of our highly successful quiz series for extra practice.", 
    price: "Explore", oldPrice: "Premium", rating: "4.8", students: "1k+", 
    duration: "Practice", 
    img: "https://images.unsplash.com/photo-1513258496099-48166314a708?auto=format&fit=crop&w=800&q=80", 
    link: "https://www.studysmartiaspcs.com/courses/798613?filterId=1&sortId=7" 
  },
  { 
    id: "uppcs-p-7", category: "UPPCS Prelims", title: "ESSAY FOR UPPCS AND UPSC", 
    desc: "Real-life case studies, philosophical essay decoding, and high-scoring structures.", 
    price: "Explore", oldPrice: "Premium", rating: "4.9", students: "1.5k+", 
    duration: "Mains Focus", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F71f37137-cbbb-447b-84ae-86a29f315864.jpg&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/804293?filterId=1&sortId=7" 
  },

  // ==========================================
  // UPPCS MAINS
  // ==========================================
  { 
    id: "uppcs-m-1", category: "UPPCS Mains", title: "MahaGranth", 
    desc: "The definitive Mains coverage batch. Deep dive into all GS papers with answer writing.", 
    price: "Explore", oldPrice: "Premium", rating: "4.9", students: "2.3k+", 
    duration: "Mains Specific", badge: "Flagship", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F85b8445d-493a-4902-be09-605ee4cea44f.png&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/770999?mainCategory=0&subCatList=%5B343654%5D" 
  },
  { 
    id: "uppcs-m-2", category: "UPPCS Mains", title: "GS 5&6 - UP Special", 
    desc: "Exhaustive coverage of newly added UP Special Papers 5 and 6.", 
    price: "Explore", oldPrice: "Premium", rating: "4.8", students: "3.1k+", 
    duration: "Mains Specific", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F455a9f7e-5a13-49d0-ad6e-86f1bf7027c8.png&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/771002?mainCategory=0&subCatList=%5B343654%5D" 
  },
  { 
    id: "uppcs-m-3", category: "UPPCS Mains", title: "ESSAY FOR UPPCS AND UPSC", 
    desc: "Real-life case studies, philosophical essay decoding, and high-scoring structures.", 
    price: "Explore", oldPrice: "Premium", rating: "4.9", students: "1.5k+", 
    duration: "Mains Focus", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F71f37137-cbbb-447b-84ae-86a29f315864.jpg&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/804293?filterId=1&sortId=7" 
  },

  // ==========================================
  // MENTORSHIP: UPPCS Prelims
  // ==========================================
  { 
    id: "m-pre-1", category: "Mentorship", subCategory: "UPPCS Prelims Mentorship", title: "Prelims Mentorship - Batch 1", 
    desc: "Daily targets, 1-on-1 guidance, strict monitoring, and doubt clearing sessions.", 
    price: "₹4,999", oldPrice: "₹7,000", rating: "5.0", students: "Full", 
    duration: "Till Prelims", startDate: "08-12-2025", isClosed: true, 
    img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: "m-pre-2", category: "Mentorship", subCategory: "UPPCS Prelims Mentorship", title: "Prelims Mentorship - Batch 2", 
    desc: "Daily targets, 1-on-1 guidance, strict monitoring, and doubt clearing sessions.", 
    price: "₹4,999", oldPrice: "₹7,000", rating: "4.9", students: "Full", 
    duration: "Till Prelims", startDate: "15-01-2026", isClosed: true, 
    img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: "m-pre-3", category: "Mentorship", subCategory: "UPPCS Prelims Mentorship", title: "Prelims Mentorship - Batch 3", 
    desc: "Daily targets, 1-on-1 guidance, strict monitoring, and doubt clearing sessions.", 
    price: "₹4,999", oldPrice: "₹7,000", rating: "New", students: "Filling Fast", 
    duration: "Till Prelims", startDate: "15-03-2026", badge: "Admissions Open", isClosed: false, 
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80", 
    link: "https://t.me/m/MzXlzGepNWY1" 
  },

  // ==========================================
  // MENTORSHIP: UPPCS Prelims+Mains
  // ==========================================
  { 
    id: "m-premains-1", category: "Mentorship", subCategory: "UPPCS Prelims+Mains Mentorship", title: "Pre+Mains Mentorship - Batch 1", 
    desc: "Integrated preparation strategy, daily answer writing evaluation, and personalized mentor calls.", 
    price: "₹9,999", oldPrice: "₹14,000", rating: "5.0", students: "Full", 
    duration: "1 Year", startDate: "08-12-2025", isClosed: true, 
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: "m-premains-2", category: "Mentorship", subCategory: "UPPCS Prelims+Mains Mentorship", title: "Pre+Mains Mentorship - Batch 2", 
    desc: "Integrated preparation strategy, daily answer writing evaluation, and personalized mentor calls.", 
    price: "₹9,999", oldPrice: "₹14,000", rating: "4.9", students: "Full", 
    duration: "1 Year", startDate: "15-01-2026", isClosed: true, 
    img: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: "m-premains-3", category: "Mentorship", subCategory: "UPPCS Prelims+Mains Mentorship", title: "Pre+Mains Mentorship - Batch 3", 
    desc: "Integrated preparation strategy, daily answer writing evaluation, and personalized mentor calls.", 
    price: "₹9,999", oldPrice: "₹14,000", rating: "New", students: "Filling Fast", 
    duration: "1 Year", startDate: "15-03-2026", badge: "Admissions Open", isClosed: false, 
    img: "https://images.unsplash.com/photo-1513258496099-48166314a708?auto=format&fit=crop&w=800&q=80", 
    link: "https://t.me/m/MzXlzGepNWY1" 
  }
];

const categories = ["All", "UPSC Prelims", "UPPCS Prelims", "UPPCS Mains", "Mentorship"];

// --- PREMIUM COURSE CARD COMPONENT ---
const CourseCard = ({ course, index }) => {
  // If the course is closed, we use a div instead of an anchor tag so it's not clickable
  const CardWrapper = course.isClosed ? motion.div : motion.a;
  const wrapperProps = course.isClosed 
    ? {} 
    : { href: course.link, target: "_blank", rel: "noopener noreferrer" };

  return (
    <CardWrapper 
      {...wrapperProps}
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
      className={`snap-start shrink-0 w-[320px] md:w-[400px] relative group block outline-none ${course.isClosed ? 'opacity-80' : ''}`}
    >
      {/* Glowing Background Blur for Hover (Only active if not closed) */}
      {!course.isClosed && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-primary rounded-[2rem] blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>
      )}
      
      {/* Main Card Container */}
      <div className={`h-full flex flex-col bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border ${course.isClosed ? 'border-slate-200 dark:border-slate-800' : 'border-white/40 dark:border-slate-700/50'} rounded-[2rem] overflow-hidden shadow-xl ${!course.isClosed && 'hover:shadow-2xl group-hover:-translate-y-1'} transition-all duration-300 relative`}>
        
        {/* Floating Badge */}
        {course.badge && (
          <div className={`absolute top-4 right-4 z-20 px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1 ${course.isClosed ? 'bg-slate-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
            {!course.isClosed && <Flame size={12} />} {course.badge}
          </div>
        )}

        {/* Thumbnail Area - Reduced height slightly from h-56 to h-48 */}
        <div className="relative h-48 overflow-hidden bg-slate-200 dark:bg-slate-800 p-2">
           <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
              <img src={course.img} alt={course.title} className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${!course.isClosed && 'group-hover:scale-110'} ${course.isClosed && 'grayscale opacity-70'}`} />
              
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
              
              {/* Category Pill */}
              <div className="absolute top-3 left-3 px-3 py-1 bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold text-white uppercase tracking-wider border border-white/30 shadow-sm">
                {course.category === 'Mentorship' ? course.subCategory : course.category}
              </div>
              
              {/* Stats Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white z-10">
                <div className="flex items-center gap-1.5 text-yellow-400 text-sm font-bold bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  <Star size={14} fill="currentColor"/> {course.rating}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-white/90 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  <Users size={12}/> {course.students}
                </div>
              </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 flex flex-col relative z-10 bg-gradient-to-b from-transparent to-white/50 dark:to-slate-900/50">
           <h3 className={`text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-3 leading-tight transition-colors ${!course.isClosed && 'group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-500'}`}>
             {course.title}
           </h3>
           
           <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {course.startDate ? (
                 <span className={`flex items-center gap-1 ${course.isClosed ? 'text-red-500' : 'text-emerald-500'}`}>
                   <Calendar size={14}/> Batch: {course.startDate}
                 </span>
              ) : (
                <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500"/> Verified</span>
              )}
              <span className="flex items-center gap-1"><Clock size={14} className="text-primary"/> {course.duration}</span>
           </div>

           <p className="text-slate-600 dark:text-slate-300 text-sm mb-8 flex-1 line-clamp-2 leading-relaxed font-medium">
             {course.desc}
           </p>
           
           {/* Premium Pricing & CTA Footer */}
           <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 line-through font-semibold mb-0.5">{course.oldPrice}</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{course.price}</span>
              </div>
              
              {course.isClosed ? (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500 rounded-xl font-bold text-sm shadow-inner cursor-not-allowed border border-slate-300 dark:border-slate-700">
                  Closed <Lock size={16} />
                </div>
              ) : (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg group-hover:bg-primary dark:group-hover:bg-primary group-hover:text-white transition-all">
                  {course.link?.includes('t.me') ? "Join via Telegram" : "Enroll Now"} <ExternalLink size={16} />
                </div>
              )}
           </div>
        </div>
      </div>
    </CardWrapper>
  );
};

// --- HORIZONTAL SLIDER COMPONENT ---
const CourseRow = ({ title, courses }) => {
  const sliderRef = useRef(null);

  const slide = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 320 : 800;
      sliderRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (courses.length === 0) return null;

  return (
    <div className="mb-20 relative">
      <div className="flex justify-between items-end mb-8 px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-4 tracking-tight">
          <span className="w-2 h-10 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
          {title}
        </h2>
        
        <div className="hidden md:flex gap-3">
          <button onClick={() => slide('left')} className="p-3 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition shadow-sm hover:scale-110 active:scale-95">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => slide('right')} className="p-3 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition shadow-sm hover:scale-110 active:scale-95">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div 
        ref={sliderRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-12 pt-4 px-4 md:px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
      >
        {courses.map((course, idx) => (
          <CourseCard key={course.id} course={course} index={idx} />
        ))}
        {/* Spacer to allow full scroll padding on right */}
        <div className="shrink-0 w-4 md:w-8"></div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function Courses() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* --- Deep Glassmorphism Animated Background --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-blue-600/20 dark:bg-blue-600/10 rounded-full blur-[150px]" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4], rotate: [0, -90, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[40%] -right-[10%] w-[800px] h-[800px] bg-purple-600/20 dark:bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto">
        
        {/* --- EYE-CATCHING IMPORTANT ALERT BANNER --- */}
        <div className="px-4 sm:px-6 pt-2">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mx-auto max-w-5xl p-4 md:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-center gap-3 text-amber-800 dark:text-amber-400 shadow-lg shadow-amber-500/5 text-center md:text-left relative overflow-hidden group"
          >
            {/* Animated shimmer sweep */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_2s_infinite]"></div>
            
            <div className="p-2 bg-amber-500/20 rounded-full animate-pulse shrink-0">
              <AlertCircle size={24} className="text-amber-600 dark:text-amber-400" />
            </div>
            
            <p className="font-bold text-sm md:text-base leading-snug">
              <span className="uppercase tracking-wider font-black mr-2 bg-amber-500 text-white px-2 py-0.5 rounded text-xs align-middle">Important</span> 
              Clicking <strong className="text-slate-900 dark:text-white">"Enroll Now"</strong> will redirect you to our official portal (<a href="https://www.studysmartiaspcs.com" target="_blank" rel="noopener noreferrer" className="underline decoration-amber-500/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">studysmartiaspcs.com</a>) for admission. After completing your purchase, please <strong>re-login</strong> to the app/website to instantly access your course!
            </p>
          </motion.div>
        </div>

        {/* --- Header Section --- */}
        <div className="text-center mb-16 px-6 pt-10">
           <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/50 dark:border-slate-700 text-primary dark:text-purple-400 font-extrabold text-sm mb-8 shadow-xl">
             <Sparkles size={16} className="animate-pulse" /> Elite Preparation Modules
           </motion.div>
           
           <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">
             Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-primary">Future.</span>
           </motion.h1>
           
           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium">
             Select your target exam and enroll in our highly acclaimed batches. 
           </motion.p>
        </div>

        {/* --- Segmented Control Filter Bar --- */}
        <div className="flex justify-center mb-16 px-4">
          <div className="flex p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-slate-700/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-x-auto scrollbar-hide max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-8 py-3.5 rounded-xl text-sm md:text-base font-extrabold transition-all whitespace-nowrap z-10 ${
                  activeCategory === cat ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {activeCategory === cat && (
                  <motion.div layoutId="courseFilterBubble" className="absolute inset-0 bg-slate-900 dark:bg-white rounded-xl shadow-md -z-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <span className={activeCategory === cat ? "dark:text-slate-900" : ""}>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* --- Dynamic Course Sliders --- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {activeCategory === "All" ? (
              <>
                <CourseRow title="UPSC Prelims Masterclasses" courses={allCourses.filter(c => c.category === "UPSC Prelims")} />
                <CourseRow title="UPPCS Prelims Masterclasses" courses={allCourses.filter(c => c.category === "UPPCS Prelims")} />
                <CourseRow title="UPPCS Mains Batches" courses={allCourses.filter(c => c.category === "UPPCS Mains")} />
                <CourseRow title="UPPCS Prelims Mentorship" courses={allCourses.filter(c => c.subCategory === "UPPCS Prelims Mentorship")} />
                <CourseRow title="UPPCS Prelims+Mains Mentorship" courses={allCourses.filter(c => c.subCategory === "UPPCS Prelims+Mains Mentorship")} />
              </>
            ) : activeCategory === "Mentorship" ? (
              <>
                <CourseRow title="UPPCS Prelims Mentorship Batches" courses={allCourses.filter(c => c.subCategory === "UPPCS Prelims Mentorship")} />
                <CourseRow title="UPPCS Prelims+Mains Mentorship Batches" courses={allCourses.filter(c => c.subCategory === "UPPCS Prelims+Mains Mentorship")} />
              </>
            ) : (
              <CourseRow 
                title={`${activeCategory} Batches`} 
                courses={allCourses.filter(course => course.category === activeCategory)} 
              />
            )}
            
            {/* Empty State Fallback (Just in case) */}
            {allCourses.filter(c => activeCategory === "All" || c.category === activeCategory).length === 0 && (
               <div className="mx-6 text-center py-32 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-700">
                  <PlayCircle size={64} className="mx-auto text-slate-400 mb-6 opacity-30"/>
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">New batches dropping soon!</h3>
                  <p className="text-slate-500 font-medium text-lg">Stay tuned for the upcoming {activeCategory} curriculum.</p>
               </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}