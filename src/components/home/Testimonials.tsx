import React, { useEffect, useState } from 'react';
import { Star, Quote, User, MapPin } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '../../core/config/FirestoreConfig';
import { Review } from '../../types';

export const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.REVIEWS),
        where('approved', '==', true)
      );
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedReviews: Review[] = [];
          snapshot.forEach((docSnap) => {
            fetchedReviews.push({ id: docSnap.id, ...docSnap.data() } as Review);
          });
          setReviews(fetchedReviews);
          setLoading(false);
        },
        (error) => {
          console.warn('Error fetching approved reviews:', error);
          setReviews([]);
          setLoading(false);
        }
      );
    } catch (err) {
      console.warn('Failed to subscribe to reviews collection:', err);
      setReviews([]);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  // Empty state: If loading or no approved reviews exist, do NOT render the section at all
  if (loading || reviews.length === 0) {
    return null;
  }

  // Calculate real average rating from approved reviews
  const totalRating = reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0);
  const avgRating = (totalRating / reviews.length).toFixed(1);

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 mb-1">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>آراء وتقييمات زوار معرض المعادي</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            تجارب عملائنا الحقيقية
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <span className="flex text-amber-400">★</span>
          <span>
            {avgRating} / 5 بناءً على {reviews.length} تقييم معتمد
          </span>
        </div>
      </div>

      {/* Grid of Real Approved Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, i) => (
          <div
            key={rev.id || i}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between relative group"
          >
            <Quote className="absolute top-6 left-6 w-8 h-8 text-slate-100 dark:text-slate-800 group-hover:text-blue-500/10 transition-colors pointer-events-none" />

            <div className="space-y-4 relative z-10">
              {/* Rating Stars */}
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(Math.min(5, Math.max(1, Math.round(rev.rating || 5))))].map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Review Comment */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                "{rev.comment}"
              </p>
            </div>

            {/* Author Info */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    {rev.customerName}
                  </h4>
                  {rev.location && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{rev.location}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
