"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
  FiClock,
} from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className=" bg-gradient-to-b from-green-50 to-white">

      {/* ================= HERO ================= */}
      {/* ================= HERO ================= */}
<div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-14">
  <div className="relative w-full overflow-hidden border border-[#14532d]/10">

    <img
      src="banners/contact.webp"
      alt="Contact"
      className="w-full h-[120px] sm:h-auto object-cover block"
    />

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/40" />

    {/* Content */}
    <div className="absolute inset-0 flex flex-col justify-center text-white px-6 sm:px-8 md:px-12 lg:px-16">

      <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-left">
        {t('contact_us_title')}
      </h1>

      <div className="mt-3 inline-flex items-center w-fit gap-2 text-[10px] font-black uppercase tracking-[0.2em] bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        <Link href="/">{t('home')}</Link>
        <span className="mx-1">›</span>
        <span className="text-emerald-400">{t('contact_us_title')}</span>
      </div>

    </div>

  </div>
</div>

      {/* ================= CONTACT SECTION ================= */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 grid lg:grid-cols-12 gap-10 md:gap-16">

        {/* LEFT SIDE */}
        <div className="lg:col-span-5 space-y-8">

          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#14532d] mb-3">
              {t("get_in_touch")}
            </h2>
            <div className="w-16 h-[3px] bg-[#14532d]" />
          </div>

          {/* Address */}
          <div className="flex gap-4">
            <div className="p-3 bg-green-50 text-[#14532d] rounded-full">
              <FiMapPin size={18} />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#14532d]">
                {t("address_label")}
              </h4>

              <p className="text-sm text-gray-500">
                Shop No. G-76, IFM Market, Sitanagar,
                Surat - 395010, Gujarat, INDIA.
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex gap-4">
            <div className="p-3 bg-green-50 text-[#14532d] rounded-full">
              <FiPhone size={18} />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#14532d]">
                {t("phone_label")}
              </h4>

              <p className="text-sm text-gray-500">
                +91-95123 34223
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex gap-4">
            <div className="p-3 bg-green-50 text-[#14532d] rounded-full">
              <FiMail size={18} />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#14532d]">
               {t("email_label")}
              </h4>

              <p className="text-sm text-gray-500">
                Sales.Prakrusham@gmail.com
              </p>
            </div>
          </div>

          {/* Opening Hours */}
          <div className=" border border-[#14532d]/10 rounded-[24px] p-6">

            <div className="flex items-center gap-3 mb-4">
              <FiClock className="text-[#14532d]" />
              <h4 className="font-semibold text-[#14532d]">
                {t("opening_hours")}
              </h4>
            </div>

            <div className="space-y-2 text-sm text-gray-600">

              <div className="flex justify-between">
                <span>{t("mon_fri")}</span>
                <span className="font-semibold text-[#14532d]">
                  10:00 - 17:00
                </span>
              </div>

              <div className="flex justify-between">
                <span>{t("sat_sun")}</span>
                <span className="font-semibold text-[#14532d]">
                  11:00 - 14:00
                </span>
              </div>

            </div>

          </div>

        </div>


        {/* RIGHT SIDE FORM */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 bg-white border border-[#14532d]/5 rounded-[24px] p-6 md:p-10 shadow-sm"
        >

          <div className="mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-[#14532d]">
             {t("send_message")}
            </h3>

            <p className="text-sm text-gray-500">
              {t("respond_24_hours")}
            </p>
          </div>

          <form className="space-y-5">

            <div className="grid sm:grid-cols-2 gap-4">

              <input
                type="text"
                placeholder={t("full_name")}
                className="w-full border border-[#14532d]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#14532d]"
              />

              <input
                type={t("email_label")}
                placeholder="Email"
                className="w-full border border-[#14532d]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#14532d]"
              />

            </div>

            <input
              type="text"
              placeholder={t("subject_label")}
              className="w-full border border-[#14532d]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#14532d]"
            />

            <textarea
              rows="5"
              placeholder={t("your_message")}
              className="w-full border border-[#14532d]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#14532d]"
            />

            <button className="w-full bg-[#14532d] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#14532d] transition">
              {t("send_message")}
            </button>

          </form>

        </motion.div>

      </section>


      {/* ================= MAP SECTION ================= */}
      <section className="bg-gradient-to-b from-green-50 to-white py-8 sm:py-10 md:py-12 lg:py-10 xl:py-14">

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#14532d] mb-2 uppercase">
              {t('our_location')}
            </h2>

            <p className="text-gray-500 text-sm">
              {t('visit_our_store')}
            </p>
          </div>

          <div className="w-full h-[350px] md:h-[500px] overflow-hidden shadow-sm">

            <iframe
              src="https://www.google.com/maps?q=Surat&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            />

          </div>

        </div>

      </section>

    </div>
  );
}