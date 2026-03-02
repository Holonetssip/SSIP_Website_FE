import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const reviews = [
  { id: 1, name: "Srushti Jayant Deshmukh", rank: "AIR 5", text: "The current affairs modules are concise and to the point. Highly recommended!", rating: 5 },
  { id: 2, name: "Kanishak Kataria", rank: "AIR 1", text: "Study Smart's test series helped me improve my speed and accuracy significantly.", rating: 5 },
  { id: 3, name: "Akshat Jain", rank: "AIR 2", text: "The mentors are very approachable and the doubt solving mechanism is instant.", rating: 4 },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900">Student Stories</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-8 rounded-3xl shadow-lg border-t-4 border-primary relative"
            >
              <Quote size={40} className="text-purple-100 absolute top-4 right-4" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"} 
                  />
                ))}
              </div>

              <p className="text-slate-600 italic mb-6 leading-relaxed">"{review.text}"</p>

              <div className="flex items-center gap-4 border-t pt-4 border-slate-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{review.name}</h4>
                  <p className="text-xs font-bold text-primary">{review.rank}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;