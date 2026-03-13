import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Star, PlayCircle, BookOpen, Users,
  Award, Zap, Video, CheckCircle, Send,
  GraduationCap, Target, Phone, Mail,
  Youtube, MessageCircle, Instagram, Twitter, ChevronRight,
  ChevronLeft, Sparkles, BookMarked, PenTool, 
  Smartphone, Play, Apple, Compass, 
  MapPin, Copy, ExternalLink
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
    animate={{ y: [0, -15, 0] }}
    transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    className="will-change-transform transform-gpu hidden lg:block" 
  >
    {children}
  </motion.div>
);

const Home = () => {
  const testimonialScrollRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // --- DYNAMIC STUDENT COUNTER LOGIC ---
  // Automatically increases base 6542 by 1, 2, or 3 every 26 hours
  const activeStudents = useMemo(() => {
    const baseNumber = 6542;
    // Set a fixed start date (e.g., Jan 1, 2024) to calculate elapsed time against
    const startDate = new Date('2024-01-01T00:00:00Z').getTime();
    const now = Date.now();
    
    // Calculate total 26-hour intervals passed
    const hoursPassed = Math.max(0, (now - startDate) / (1000 * 60 * 60));
    const intervalsPassed = Math.floor(hoursPassed / 26);

    let addition = 0;
    // A predictable pattern of 1, 2, 3 so it looks random but stays consistent for all users
    const randomPattern = [2, 1, 3, 1, 2, 3, 2, 3, 1, 2];
    
    for (let i = 0; i < intervalsPassed; i++) {
      addition += randomPattern[i % randomPattern.length];
    }
    
    return baseNumber + addition;
  }, []);

  const scrollTestimonials = (direction) => {
    if (testimonialScrollRef.current) {
      const container = testimonialScrollRef.current;
      const scrollAmount = window.innerWidth < 768 ? 300 : 400; 
      
      if (direction === 'right') {
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      } else {
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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
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

  // --- FEATURED COURSES WITH SPECIFIC URLS AND COLORS ---
  // --- FEATURED COURSES WITH PRICING ---
  const featuredCourses = [
    { id: "upsc-2", category: "UPSC Prelims", title: "PYQ Reverse Engineering", desc: "Master the art of decoding previous year questions to predict future exam patterns.", img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F0326fec9-da8e-4e7f-b71f-6564bcae1122.png&w=384&q=75", link: "https://www.studysmartiaspcs.com/courses/770945?mainCategory=0&subCatList=%5B342039%5D", price: "₹2,999", oldPrice: "₹4,999 (Excluding GST)", badge: "Must Have" },
    { id: "upsc-4", category: "UPSC Prelims", title: "NCERT Concept Roots", 
    desc: "Line-by-line coverage of fundamental NCERTs to build a rock-solid base.", 
    price: "1,111", oldPrice: "2,199 (Excluding GST)", rating: "4.8", students: "3.2k+", 
    duration: "Foundation", badge:"Best Seller",
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F0fdd717f-65a9-4f92-9c22-87eb32d77a93.png&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/770972?mainCategory=0&subCatList=%5B342039%5D" },
    { id: "uppcs-p-5", category: "UPPCS Prelims", title: "Granth 2.0", 
    desc: "All subjects GHATNA CHAKRA & lucent coverage through tricks & nemonic for retention.", 
    price: "2,499", oldPrice: "4,999 (Excluding GST)", rating: "4.9", students: "1.2k+", 
    duration: "Foundation", badge:"Trending",
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F71d35ae1-c133-4273-9000-4fa341611bfe.png&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/770985?mainCategory=0&subCatList=%5B343651%5D" },
    { id: "uppcs-m-1", category: "UPPCS Mains", title: "MAHAGRANTH", 
    desc: "The definitive Mains coverage batch. Deep dive into all GS papers with blueprint techniques & tricks.", 
    price: "3,999", oldPrice: "9,999 (Excluding GST)", rating: "4.9", students: "2.3k+", 
    duration: "GS 1 to 6", badge: "Flagship", 
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2F8287d028-202c-441b-990d-f49b7224190d.png&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/770999?mainCategory=0&subCatList=%5B343654%5D" },
    { id: "uppcs-p-4", category: "UPPCS Prelims", title: "CAC 3.0", 
    desc: "Monthly Current Affairs Compilation version 3.0 optimized for UPPCS specific events including lectures & notes.", 
    price: "499", oldPrice: "1,499 (Excluding GST)", rating: "4.8", students: "2.8k+", 
    duration: "Current Affairs", badge:"Best Seller",
    img: "https://courses-assets-v2.classplus.co/_next/image?url=/api/proxyimage?url=https%3A%2F%2Fcdn-wl-assets.classplus.co%2Fproduction%2Fsingle%2Fkedvtr%2Fcb831c14-7671-4fbb-a352-3b242af51c38.png&w=384&q=75", 
    link: "https://www.studysmartiaspcs.com/courses/770996?mainCategory=0&subCatList=%5B343651%5D" }
  ];

  return (
    <div className="pt-20 transition-colors duration-300 w-full overflow-hidden relative">

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[85vh] flex flex-col justify-center z-10 pb-12 pt-8">
        
        {/* Clean, Elegant Ambient Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900 transition-colors duration-300"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>

          {/* Optimized Soft Glows */}
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] left-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-[radial-gradient(circle,rgba(59,130,246,0.25)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] transform-gpu" />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[-10%] right-[-10%] w-[500px] md:w-[700px] h-[500px] md:h-[700px] bg-[radial-gradient(circle,rgba(168,85,247,0.25)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(168,85,247,0.15)_0%,transparent_70%)] transform-gpu" />
        </div>

        {/* FOREGROUND CONTENT */}
        <div className="container mx-auto px-4 md:px-6 relative z-20 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex justify-center lg:justify-start mb-6 mt-4">
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-primary p-[2px] rounded-full shadow-sm">
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-6 py-1.5 md:py-2 rounded-full flex items-center gap-2">
                 <Sparkles className="text-blue-500" size={16} />
                 <span className="font-bold text-[11px] md:text-sm text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                   Ignite Your Potential! Start Your Success Story Today
                 </span>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-left relative z-20">
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm mb-6 mx-auto lg:mx-0 transition-shadow">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wide uppercase">
                  {/* Dynamic number applied here */}
                  {activeStudents.toLocaleString()}+ ACTIVE STUDENTS
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] text-slate-900 dark:text-white mb-6 drop-shadow-sm">
                <AnimatedText text="Turn Your" className="block" />
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-secondary animate-gradient bg-[length:200%_auto] will-change-transform">
                  IAS Dreams
                </span> <br className="hidden lg:block"/>
                <AnimatedText text="Into Reality" className="block" />
              </h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-4 font-medium">
                <span className="font-semibold text-primary">"Don't give up yet - your breakthrough is near"</span>
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8 font-medium">
                The world is evolving, and so are Exams - why should your preparation stay the same? Study Smart with expert faculty, comprehensive materials & active community support.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start">
                <Link to="/courses" className="w-full sm:w-auto">
                  <motion.button whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(124, 58, 237, 0.3)" }} whileTap={{ scale: 0.95 }} className="w-full px-8 py-3.5 md:py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 group transition-transform transform-gpu">
                    Explore Courses <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <a href="https://www.youtube.com/@studysmartiaspcs" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full px-8 py-3.5 md:py-4 bg-white/95 backdrop-blur-sm dark:bg-slate-800/95 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold shadow-sm hover:border-primary flex items-center justify-center gap-2 transition-transform transform-gpu">
                    <PlayCircle size={18} className="text-red-500" /> Free on YouTube
                  </motion.button>
                </a>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <span className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400">Follow us:</span>
                <div className="flex gap-3">
                  {[
                    { icon: <Youtube size={16} />, href: "https://youtube.com/@studysmartiaspcs", color: "hover:text-red-500" },
                    { icon: <Send size={16} />, href: "https://t.me/StudySmartIASPCS", color: "hover:text-blue-500" },
                    { icon: <Instagram size={16} />, href: "https://instagram.com/studysmartiaspcs", color: "hover:text-pink-500" },
                    { icon: <Twitter size={16} />, href: "https://twitter.com/Studysmartias", color: "hover:text-sky-500" },
                  ].map((social, idx) => (
                    <motion.a key={idx} href={social.href} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.2, y: -2 }} className={`p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 shadow-sm transition-all transform-gpu hover:-translate-y-1 ${social.color}`}>
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Clean Hero Graphic */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative w-full max-w-sm md:max-w-md mx-auto block z-20">
              <div className="relative z-10">
                <div className="p-2 sm:p-3 rounded-[2.5rem] bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-slate-700 shadow-2xl relative transform-gpu lg:hover:rotate-y-2 lg:hover:rotate-x-2 transition-transform duration-500" style={{ transformStyle: "preserve-3d" }}>
                  <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Student Studying" className="rounded-[2rem] w-full h-[300px] sm:h-[350px] lg:h-[400px] object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-primary/10 rounded-[2rem] mix-blend-overlay pointer-events-none"></div>
                </div>

                <FloatingElement delay={0}>
                  <div className="absolute top-4 sm:top-8 -right-2 sm:-right-4 bg-white/95 dark:bg-slate-800/95 p-2 sm:p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 transform-gpu">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-1.5 sm:p-2 rounded-xl text-white shadow-md"><Video size={16} /></div>
                    <div><p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">Live Now</p><p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">UPPCS Batch</p></div>
                  </div>
                </FloatingElement>

                <FloatingElement delay={1.5}>
                  <div className="absolute -bottom-4 sm:-bottom-6 -left-2 sm:-left-4 bg-white/95 dark:bg-slate-800/95 p-2 sm:p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 transform-gpu">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1.5 sm:p-2 rounded-xl text-white shadow-md"><CheckCircle size={16} /></div>
                    <div><p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">Results</p><p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">250+ Selections in Mains</p></div>
                  </div>
                </FloatingElement>
              </div>
            </motion.div>
          </div>

          {/* Stats Row (Dynamic value added here too) */}
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 relative z-30 mt-8 md:mt-0">
            {[
              { label: "Active Students", value: activeStudents.toString(), icon: <Users size={20}/>, gradient: "from-blue-500 to-cyan-500" },
              { label: "Total Courses", value: "21", icon: <BookOpen size={20}/>, gradient: "from-purple-500 to-pink-500" },
              { label: "Video Lessons", value: "1720", icon: <Video size={20}/>, gradient: "from-orange-500 to-red-500" },
              { label: "Free Videos", value: "2000", icon: <Award size={20}/>, gradient: "from-green-500 to-emerald-500" },
            ].map((stat, idx) => (
               <motion.div key={idx} variants={scaleIn} className="relative overflow-hidden bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl group transition-all transform-gpu lg:hover:-translate-y-1">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 lg:group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-r ${stat.gradient} text-white flex items-center justify-center mb-3 md:mb-4 shadow-md lg:group-hover:scale-110 transition-transform transform-gpu`}>
                    {stat.icon}
                  </div>
                  <h3 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white"><Counter value={stat.value} /></h3>
                  <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
               </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- MARQUEE --- */}
      <section className="py-4 md:py-6 bg-gradient-to-r from-primary to-secondary relative z-20 overflow-hidden shadow-inner">
        <Marquee speed={30}>
          {["Expert Faculty", "Live Classes", "Telegram Community", "Daily Targets", "Answer Writing", "Mock Tests", "Memory Tricks", "1:1 Mentorship", "NCERT Focus", "PYQ Analysis"].map((item, idx) => (
            <span key={idx} className="text-white font-bold text-sm md:text-lg flex items-center gap-2 md:gap-3 whitespace-nowrap px-4 tracking-wide">
              <Star size={14} className="text-yellow-300" fill="currentColor" /> {item}
            </span>
          ))}
        </Marquee>
      </section>

      {/* --- WHY CHOOSE US --- */}
      <section className="py-16 md:py-24 relative z-10 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs md:text-sm mb-4 tracking-widest uppercase">Why Study Smart?</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Study Smart, Achieve Great</h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 px-4">Together towards IAS & PCS Success! We don't just teach subjects; we build officers.</p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: <GraduationCap />, title: "Expert Faculty", desc: "Instruction from experienced educators and former civil servants.", gradient: "from-blue-500 to-cyan-500" },
              { icon: <BookOpen />, title: "Comprehensive Material", desc: "Structured notes, video lectures, and practice assessments.", gradient: "from-purple-500 to-pink-500" },
              { icon: <MessageCircle />, title: "Active Community", desc: "Telegram-based peer network with daily updates and discussions.", gradient: "from-orange-500 to-red-500" },
              { icon: <Target />, title: "Daily Targets", desc: "Structured daily goals and quizzes to keep you on track.", gradient: "from-green-500 to-emerald-500" },
              { icon: <Video />, title: "Live Mentorship", desc: "Regular live sessions for doubt clearing and strategy discussions.", gradient: "from-indigo-500 to-violet-500" },
              { icon: <Zap />, title: "Smart Techniques", desc: "Memory tricks, mnemonics, and proven exam strategies.", gradient: "from-rose-500 to-pink-500" },
            ].map((feature, idx) => (
               <motion.div key={idx} variants={fadeInUp} className="relative bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all lg:hover:shadow-xl lg:hover:-translate-y-1 transform-gpu group overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-r ${feature.gradient} opacity-10 rounded-full blur-2xl lg:group-hover:opacity-30 transition-opacity duration-500 pointer-events-none`}></div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} text-white flex items-center justify-center mb-5 shadow-sm lg:group-hover:scale-110 transition-transform duration-300 transform-gpu`}>
                     {React.cloneElement(feature.icon, { size: 24 })}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-10 lg:group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed relative z-10">{feature.desc}</p>
               </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- FEATURED COURSES (Exact 5-column Glassmorphism UI) --- */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 border-y border-slate-100 dark:border-slate-800 relative z-10">
        <div className="container mx-auto px-4 md:px-6 max-w-[1400px]">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-12 gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs mb-3 tracking-widest uppercase">POPULAR COURSES</span>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                <span className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full hidden md:block"></span>
                Our Best Selling Programs
              </h2>
            </div>
            <Link to="/courses" className="px-5 py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-primary transition-colors flex items-center gap-2 text-sm shadow-sm w-full md:w-auto justify-center">
              View All Courses <ChevronRight size={16} />
            </Link>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {featuredCourses.map((course, idx) => (
              <motion.a 
                key={idx} 
                href={course.link}
                target="_blank"
                rel="noopener noreferrer"
                variants={fadeInUp} 
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] shadow-xl lg:hover:shadow-2xl border border-white/50 dark:border-slate-700 overflow-hidden flex flex-col group transition-all duration-300 transform-gpu lg:hover:-translate-y-2 h-full"
              >
                {/* Option 1: The Responsive Aspect Ratio Method (Highly Recommended) */}
                <div className="w-full aspect-[5/4] bg-slate-100 dark:bg-slate-800/50 p-2 overflow-hidden border-b border-slate-100/50 dark:border-slate-700/50 relative shrink-0">
                  
                  {course.badge && (
                    <div className="absolute top-4 right-4 z-20 px-2.5 py-1 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm bg-gradient-to-r from-orange-500 to-red-500">
                      {course.badge}
                    </div>
                  )}

                  <div className="w-full h-full rounded-[1.2rem] overflow-hidden relative">
                    <img src={course.img} alt={course.title} className="w-full h-full object-cover object-center transition-transform duration-700 lg:group-hover:scale-105 transform-gpu" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent opacity-80 lg:group-hover:opacity-40 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-between bg-white/5 dark:bg-transparent">
                <div className="mb-4 text-center">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{course.category}</span>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mt-1 line-clamp-2 leading-snug lg:group-hover:text-primary transition-colors">{course.title}</h3>
                </div>
                
                {/* --- NEW PRICING LAYOUT --- */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/50 mt-auto">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 line-through font-semibold mb-0.5">{course.oldPrice}</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{course.price}</span>
                  </div>
                  
                  <button className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs shadow-md lg:group-hover:bg-primary dark:lg:group-hover:bg-primary lg:group-hover:text-white transition-all flex items-center justify-center gap-1.5 transform-gpu active:scale-95">
                    Enroll Now<ExternalLink size={12} className="lg:group-hover:translate-x-0.5 lg:group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- TARGETED PROGRAMS --- */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-4 tracking-widest uppercase">Targeted Programs</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Focused Exam Preparation</h2>
            <p className="text-slate-600 dark:text-slate-400">Choose your destination, and let us guide you through the smartest route to success.</p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: "UPSC Civil Services", desc: "Holistic coverage of Prelims & Mains.", icon: <Compass size={28} />, color: "bg-blue-500 dark:bg-blue-600", link: "/courses" },
              { title: "UPPCS PCS", desc: "State-specific GS, current affairs & tests.", icon: <MapPin size={28} />, color: "bg-purple-500 dark:bg-purple-600", link: "/courses" },
              { title: "RO / ARO", desc: "Focused batches targeting exact syllabus.", icon: <BookMarked size={28} />, color: "bg-rose-500 dark:bg-rose-600", link: "/courses" },
              { title: "Answer Writing", desc: "Daily mains practice with evaluation.", icon: <PenTool size={28} />, color: "bg-emerald-500 dark:bg-emerald-600", link: "/courses" }
            ].map((program, idx) => (
              <motion.div key={idx} variants={fadeInUp} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group transform-gpu lg:hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl ${program.color} text-white flex items-center justify-center mb-5 lg:group-hover:scale-110 transition-transform duration-300 transform-gpu`}>{program.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{program.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{program.desc}</p>
                <Link to={program.link} className="inline-flex items-center gap-1.5 text-primary font-bold text-sm lg:hover:gap-2 transition-all">
                  Explore <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- APP DOWNLOAD SECTION --- */}
      <section className="py-20 md:py-24 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900"></div>
        <div className="hidden md:block absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none transform-gpu"></div>
        <div className="hidden md:block absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none transform-gpu"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs mb-6">
                <Smartphone size={14} /> Official Mobile App
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                Take your prep <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">everywhere you go.</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base mb-8 max-w-xl mx-auto lg:mx-0">
                Experience seamless learning with our highly-rated mobile application. Get access to live classes, offline video downloads, and mock tests directly on your smartphone.
              </p>

              <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10 inline-flex flex-col items-center lg:items-start max-w-full mx-auto lg:mx-0">
                 <p className="text-slate-400 text-xs font-medium mb-2">Use Organization Code to log in:</p>
                 <button onClick={handleCopyOrgCode} className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl border border-slate-600 transition-colors">
                    <span className="text-xl md:text-2xl font-black tracking-widest text-white uppercase">KEDVTR</span>
                    <div className="flex items-center gap-1.5 text-primary font-bold text-[10px] md:text-xs bg-primary/10 px-2 py-1 rounded-lg">
                      {copied ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy"}
                    </div>
                 </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a 
                  href="https://aalexis.page.link/BYyH" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-4 px-6 py-3.5 bg-black/60 backdrop-blur-md border border-white/10 lg:hover:border-blue-500 text-white rounded-2xl transition-all shadow-lg lg:hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] lg:hover:-translate-y-1 w-full sm:w-auto transform-gpu"
                >
                  <Play size={28} className="text-blue-500 lg:group-hover:text-blue-400 transition-colors fill-current" />
                  <div className="text-left flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold leading-none mb-1">Get it on</span>
                    <span className="text-lg font-black leading-none tracking-wide">Google Play</span>
                  </div>
                </a>
                
                <a 
                  href="https://apps.apple.com/in/app/classplus/id1324522260" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-4 px-6 py-3.5 bg-black/60 backdrop-blur-md border border-white/10 lg:hover:border-white/50 text-white rounded-2xl transition-all shadow-lg lg:hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] lg:hover:-translate-y-1 w-full sm:w-auto transform-gpu"
                >
                  <Apple size={30} className="text-white lg:group-hover:scale-105 transition-transform fill-current mb-1" />
                  <div className="text-left flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold leading-none mb-1">Download on the</span>
                    <span className="text-lg font-black leading-none tracking-wide">App Store</span>
                  </div>
                </a>
              </div>
            </motion.div>

            {/* 3D App UI Graphic */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative flex justify-center items-center h-[400px] md:h-[500px] z-20">
              
              <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 md:top-10 right-0 md:right-10 z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-3 md:p-4 rounded-2xl shadow-2xl flex items-center gap-3 transform-gpu">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400"><Star size={16} fill="currentColor" /></div>
                <div><p className="text-white font-bold text-xs md:text-sm">4.9/5 Rating</p><p className="text-slate-400 text-[10px] md:text-xs">Based on 10k+ reviews</p></div>
              </motion.div>
              
              <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-4 md:bottom-20 left-0 md:left-10 z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-3 md:p-4 rounded-2xl shadow-2xl flex items-center gap-3 transform-gpu">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400"><Play size={16} fill="currentColor" /></div>
                <div><p className="text-white font-bold text-xs md:text-sm">Live Classes</p><p className="text-slate-400 text-[10px] md:text-xs">Watch anywhere</p></div>
              </motion.div>
              
              <div className="relative w-[220px] sm:w-[260px] h-[450px] sm:h-[520px] bg-slate-800 rounded-[2.5rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden lg:animate-[float_6s_ease-in-out_infinite] transform-gpu">
                <div className="absolute top-0 inset-x-0 h-5 bg-slate-900 rounded-b-xl w-[40%] mx-auto z-30"></div>
                <div className="absolute inset-0 bg-slate-900 z-10">
                   <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80" alt="Study App UI" className="w-full h-full object-cover opacity-60" loading="lazy" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent flex flex-col justify-end p-5 pointer-events-none">
                      <div className="w-full h-20 md:h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mb-4 p-4 flex flex-col justify-between">
                         <div className="w-1/2 h-3 bg-white/30 rounded-full"></div>
                         <div className="flex gap-2">
                           <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-blue-500/50"></div>
                           <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-purple-500/50"></div>
                         </div>
                      </div>
                      <div className="w-3/4 h-4 md:h-5 bg-white/20 backdrop-blur-md rounded-full mb-3"></div>
                      <div className="w-1/2 h-4 md:h-5 bg-white/20 backdrop-blur-md rounded-full"></div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-20 md:py-24 relative bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 z-10">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} className="text-left max-w-2xl relative z-20">
              <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-bold text-xs mb-3 tracking-widest uppercase">TESTIMONIALS</span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 leading-tight">Trusted by Toppers</h2>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">Hear from students who transformed their preparation.</p>
            </motion.div>
            
            <div className="flex gap-2 relative z-20">
              <button onClick={() => scrollTestimonials('left')} className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95 text-slate-600 dark:text-slate-300 transform-gpu transition-all">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => scrollTestimonials('right')} className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95 text-slate-600 dark:text-slate-300 transform-gpu transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div 
            ref={testimonialScrollRef} 
            className="flex gap-4 md:gap-6 overflow-x-auto pb-8 pt-2 snap-x snap-mandatory scrollbar-hide scroll-smooth w-full relative z-10"
          >
            {testimonials.map((testimonial, idx) => (
              <div 
                key={idx} 
                className="w-[85vw] sm:w-[300px] md:w-[350px] shrink-0 snap-center p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm lg:hover:shadow-xl transition-shadow flex flex-col justify-between transform-gpu"
              >
                <div className="absolute top-4 right-4 text-slate-100 dark:text-slate-700">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>
                
                <div className="flex text-yellow-400 mb-3 relative z-10 pointer-events-none">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                
                <div className="flex-grow pr-2 mb-4 pointer-events-none">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base font-medium">"{testimonial.text}"</p>
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto shrink-0 pointer-events-none">
                  <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{testimonial.name}</h4>
                    <p className="text-[10px] font-bold text-primary uppercase">{testimonial.rank}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 md:py-28 relative bg-white dark:bg-slate-950 z-10">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-50px" }} className="relative bg-gradient-to-r from-primary via-purple-600 to-secondary rounded-[2rem] md:rounded-[3rem] p-12 md:p-24 text-center text-white shadow-xl overflow-hidden transform-gpu min-h-[350px] md:min-h-[450px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none transform-gpu"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none transform-gpu"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">Ready to Start Your Journey?</h2>
              <p className="text-base md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">
                Join thousands of aspirants who are learning smarter, not harder. Let's together conquer UPSC & UPPCS!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/courses" className="w-full sm:w-auto">
                  <button className="w-full px-10 py-4 bg-white text-primary rounded-xl font-bold text-base md:text-lg shadow-md active:scale-95 transition-transform transform-gpu">
                    Get Started Now
                  </button>
                </Link>
                <a href="https://t.me/StudySmartIASPCS" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <button className="w-full px-10 py-4 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl font-bold text-base md:text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform transform-gpu">
                    <Send size={18} /> Join Telegram
                  </button>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- CONTACT INFO --- */}
      <section className="py-10 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-10 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center shadow-md">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Study Smart IAS PCS</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your trusted preparation partner</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <a href="mailto:studysmartiaspcs@gmail.com" className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-semibold transition-colors hover:text-primary">
                <Mail size={16} /> studysmartiaspcs@gmail.com
              </a>
              <a href="tel:+918810843292" className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-semibold transition-colors hover:text-primary">
                <Phone size={16} /> +91 8810843292
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;