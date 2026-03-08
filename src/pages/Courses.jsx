import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useSpring, useTransform, useScroll, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Star, PlayCircle, BookOpen, Users,
  Award, Zap, Video, CheckCircle, Send,
  GraduationCap, Target, Phone, Mail,
  Youtube, MessageCircle, Instagram, Twitter, ChevronRight,
  ChevronLeft, Sparkles, BookMarked, PenTool, 
  Smartphone, DownloadCloud, Play, Apple, Compass, 
  MapPin, Copy, ExternalLink, Flame, ShieldCheck, Clock, AlertCircle, Lock, Calendar
} from 'lucide-react';

// --- ANIMATED COUNTER COMPONENT ---
const Counter = ({ value, suffix = "+" }) => {
  const safeValue = String(value).replace(/,/g, '');
  const numericValue = parseInt(safeValue, 10) || 0;
  
  const spring = useSpring(0, { mass: 1, stiffness: 50, damping: 20, duration: 2000 });
  const displayValue = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(numericValue);
  }, [spring, numericValue]);

  return (
    <span className="flex items-center justify-center">
      <motion.span>{displayValue}</motion.span>
      <span>{suffix}</span>
    </span>
  );
};

// --- MARQUEE COMPONENT FOR TEXT ---
const Marquee = ({ children, direction = "left", speed = 25, pauseOnHover = false }) => {
  return (
    <div className={`flex overflow-hidden transform-gpu ${pauseOnHover ? 'group' : ''}`}>
      <motion.div
        initial={{ x: direction === "left" ? 0 : "-100%" }}
        animate={{ x: direction === "left" ? "-100%" : 0 }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="flex shrink-0 gap-8 group-hover:[play-state:paused] will-change-transform"
      >
        {children}
        {children}
      </motion.div>
      <motion.div
        initial={{ x: direction === "left" ? 0 : "-100%" }}
        animate={{ x: direction === "left" ? "-100%" : 0 }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="flex shrink-0 gap-8 group-hover:[play-state:paused] will-change-transform"
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
};

// --- ANIMATED TEXT COMPONENT ---
const AnimatedText = ({ text, className }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`inline-block ${className} will-change-transform`}
    >
      {text}
    </motion.span>
  );
};

// --- HERO IMAGE FLOATING ELEMENT ---
const FloatingElement = ({ children, delay = 0, duration = 3 }) => (
  <motion.div
    animate={{ y: [0, -15, 0], rotate: [0, 2, -2, 0] }}
    transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    className="will-change-transform transform-gpu hidden md:block" 
  >
    {children}
  </motion.div>
);

// --- HOLI COLOR BURST (GPU Optimized) ---
const ColorBurst = ({ x, y, colorClass, baseDelay }) => {
  const particles = useMemo(() => {
    return [...Array(12)].map((_, i) => ({ 
      id: i,
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
      scale: Math.random() * 3 + 1,
      delay: baseDelay + (Math.random() * 1.5)
    }));
  }, [baseDelay]);

  return (
    <div className={`absolute pointer-events-none ${x} ${y} z-0`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{ x: p.x, y: p.y, scale: [0, p.scale, 0], opacity: [0.6, 0.2, 0] }}
          transition={{ duration: 2.5, delay: p.delay, repeat: Infinity, repeatDelay: 1.5 + Math.random() }}
          className={`absolute w-12 h-12 md:w-16 md:h-16 rounded-full blur-xl mix-blend-multiply dark:mix-blend-screen transform-gpu will-change-transform ${colorClass}`}
        />
      ))}
    </div>
  );
};

// --- ANIMATED PICHKARI ---
const AnimatedPichkari = ({ top, left, right, bottom, rotate, colorClass, waterColorClass, delay }) => (
  <motion.div
    className="absolute pointer-events-none flex items-center drop-shadow-xl transform-gpu will-change-transform opacity-70 md:opacity-100"
    style={{ top, left, right, bottom, rotate }}
    animate={{ scale: [1, 1.1, 1], x: [0, -10, 0] }} 
    transition={{ duration: 3, delay, repeat: Infinity, repeatDelay: 1 }}
  >
    <div className="relative z-10">
      <svg viewBox="0 0 100 30" className={`w-24 sm:w-32 lg:w-48 h-8 sm:h-12 lg:h-16 ${colorClass}`}>
        <rect x="15" y="5" width="60" height="20" rx="10" fill="currentColor" />
        <rect x="0" y="10" width="20" height="10" fill="#cbd5e1" className="dark:fill-slate-600" />
        <rect x="75" y="2" width="10" height="26" rx="3" fill="#facc15" />
        <path d="M 85 10 L 100 12 L 100 18 L 85 20 Z" fill="currentColor" />
      </svg>
    </div>
    
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 0.5, 0.5, 0], x: [0, 0, 100, 200] }}
      transition={{ duration: 3, delay, repeat: Infinity, repeatDelay: 1 }}
      className={`h-4 sm:h-6 lg:h-8 rounded-full absolute left-[65px] sm:left-[85px] lg:left-[105px] origin-left blur-[4px] shadow-[0_0_20px_currentColor] transform-gpu will-change-transform w-[150px] sm:w-[300px] lg:w-[400px] ${waterColorClass}`}
    />
  </motion.div>
);

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

// --- PREMIUM COURSE CARD COMPONENT (Restored Glassmorphism Design) ---
const CourseCard = ({ course, index }) => {
  const CardWrapper = course.isClosed ? motion.div : motion.a;
  const wrapperProps = course.isClosed 
    ? {} 
    : { href: course.link, target: "_blank", rel: "noopener noreferrer" };

  return (
    <CardWrapper 
      {...wrapperProps}
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
      className={`snap-start shrink-0 w-[85vw] sm:w-[320px] md:w-[360px] relative group block outline-none ${course.isClosed ? 'opacity-80' : ''}`}
    >
      {!course.isClosed && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-primary rounded-[2rem] blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10 transform-gpu"></div>
      )}
      
      <div className={`h-full flex flex-col bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border ${course.isClosed ? 'border-slate-200 dark:border-slate-800' : 'border-white/40 dark:border-slate-700/50'} rounded-[2rem] overflow-hidden shadow-xl ${!course.isClosed && 'hover:shadow-2xl md:group-hover:-translate-y-1'} transition-all duration-300 relative transform-gpu`}>
        
        {course.badge && (
          <div className={`absolute top-4 right-4 z-20 px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1 ${course.isClosed ? 'bg-slate-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
            {!course.isClosed && <Flame size={12} />} {course.badge}
          </div>
        )}

        <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-200 dark:bg-slate-800 p-2">
           <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
              <img src={course.img} alt={course.title} className={`w-full h-full object-cover object-center transition-transform duration-700 ease-in-out ${!course.isClosed && 'md:group-hover:scale-110'} ${course.isClosed && 'grayscale opacity-70'} transform-gpu`} loading="lazy" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80 md:group-hover:opacity-60 transition-opacity pointer-events-none"></div>
              
              <div className="absolute top-3 left-3 px-3 py-1 bg-white/20 backdrop-blur-md rounded-xl text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider border border-white/30 shadow-sm pointer-events-none">
                {course.category === 'Mentorship' ? course.subCategory : course.category}
              </div>
              
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white z-10 pointer-events-none">
                <div className="flex items-center gap-1 sm:gap-1.5 text-yellow-400 text-xs sm:text-sm font-bold bg-black/50 backdrop-blur-md px-2 sm:px-2.5 py-1 rounded-lg border border-white/10">
                  <Star size={12} fill="currentColor"/> {course.rating}
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-white/90 bg-black/50 backdrop-blur-md px-2 sm:px-2.5 py-1 rounded-lg border border-white/10">
                  <Users size={10}/> {course.students}
                </div>
              </div>
           </div>
        </div>

        <div className="p-5 sm:p-6 flex-1 flex flex-col relative z-10 bg-gradient-to-b from-transparent to-white/50 dark:to-slate-900/50">
           <h3 className={`text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-3 leading-tight transition-colors ${!course.isClosed && 'md:group-hover:text-transparent md:group-hover:bg-clip-text md:group-hover:bg-gradient-to-r md:group-hover:from-blue-600 md:group-hover:to-purple-500'}`}>
             {course.title}
           </h3>
           
           <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {course.startDate ? (
                 <span className={`flex items-center gap-1 ${course.isClosed ? 'text-red-500' : 'text-emerald-500'}`}>
                   <Calendar size={12}/> Batch: {course.startDate}
                 </span>
              ) : (
                <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-500"/> Verified</span>
              )}
              <span className="flex items-center gap-1"><Clock size={12} className="text-primary"/> {course.duration}</span>
           </div>

           <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-6 flex-1 line-clamp-2 leading-relaxed font-medium">
             {course.desc}
           </p>
           
           <div className="flex items-center justify-between pt-4 sm:pt-5 border-t border-slate-200 dark:border-slate-800 mt-auto">
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs text-slate-400 line-through font-semibold mb-0.5">{course.oldPrice}</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">{course.price}</span>
              </div>
              
              {course.isClosed ? (
                <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500 rounded-xl font-bold text-[10px] sm:text-sm shadow-inner cursor-not-allowed border border-slate-300 dark:border-slate-700">
                  Closed <Lock size={14} />
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-[10px] sm:text-sm shadow-lg md:group-hover:bg-primary md:dark:group-hover:bg-primary md:group-hover:text-white transition-all">
                  {course.link?.includes('t.me') ? "Join via Telegram" : "Enroll Now"} <ExternalLink size={14} />
                </div>
              )}
           </div>
        </div>
      </div>
    </CardWrapper>
  );
};

// --- HORIZONTAL SLIDER COMPONENT (Adjusted padding/mobile arrows) ---
const CourseRow = ({ title, courses }) => {
  const sliderRef = useRef(null);

  const slide = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.85 : 360;
      sliderRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (courses.length === 0) return null;

  return (
    <div className="mb-16 md:mb-20 relative">
      <div className="flex items-center justify-between mb-6 md:mb-8 px-4 sm:px-6 lg:px-10 gap-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 md:gap-4 tracking-tight">
          <span className="w-1.5 md:w-2 h-8 md:h-10 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
          {title}
        </h2>
        
        {/* Desktop Controls */}
        <div className="hidden md:flex gap-3 shrink-0">
          <button onClick={() => slide('left')} className="p-2.5 md:p-3 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition shadow-sm hover:scale-110 active:scale-95 transform-gpu">
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </button>
          <button onClick={() => slide('right')} className="p-2.5 md:p-3 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition shadow-sm hover:scale-110 active:scale-95 transform-gpu">
            <ChevronRight size={20} className="md:w-6 md:h-6" />
          </button>
        </div>

        {/* Mobile Swipe Indicator (New feature requested) */}
        <div className="md:hidden flex items-center shrink-0">
          <motion.div 
            animate={{ x: [0, 8, 0] }} 
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="flex items-center gap-1.5 text-primary font-bold text-[11px] bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full"
          >
            Swipe <ArrowRight size={12} strokeWidth={3} />
          </motion.div>
        </div>
      </div>

      <div 
        ref={sliderRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 md:gap-8 pb-10 md:pb-12 pt-2 md:pt-4 px-4 sm:px-6 lg:px-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth w-full"
      >
        {courses.map((course, idx) => (
          <CourseCard key={course.id} course={course} index={idx} />
        ))}
        {/* Spacer to allow full scroll padding on right */}
        <div className="shrink-0 w-2 sm:w-4 md:w-8"></div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function Courses() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="pt-24 md:pt-28 pb-16 md:pb-20 min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden font-sans selection:bg-purple-500/30 w-full">
      
      {/* --- Deep Glassmorphism Animated Background --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="hidden md:block absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-blue-600/20 dark:bg-blue-600/10 rounded-full blur-[150px] transform-gpu" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4], rotate: [0, -90, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className="hidden md:block absolute top-[40%] -right-[10%] w-[800px] h-[800px] bg-purple-600/20 dark:bg-purple-600/10 rounded-full blur-[150px] transform-gpu" />
      </div>

      {/* Replaced max-w-[1600px] with max-w-[1400px] to prevent extreme edge stretching on laptops */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto 2xl:px-8">
        
        {/* --- EYE-CATCHING IMPORTANT ALERT BANNER --- */}
        <div className="px-4 sm:px-6 lg:px-10 pt-2">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mx-auto max-w-5xl p-4 md:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-center gap-3 text-amber-800 dark:text-amber-400 shadow-lg shadow-amber-500/5 text-center sm:text-left relative overflow-hidden group transform-gpu"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent md:group-hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>
            
            <div className="p-2 bg-amber-500/20 rounded-full animate-pulse shrink-0">
              <AlertCircle size={20} className="md:w-6 md:h-6 text-amber-600 dark:text-amber-400" />
            </div>
            
            <p className="font-bold text-xs sm:text-sm md:text-base leading-snug">
              <span className="uppercase tracking-wider font-black mr-2 bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] sm:text-xs align-middle">Important</span> 
              Clicking <strong className="text-slate-900 dark:text-white">"Enroll Now"</strong> will redirect you to our official portal (<a href="https://www.studysmartiaspcs.com" target="_blank" rel="noopener noreferrer" className="underline decoration-amber-500/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">studysmartiaspcs.com</a>). After completing your purchase, please <strong>re-login</strong> to instantly access your course!
            </p>
          </motion.div>
        </div>

        {/* --- Header Section --- */}
        <div className="text-center mb-10 md:mb-16 px-4 sm:px-6 lg:px-10 pt-8 md:pt-10">
           <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-5 md:px-6 py-2 md:py-2.5 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/50 dark:border-slate-700 text-primary dark:text-purple-400 font-extrabold text-xs md:text-sm mb-6 md:mb-8 shadow-md">
             <Sparkles size={14} className="md:w-4 md:h-4 animate-pulse" /> Elite Preparation Modules
           </motion.div>
           
           <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-4 md:mb-6 tracking-tighter leading-tight">
             Transform Your <br className="sm:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-primary">Future.</span>
           </motion.h1>
           
           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl md:max-w-3xl mx-auto font-medium">
             Select your target exam and enroll in our highly acclaimed batches. 
           </motion.p>
        </div>

        {/* --- Segmented Control Filter Bar --- */}
        <div className="flex justify-start sm:justify-center mb-12 md:mb-16 px-4 sm:px-6 lg:px-10 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex p-1.5 md:p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl rounded-xl md:rounded-2xl border border-white/60 dark:border-slate-700/60 shadow-sm min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 sm:px-6 md:px-8 py-2 md:py-3.5 rounded-lg md:rounded-xl text-xs sm:text-sm md:text-base font-extrabold transition-all whitespace-nowrap z-10 ${
                  activeCategory === cat ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {activeCategory === cat && (
                  <motion.div layoutId="courseFilterBubble" className="absolute inset-0 bg-slate-900 dark:bg-white rounded-lg md:rounded-xl shadow-md -z-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full transform-gpu"
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
               <div className="mx-4 md:mx-6 lg:mx-10 text-center py-20 md:py-32 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md rounded-[2rem] md:rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-700">
                  <PlayCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto text-slate-400 mb-4 md:mb-6 opacity-30"/>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">New batches dropping soon!</h3>
                  <p className="text-sm md:text-lg text-slate-500 font-medium">Stay tuned for the upcoming {activeCategory} curriculum.</p>
               </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}