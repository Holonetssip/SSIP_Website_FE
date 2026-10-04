import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ExternalLink } from 'lucide-react';
import posterImg from '../assets/poster.png';

const PosterPopup = () => {
  const [isOpen, setIsOpen] = useState(true);

  // Lock body scroll when modal is open to ensure poster focus
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAction = () => {
    window.open('https://share.google/7zUhTuDMNWX2PPQe5', '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto"
          onClick={() => setIsOpen(false)}
        >
          {/* Main Modal Wrapper - Narrower width and +2px height adjustment */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[320px] sm:max-w-[360px] md:max-w-[390px] max-h-[94vh] flex flex-col items-center justify-center my-auto"
          >
            {/* Soft Radiant Ambient Glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-[1.6rem] blur-xl opacity-50 pointer-events-none animate-pulse"></div>

            {/* Ultra-Slim Glassmorphism Poster Card */}
            <div className="relative w-full bg-slate-900/40 border border-white/25 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col items-center p-1 sm:p-1.5 backdrop-blur-xl">

              {/* Close Button - Top Right Floating */}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close advertisement"
                className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-30 bg-slate-900/80 hover:bg-red-600 text-white rounded-full p-1.5 backdrop-blur-md shadow-lg border border-white/20 transition-all duration-300 transform hover:scale-110 group cursor-pointer"
                title="Close"
              >
                <X size={15} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* Compact Header Badge - Reduced size so poster fonts remain 100% visible */}
              <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-30 px-2 py-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 backdrop-blur-md text-white font-semibold text-[8px] sm:text-[9px] rounded-full shadow-md border border-white/30 flex items-center gap-1 uppercase tracking-wide pointer-events-none opacity-90">
                <Sparkles size={10} className="text-yellow-300 animate-spin" />
                <span>Special Announcement</span>
              </div>

              {/* Poster Image Container (Taller, slimmer & increased height by 2px) */}
              <div
                className="relative w-full overflow-hidden rounded-xl sm:rounded-[1.25rem] cursor-pointer group/img flex items-center justify-center bg-slate-900/20"
                onClick={handleAction}
              >
                <img
                  src={posterImg}
                  alt="Special Program Poster"
                  className="w-full h-auto max-h-[calc(86vh+2px)] sm:max-h-[calc(88vh+2px)] object-contain rounded-xl sm:rounded-[1.25rem] transition-transform duration-500 group-hover/img:scale-[1.02]"
                  loading="eager"
                />

                {/* Elegant Hover Overlay & Action Callout */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 sm:pb-5">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold px-4 py-2 rounded-full backdrop-blur-md border border-white/40 shadow-[0_10px_25px_rgba(124,58,237,0.5)] flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-wider overflow-hidden"
                  >
                    {/* Shimmer light effect inside hover badge */}
                    <motion.span
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
                    />
                    <span className="relative z-10 flex items-center gap-1.5">
                      Click to Open Link <ExternalLink size={13} />
                    </span>
                  </motion.div>
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PosterPopup;
