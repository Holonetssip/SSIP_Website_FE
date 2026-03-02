import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Search, ChevronRight, X, Share2, 
  Bookmark, Globe, Clock, Newspaper 
} from 'lucide-react';

const CurrentAffairs = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  // Categories (You can make this dynamic later)
  const categories = ["All", "Politics", "Economy", "Science", "International", "Sports"];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/current-affairs`);
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load news", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || article.tags?.includes(activeCategory); // Assuming backend has tags, else remove this line
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-slate-500 font-medium">Fetching Daily Updates...</p>
      </div>
    </div>
  );

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="container mx-auto px-6">
        
        {/* --- HEADER --- */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/> Live Updates
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            Daily <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Current Affairs</span>
          </motion.h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Stay ahead with the latest news, analysis, and editorials curated for UPSC & Government Exams.</p>
        </div>

        {/* --- SEARCH & FILTERS --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 sticky top-20 z-20 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-white/20">
           {/* Search */}
           <div className="relative w-full md:w-96 group">
             <input 
               type="text" 
               placeholder="Search topics..." 
               className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
           </div>

           {/* Categories */}
           <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
             {categories.map(cat => (
               <button 
                 key={cat}
                 onClick={() => setActiveCategory(cat)}
                 className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                   activeCategory === cat 
                   ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                   : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                 }`}
               >
                 {cat}
               </button>
             ))}
           </div>
        </div>

        {/* --- NEWS GRID --- */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article, idx) => (
                <NewsCard 
                  key={article.id || idx} 
                  article={article} 
                  onClick={() => setSelectedArticle(article)} 
                  index={idx}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                 <Newspaper size={48} className="mx-auto text-slate-300 mb-4"/>
                 <p className="text-slate-500">No articles found matching your criteria.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* --- READER MODAL --- */}
        <AnimatePresence>
          {selectedArticle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Modal Header Image */}
                <div className="relative h-64 shrink-0">
                  {selectedArticle.image ? (
                     <img src={selectedArticle.image} className="w-full h-full object-cover" alt="Article Cover" />
                  ) : (
                     <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <Newspaper size={64} className="text-white/20" />
                     </div>
                  )}
                  <button 
                    onClick={() => setSelectedArticle(null)}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-8">
                     <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg mb-3 inline-block">
                        {selectedArticle.tags?.[0] || 'General'}
                     </span>
                     <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{selectedArticle.title}</h2>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                   <div className="flex items-center justify-between text-sm text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                      <div className="flex items-center gap-4">
                         <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(selectedArticle.created_at || Date.now()).toLocaleDateString()}</span>
                         <span className="flex items-center gap-1"><Clock size={14}/> 5 min read</span>
                      </div>
                      <div className="flex gap-3">
                         <button className="hover:text-primary transition-colors"><Bookmark size={18}/></button>
                         <button className="hover:text-primary transition-colors"><Share2 size={18}/></button>
                      </div>
                   </div>

                   <article className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedArticle.content?.split('\n').map((paragraph, i) => (
                         <p key={i} className="mb-4">{paragraph}</p>
                      ))}
                   </article>

                   {selectedArticle.source_link && (
                      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                         <a 
                           href={selectedArticle.source_link} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                         >
                            <Globe size={16}/> Read Original Source
                         </a>
                      </div>
                   )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

// --- Sub-Component: News Card ---
const NewsCard = ({ article, onClick, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    onClick={onClick}
    className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
  >
    {/* Image Area - FIX: Renders IMG, doesn't redirect */}
    <div className="h-48 overflow-hidden relative">
      {article.image ? (
        <img 
          src={article.image} 
          alt={article.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80"; }} // Fallback image
        />
      ) : (
        <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <Newspaper className="text-slate-300" size={40} />
        </div>
      )}
      <div className="absolute top-4 left-4">
         <span className="px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm text-slate-800 dark:text-white text-xs font-bold rounded-lg shadow-sm">
            {article.tags?.[0] || 'News'}
         </span>
      </div>
    </div>

    {/* Content Area */}
    <div className="p-6 flex-1 flex flex-col">
       <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase mb-3">
          <Calendar size={12} />
          {new Date(article.created_at || Date.now()).toLocaleDateString()}
       </div>
       
       <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {article.title}
       </h3>
       
       <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
          {article.content}
       </p>
       
       <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
          <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
             Read Full Article <ChevronRight size={16} />
          </span>
       </div>
    </div>
  </motion.div>
);

export default CurrentAffairs;