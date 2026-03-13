import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Star, PlayCircle, Users,
  Flame, ShieldCheck, Clock, AlertCircle, Lock, Calendar,
  ExternalLink, ChevronRight, ChevronLeft, Sparkles, Send
} from 'lucide-react';

// --- MENTORSHIP LOCAL IMAGES ---
import mentorImg1 from '../assets/mentor/P1.jpg';
import mentorImg2 from '../assets/mentor/P2.jpg';
import mentorImg3 from '../assets/mentor/P3.jpg';
import mentorImg4 from '../assets/mentor/M3.jpg';
import mentorImg5 from '../assets/mentor/M2.jpg';
import mentorImg6 from '../assets/mentor/M1.jpg';

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

// --- EXACT COURSE DATA & LINKS ---
const allCourses = [
  // ==========================================
  // UPSC PRELIMS
  // ==========================================
   { 
    id: "upsc-2", category: "UPSC Prelims", title: "PYQ Reverse Engineering", 
    desc: "Master the art of decoding previous year questions to predict future exam patterns.", 
    price: "2,999", oldPrice: "4,999", rating: "4.8", students: "1.8k+", 
    duration: "Self Paced", badge:"Must Have",
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F0326fec9-da8e-4e7f-b71f-6564bcae1122.png&w=384&q=75", 
    link: "https://www.ssip.cloud/courses/770945?filterId=1&sortId=7" 
  },
  { 
    id: "upsc-4", category: "UPSC Prelims", title: "NCERT Concept Roots", 
    desc: "Line-by-line coverage of fundamental NCERTs to build a rock-solid base.", 
    price: "1,111", oldPrice: "2,199", rating: "4.8", students: "3.2k+", 
    duration: "Foundation", badge:"Best Seller",
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F0fdd717f-65a9-4f92-9c22-87eb32d77a93.png&w=384&q=75", 
    link: "https://www.ssip.cloud/courses/770972?filterId=1&sortId=7" 
  },
  { 
    id: "upsc-1", category: "UPSC Prelims", title: "Rapid Revision Course (VOD) for UPSC 2026", 
    desc: "Complete video-on-demand rapid revision covering all essential UPSC Prelims topics.", 
    price: "1,499", oldPrice: "2,999", rating: "4.9", students: "2.5k+", 
    duration: "VOD", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F755b4d87-3f94-4b39-a38a-5a83026913c9.png&w=384&q=75", 
    link: "https://www.ssip.cloud/courses/770966?filterId=1&sortId=7" 
  },
  { 
    id: "upsc-3", category: "UPSC Prelims", title: "General Studies Magazine", 
    desc: "Comprehensive syllabus coverage with crisp notes in a magazine format.", 
    price: "499", oldPrice: "1,499", rating: "4.9", students: "4k+", 
    duration: "VOD", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2Fd2f01b59-22e6-463d-b638-ceda63b2ee9b.png&w=384&q=75", 
    link: "https://www.ssip.cloud/courses/770970?filterId=1&sortId=7" 
  },
  
  // ==========================================
  // UPPCS PRELIMS
  // ==========================================
  { 
    id: "uppcs-p-5", category: "UPPCS Prelims", title: "Granth 2.0", 
    desc: "All subjects GHATNA CHAKRA & lucent coverage through tricks & nemonic for retention.", 
    price: "2,499", oldPrice: "4,999", rating: "4.9", students: "1.2k+", 
    duration: "Foundation", badge:"Trending",
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F71d35ae1-c133-4273-9000-4fa341611bfe.png&w=384&q=75", 
    link: "https://www.ssip.cloud/courses/770985?filterId=1&sortId=7" 
  },
  { 
    id: "uppcs-p-4", category: "UPPCS Prelims", title: "CAC 3.0", 
    desc: "Monthly Current Affairs Compilation version 3.0 optimized for UPPCS specific events including lectures & notes.", 
    price: "499", oldPrice: "1,499", rating: "4.8", students: "2.8k+", 
    duration: "Current Affairs", badge:"Best Seller",
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2Fcb831c14-7671-4fbb-a352-3b242af51c38.png&w=384&q=75", 
    link: "https://www.ssip.cloud/courses/770996?filterId=1&sortId=7" 
  },
  { 
    id: "uppcs-p-3", category: "UPPCS Prelims", title: "Score Boosters", 
    desc: "High-yield topics and short tricks to instantly elevate your Prelims score of all subjects (UP SPECIAL).", 
    price: "499", oldPrice: "1,999", rating: "4.7", students: "3.5k+", 
    duration: "MAGZINE", badge:"Must Have",
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F1dbb3067-9350-4dc0-99b6-cdd02533ffb3.png&w=384&q=75", 
    link: "https://www.ssip.cloud/courses/770990?filterId=1&sortId=7" 
  },
  { 
    id: "uppcs-p-2", category: "UPPCS Prelims", title: "GRANTH (GHATNA CHAKRA)", 
    desc: "The ultimate preparatory material tailored for UPPCS 2025 Prelims.", 
    price: "1,499", oldPrice: "4,999", rating: "4.9", students: "5k+", 
    duration: "VOD", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F9bade139-7424-4543-946d-4ba4b105487f.png&w=384&q=75", 
    link: "https://www.ssip.cloud/courses/721212?filterId=1&sortId=7" 
  },

  // ==========================================
  // UPPCS MAINS
  // ==========================================
  { 
    id: "uppcs-m-1", category: "UPPCS Mains", title: "MAHAGRANTH", 
    desc: "The definitive Mains coverage batch. Deep dive into all GS papers with blueprint techniques & tricks.", 
    price: "3,999", oldPrice: "9,999", rating: "4.9", students: "2.3k+", 
    duration: "GS 1 to 6", badge: "Flagship", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F8287d028-202c-441b-990d-f49b7224190d.png&w=384&q=75", 
    link: "https://www.ssip.cloud/courses/770999?filterId=1&sortId=7" 
  },
  { 
    id: "uppcs-m-2", category: "UPPCS Mains", title: "GS 5&6 - UP Special", 
    desc: "Exhaustive coverage of newly added UP Special Papers 5 and 6.", 
    price: "999", oldPrice: "2,499", rating: "4.8", students: "3.1k+", 
    duration: "Thematic Coverage", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F901d2ccf-26af-4895-b558-9a08c59b9c92.png&w=384&q=75", 
    link: "https://www.ssip.cloud/courses/771002?filterId=1&sortId=7" 
  },
  { 
    id: "uppcs-m-3", category: "UPPCS Mains", title: "ESSAY FOR UPPCS AND UPSC", 
    desc: "Real-life case studies, philosophical essay decoding, and high-scoring structures.", 
    price: "999", oldPrice: "2,999", rating: "4.9", students: "1.5k+", 
    duration: "Mains Focus", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2Ff0be90a3-2c07-4cb0-a962-a0feb1f1bf2c.png&w=384&q=75", 
    link: "https://www.ssip.cloud/courses/804293?filterId=1&sortId=7" 
  },
  { 
    id: "uppcs-m-4", category: "UPPCS Mains", title: "सामान्य हिंदी - UPPCS MAINS", 
    desc: "Compulsory Hindi paper mastery with Crips Notes.", 
    price: "999", oldPrice: "2,999", rating: "4.9", students: "1.5k+", 
    duration: "Mains Focus", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F2254dbc7-e4ab-4086-911b-47946ff6d6b3.png&w=384&q=75", 
    link: "https://www.ssip.cloud/courses/771006?filterId=1&sortId=7" 
  },
  { 
    id: "uppcs-m-5", category: "UPPCS Mains", title: "CAC Mains", 
    desc: "One Year compilation in answer writing format.", 
    price: "499", oldPrice: "1,499", rating: "4.9", students: "1.5k+", 
    duration: "Mains Focus", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F1ceee6b1-5d49-47ee-86a2-0499bee97ced.png&w=384&q=75", 
    link: "https://www.ssip.cloud/courses/771012?filterId=1&sortId=7" 
  },

  // ==========================================
  // MENTORSHIP: UPPCS Prelims
  // ==========================================
  { 
    id: "m-pre-3", category: "Mentorship", subCategory: "UPPCS Prelims Mentorship", title: "Prelims Mentorship - Batch 3", 
    desc: "Daily targets, 1-on-1 guidance, strict monitoring, and doubt clearing sessions.", 
    price: "₹4,999", oldPrice: "₹7,000", rating: "New", students: "Filling Fast", 
    duration: "Till Prelims", startDate: "15-03-2026", badge: "Admissions Open", isClosed: false, 
    img: mentorImg3,
    link: "https://t.me/m/MzXlzGepNWY1" 
  },
  { 
    id: "m-pre-2", category: "Mentorship", subCategory: "UPPCS Prelims Mentorship", title: "Prelims Mentorship - Batch 2", 
    desc: "Daily targets, 1-on-1 guidance, strict monitoring, and doubt clearing sessions.", 
    price: "₹4,999", oldPrice: "₹7,000", rating: "4.9", students: "Full", 
    duration: "Till Prelims", startDate: "15-01-2026", isClosed: true, 
    img: mentorImg2 
  },
  { 
    id: "m-pre-1", category: "Mentorship", subCategory: "UPPCS Prelims Mentorship", title: "Prelims Mentorship - Batch 1", 
    desc: "Daily targets, 1-on-1 guidance, strict monitoring, and doubt clearing sessions.", 
    price: "₹4,999", oldPrice: "₹7,000", rating: "5.0", students: "Full", 
    duration: "Till Prelims", startDate: "08-12-2025", isClosed: true, 
    img: mentorImg1 
  },
  
  // ==========================================
  // MENTORSHIP: UPPCS Prelims+Mains
  // ==========================================
  { 
    id: "m-premains-3", category: "Mentorship", subCategory: "UPPCS Prelims+Mains Mentorship", title: "Pre+Mains Mentorship - Batch 3", 
    desc: "Integrated preparation strategy, daily answer writing evaluation, and personalized mentor calls.", 
    price: "₹9,999", oldPrice: "₹14,000", rating: "New", students: "Filling Fast", 
    duration: "1 Year", startDate: "15-03-2026", badge: "Admissions Open", isClosed: false, 
    img: mentorImg4,
    link: "https://t.me/m/MzXlzGepNWY1" 
  },
  { 
    id: "m-premains-2", category: "Mentorship", subCategory: "UPPCS Prelims+Mains Mentorship", title: "Pre+Mains Mentorship - Batch 2", 
    desc: "Integrated preparation strategy, daily answer writing evaluation, and personalized mentor calls.", 
    price: "₹9,999", oldPrice: "₹14,000", rating: "4.9", students: "Full", 
    duration: "1 Year", startDate: "15-01-2026", isClosed: true, 
    img: mentorImg5 
  },
  { 
    id: "m-premains-1", category: "Mentorship", subCategory: "UPPCS Prelims+Mains Mentorship", title: "Pre+Mains Mentorship - Batch 1", 
    desc: "Integrated preparation strategy, daily answer writing evaluation, and personalized mentor calls.", 
    price: "₹9,999", oldPrice: "₹14,000", rating: "5.0", students: "Full", 
    duration: "1 Year", startDate: "08-12-2025", isClosed: true, 
    img: mentorImg6 
  },

  /* // ==========================================
  // UNCOMMENT THESE WHEN READY TO LAUNCH
  // ==========================================
  { 
    id: "bpsc-1", category: "BPSC", title: "BPSC Prelims Foundation", 
    desc: "Complete syllabus coverage for BPSC with state-specific focus.", 
    price: "₹2,499", oldPrice: "₹4,999", rating: "New", students: "Filling Fast", 
    duration: "Foundation", badge: "Coming Soon", isClosed: false, 
    img: "PLACEHOLDER_IMAGE_URL",
    link: "#" 
  },
  { 
    id: "mppsc-1", category: "MPPSC", title: "MPPSC Prelims & Mains", 
    desc: "Integrated MPPSC preparation with answer writing modules.", 
    price: "₹3,499", oldPrice: "₹6,999", rating: "New", students: "Filling Fast", 
    duration: "Foundation", badge: "Coming Soon", isClosed: false, 
    img: "PLACEHOLDER_IMAGE_URL",
    link: "#" 
  }
  */
];

// --- UPDATED CATEGORIES ---
const categories = ["All", "UPSC Prelims", "UPPCS Prelims", "UPPCS Mains", "Mentorship", "BPSC", "MPPSC"];

const preloadImages = () => {
  const imagesToPreload = allCourses.slice(0, 6).map(course => course.img);
  imagesToPreload.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};

// --- SAFELY RENDERED COMING SOON PLACEHOLDER ---
const ComingSoonPlaceholder = ({ title }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-full py-20 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm text-center"
  >
    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-800">
      <Clock size={32} />
    </div>
    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{title} Courses Launching Soon</h3>
    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">We are carefully crafting the best study material and lectures for this exam. Stay tuned to our Telegram channel for the launch announcement!</p>
    <a href="https://t.me/StudySmartIASPCS" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-md hover:scale-105 transition-transform transform-gpu">
      <Send size={16} /> Join Telegram for Updates
    </a>
  </motion.div>
);

// --- PREMIUM COURSE CARD COMPONENT ---
const CourseCard = ({ course, index }) => {
  const CardWrapper = course.isClosed ? 'div' : 'a';
  const wrapperProps = course.isClosed 
    ? {} 
    : { href: course.link, target: "_blank", rel: "noopener noreferrer" };

  // Safely extract price to prevent .includes() crash on undefined
  const priceDisplay = course.price ? (String(course.price).includes('₹') ? course.price : `₹${course.price}`) : 'Free';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 0.4 }}
      className={`snap-start shrink-0 w-[85vw] sm:w-[350px] md:w-[400px] lg:w-[420px] relative group flex flex-col outline-none ${course.isClosed ? 'opacity-80' : ''}`}
    >
      {!course.isClosed && (
        <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-[2.2rem] opacity-0 group-hover:opacity-100 blur-sm md:blur-md transition-all duration-500 -z-10 group-hover:animate-pulse"></div>
      )}

      <CardWrapper 
        {...wrapperProps} 
        className="flex-1 flex flex-col bg-white dark:bg-slate-900 group-hover:bg-white/80 dark:group-hover:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 group-hover:border-white/50 dark:group-hover:border-slate-700/50 rounded-[2rem] overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 md:group-hover:-translate-y-1 m-[1px]"
      >
        
        {course.badge && (
          <div className={`absolute top-4 right-4 z-20 px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md flex items-center gap-1 ${course.isClosed ? 'bg-slate-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
            {!course.isClosed && <Flame size={12} />} {course.badge}
          </div>
        )}

        <div className="relative h-52 sm:h-60 overflow-hidden bg-slate-100 dark:bg-slate-800 p-2 shrink-0">
           <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
              <img 
                src={course.img} 
                alt={course.title} 
                className={`w-full h-full object-cover object-center transition-transform duration-700 ${!course.isClosed && 'md:group-hover:scale-105'} ${course.isClosed && 'grayscale opacity-70'} transform-gpu`} 
                loading={index > 3 ? "lazy" : "eager"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent pointer-events-none"></div>
              
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white z-10 pointer-events-none">
                <div className="flex items-center gap-1 sm:gap-1.5 text-yellow-400 text-xs sm:text-sm font-bold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  <Star size={12} fill="currentColor"/> {course.rating}
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  <Users size={10}/> {course.students}
                </div>
              </div>
           </div>
        </div>

        <div className="p-5 sm:p-6 flex-1 flex flex-col relative z-10">
           <h3 className={`text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 leading-tight transition-colors ${!course.isClosed && 'md:group-hover:text-transparent md:group-hover:bg-clip-text md:group-hover:bg-gradient-to-r md:group-hover:from-blue-600 md:group-hover:to-purple-600'}`}>
             {course.title}
           </h3>
           
           <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {course.startDate ? (
                 <span className={`flex items-center gap-1 ${course.isClosed ? 'text-red-500' : 'text-emerald-500'}`}>
                   <Calendar size={12}/> Batch: {course.startDate}
                 </span>
              ) : (
                <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-500"/> {course.category}</span>
              )}
              <span className="flex items-center gap-1"><Clock size={12} className="text-primary"/> {course.duration}</span>
           </div>

           <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-6 flex-1 leading-relaxed font-medium group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
             {course.desc}
           </p>
           
           <div className="flex items-center justify-between pt-4 sm:pt-5 border-t border-slate-100 dark:border-slate-800/50 mt-auto">
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs text-slate-400 line-through font-semibold mb-0.5">{course.oldPrice}</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">{priceDisplay}</span>
              </div>
              
              {course.isClosed ? (
                <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-bold text-[10px] sm:text-sm shadow-inner cursor-not-allowed border border-slate-200 dark:border-slate-700">
                  Closed <Lock size={14} />
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-[10px] sm:text-sm shadow-md md:group-hover:bg-primary dark:md:group-hover:bg-primary md:group-hover:text-white transition-all transform-gpu md:group-hover:scale-105">
                  {course.link?.includes('t.me') ? "Join Telegram" : "Enroll Now"} <ExternalLink size={14} />
                </div>
              )}
           </div>
        </div>
      </CardWrapper>
    </motion.div>
  );
};

// --- HORIZONTAL SLIDER COMPONENT ---
const CourseRow = ({ title, courses }) => {
  const sliderRef = useRef(null);

  const slide = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.85 : 380;
      sliderRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Safe Guard: Check if the category is empty. Display coming soon placeholder for BPSC/MPPSC.
  if (!courses || courses.length === 0) {
    if (title && title.includes("BPSC")) return <ComingSoonPlaceholder title="BPSC" />;
    if (title && title.includes("MPPSC")) return <ComingSoonPlaceholder title="MPPSC" />;
    return null;
  }

  return (
    <div className="mb-12 md:mb-16 relative">
      
      {/* Title & Badge ONLY (Removed the top-right arrows from here) */}
      <div className="flex items-center justify-between mb-4 md:mb-6 px-4 sm:px-6 lg:px-10 gap-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 md:gap-4 tracking-tight relative z-10">
          <span className="w-1.5 md:w-2 h-8 md:h-10 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full shrink-0"></span>
          <div className="flex items-center gap-3 flex-wrap">
            <span>{title}</span>
            <span className="text-sm md:text-base font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
              {courses.length}
            </span>
          </div>
        </h2>

        {/* Mobile swipe indicator */}
        <div className="md:hidden flex items-center shrink-0 relative z-10">
          <motion.div animate={{ x: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="flex items-center gap-1.5 text-primary font-bold text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full shadow-sm">
            Swipe <ArrowRight size={12} strokeWidth={3} />
          </motion.div>
        </div>
      </div>

      {/* --- Slider Container with Floating Edge Arrows --- */}
      <div className="relative w-full py-4 group/slider">
        
        {/* The completely pushed out floating arrows */}
        <div className="absolute top-1/2 -translate-y-1/2 -left-2 md:-left-6 lg:-left-8 -right-2 md:-right-6 lg:-right-8 flex justify-between z-30 pointer-events-none opacity-0 md:group-hover/slider:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => slide('left')} 
            className="pointer-events-auto p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:scale-110 active:scale-95 transition-all transform-gpu"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => slide('right')} 
            className="pointer-events-auto p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:scale-110 active:scale-95 transition-all transform-gpu"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Track with increased inner padding so cards don't hit the arrows */}
        <div ref={sliderRef} className="flex items-stretch overflow-x-auto snap-x snap-mandatory gap-6 sm:gap-8 pb-10 pt-4 px-4 md:px-12 lg:px-14 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth w-full relative z-20">
          {courses.map((course, idx) => (
            <CourseCard key={course.id} course={course} index={idx} />
          ))}
          <div className="shrink-0 w-2 sm:w-4 md:w-8"></div>
        </div>
        
      </div>

    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function Courses() {
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    preloadImages();
  }, []);

  return (
    <div className="pt-24 md:pt-28 pb-32 md:pb-40 lg:pb-48 min-h-screen bg-slate-50 dark:bg-slate-950 relative font-sans w-full overflow-x-hidden">
      
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="hidden md:block absolute top-[0%] left-[-5%] w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] transform-gpu"></div>
        <div className="hidden md:block absolute top-[40%] right-[-5%] w-[600px] h-[600px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px] transform-gpu"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto 2xl:px-8">
        
        {/* --- ALERT BANNER --- */}
        <div className="px-4 sm:px-6 lg:px-10 pt-2">
          <div className="mx-auto max-w-5xl p-4 md:p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 flex flex-col sm:flex-row items-center justify-center gap-3 text-amber-800 dark:text-amber-300 shadow-sm text-center sm:text-left transform-gpu">
            <AlertCircle size={24} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="font-medium text-xs sm:text-sm md:text-base leading-snug">
              <span className="uppercase tracking-wider font-bold mr-2 bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded text-[10px] sm:text-xs align-middle">Important</span> 
              Clicking <strong className="text-slate-900 dark:text-white">"Enroll Now"</strong> will redirect you to our official portal. After purchase, please <strong>re-login</strong> to instantly access your course!
            </p>
          </div>
        </div>

        {/* --- Header Section --- */}
        <div className="text-center mb-10 md:mb-16 px-4 sm:px-6 lg:px-10 pt-8 md:pt-10">
           <div className="inline-flex items-center gap-2 px-4 md:px-5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary dark:text-purple-400 font-bold text-xs md:text-sm mb-6 shadow-sm">
             <Sparkles size={14} className="text-yellow-500" /> Elite Preparation Modules
           </div>
           
           <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-4 md:mb-6 tracking-tighter leading-tight">
             Transform Your <br className="sm:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Future.</span>
           </h1>
           
           <p className="text-sm sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl md:max-w-3xl mx-auto font-medium">
             Select your target exam and enroll in our highly acclaimed batches. 
           </p>
        </div>

        {/* --- Segmented Control Filter Bar --- */}
        <div className="flex justify-start sm:justify-center mb-12 md:mb-16 px-4 sm:px-6 lg:px-10 overflow-x-auto pb-4 scrollbar-hide relative z-20">
          <div className="flex p-1.5 md:p-2 bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 sm:px-6 md:px-8 py-2 md:py-3.5 rounded-lg md:rounded-xl text-xs sm:text-sm md:text-base font-bold transition-all whitespace-nowrap z-10 ${
                  activeCategory === cat ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {activeCategory === cat && (
                  <motion.div layoutId="courseFilter" className="absolute inset-0 bg-slate-900 dark:bg-slate-600 rounded-lg md:rounded-xl shadow-md -z-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* --- Dynamic Course Sliders --- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full transform-gpu min-h-[50vh]"
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
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}