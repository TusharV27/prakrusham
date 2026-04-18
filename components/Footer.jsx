"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaYoutube,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import { Plus, Minus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const footerLinks = [
    {
      title: t('explore_more'),
      links: [
       { name: t('best_sellers_link'), href: "/#best-sellers" },
       { name: t('new_arrivals'), href: "/#new-arrivals" },
      ],
    },
    {
      title: t('information'),
      links: [
        { name: t('order_policy'), href: "/order-policy" },
        { name: t('return_policy'), href: "/return-policy" },
        { name: t('privacy_policy'), href: "/privacy-policy" },
        { name: t('terms_conditions'), href: "/terms" },
      ],
    },
    {
      title: t('discover'),
      links: [
        { name: t('blog_link'), href: "/blog" },
        { name: t('about_us_link'), href: "/about" },
        { name: t('contact_link'), href: "/contact" },
      ],
    },
  ];

  return (
    <footer 
      className="relative border-t border-[#14532d]/5 pt-16 overflow-hidden pb-20 lg:pb-0" 
      id="site-footer"
    >

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-white/20 pointer-events-none"></div>

      {/* Content */}
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 pb-2">

        {/* Desktop Layout */}
        <div className="hidden lg:grid grid-cols-12 gap-8">

          {/* Brand */}
          <div className="col-span-4 space-y-4">
            <h2 className="text-3xl text-[#14532d] font-serif font-bold uppercase">
              {t('brand_name')}
            </h2>

            <p className="text-black/70 max-w-sm">
              {t('footer_tagline')}
            </p>
          </div>

          {/* Links */}
          <div className="col-span-5 grid grid-cols-3 gap-8">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm text-[#14532d] font-semibold uppercase mb-4">
                  {group.title}
                </h3>

                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-black/70 hover:text-black transition"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social + Support */}
          <div className="col-span-3 space-y-8">

            <div>
              <h3 className="text-sm text-[#14532d] font-semibold uppercase mb-4">
                {t('follow_us')}
              </h3>

              <div className="flex gap-3">
                <Social><FaFacebookF size={14} /></Social>
                <Social><FaInstagram size={14} /></Social>
                <Social><FaPinterestP size={14} /></Social>
                <Social><FaYoutube size={14} /></Social>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-[#14532d] font-semibold uppercase mb-4">
                {t('support')}
              </h3>

              <div className="space-y-3 text-sm text-black/70">
                <div className="flex items-center gap-3">
                  <Social>
                    <FaPhoneAlt size={14} />
                  </Social>
                  +91 95123 34223
                </div>

                <div className="flex items-center gap-3">
                  <Social>
                    <FaEnvelope size={14} />
                  </Social>
                  support@Prakrusham.com
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Mobile */}
        <div className="lg:hidden space-y-6">

          <div className="space-y-4">
            <h2 className="text-2xl text-[#14532d] font-serif font-bold">
              Prakrusham
            </h2>

            <p className="text-sm text-black/70">
              {t('footer_tagline')}
            </p>
          </div>

          {footerLinks.map((group, index) => (
            <div
              key={group.title}
              className="border-t border-[#14532d]/10 pt-4"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center"
              >
                <span className="text-sm text-[#14532d] font-semibold uppercase">
                  {group.title}
                </span>

                {openIndex === index ? (
                  <Minus size={16} />
                ) : (
                  <Plus size={16} />
                )}
              </button>

              {openIndex === index && (
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-black/70"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="border-t border-[#14532d]/10 pt-4">
            <button
              onClick={() => toggle(100)}
              className="w-full flex justify-between items-center"
            >
              <span className="text-sm text-[#14532d] font-semibold uppercase">
                {t('follow_us')}
              </span>

              {openIndex === 100 ? (
                <Minus size={16} />
              ) : (
                <Plus size={16} />
              )}
            </button>

            {openIndex === 100 && (
              <div className="flex gap-3 mt-4">
                <Social><FaFacebookF size={14} /></Social>
                <Social><FaInstagram size={14} /></Social>
                <Social><FaPinterestP size={14} /></Social>
                <Social><FaYoutube size={14} /></Social>
              </div>
            )}
          </div>

          <div className="border-t border-[#14532d]/10 pt-4">
            <button
              onClick={() => toggle(101)}
              className="w-full flex justify-between items-center"
            >
              <span className="text-sm text-[#14532d] font-semibold uppercase">
                {t('support')}
              </span>

              {openIndex === 101 ? (
                <Minus size={16} />
              ) : (
                <Plus size={16} />
              )}
            </button>

            {openIndex === 101 && (
              <div className="space-y-3 mt-4 text-sm text-black/70">
                <div className="flex items-center gap-3">
                  <Social>
                    <FaPhoneAlt size={14} />
                  </Social>
                  +91 95123 34223
                </div>

                <div className="flex items-center gap-3">
                  <Social>
                    <FaEnvelope size={14} />
                  </Social>
                  support@Prakrusham.com
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Bottom Image */}
      <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5] lg:aspect-[16/3.5] -mt-4 lg:mt-0">
        <img
          src="/banners/footer1.webp"
          alt="Footer Illustration"
          className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none"
        />
      </div>

      {/* Copyright Section */}
      <div className="w-full bg-[#14532d] py-4">
        <p className="text-[13px] text-white/90 text-center font-medium tracking-wide">
          © {currentYear} Prakrusham. All rights reserved.
        </p>
      </div>

    </footer>
  );
}

function Social({ children }) {
  return (
    <div className="w-10 h-10 rounded-full border border-[#14532d]/20 flex items-center justify-center hover:bg-[#14532d] hover:text-white transition">
      {children}
    </div>
  );
}