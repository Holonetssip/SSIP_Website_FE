import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen pt-36 pb-20 bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white transition-colors">Get in Touch</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Have a question? We'd love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">
          
          {/* Contact Info Card */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-primary to-secondary p-8 rounded-3xl text-white shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-10 translate-x-10"></div>

            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            <p className="mb-8 opacity-90 leading-relaxed">Fill out the form and our team will get back to you within 24 hours.</p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl"><Phone size={24} /></div>
                <div>
                  <p className="text-xs opacity-70 uppercase tracking-wider">Phone</p>
                  <p className="font-semibold">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl"><Mail size={24} /></div>
                <div>
                  <p className="text-xs opacity-70 uppercase tracking-wider">Email</p>
                  <p className="font-semibold">support@studysmart.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl"><MapPin size={24} /></div>
                <div>
                  <p className="text-xs opacity-70 uppercase tracking-wider">Address</p>
                  <p className="font-semibold">123, Civil Lines, Knowledge Park,<br/> New Delhi, India 110001</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 transition-colors"
          >
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition text-slate-900 dark:text-white" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition text-slate-900 dark:text-white" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition text-slate-900 dark:text-white" placeholder="john@example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
                <textarea rows="4" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition text-slate-900 dark:text-white" placeholder="How can we help you?"></textarea>
              </div>

              <button className="w-full py-4 rounded-xl bg-slate-900 dark:bg-primary text-white font-bold shadow-lg hover:bg-primary transition flex items-center justify-center gap-2">
                Send Message <Send size={18} />
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Contact;