import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';

// System prompt to restrict chatbot to course-related queries only
const SYSTEM_PROMPT = `You are "Study Smart Assistant" - an AI helper for Study Smart IAS PCS coaching platform.

IMPORTANT RULES:
1. You ONLY answer questions related to:
   - UPSC (Union Public Service Commission) exam preparation
   - UPPCS (Uttar Pradesh Public Service Commission) exam preparation
   - IAS (Indian Administrative Service) preparation
   - PCS (Provincial Civil Services) preparation
   - General Studies (History, Geography, Polity, Economy, Science, Environment)
   - Current Affairs relevant to civil services exams
   - Study tips and strategies for competitive exams
   - Our courses: NCR (NCERT Concept Roots), PRE (PYQ Reverse Engineering), GRANTH (History), MAHAGRANTH (Complete GS), CAC (Current Affairs), Test Series
   - Exam patterns, syllabus, and preparation guidance

2. For ANY question outside these topics (like coding, general chat, entertainment, personal advice, etc.), politely respond:
   "I'm your Study Smart Assistant, focused on helping with UPSC/UPPCS preparation. I can help you with exam strategies, subject queries, current affairs, and our courses. Please ask me something related to your civil services preparation!"

3. Keep responses concise and helpful (max 150 words unless detailed explanation needed)
4. Be encouraging and supportive to aspirants
5. When discussing courses, mention relevant Study Smart courses that could help

Available Courses at Study Smart:
- NCERT Concept Roots (NCR) - ₹2,999 - Foundation building from NCERT
- PYQ Reverse Engineering (PRE) - ₹3,999 - Previous year question analysis
- GRANTH 2.0 - ₹4,999 - Complete History with memory tricks
- MAHAGRANTH - ₹9,999 - Complete GS for Mains
- Current Affairs (CAC 3.0) - ₹1,999 - Daily current affairs
- Test Series - ₹2,499 - 18 mock tests with analysis
- UP Special Module - ₹2,999 - UP specific content for UPPCS
- General Hindi - ₹1,999 - Hindi language preparation

Contact: studysmartiaspcs@gmail.com | +91 8810843292`;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Namaste! I'm your Study Smart Assistant. Ask me anything about UPSC/UPPCS preparation, our courses, study strategies, or current affairs. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Hidden routes
  const hiddenRoutes = ['/dashboard', '/test-panel', '/course-player', '/admin'];
  const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));

  if (shouldHide) return null;

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Add system prompt and user message
      const contents = [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT + "\n\nNow respond to: " + userMessage }]
        }
      ];

      // If there's conversation history, include it
      if (conversationHistory.length > 1) {
        contents[0].parts[0].text = SYSTEM_PROMPT + "\n\nPrevious conversation:\n" +
          messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n') +
          "\n\nUser's new message: " + userMessage;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            ]
          })
        }
      );

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const assistantMessage = data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again or contact us at studysmartiaspcs@gmail.com for assistance."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed bottom-8 left-4 z-[100] cursor-grab active:cursor-grabbing"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: -20 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-full mb-4 left-0 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden cursor-auto"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-bold">Study Smart Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-80 p-4 bg-slate-50 dark:bg-slate-900 overflow-y-auto space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gradient-to-r from-primary to-secondary text-white'
                    }`}>
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center">
                      <Bot size={14} />
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-700">
                      <Loader2 size={16} className="animate-spin text-primary" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about UPSC/UPPCS..."
                className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary text-slate-800 dark:text-white placeholder-slate-400"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-full text-white shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-800 pointer-events-auto"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </motion.div>
  );
};

export default ChatBot;
