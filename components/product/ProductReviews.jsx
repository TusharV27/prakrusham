"use client";

import ReviewSection from "./ReviewSection";

export default function ProductReviews({ productId, rating, reviews }) {
  return (
    <ReviewSection 
      productId={productId} 
      rating={rating} 
      reviews={reviews} 
      title="Product Feedback"
      ctaText="WRITE A PRODUCT REVIEW"
      emptyText="Share your experience with our 100% natural products and help other farmers!"
    />
  );
}