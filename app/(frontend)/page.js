import dynamic from 'next/dynamic';
import HeroSection from "@/components/HeroSection";

// Lazy load components that are below the fold
const OurCollection = dynamic(() => import("@/components/home/OurCollection"));
const OfferSlider = dynamic(() => import("@/components/home/OfferSlider"));
const FeaturedProducts = dynamic(() => import("@/components/home/FeaturedProducts"));
const OutStory = dynamic(() => import("@/components/home/OutStory"));
const Testimonials = dynamic(() => import("@/components/home/Testimonials"));
const Blog = dynamic(() => import("@/components/home/Blog"));
const EventsSpecials = dynamic(() => import("@/components/home/EventsSpecials"));
const DailyEssentials = dynamic(() => import("@/components/home/DailyEssentials"));
const ComboOffers = dynamic(() => import("@/components/home/ComboOffers"));
const BannerFarmers = dynamic(() => import("@/components/home/BannerFarmers"));
const BestSellers = dynamic(() => import("@/components/home/BestSellers"));
const HowItWorks = dynamic(() => import("@/components/home/HowItWorks"));
const DeliveryArea = dynamic(() => import("@/components/home/DeliveryArea"));
const FAQ = dynamic(() => import("@/components/home/FAQ"));

export const metadata = {
  title: "Prakrushi | Fresh Organic Vegetables directly from Farmers",
  description: "Experience the freshness of farm-to-home organic vegetables. Support local farmers and eat healthy with Prakrushi.",
};

export default function Home() {
  return (
    <>
    <main className="min-h-screen">
      {/* 2. Header (already in layout) */}
      
      {/* 3. Hero Banner */}
      <HeroSection />
      
      {/* 4. Shop by Category */}
      <OurCollection />
       
      {/* 5. Offers */}
      <OfferSlider />
      
      {/* 6. Today's Fresh Vegetables */}
      <section id="new-arrivals" className="scroll-mt-20">
        <FeaturedProducts />
      </section>
      
      {/* 7. Events/Seasonal Specials */}
      <EventsSpecials />

      {/* 8. Daily Essentials Section */}
      <DailyEssentials />
      
      {/* 9. Combo Offers Section */}
      <ComboOffers />
      
      {/* 10. Banner Section: Direct from Gujarat Farmers */}
      <BannerFarmers />
      
      {/* 11. Best Selling Products */}
      <section id="best-sellers" className="scroll-mt-20">  
        <BestSellers />
      </section>
      
      {/* 12. How it works (steps) */}
      <HowItWorks />
      
      {/* 13. Delivery Area */}
      <DeliveryArea />
      
      {/* 14. Blog Section */}
      <Blog />
      
      {/* 15. Short Brand Story (About) */}
      <OutStory />
      
      {/* 16. Customer Review */}
      <Testimonials />

      {/* 17. Faq Section */}
      <FAQ/>
      
      {/* 18. Footer (already in layout) */}
    </main>
    </>
  );
}