'use client';

import React, { useState, useEffect } from 'react';
import { Star, Quote, User } from 'lucide-react';
import Image from 'next/image';

interface Testimonial {
  _id: string;
  clientName: string;
  clientRole: string;
  clientCompany?: string;
  content: string;
  image?: string;
  rating: number;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/testimonials');
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-white dark:bg-[#0A0A0A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Trusted by Industry Leaders.
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Real stories from clients who have scaled their business infrastructure with my help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial._id} 
              className="bg-gray-50 dark:bg-[#18181b] p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col relative group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500"
            >
              <div className="absolute top-8 right-8 text-blue-500/10 dark:text-blue-500/5 group-hover:text-blue-500/20 transition-colors">
                <Quote size={56} />
              </div>

              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-700'}`} 
                  />
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8 flex-1 italic">
                &quot;{testimonial.content}&quot;
              </p>

              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 border-2 border-white dark:border-gray-700 shadow-sm">
                  {testimonial.image ? (
                    <Image 
                      src={testimonial.image} 
                      alt={testimonial.clientName} 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.clientName}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                    {testimonial.clientRole} {testimonial.clientCompany && `• ${testimonial.clientCompany}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
