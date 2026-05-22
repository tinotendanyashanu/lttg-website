'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, Star, User, Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import Image from 'next/image';

interface Testimonial {
  _id: string;
  clientName: string;
  clientRole: string;
  clientCompany?: string;
  content: string;
  image?: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/testimonials');
      if (!res.ok) throw new Error('Failed to fetch testimonials');
      const data = await res.json();
      setTestimonials(data);
    } catch (err) {
      setError('Could not load testimonials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved: !currentStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      
      setTestimonials(prev => prev.map(t => 
        t._id === id ? { ...t, isApproved: !currentStatus } : t
      ));
    } catch (err) {
      alert('Error updating status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');
      
      setTestimonials(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      alert('Error deleting testimonial');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Client Testimonials</h1>
          <p className="text-gray-500 dark:text-gray-400">Moderate and manage client feedback displayed on the landing page.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl flex items-center border border-red-100 dark:border-red-900/30">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {error}
        </div>
      )}

      {testimonials.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#27272a] rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No testimonials yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Feedback from clients will appear here for your approval.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial._id} 
              className={`bg-white dark:bg-[#27272a] rounded-3xl p-6 border transition-all ${
                testimonial.isApproved ? 'border-green-100 dark:border-green-900/30 shadow-sm' : 'border-gray-100 dark:border-gray-800'
              }`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="relative w-20 h-20 rounded-full bg-gray-100 dark:bg-[#18181b] overflow-hidden">
                    {testimonial.image ? (
                      <Image src={testimonial.image} alt={testimonial.clientName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{testimonial.clientName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.clientRole} {testimonial.clientCompany && `@ ${testimonial.clientCompany}`}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        testimonial.isApproved 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {testimonial.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(testimonial.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 italic mb-6 leading-relaxed">
                    &quot;{testimonial.content}&quot;
                  </p>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleApprove(testimonial._id, testimonial.isApproved)}
                      disabled={actionLoading === testimonial._id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        testimonial.isApproved
                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {actionLoading === testimonial._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : testimonial.isApproved ? (
                        <><X className="w-4 h-4" /> Unapprove</>
                      ) : (
                        <><Check className="w-4 h-4" /> Approve</>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial._id)}
                      disabled={actionLoading === testimonial._id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
