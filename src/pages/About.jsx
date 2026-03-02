import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useMotionValue } from 'framer-motion';
import { 
  Users, Award, BookOpen, Target, PenTool, FileText, 
  MonitorPlay, Landmark, ChevronLeft, ChevronRight, CheckCircle, GraduationCap, 
  Smartphone, DownloadCloud, Play, Star, Apple, Lightbulb
} from 'lucide-react';

// --- 1. Number Roll Component ---
const CountUp = ({ value, suffix = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 3000, bounce: 0 });
  const [displayValue, setDisplayValue] = useState(0);

  const numericValue = parseInt(value.replace(/,/g, '').replace('+', ''), 10);

  useEffect(() => {
    if (isInView) motionValue.set(numericValue);
  }, [isInView, motionValue, numericValue]);

  useEffect(() => {
    springValue.on("change", (latest) => setDisplayValue(Math.floor(latest)));
    return () => springValue.clearListeners();
  }, [springValue]);

  return <span ref={ref}>{displayValue.toLocaleString()}{suffix}</span>;
};

// --- 2. Interactive Floating Item Component ---
const FloatingItem = ({ Icon, label, x, y, delay, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1, y: [0, -15, 0] }}
    transition={{ opacity: { duration: 0.5, delay }, scale: { duration: 0.5, delay }, y: { repeat: Infinity, duration: 3, ease: "easeInOut", delay: Math.random() * 2 } }}
    whileHover={{ scale: 1.1, cursor: "pointer" }}
    className={`absolute ${x} ${y} z-0 hidden lg:block group`}
  >
    <div className="relative p-4 rounded-2xl backdrop-blur-md bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 shadow-lg transition-all duration-300 group-hover:bg-white dark:group-hover:bg-slate-800">
      <Icon className={`w-10 h-10 text-slate-500 dark:text-slate-400 transition-colors duration-300 ${color}`} />
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-slate-700 dark:text-slate-200">
        {label}
      </span>
    </div>
  </motion.div>
);

// --- 3. REALISTIC REPLAYABLE ARCHERY ANIMATION ---
const ArcheryAnimation = ({ inView }) => {
  // State to trigger re-animation on click
  const [playCount, setPlayCount] = useState(0);

  return (
    <div 
      className="w-full max-w-xl mx-auto relative h-32 md:h-48 flex flex-col items-center justify-center cursor-pointer group"
      onClick={() => setPlayCount(prev => prev + 1)}
    >
      <svg key={playCount} viewBox="0 0 500 100" className="w-full h-full overflow-visible drop-shadow-xl group-hover:scale-105 transition-transform duration-300">
        
        {/* 1. Target (Shakes on impact) */}
        <motion.g
          initial={{ x: 0, scale: 1 }}
          animate={inView ? { x: [0, 0, 8, -6, 4, -2, 0], scale: [1, 1, 1.1, 0.95, 1.05, 1] } : {}}
          transition={{ duration: 2, times: [0, 0.6, 0.65, 0.7, 0.75, 0.8, 1], ease: "easeInOut" }}
        >
          {/* Target Rings: Red, White, Green */}
          <circle cx="450" cy="50" r="35" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          <circle cx="450" cy="50" r="22" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
          <circle cx="450" cy="50" r="10" fill="#22c55e" />
        </motion.g>

        {/* 2. Bow Frame (Static curve) */}
        <path d="M 60 10 Q 100 50 60 90" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />

        {/* 3. Bow String (Pulls back, then snaps) */}
        <motion.path
          fill="none" stroke="#cbd5e1" strokeWidth="2"
          initial={{ d: "M 60 10 L 60 50 L 60 90" }}
          animate={inView ? {
            d: [
              "M 60 10 L 60 50 L 60 90",    // Rest
              "M 60 10 L 0 50 L 60 90",     // Pulled back
              "M 60 10 L 80 50 L 60 90",    // Snap forward
              "M 60 10 L 50 50 L 60 90",    // Vibrate back
              "M 60 10 L 60 50 L 60 90"     // Rest
            ]
          } : {}}
          transition={{ duration: 2, times: [0, 0.5, 0.6, 0.7, 0.8] }}
        />

        {/* 4. The Flying Arrow */}
        <motion.g
          initial={{ x: 0, opacity: 1 }}
          animate={inView ? { x: [0, -60, 360], opacity: [1, 1, 0] } : {}}
          transition={{ duration: 2, times: [0, 0.5, 0.6] }}
        >
          {/* Arrow Shaft */}
          <line x1="20" y1="50" x2="100" y2="50" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
          {/* Arrow Head */}
          <polygon points="100,45 115,50 100,55" fill="#f59e0b" />
          {/* Feathers */}
          <line x1="25" y1="50" x2="15" y2="42" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <line x1="25" y1="50" x2="15" y2="58" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <line x1="35" y1="50" x2="25" y2="42" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <line x1="35" y1="50" x2="25" y2="58" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        </motion.g>

        {/* 5. The Embedded Arrow (Appears inside target upon impact) */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: [0, 0, 1, 1] } : {}}
          transition={{ duration: 2, times: [0, 0.59, 0.6, 1] }}
        >
          <line x1="380" y1="50" x2="460" y2="50" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
          <polygon points="460,45 475,50 460,55" fill="#f59e0b" />
          <line x1="385" y1="50" x2="375" y2="42" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <line x1="385" y1="50" x2="375" y2="58" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <line x1="395" y1="50" x2="385" y2="42" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <line x1="395" y1="50" x2="385" y2="58" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        </motion.g>

      </svg>
      
      {/* Replay Tooltip */}
      <div className="absolute -bottom-4 text-xs font-bold text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
        Click to shoot again!
      </div>
    </div>
  );
};

// --- 4. ACTUAL STUDY SMART TEAM DATA ---
const teamMembers = [
  { name: "Shubham Prakash", role: "Founder, Btech, IIT (Dhn)", exp: "4+ Years", subject: "General Studies & Strategy", img: "src/assets/Shubham Prakash.jpg" },
  { name: "Rushiraj Singh Rathore", role: "Btech, SSGMCE", exp: "2+ Years", subject: "Economy", img: "src/assets/RB.jpg" },
  { name: "Vikas Sharma", role: "BA & MA (History)", exp: "2+ Years", subject: "Polity & Governance", img: "src/assets/Vikas Sharma.jpg" },
  { name: "Neha Vashisht", role: "BA & MA(Psychology)", exp: "1.5+ Years", subject: "Current Affairs & Answer Writing", img: "src/assets/Neha Vashisht.jpg" },
  { name: "Saurabh Singh", role: "B.tech(JNU), BA", exp: "3+ Years", subject: "History, Polity", img: "src/assets/Saurabh Singh.jpg" },
  { name: "Khwahish Sharma", role: "MBA(IIM Indore), BSc (Geography)", exp: "5+ Years", subject: "Geography", img: "src/assets/Khwahish Sharma.jpg" },
  { name: "Anshul Pandey", role: "B.tech (JNU), Ex ITBP Inspector", exp: "3+ Years", subject: "Science & Technology", img: "src/assets/Anshul Pandey.jpg" },
  { name: "Shivangi Singh", role: "Masters in PubAd, CCSU Meerut", exp: "5+ Years", subject: "Hindi", img: "src/assets/Shivangi Singh.jpg" },
];


const About = () => {
  const sliderRef = useRef(null);
  const visionRef = useRef(null);
  
  const isVisionInView = useInView(visionRef, { once: true, margin: "-100px" });

  const slide = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 320; 
      sliderRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden relative font-sans">
      
      {/* --- Background Floating Items --- */}
      <div className="absolute inset-0 pointer-events-none lg:pointer-events-auto overflow-hidden">
        <FloatingItem Icon={BookOpen} label="Study Material" x="top-32" y="left-10" delay={0.2} color="group-hover:text-pink-500" />
        <FloatingItem Icon={Target} label="Focused Strategy" x="top-28" y="right-12" delay={0.4} color="group-hover:text-yellow-500" />
        <FloatingItem Icon={FileText} label="Quick Notes" x="top-1/3" y="left-20" delay={0.6} color="group-hover:text-blue-500" />
        <FloatingItem Icon={Landmark} label="Administration" x="top-[45%]" y="right-24" delay={0.8} color="group-hover:text-purple-500" />
        <FloatingItem Icon={PenTool} label="Answer Writing" x="bottom-1/3" y="left-16" delay={1.0} color="group-hover:text-green-500" />
        <FloatingItem Icon={MonitorPlay} label="Live Classes" x="bottom-1/4" y="right-16" delay={1.2} color="group-hover:text-orange-500" />
      </div>

      {/* --- 1. HERO SECTION --- */}
      <section className="relative py-20 lg:py-28 z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-[100px] -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[100px] translate-y-10 -translate-x-10"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 mb-6 p-2 px-5 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-purple-400 font-bold text-sm shadow-sm">
            <Award size={16}/> Study Smart IAS PCS
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
            Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Future Bureaucrats</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
            We blend experience and knowledge with modern technology to provide hyper-focused notes, strategic mentoring, and top-tier classes to crack India's toughest exams.
          </motion.p>
        </div>
      </section>

      {/* --- 2. STATS SECTION --- */}
      <section className="py-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border-y border-slate-200 dark:border-slate-800 relative z-10 shadow-sm">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, label: "Active Aspirants", value: "15,000", suffix: "+" },
              { icon: Award, label: "Selections in mains", value: "650", suffix: "+" },
              { icon: FileText, label: "Total subscribers", value: "72,000", suffix: "+" },
              { icon: Target, label: "Viewers", value: "6,500,000", suffix: "+" },
            ].map((stat, index) => (
              <div key={index} className="p-4">
                <h3 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2 font-mono">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-center gap-2 mt-2">
                  <stat.icon size={16}/> {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 3. APP DOWNLOAD SECTION --- */}
      <section className="py-24 relative z-10 bg-slate-900 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            {/* Left Column: Text & CTA */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm mb-6">
                <Smartphone size={16} /> Official Mobile App
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
                Take your prep <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">everywhere you go.</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                Experience seamless learning with our highly-rated mobile application. Get access to live classes, offline video downloads, daily current affairs, and mock tests directly on your smartphone.
              </p>

              {/* Dynamic Sleek App Badges */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                {/* Android Badge */}
                <a 
                  href="https://aalexis.page.link/BYyH" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-4 px-6 py-3.5 bg-black/60 backdrop-blur-md border border-white/10 hover:border-blue-500 text-white rounded-2xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:-translate-y-1 w-full sm:w-auto"
                >
                  <Play size={28} className="text-blue-500 group-hover:text-blue-400 transition-colors fill-current" />
                  <div className="text-left flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold leading-none mb-1">Get it on</span>
                    <span className="text-lg font-black leading-none tracking-wide">Google Play</span>
                  </div>
                </a>
                
                {/* iOS Badge */}
                <a 
                  href="https://apps.apple.com/in/app/classplus/id1324522260" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-4 px-6 py-3.5 bg-black/60 backdrop-blur-md border border-white/10 hover:border-white/50 text-white rounded-2xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-1 w-full sm:w-auto"
                >
                  <Apple size={30} className="text-white group-hover:scale-105 transition-transform fill-current mb-1" />
                  <div className="text-left flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold leading-none mb-1">Download on the</span>
                    <span className="text-lg font-black leading-none tracking-wide">App Store</span>
                  </div>
                </a>
              </div>

              {/* HIGHLIGHTED ORG CODE */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="inline-flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                <Lightbulb className="text-amber-400 animate-pulse" size={20} />
                <span className="text-amber-400/90 font-bold text-sm tracking-wide">
                  IMPORTANT: USE ORG CODE
                </span>
                <span className="bg-amber-500 text-slate-900 font-black px-3 py-1 rounded-lg text-base tracking-widest shadow-md">
                  KEDVTR
                </span>
              </motion.div>
              
            </motion.div>

            {/* Right Column: 3D App Mockup Graphics */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative flex justify-center items-center h-[500px] lg:h-[600px]"
            >
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
                   <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80" alt="Study App" className="w-full h-full object-cover opacity-60" />
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

      {/* --- 4. OUR TEAM (SLIDER/CAROUSEL SECTION) --- */}
      <section className="py-24 bg-slate-100 dark:bg-slate-950/50 relative z-10 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 max-w-7xl">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Expert Team</span></h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-xl font-medium">Learn from the best. Our faculty includes subject matter experts, former bureaucrats, and seasoned evaluators.</p>
            </div>
            
            {/* Slider Controls */}
            <div className="flex gap-3 shrink-0">
              <button onClick={() => slide('left')} className="w-12 h-12 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-white hover:shadow-md text-slate-700 dark:text-slate-300 transition-all">
                <ChevronLeft size={24} />
              </button>
              <button onClick={() => slide('right')} className="w-12 h-12 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-white hover:shadow-md text-slate-700 dark:text-slate-300 transition-all">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Slider Container */}
          <div ref={sliderRef} className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-10 pt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth">
            {teamMembers.map((member, idx) => (
              <motion.div key={idx} whileHover={{ y: -10 }} className="snap-start shrink-0 w-[280px] sm:w-[300px] bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-all group shadow-lg">
                <div className="relative mb-6">
                   <div className="w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-r from-blue-500 to-purple-500 shadow-md">
                     {/* Local image fetching from assets folder */}
                     <img 
                       src={member.img} 
                       alt={member.name} 
                       onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + member.name + "&background=random" }}
                       className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700" 
                     />
                   </div>
                   <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg whitespace-nowrap">
                     {member.exp}
                   </div>
                </div>
                
                <div className="text-center mt-6">
                  <h3 className="text-xl font-extrabold mb-1 text-slate-900 dark:text-white group-hover:text-primary transition-colors">{member.name}</h3>
                  <p className="text-primary font-bold text-sm mb-5">{member.role}</p>
                  
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">Expertise</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5">
                      <GraduationCap size={16} className="text-slate-400"/> {member.subject}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* --- 5. ANIMATED VISION & MISSION SECTION --- */}
      <section className="py-32 relative z-10 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* The Arrow & Target Animation */}
            <div ref={visionRef} className="w-full flex flex-col items-center lg:items-start">
               
               <ArcheryAnimation inView={isVisionInView} />
               
               {/* Vision Header (Fades in slightly before the paragraph text) */}
               <motion.div 
                 initial={{ opacity: 0, y: 30 }} 
                 // Fades in at 1.4s, just as the arrow shakes the target
                 animate={isVisionInView ? { opacity: 1, y: 0 } : {}} 
                 transition={{ delay: 1.4, duration: 0.8 }}
                 className="text-center lg:text-left mt-4"
               >
                 <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-widest uppercase mb-6">Our Vision</span>
                 <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                   Welcome to Study Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">IAS PCS</span>
                 </h2>
               </motion.div>
            </div>

            {/* The Text & Stats (Appears strictly after the arrow hits) */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              // Fades in at 1.8s, completely after the arrow has hit
              animate={isVisionInView ? { opacity: 1, x: 0 } : {}} 
              transition={{ delay: 1.8, duration: 0.8 }}
            >
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg mb-6 font-medium">
                  Welcome to Study Smart IAS PCS, where we shape tomorrow’s leaders. With dedicated mentors, advanced resources, and innovative teaching methods, we prepare you to excel in the nation's most prestigious exams.
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg mb-10 font-medium">
                  Our mission is to empower you with the knowledge, skills, and confidence needed to become future officers. By embracing diversity and fostering critical thinking, we nurture qualities essential for leadership in public service. Through real-world insights and tailored guidance, we ensure your journey to becoming an IAS or PCS officer is both enriching and transformative. Join us to build a brighter future for yourself and the nation.
                </p>
              </div>

              {/* Minimal Stats */}
              <div className="flex flex-col sm:flex-row gap-6 mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                 <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-2xl flex-1 border border-slate-100 dark:border-slate-700/50">
                    <BookOpen size={36} className="text-blue-500 opacity-80" />
                    <div>
                       <h3 className="text-3xl font-black text-slate-900 dark:text-white"><CountUp value="21" /></h3>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Courses</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-2xl flex-1 border border-slate-100 dark:border-slate-700/50">
                    <Users size={36} className="text-purple-500 opacity-80" />
                    <div>
                       <h3 className="text-3xl font-black text-slate-900 dark:text-white"><CountUp value="4,056" /></h3>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Active Students</p>
                    </div>
                 </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default About;