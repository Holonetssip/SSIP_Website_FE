import React from 'react';
import { Link } from 'react-router-dom';
import { Youtube, Send, MapPin, Mail, Phone, Instagram, Twitter, MessageCircle } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // WhatsApp Link format: https://wa.me/<countrycode><number>
  const whatsappLink = "https://wa.me/918810843292";

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
             <h2 className="text-2xl font-black text-white mb-4 tracking-tight">
               Study Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">IAS PCS</span>
             </h2>
             <p className="text-slate-400 text-sm leading-relaxed font-medium">
               Empowering aspirants with affordable, high-quality education to build the bureaucrats of tomorrow.
             </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-5 uppercase tracking-wider text-sm">Quick Explore</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary opacity-0 hover:opacity-100 transition-opacity"></span>Home</Link></li>
              <li><Link to="/courses" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary opacity-0 hover:opacity-100 transition-opacity"></span>Courses</Link></li>
              {/* Defaulting Exams link to UPSC, since the exam page requires a specific exam parameter */}
              <li><Link to="/exams/upsc" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary opacity-0 hover:opacity-100 transition-opacity"></span>Exams</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary opacity-0 hover:opacity-100 transition-opacity"></span>About Us</Link></li>
            </ul>
          </div>

          {/* Socials */}
          <div>
             <h3 className="text-white font-bold mb-5 uppercase tracking-wider text-sm">Connect</h3>
             <div className="flex flex-wrap gap-3 mb-6">
               {/* YouTube */}
               <a href="https://www.youtube.com/@StudySmartIASPCS" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-900 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 border border-slate-800 transition-all hover:scale-110">
                 <Youtube size={20} />
               </a>
               {/* Telegram */}
               <a href="https://t.me/StudySmartIASPCS" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-900 rounded-xl text-slate-400 hover:bg-blue-500/10 hover:text-blue-500 border border-slate-800 transition-all hover:scale-110">
                 <Send size={20} />
               </a>
               {/* Instagram */}
               <a href="https://instagram.com/studysmartiaspcs" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-900 rounded-xl text-slate-400 hover:bg-pink-500/10 hover:text-pink-500 border border-slate-800 transition-all hover:scale-110">
                 <Instagram size={20} />
               </a>
               {/* Twitter / X */}
               <a href="https://twitter.com/Studysmartias" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-900 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white border border-slate-800 transition-all hover:scale-110">
                 <Twitter size={20} />
               </a>
               {/* WhatsApp */}
               <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-900 rounded-xl text-slate-400 hover:bg-green-500/10 hover:text-green-500 border border-slate-800 transition-all hover:scale-110" title="Chat on WhatsApp">
                 <MessageCircle size={20} />
               </a>
             </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-white font-bold mb-5 uppercase tracking-wider text-sm">Contact Us</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex gap-3 items-start group">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">Lucknow, Uttar Pradesh, India</span>
              </li>
              <li className="flex gap-3 items-center group">
                <Mail size={18} className="text-primary shrink-0 group-hover:scale-110 transition-transform" />
                <a href="mailto:Studysmartiaspcs@gmail.com" className="text-slate-400 group-hover:text-slate-200 transition-colors">Studysmartiaspcs@gmail.com</a>
              </li>
              <li className="flex gap-3 items-center group">
                <Phone size={18} className="text-primary shrink-0 group-hover:scale-110 transition-transform" />
                <a href="tel:+918810843292" className="text-slate-400 group-hover:text-slate-200 transition-colors">+91 88108 43292</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center text-sm font-medium text-slate-500">
          <p>© {currentYear} Study Smart IAS PCS. All rights reserved.</p>
          <p className="flex items-center gap-1.5 mt-4 md:mt-0">
            Made with <span className="text-red-500">❤️</span> in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;