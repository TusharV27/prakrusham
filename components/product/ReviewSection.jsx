"use client";

import { FaStar, FaCheck, FaQuoteLeft, FaPlus, FaTimes, FaSpinner, FaClock } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ReviewSection({ 
  productId, 
  farmerId, 
  title = "Customer Reviews",
  ctaText = "WRITE A REVIEW",
  emptyText = "Share your experience and help others!",
  rating: initialRating = 0, 
  reviews: initialReviews = [] 
}) {
  const { user, openLogin } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Form State
  const [newRating, setNewRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (productId || farmerId) {
      fetchReviews();
    }
  }, [productId, farmerId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const query = productId ? `productId=${productId}` : `farmerId=${farmerId}`;
      const res = await fetch(`/api/reviews?${query}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openLogin();
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: user.id || user._id, 
          productId,
          farmerId,
          rating: newRating,
          comment: comment,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitSuccess(true);
        setComment("");
        setNewRating(5);
        // Refresh reviews to show the new pending one
        fetchReviews();
        setTimeout(() => {
          setIsFormOpen(false);
          setSubmitSuccess(false);
        }, 3000);
      } else {
        setError(data.error || "Failed to submit review");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only use APPROVED reviews for summary stats
  const approvedReviews = reviews.filter(r => r.status === 'APPROVED');

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: approvedReviews.filter(r => Math.round(r.rating) === star).length
  }));

  const averageRating = approvedReviews.length > 0 
    ? (approvedReviews.reduce((acc, curr) => acc + curr.rating, 0) / approvedReviews.length).toFixed(1)
    : initialRating.toFixed(1);

  return (
    <section className="mt-10">
      
      {/* Heading */}
      <div className="flex items-center justify-between mb-8 gap-2">
        <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#14532d]">
          {title}
        </h2>
        <button 
          onClick={() => user ? setIsFormOpen(true) : openLogin()}
          className="bg-[#14532d] text-white 
          px-3 py-2 sm:px-6 sm:py-3 
          rounded-full 
          text-[10px] sm:text-sm 
          font-black tracking-widest 
          hover:bg-[#114224] 
          transition-all 
          flex items-center gap-2 
          shadow-lg"
        >
          <FaPlus size={10} /> {ctaText}
        </button>
      </div>

      {/* Review Summary */}
      <div className="border border-[#14532d]/10 rounded-[24px] p-4 sm:p-6 md:p-10 bg-white shadow-sm">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">

          {/* Left Rating */}
          <div className="text-center lg:text-left border-b lg:border-b-0 lg:border-r border-gray-100 pb-8 lg:pb-0 lg:pr-10">
            <div className="flex justify-center lg:justify-start gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`${
                    i < Math.round(averageRating)
                      ? "text-yellow-400"
                      : "text-gray-200"
                  }`}
                  size={20}
                />
              ))}
            </div>

            <div className="text-3xl sm:text-4xl font-black text-[#14532d] mb-1">
              {averageRating}
            </div>

            <p className="text-[10px] sm:text-sm text-gray-400 font-black uppercase tracking-[0.2em] mb-4">
              OUT OF 5.0
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-sm font-black text-[#14532d] uppercase tracking-widest border border-emerald-100">
              <FaCheck size={10} />
              VERIFIED STORE
            </div>

            <p className="text-sm text-gray-400 mt-4 uppercase tracking-[0.1em] font-medium">
              Based on {approvedReviews.length} approved reviews
            </p>
          </div>

          {/* Rating Bars */}
          <div className="space-y-3 px-0 lg:px-4">
            {ratingCounts.map(item => (
              <div key={item.star} className="flex items-center gap-4">
                
                <span className="text-sm font-black text-gray-600 w-6">
                  {item.star}★
                </span>

                <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${approvedReviews.length ? (item.count / approvedReviews.length) * 100 : 0}%` 
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-[#14532d]"
                  />
                </div>

                <span className="text-sm font-bold text-gray-400 w-6 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center lg:pl-10">
             <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                <p className="text-emerald-800 text-xs font-bold leading-relaxed mb-4">
                  {emptyText}
                </p>
                <button 
                  onClick={() => user ? setIsFormOpen(true) : openLogin()}
                  className="w-full bg-white text-[#14532d] border-2 border-[#14532d] py-3 rounded-xl text-sm font-black tracking-widest hover:bg-[#14532d] hover:text-white transition-all shadow-sm"
                >
                  REVIEW NOW
                </button>
             </div>
          </div>

        </div>
      </div>

      {/* Review List */}
      <div className="mt-12 space-y-6">
        {loading ? (
          <div className="flex justify-center py-8 sm:py-10 md:py-12 lg:py-10 xl:py-14">
            <FaSpinner className="animate-spin text-[#14532d]" size={32} />
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={review.id} 
                className={`bg-white border rounded-[32px] p-8 hover:shadow-xl hover:shadow-[#14532d]/5 transition-all group ${review.status === 'PENDING' ? 'border-amber-200 bg-amber-50/10' : 'border-gray-100'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1 text-[#FBBF24]">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} size={14} className={i < review.rating ? "text-yellow-400" : "text-gray-100"} />
                      ))}
                    </div>
                    {review.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-200">
                        <FaClock size={8} /> Under Review
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="relative">
                  <FaQuoteLeft className={`absolute -left-2 -top-2 text-2xl group-hover:opacity-100 opacity-50 transition-colors -z-0 ${review.status === 'PENDING' ? 'text-amber-100' : 'text-emerald-50'}`} />
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 relative z-10 italic">
                    {review.comment?.en || review.comment || "No comment provided."}
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-gray-50 pt-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xs uppercase overflow-hidden">
                    {review.author?.profileImage ? (
                      <img src={review.author.profileImage} alt={review.author?.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      (review.author?.name?.en?.[0] || review.author?.name?.[0] || "U").toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-[#14532d] uppercase tracking-widest">
                      {review.author?.name?.en || review.author?.name || "Verified Customer"}
                    </h4>
                    <p className="text-[9px] text-[#16a34a] font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                      <FaCheck size={8} /> Verified Buyer
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
             No reviews yet. Be the first to share your experience!
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-[#14532d]/40 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="h-2 w-full bg-[#14532d]" />
              
              <button 
                onClick={() => setIsFormOpen(false)}
                className="absolute right-8 top-8 text-gray-300 hover:text-red-500 transition-colors"
              >
                <FaTimes size={20} />
              </button>

              <div className="p-10">
                {submitSuccess ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                      <FaCheck size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-[#14532d] mb-4 uppercase">Thank You!</h3>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">
                      Your review has been submitted for moderation. It will be visible once approved by our team.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-3xl font-black text-[#14532d] mb-2 uppercase tracking-tight">Write a Review</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-10">Your feedback helps everyone</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Rating Selector */}
                      <div>
                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Your Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="focus:outline-none transform active:scale-90 transition-transform"
                            >
                              <FaStar 
                                size={28} 
                                className={`${star <= newRating ? "text-yellow-400" : "text-gray-100"} transition-colors`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Your Comment</label>
                        <textarea
                          required
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Tell others about your experience..."
                          className="w-full h-32 bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm outline-none focus:border-[#14532d] focus:bg-white transition-all resize-none"
                        />
                      </div>

                      {error && (
                        <p className="text-red-500 text-sm font-black uppercase text-center">{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#14532d] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#14532d]/20 hover:bg-[#114224] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="animate-spin" /> SUBMITTING...
                          </>
                        ) : "SUBMIT REVIEW"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
