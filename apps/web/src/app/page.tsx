"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";

const SERVICES = [
  { num: "01", title: "Electrical", tag: "Safety audit" },
  { num: "02", title: "Plumbing", tag: "Leak detection" },
  { num: "03", title: "HVAC", tag: "Climate systems" },
  { num: "04", title: "Structural", tag: "Foundation check" },
  { num: "05", title: "Pest Control", tag: "Prevention plan" },
  { num: "06", title: "Security", tag: "Access audit" },
];

const PLANS = [
  {
    name: "1 BHK",
    price: "₹17,999",
    freq: "/inspection",
    sqft: "300 – 600 sq ft",
    items: [
      "All 6 services",
      "Quarterly AI report",
      "Email support",
      "Health score card",
    ],
  },
  {
    name: "2 BHK",
    price: "₹29,999",
    freq: "/inspection",
    sqft: "600 – 1,300 sq ft",
    items: [
      "All 6 services",
      "Monthly AI report",
      "Priority support",
      "Analytics dashboard",
      "Trend tracking",
    ],
    hot: true,
  },
  {
    name: "3 BHK",
    price: "₹51,999",
    freq: "/inspection",
    sqft: "1,300 – 2,100 sq ft",
    items: [
      "All 6 services",
      "Weekly AI report",
      "Dedicated manager",
      "API access",
      "Room-by-room breakdown",
    ],
  },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const [open, setOpen] = useState(false);

  return (
    <main
      className="overflow-x-hidden bg-[#F5F0E8] text-[#111]"
      style={{ fontFamily: "'Figtree Variable', 'Figtree', sans-serif" }}
    >
      {/* NAV */}
      <nav className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-[#111]/10 border-b bg-[#F5F0E8]/90 px-6 py-4 backdrop-blur-sm md:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center bg-[#F07020] font-black text-sm text-white">
            H
          </div>
          <span className="font-black text-base tracking-tight">Homefixu</span>
        </div>
        <div className="hidden items-center gap-8 font-medium text-[#111]/50 text-sm md:flex">
          {["Services", "How It Works", "Pricing"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              className="transition-colors hover:text-[#111]"
            >
              {l}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {/* Technician Login button */}
          <Link
            href="/technician/login"
            className="flex items-center gap-1.5 border border-[#111]/20 px-4 py-2 font-semibold text-[#111]/60 text-sm transition-colors hover:border-[#F07020] hover:text-[#F07020]"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M8 4L10 6" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Technician Login
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 font-semibold text-[#111]/50 text-sm transition-colors hover:text-[#111]"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="bg-[#111] px-5 py-2.5 font-black text-[#F5F0E8] text-sm transition-colors hover:bg-[#F07020]"
          >
            Get Started →
          </Link>
        </div>
        <button
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setOpen(!open)}
        >
          <span
            className={`block h-0.5 w-6 origin-center bg-[#111] transition-all ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-[#111] transition-all ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 origin-center bg-[#111] transition-all ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-[#F5F0E8] px-6 pt-20">
          {["Services", "How It Works", "Pricing"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              onClick={() => setOpen(false)}
              className="border-[#111]/10 border-b py-5 font-black text-2xl"
            >
              {l}
            </a>
          ))}
          <Link
            href="/technician/login"
            onClick={() => setOpen(false)}
            className="mt-6 flex items-center justify-center gap-2 border-2 border-[#F07020] py-3.5 text-center font-black text-[#F07020] text-base"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M8 4L10 6" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Technician Login
          </Link>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-3 bg-[#111] py-4 text-center font-black text-[#F5F0E8] text-lg"
          >
            Get Started →
          </Link>
        </div>
      )}

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pt-28 pb-20 md:px-10"
      >
        <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden">
          <span className="whitespace-nowrap font-black text-[#111]/[0.04] text-[20vw] leading-none">
            HOME
          </span>
        </div>
        <div className="absolute top-0 right-0 hidden h-full w-1 bg-[#F07020] md:block" />

        <motion.div
          style={{ y: titleY }}
          className="relative mx-auto w-full max-w-6xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 border border-[#F07020] px-3 py-1"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#F07020]" />
            <span className="font-bold text-[#F07020] text-xs uppercase tracking-widest">
              AI-Powered Home Health
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-8 font-black text-[13vw] uppercase leading-[0.88] tracking-tighter md:text-[9vw]"
          >
            Know Your
            <br />
            <span className="text-[#F07020]">Home.</span>
            <br />
            Fix It.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-col items-start gap-8 md:flex-row md:items-end md:gap-16"
          >
            <p className="max-w-md font-medium text-[#111]/50 text-base leading-relaxed md:text-lg">
              Book professional home inspections, track 12+ services, and get
              AI-generated health reports every 3 months — automatically.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="bg-[#F07020] px-8 py-4 font-black text-sm text-white uppercase tracking-wide transition-colors hover:bg-[#111]"
              >
                Start Free →
              </Link>
              <a
                href="#how-it-works"
                className="font-semibold text-[#111]/50 text-sm underline underline-offset-4 transition-colors hover:text-[#111]"
              >
                See how
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 flex gap-12 border-[#111]/15 border-t pt-8 md:mt-24"
          >
            {[
              ["2,400+", "Homes Served"],
              ["98%", "Satisfaction Rate"],
              ["12+", "Service Types"],
              ["3mo", "Report Cycle"],
            ].map(([v, l]) => (
              <div key={l} className="hidden first:block md:block">
                <div className="font-black text-2xl md:text-3xl">{v}</div>
                <div className="mt-0.5 font-medium text-[#111]/40 text-xs uppercase tracking-wider">
                  {l}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* TICKER */}
      <div className="overflow-hidden border-[#111]/10 border-y bg-[#F07020] py-3">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="flex gap-0 whitespace-nowrap"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="px-8 font-black text-sm text-white uppercase tracking-widest"
            >
              Electrical · Plumbing · HVAC · Structural · Pest Control ·
              Security · Waterproofing · Painting ·&nbsp;
            </span>
          ))}
        </motion.div>
      </div>

      {/* SERVICES */}
      <section
        id="services"
        className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-36"
      >
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="font-black text-5xl uppercase leading-none tracking-tighter md:text-7xl">
            What
            <br />
            We Fix
          </h2>
          <p className="max-w-xs font-medium text-[#111]/50 text-sm leading-relaxed">
            Every corner of your home, inspected by certified professionals and
            tracked in your dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 border border-[#111]/10 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group cursor-pointer border-[#111]/10 border-r border-b p-8 transition-colors duration-200 hover:bg-[#F07020]"
            >
              <div className="mb-6 font-black text-[#111]/30 text-xs uppercase tracking-widest transition-colors group-hover:text-white/60">
                {s.num}
              </div>
              <div className="mb-2 font-black text-2xl transition-colors group-hover:text-white">
                {s.title}
              </div>
              <div className="font-medium text-[#111]/50 text-sm transition-colors group-hover:text-white/70">
                {s.tag}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="bg-[#111] px-6 py-24 text-[#F5F0E8] md:px-10 md:py-36"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 font-black text-5xl uppercase leading-none tracking-tighter md:text-7xl">
            3 Steps.
            <br />
            <span className="text-[#F07020]">That's It.</span>
          </h2>
          <div className="grid gap-px bg-[#F5F0E8]/10 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Book",
                d: "Choose from 12+ services. Pick a date that works for you. Done in 60 seconds.",
              },
              {
                n: "02",
                t: "Inspect",
                d: "A certified professional visits your home and runs a full diagnostic.",
              },
              {
                n: "03",
                t: "Report",
                d: "Every 3 months, our AI compiles all data into your Home Health Report.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="group relative overflow-hidden bg-[#111] p-10"
              >
                <div className="absolute -right-2 -bottom-4 select-none font-black text-8xl text-white/[0.03] transition-colors group-hover:text-[#F07020]/10">
                  {step.n}
                </div>
                <div className="mb-6 font-black text-[#F07020] text-sm uppercase tracking-widest">
                  {step.n}
                </div>
                <div className="mb-4 font-black text-3xl uppercase">
                  {step.t}
                </div>
                <p className="font-medium text-[#F5F0E8]/50 text-sm leading-relaxed">
                  {step.d}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* REPORT */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-36">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-4 font-black text-[#F07020] text-xs uppercase tracking-widest">
              AI Reports
            </div>
            <h2 className="mb-6 font-black text-5xl uppercase leading-none tracking-tighter md:text-6xl">
              Your Home's
              <br />
              Score Card
            </h2>
            <p className="mb-8 max-w-sm font-medium text-[#111]/50 text-base leading-relaxed">
              Every quarter, our AI analyses all your service data and gives you
              a score — with risk flags, priority repairs, and a 12-month trend.
            </p>
            <ul className="space-y-2">
              {[
                "Room-by-room breakdown",
                "Risk score 0 – 100",
                "Priority repair list",
                "Historical trend tracking",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 font-semibold text-[#111]/60 text-sm"
                >
                  <span className="h-4 w-4 flex-shrink-0 bg-[#F07020]" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="border-2 border-[#111] p-8"
          >
            <div className="mb-8 flex items-start justify-between border-[#111]/10 border-b pb-6">
              <div>
                <div className="mb-1 font-black text-[#111]/40 text-xs uppercase tracking-widest">
                  Q1 2025
                </div>
                <div className="font-black text-lg">Sharma Residence</div>
                <div className="font-medium text-[#111]/50 text-sm">
                  Sector 21, Noida
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-5xl text-[#F07020]">84</div>
                <div className="font-bold text-[#111]/40 text-xs uppercase tracking-wider">
                  Health Score
                </div>
              </div>
            </div>
            <div className="space-y-5">
              {[
                { l: "Electrical", v: 92, c: "bg-[#111]" },
                { l: "Plumbing", v: 78, c: "bg-[#F0C040]" },
                { l: "HVAC", v: 85, c: "bg-[#111]" },
                { l: "Structural", v: 71, c: "bg-[#F07020]" },
              ].map((item) => (
                <div key={item.l}>
                  <div className="mb-2 flex justify-between font-bold text-sm">
                    <span>{item.l}</span>
                    <span>{item.v}</span>
                  </div>
                  <div className="h-1 bg-[#111]/10">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.v}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${item.c}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-[#111]/10 border-t pt-6">
              <div className="mb-2 font-black text-[#111]/40 text-xs uppercase tracking-widest">
                AI Recommendation
              </div>
              <p className="font-medium text-[#111]/60 text-sm leading-relaxed">
                Schedule structural inspection within 30 days. Minor cracks
                detected near east wall.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="bg-[#EDEAE0] px-6 py-24 md:px-10 md:py-36"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="font-black text-5xl uppercase leading-none tracking-tighter md:text-7xl">
              Simple
              <br />
              Pricing
            </h2>
            <p className="max-w-xs font-medium text-[#111]/50 text-sm leading-relaxed">
              One-time inspection price based on your home size. No hidden
              charges.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative border-2 p-8 ${plan.hot ? "border-[#111] bg-[#111] text-[#F5F0E8]" : "border-[#111]/20 bg-transparent transition-colors hover:border-[#111]"}`}
              >
                {plan.hot && (
                  <div className="absolute -top-3 left-8 bg-[#F07020] px-3 py-0.5 font-black text-white text-xs uppercase tracking-widest">
                    Popular
                  </div>
                )}
                <div
                  className={`mb-1 font-black text-xs uppercase tracking-widest ${plan.hot ? "text-[#F07020]" : "text-[#111]/40"}`}
                >
                  {plan.name}
                </div>
                {/* sqft badge */}
                <div
                  className={`mb-6 font-bold text-[11px] ${plan.hot ? "text-[#F5F0E8]/40" : "text-[#111]/30"}`}
                >
                  {plan.sqft}
                </div>
                <div className="mb-8 flex items-end gap-1">
                  <span className="font-black text-4xl">{plan.price}</span>
                  <span
                    className={`mb-1.5 font-medium text-xs ${plan.hot ? "text-[#F5F0E8]/50" : "text-[#111]/40"}`}
                  >
                    {plan.freq}
                  </span>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.items.map((item) => (
                    <li
                      key={item}
                      className={`flex items-center gap-3 font-semibold text-sm ${plan.hot ? "text-[#F5F0E8]/70" : "text-[#111]/60"}`}
                    >
                      <span
                        className={`h-3 w-3 flex-shrink-0 ${plan.hot ? "bg-[#F07020]" : "bg-[#111]/30"}`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block py-3.5 text-center font-black text-sm uppercase tracking-wider transition-colors ${
                    plan.hot
                      ? "bg-[#F07020] text-white hover:bg-white hover:text-[#111]"
                      : "bg-[#111] text-[#F5F0E8] hover:bg-[#F07020]"
                  }`}
                >
                  Get Started →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[#F07020] px-6 py-24 text-white md:px-10 md:py-32">
        <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden">
          <span className="whitespace-nowrap font-black text-[22vw] text-white/[0.06] leading-none">
            BUDDY
          </span>
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <h2 className="font-black text-5xl uppercase leading-none tracking-tighter md:text-7xl">
            Ready to
            <br />
            Know Your
            <br />
            Home?
          </h2>
          <div className="flex flex-col gap-4">
            <p className="max-w-xs font-medium text-white/70">
              Join 2,400+ homeowners. No credit card required. Cancel anytime.
            </p>
            <Link
              href="/login"
              className="inline-block w-fit bg-white px-10 py-4 font-black text-[#F07020] text-base uppercase tracking-widest transition-colors hover:bg-[#111] hover:text-white"
            >
              Start Free →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-col items-center justify-between gap-4 bg-[#111] px-6 py-10 text-[#F5F0E8] md:flex-row md:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center bg-[#F07020] font-black text-white text-xs">
            H
          </div>
          <span className="font-black text-sm">Homefixu</span>
        </div>
        <p className="font-medium text-[#F5F0E8]/30 text-xs">
          © 2025 Homefixu. All rights reserved.
        </p>
        <div className="flex gap-6">
          {["Privacy", "Terms", "Contact"].map((l) => (
            <a
              key={l}
              href="#"
              className="font-semibold text-[#F5F0E8]/40 text-xs transition-colors hover:text-[#F07020]"
            >
              {l}
            </a>
          ))}
        </div>
      </footer>
    </main>
  );
}
