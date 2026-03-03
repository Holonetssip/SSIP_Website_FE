import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, useScroll } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Star, PlayCircle, BookOpen, Users,
  Award, Zap, Video, CheckCircle, Send,
  GraduationCap, Target, Phone, Mail,
  Youtube, MessageCircle, Instagram, Twitter, ChevronRight,
  ChevronLeft, Sparkles, BookMarked, Brain,
  PenTool, Smartphone, DownloadCloud, Play,
  Apple, Compass, MapPin, Copy, ExternalLink, Flame, ShieldCheck, Clock
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
    <div className={`flex overflow-hidden ${pauseOnHover ? 'group' : ''}`}>
      <motion.div
        initial={{ x: direction === "left" ? 0 : "-100%" }}
        animate={{ x: direction === "left" ? "-100%" : 0 }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="flex shrink-0 gap-8 group-hover:[play-state:paused]"
      >
        {children}
        {children}
      </motion.div>
      <motion.div
        initial={{ x: direction === "left" ? 0 : "-100%" }}
        animate={{ x: direction === "left" ? "-100%" : 0 }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="flex shrink-0 gap-8 group-hover:[play-state:paused]"
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
};

// --- ANIMATED TEXT COMPONENT ---
const AnimatedText = ({ text, className }) => {
  const words = text ? text.split(" ") : [];
  return (
    <motion.span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

// --- HERO IMAGE FLOATING ELEMENT ---
const FloatingElement = ({ children, delay = 0, duration = 3 }) => (
  <motion.div
    animate={{ y: [0, -15, 0], rotate: [0, 2, -2, 0] }}
    transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
  >
    {children}
  </motion.div>
);

// --- HOLI COLOR BURST ---
const ColorBurst = ({ x, y, colorClass, delay }) => {
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: (Math.random() - 0.5) * 500,
            y: (Math.random() - 0.5) * 500,
            scale: [0, Math.random() * 4 + 1, 0],
            opacity: [0.6, 0.3, 0] 
          }}
          transition={{ duration: 2.5, delay: delay, repeat: Infinity, repeatDelay: 1.5 + Math.random() * 2 }}
          className={`absolute w-16 h-16 rounded-full blur-xl mix-blend-multiply dark:mix-blend-screen ${colorClass}`}
        />
      ))}
    </div>
  );
};

// --- ANIMATED PICHKARI ---
const AnimatedPichkari = ({ top, left, right, bottom, rotate, colorClass, waterColorClass, delay }) => (
  <motion.div
    className="absolute pointer-events-none flex items-center drop-shadow-xl"
    style={{ top, left, right, bottom, rotate }}
    animate={{ scale: [1, 1.1, 1], x: [0, -20, 0] }} 
    transition={{ duration: 3, delay, repeat: Infinity, repeatDelay: 1 }}
  >
    <div className="relative z-10">
      <svg viewBox="0 0 100 30" className={`w-48 h-16 ${colorClass}`}>
        <rect x="15" y="5" width="60" height="20" rx="10" fill="currentColor" />
        <rect x="0" y="10" width="20" height="10" fill="#cbd5e1" className="dark:fill-slate-600" />
        <rect x="75" y="2" width="10" height="26" rx="3" fill="#facc15" />
        <path d="M 85 10 L 100 12 L 100 18 L 85 20 Z" fill="currentColor" />
        <rect x="25" y="5" width="5" height="20" fill="#ffffff" opacity="0.4" />
        <rect x="40" y="5" width="5" height="20" fill="#ffffff" opacity="0.4" />
        <rect x="55" y="5" width="5" height="20" fill="#ffffff" opacity="0.4" />
      </svg>
    </div>
    
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 0.5, 0.5, 0], x: [0, 0, 150, 250] }}
      transition={{ duration: 3, delay, repeat: Infinity, repeatDelay: 1 }}
      className={`h-8 rounded-full absolute left-[105px] origin-left blur-[4px] shadow-[0_0_20px_currentColor] ${waterColorClass}`}
      style={{ width: '500px' }}
    />
  </motion.div>
);

const Home = () => {
  const heroRef = useRef(null);
  const testimonialScrollRef = useRef(null);
  const courseScrollRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // --- COURSE SLIDER LOGIC ---
  const scrollCourses = (direction) => {
    if (courseScrollRef.current) {
      const container = courseScrollRef.current;
      const scrollAmount = window.innerWidth < 768 ? 320 : 400;
      if (direction === 'right') {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // --- TESTIMONIAL SLIDER LOGIC (Manual with looping effect) ---
  const scrollTestimonials = (direction) => {
    if (testimonialScrollRef.current) {
      const container = testimonialScrollRef.current;
      const scrollAmount = window.innerWidth < 768 ? 320 : 400; 
      
      if (direction === 'right') {
        // If near the end, loop back to the start
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      } else {
        // If near the start, loop to the end
        if (container.scrollLeft <= 10) {
          container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      }
    }
  };

  const handleCopyOrgCode = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText('KEDVTR');
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = 'KEDVTR';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  // --- HARDCODED TESTIMONIALS ---
  const testimonials = [
    { name: "Vaishali", rank: "Prelims Cleared", text: "Cleared Prelims with your support! I am really enjoying the MahaGranth lectures; the content is absolutely top-notch and exam-oriented.", avatar: "V" },
    { name: "Harshita", rank: "Mentorship Student", text: "This mentorship group genuinely helped me focus better on my studies despite a busy schedule. The daily tasks and supportive space have kept me highly consistent.", avatar: "H" },
    { name: "Nirmala", rank: "Granth 2.0 Student", text: "I joined Granth 2.0 and the videos are amazing. The assignments perfectly help in recalling the entire lecture, making memorization effortless!", avatar: "N" },
    { name: "Priya", rank: "UPSC/UPPCS Aspirant", text: "After years of major coachings, you are the only ones who provided a clear, clutter-free path for Mains. No more bulky materials, just exact, sufficient content.", avatar: "P" },
    { name: "Nayan", rank: "Mains Student", text: "The GS Paper 5 & 6 lectures are incredibly helpful and perfectly structured. The teachers' dedication and motivating approach make learning so much easier.", avatar: "N" },
    { name: "Utkarsh", rank: "MahaGranth Student", text: "MahaGranth provides the complete, well-researched study matter at a fraction of the cost of big institutes. It saves months of time spent just finding the right content.", avatar: "U" },
    { name: "Ish", rank: "UPPCS Aspirant", text: "Joining Granth for Prelims and MahaGranth for Mains was the best decision! The top-quality, effort-enriched content has completely sorted my UPPCS preparation.", avatar: "I" },
    { name: "Uttera Singh R.", rank: "UPPCS Aspirant", text: "The teaching methodology is so impactful and engaging that I literally recall and revise the concepts in my sleep! Truly an unforgettable learning experience.", avatar: "UR" },
    { name: "Shrishti", rank: "Foundation Student", text: "The best part is how easily I understand every single concept. The faculty's ability to explain complex subjects, especially History, is simply unmatched.", avatar: "S" },
    { name: "Supriya Upadhyay", rank: "UPPCS Aspirant", text: "The syllabus is covered in such a crisp, concise manner. My PYQ answer writing has improved immensely, and I can now generate relevant points within the time limit.", avatar: "SU" }
  ];

  // --- FEATURED COURSES ---
  const featuredCourses = [
    { 
      id: "upsc-2", category: "UPSC Prelims", title: "PYQ Reverse Engineering", 
      desc: "Master the art of decoding previous year questions to predict future exam patterns.", 
      price: "Explore", oldPrice: "Premium", rating: "4.8", students: "1.8k+", duration: "Self Paced", 
      img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F1371c1ec-703b-4fcc-a4e7-3234da55c3e9.png&w=384&q=75", 
      link: "https://www.studysmartiaspcs.com/courses/770945?mainCategory=0&subCatList=%5B342039%5D" 
    },
    { 
      id: "upsc-4", category: "UPSC Prelims", title: "NCERT Concept Roots", 
      desc: "Line-by-line coverage of fundamental NCERTs to build a rock-solid base.", 
      price: "Explore", oldPrice: "Premium", rating: "4.8", students: "3.2k+", duration: "Foundation", 
      img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F9f984dc3-87d2-43cc-ab84-7998ff6ed627.png&w=384&q=75", 
      link: "https://www.studysmartiaspcs.com/courses/770972?mainCategory=0&subCatList=%5B342039%5D" 
    },
    { 
      id: "uppcs-p-2", category: "UPPCS Prelims", title: "Granth (UPPCS 2025)", 
      desc: "The ultimate preparatory material tailored for UPPCS 2025 Prelims.", 
      price: "Explore", oldPrice: "Premium", rating: "4.9", students: "5k+", duration: "Targeted", badge: "Trending",
      img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F2721431a-b9e8-44d3-8680-c9d26fd45c1b.jpeg&w=384&q=75", 
      link: "https://www.studysmartiaspcs.com/courses/721212?mainCategory=0&subCatList=%5B343651%5D" 
    },
    { 
      id: "uppcs-m-1", category: "UPPCS Mains", title: "MahaGranth", 
      desc: "The definitive Mains coverage batch. Deep dive into all GS papers with answer writing.", 
      price: "Explore", oldPrice: "Premium", rating: "4.9", students: "2.3k+", duration: "Mains Specific", badge: "Flagship", 
      img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F85b8445d-493a-4902-be09-605ee4cea44f.png&w=384&q=75", 
      link: "https://www.studysmartiaspcs.com/courses/770999?mainCategory=0&subCatList=%5B343654%5D" 
    },
    { 
      id: "uppcs-p-4", category: "UPPCS Prelims", title: "CAC 3.0", 
      desc: "Current Affairs Compilation version 3.0 optimized for UPPCS specific events.", 
      price: "Explore", oldPrice: "Premium", rating: "4.8", students: "2.8k+", duration: "Current Affairs", 
      img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F0dea98a0-dc7f-451b-be2f-dc990fd8a4d3.png&w=384&q=75", 
      link: "https://www.studysmartiaspcs.com/courses/770996?mainCategory=0&subCatList=%5B343651%5D" 
    }
  ];

  return (
    <div className="pt-20 transition-colors duration-300 overflow-x-hidden relative">

      {/* --- HERO SECTION --- */}
      <section ref={heroRef} className="relative min-h-[90vh] flex flex-col justify-center z-10 pb-12 pt-4 overflow-hidden">
        
        {/* BACKGROUND Holi Clouds */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900 transition-colors duration-300"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>

          <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,197,94,0.3)_0%,transparent_70%)] mix-blend-multiply dark:mix-blend-screen" />
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(234,179,8,0.3)_0%,transparent_70%)] mix-blend-multiply dark:mix-blend-screen" />
          <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(236,72,153,0.3)_0%,transparent_70%)] mix-blend-multiply dark:mix-blend-screen" />
        </div>

        {/* MIDGROUND Holi Effects */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <ColorBurst x="15%" y="35%" colorClass="bg-pink-500" delay={0} />
          <ColorBurst x="85%" y="25%" colorClass="bg-yellow-400" delay={1.5} />
          <ColorBurst x="75%" y="85%" colorClass="bg-cyan-400" delay={3} />
          <ColorBurst x="25%" y="75%" colorClass="bg-green-500" delay={2} />

          <AnimatedPichkari top="20%" left="-5%" rotate="20deg" colorClass="text-pink-500" waterColorClass="bg-pink-400 text-pink-400" delay={0} />
          <AnimatedPichkari bottom="30%" right="-5%" rotate="-160deg" colorClass="text-green-500" waterColorClass="bg-green-400 text-green-400" delay={1.5} />
        </div>

        {/* FOREGROUND CONTENT */}
        <motion.div style={{ y, opacity }} className="container mx-auto px-6 relative z-20">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex justify-center lg:justify-start mb-6">
            <div className="bg-gradient-to-r from-pink-500 via-yellow-500 to-green-500 p-[2px] rounded-full shadow-lg">
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-6 py-2 rounded-full flex items-center gap-2">
                 <Sparkles className="text-pink-500" size={18} />
                 <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-green-600 dark:from-pink-400 dark:to-green-400">
                   Happy Holi! Paint Your Success Story With Us
                 </span>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg mb-6 hover:shadow-xl transition-shadow">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wide">6,542+ ACTIVE STUDENTS</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] text-slate-900 dark:text-white mb-6 drop-shadow-sm">
                <AnimatedText text="Turn Your" className="block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-secondary animate-gradient bg-[length:200%_auto]">
                  IAS Dreams
                </span>
                <AnimatedText text="Into Reality" className="block" />
              </h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mb-4 font-medium">
                <span className="font-semibold text-primary">"Don't give up yet - your breakthrough is near"</span>
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mb-8 font-medium">
                The world is evolving, and so are Exams - why should your preparation stay the same? Study Smart with expert faculty, comprehensive materials & active community support.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/courses">
                  <motion.button whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(124, 58, 237, 0.3)" }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 group">
                    Explore Courses <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <a href="https://www.youtube.com/@studysmartiaspcs" target="_blank" rel="noopener noreferrer">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto px-8 py-4 bg-white/95 backdrop-blur-sm dark:bg-slate-800/95 text-slate-700 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-bold shadow-md hover:border-primary dark:hover:border-primary flex items-center justify-center gap-2 transition-all">
                    <PlayCircle size={20} className="text-red-500" /> Free on YouTube
                  </motion.button>
                </a>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full backdrop-blur-sm">Follow us:</span>
                <div className="flex gap-3">
                  {[
                    { icon: <Youtube size={20} />, href: "https://youtube.com/@studysmartiaspcs", color: "hover:text-red-500" },
                    { icon: <Send size={20} />, href: "https://t.me/StudySmartIASPCS", color: "hover:text-blue-500" },
                    { icon: <Instagram size={20} />, href: "https://instagram.com/studysmartiaspcs", color: "hover:text-pink-500" },
                    { icon: <Twitter size={20} />, href: "https://twitter.com/Studysmartias", color: "hover:text-sky-500" },
                  ].map((social, idx) => (
                    <motion.a key={idx} href={social.href} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.2, y: -2 }} className={`p-2 rounded-full bg-white/95 backdrop-blur-sm dark:bg-slate-800/95 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 shadow-md ${social.color} transition-all`}>
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative hidden lg:block">
              <div className="relative z-10">
                <motion.div whileHover={{ rotateY: 5, rotateX: 5 }} className="p-3 rounded-[2.5rem] bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-800/60 dark:to-slate-800/30 backdrop-blur-xl border border-white/50 dark:border-slate-700 shadow-2xl relative" style={{ transformStyle: "preserve-3d" }}>
                  <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Student Studying" className="rounded-[2rem] w-full h-[400px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-yellow-500/10 to-green-500/20 rounded-[2rem] mix-blend-overlay pointer-events-none"></div>
                </motion.div>

                <FloatingElement delay={0}>
                  <motion.div className="absolute top-8 -right-6 bg-white/95 backdrop-blur-sm dark:bg-slate-800/95 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-xl text-white shadow-md"><Video size={20} /></div>
                    <div><p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">Live Now</p><p className="font-bold text-slate-800 dark:text-white">UPPCS Batch 2026</p></div>
                  </motion.div>
                </FloatingElement>

                <FloatingElement delay={1} duration={4}>
                  <motion.div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm dark:bg-slate-800/95 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl text-white shadow-md"><CheckCircle size={20} /></div>
                    <div><p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">Results</p><p className="font-bold text-slate-800 dark:text-white">250+ Selections in Mains</p></div>
                  </motion.div>
                </FloatingElement>
              </div>
            </motion.div>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-30">
            {[
              { label: "Active Students", value: "6542", icon: <Users size={24}/>, gradient: "from-blue-500 to-cyan-500" },
              { label: "Total Courses", value: "21", icon: <BookOpen size={24}/>, gradient: "from-purple-500 to-pink-500" },
              { label: "Video Lessons", value: "1720", icon: <Video size={24}/>, gradient: "from-orange-500 to-red-500" },
              { label: "Free Video Lectures", value: "2000", icon: <Award size={24}/>, gradient: "from-green-500 to-emerald-500" },
            ].map((stat, idx) => (
               <motion.div key={idx} variants={scaleIn} whileHover={{ y: -5, scale: 1.02 }} className="relative overflow-hidden bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl group transition-all">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${stat.gradient} text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </div>
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white"><Counter value={stat.value} /></h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
               </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* --- MARQUEE --- */}
      <section className="py-8 bg-gradient-to-r from-primary to-secondary relative z-20 overflow-hidden shadow-inner">
        <Marquee speed={30}>
          {["Expert Faculty", "Live Classes", "Telegram Community", "Daily Targets", "Answer Writing", "Mock Tests", "Memory Tricks", "1:1 Mentorship", "NCERT Focus", "PYQ Analysis"].map((item, idx) => (
            <span key={idx} className="text-white font-bold text-lg flex items-center gap-3 whitespace-nowrap px-4 tracking-wide">
              <Star size={16} className="text-yellow-300" fill="currentColor" /> {item}
            </span>
          ))}
        </Marquee>
      </section>

      {/* --- WHY CHOOSE US --- */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4 tracking-widest">WHY STUDY SMART?</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Study Smart, Achieve Great</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">Together towards IAS & PCS Success! We don't just teach subjects; we build officers.</p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <GraduationCap />, title: "Expert Faculty", desc: "Instruction from experienced educators and former civil servants who understand the exam inside-out.", gradient: "from-blue-500 to-cyan-500" },
              { icon: <BookOpen />, title: "Comprehensive Material", desc: "Structured notes, video lectures with memory tricks, and practice assessments designed for success.", gradient: "from-purple-500 to-pink-500" },
              { icon: <MessageCircle />, title: "Active Community", desc: "Telegram-based peer network with daily updates, discussions, and continuous assistance.", gradient: "from-orange-500 to-red-500" },
              { icon: <Target />, title: "Daily Targets", desc: "Structured daily goals and quizzes to keep you on track and maintain consistent progress.", gradient: "from-green-500 to-emerald-500" },
              { icon: <Video />, title: "Live Mentorship", desc: "Regular live sessions for doubt clearing, strategy discussions, and one-on-one guidance.", gradient: "from-indigo-500 to-violet-500" },
              { icon: <Zap />, title: "Smart Techniques", desc: "Memory tricks, mnemonics, and proven strategies that make learning 10x more effective.", gradient: "from-rose-500 to-pink-500" },
            ].map((feature, idx) => (
               <motion.div key={idx} variants={fadeInUp} whileHover={{ y: -10 }} className="relative bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-slate-100 dark:border-slate-700 group overflow-hidden transition-all duration-300">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-r ${feature.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-30 transition-opacity duration-500`}></div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                     {React.cloneElement(feature.icon, { size: 28 })}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed relative z-10">{feature.desc}</p>
               </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- FEATURED COURSES SECTION --- */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 border-y border-slate-100 dark:border-slate-800 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4 tracking-widest uppercase">POPULAR COURSES</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Our Best Selling Programs</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Handpicked premium courses for UPSC & UPPCS preparation</p>
            </div>
            <Link to="/courses" className="mt-4 md:mt-0 px-6 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-primary dark:hover:bg-primary hover:-translate-y-1 transition-all flex items-center gap-2 shadow-lg">
              View All Courses <ChevronRight size={18} />
            </Link>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {featuredCourses.map((course, idx) => (
              <motion.a 
                key={idx} 
                href={course.link}
                target="_blank"
                rel="noopener noreferrer"
                variants={fadeInUp} 
                whileHover={{ y: -10 }} 
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] shadow-xl hover:shadow-2xl border border-white/50 dark:border-slate-700 overflow-hidden group transition-all duration-300 flex flex-col"
              >
                {/* Changed object-contain to object-cover to fit container perfectly without stretching */}
                <div className="w-full aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800/50 p-2">
                  <div className="w-full h-full rounded-[1.2rem] overflow-hidden relative">
                    <img src={course.img} alt={course.title} className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${course.color} opacity-20 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none`}></div>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-between text-center gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{course.category}</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
                  </div>
                  <button className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-md group-hover:bg-primary dark:group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center gap-2">
                    Enroll Now <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </motion.a>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center py-12 mt-8">
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg max-w-xl mx-auto">
              Browse our complete catalog of UPSC, UPPCS & CSAT preparation courses - from foundational to advanced levels.
            </p>
            <Link to="/courses">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-10 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-3 mx-auto text-lg">
                <BookOpen size={22} /> Explore All Courses <ChevronRight size={20} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- TARGETED PROGRAMS --- */}
      <section className="py-24 relative z-10 bg-white dark:bg-slate-900 overflow-hidden border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-4 tracking-widest uppercase">Targeted Programs</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Focused Exam Preparation</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">Choose your destination, and let us guide you through the smartest route to success.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "UPSC Civil Services", description: "Holistic coverage of Prelims & Mains with dedicated mentorship.", icon: <Compass size={32} />, color: "bg-blue-500 dark:bg-blue-600", link: "/courses" },
              { title: "UPPCS PCS", description: "State-specific general studies, current affairs, and comprehensive test series.", icon: <MapPin size={32} />, color: "bg-purple-500 dark:bg-purple-600", link: "/courses" },
              { title: "RO / ARO", description: "Focused batches targeting exact syllabus requirements with PYQ analysis.", icon: <BookMarked size={32} />, color: "bg-rose-500 dark:bg-rose-600", link: "/courses" },
              { title: "Answer Writing", description: "Daily mains practice with expert evaluation to boost your score.", icon: <PenTool size={32} />, color: "bg-emerald-500 dark:bg-emerald-600", link: "/courses" }
            ].map((program, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -8 }} className="group relative p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all">
                <div className={`w-16 h-16 rounded-2xl ${program.color} text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>{program.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{program.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{program.description}</p>
                <Link to={program.link} className="inline-flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all">
                  Explore Program <ArrowRight size={18} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- APP DOWNLOAD SECTION WITH ORG CODE --- */}
      <section className="py-24 relative z-10 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            {/* Text & CTA */}
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm mb-6">
                <Smartphone size={16} /> Official Mobile App
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Take your prep <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">everywhere you go.</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Experience seamless learning with our highly-rated mobile application. Get access to live classes, offline video downloads, daily current affairs, and mock tests directly on your smartphone.
              </p>

              {/* Prominent Org Code Box */}
              <div className="mb-8 p-4 md:p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md inline-flex flex-col items-center lg:items-start max-w-full">
                 <p className="text-slate-300 text-sm font-medium mb-2">Use this Organization Code to log in:</p>
                 <button 
                   onClick={handleCopyOrgCode}
                   className="group relative flex items-center gap-4 bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl border border-slate-600 transition-colors w-full sm:w-auto overflow-hidden"
                 >
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500"></div>
                    <span className="text-2xl md:text-3xl font-black tracking-widest text-white uppercase pl-2">KEDVTR</span>
                    
                    <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 px-3 py-1.5 rounded-lg group-hover:bg-primary/20 transition-colors ml-4">
                      {copied ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      {copied ? "Copied!" : "Copy Code"}
                    </div>
                 </button>
              </div>

              <ul className="space-y-4 mb-10 text-left max-w-md mx-auto lg:mx-0">
                {['Access to Premium Video Lectures & Notes', 'Offline Downloads to study without internet', 'Daily Quizzes & Current Affairs updates'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle size={14} className="text-emerald-400" />
                    </div>
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="https://aalexis.page.link/BYyH" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-extrabold text-lg transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:-translate-y-1">
                  <DownloadCloud size={24} className="text-primary group-hover:scale-110 transition-transform" />
                  Download for Android
                </a>
                <a href="https://apps.apple.com/in/app/classplus/id1324522260" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-3 px-8 py-4 bg-transparent border-2 border-white/20 hover:bg-white/10 text-white rounded-2xl font-extrabold text-lg transition-all hover:-translate-y-1">
                  <Apple size={24} className="text-white group-hover:scale-110 transition-transform" />
                  Download for iOS
                </a>
              </div>
            </motion.div>

            {/* 3D CSS App Mockup */}
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative flex justify-center items-center h-[500px] lg:h-[600px]">
              <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 right-0 lg:right-10 z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400"><Star size={20} fill="currentColor" /></div>
                <div><p className="text-white font-bold text-sm">4.9/5 Rating</p><p className="text-slate-400 text-xs">Based on 10k+ reviews</p></div>
              </motion.div>
              <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-20 left-0 lg:left-10 z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400"><Play size={20} fill="currentColor" /></div>
                <div><p className="text-white font-bold text-sm">Live Classes</p><p className="text-slate-400 text-xs">Watch anywhere</p></div>
              </motion.div>
              <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative w-[260px] h-[540px] bg-slate-800 rounded-[3rem] border-[10px] border-slate-900 shadow-2xl ring-4 ring-slate-800/50 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-2xl w-[40%] mx-auto z-30"></div>
                <div className="absolute inset-0 bg-slate-900 z-10">
                   <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80" alt="Study App UI" className="w-full h-full object-cover opacity-60" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent flex flex-col justify-end p-5">
                      <div className="w-full h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mb-4 p-4 flex flex-col justify-between">
                         <div className="w-1/2 h-3 bg-white/30 rounded-full"></div>
                         <div className="flex gap-2">
                           <div className="w-8 h-8 rounded-lg bg-blue-500/50"></div>
                           <div className="w-8 h-8 rounded-lg bg-purple-500/50"></div>
                         </div>
                      </div>
                      <div className="w-3/4 h-5 bg-white/20 backdrop-blur-md rounded-full mb-3"></div>
                      <div className="w-1/2 h-5 bg-white/20 backdrop-blur-md rounded-full"></div>
                   </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- MANUAL LOOPING TESTIMONIALS SLIDER --- */}
      <section className="py-24 relative z-10 overflow-hidden bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-left max-w-2xl">
              <span className="inline-block px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-bold text-sm mb-4 tracking-widest uppercase">TESTIMONIALS</span>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Trusted by Toppers</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">Hear from students who transformed their preparation with SSIP</p>
            </motion.div>
            
            {/* Custom Manual Slider Controls for Testimonials */}
            <div className="flex gap-4 pb-2">
              <button 
                onClick={() => scrollTestimonials('left')} 
                className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-md hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 z-20"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => scrollTestimonials('right')} 
                className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-md hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 z-20"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
          
          <div className="relative -mx-6 px-6">
            <div 
              ref={testimonialScrollRef} 
              className="flex gap-6 md:gap-8 overflow-x-auto pb-12 pt-8 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {testimonials.map((testimonial, idx) => (
                <div 
                  key={idx} 
                  className="w-[80vw] sm:w-[350px] lg:w-[400px] aspect-square shrink-0 snap-start p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 relative group transition-all duration-500 flex flex-col justify-between shadow-md hover:shadow-2xl hover:-translate-y-2 cursor-default"
                >
                  <div className="absolute top-6 right-6 text-slate-100 dark:text-slate-700 transition-colors group-hover:text-primary/20">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                    </svg>
                  </div>
                  
                  <div className="flex text-yellow-400 mb-4 gap-1 relative z-10">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  
                  <div className="flex-grow overflow-y-auto pr-2 mb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base font-medium">"{testimonial.text}"</p>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto shrink-0">
                    <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center font-bold text-white text-lg shadow-md transition-transform group-hover:scale-110">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base line-clamp-1">{testimonial.name}</h4>
                      <p className="text-xs font-bold text-primary">{testimonial.rank}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="shrink-0 w-[5vw] md:w-[10vw]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative bg-gradient-to-r from-primary via-purple-600 to-secondary rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl overflow-hidden">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl" />

            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Ready to Start Your Journey?</h2>
              <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">
                Join 6,542+ aspirants who are learning smarter, not harder. Let's together conquer UPSC & UPPCS!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/courses">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-10 py-5 bg-white text-primary rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all">
                    Get Started Now
                  </motion.button>
                </Link>
                <a href="https://t.me/StudySmartIASPCS" target="_blank" rel="noopener noreferrer">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-10 py-5 bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white rounded-2xl font-bold text-lg hover:bg-white/30 transition-all flex items-center justify-center gap-2">
                    <Send size={20} /> Join Telegram
                  </motion.button>
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- CONTACT INFO --- */}
      <section className="py-16 bg-slate-100 dark:bg-slate-800/50 relative z-10 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <GraduationCap size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Study Smart IAS PCS</h3>
                <p className="text-slate-500 dark:text-slate-400">Your trusted UPSC/PCS preparation partner</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="mailto:studysmartiaspcs@gmail.com" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors font-semibold">
                <Mail size={20} /> studysmartiaspcs@gmail.com
              </a>
              <a href="tel:+918810843292" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors font-semibold">
                <Phone size={20} /> +91 8810843292
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;