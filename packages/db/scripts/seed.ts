// packages/db/scripts/seed.ts
// Run: pnpm tsx scripts/seed.ts

import { randomUUID } from "node:crypto";
import { db } from "../src/index.js";
import { plans, services } from "../src/schema/index.js";

async function seed() {
  console.log("🌱 Seeding plans...");

  await db.insert(plans).values([
    {
      id: randomUUID(),
      name: "Starter",
      tier: "starter",
      priceMonthlyPaise: 49900, // ₹499
      priceYearlyPaise: 479900, // ₹4,799 (2 months free)
      servicesPerMonth: 2,
      reportFrequency: "quarterly",
      maxProperties: 1,
      hasSos: false,
      hasDoorbell: false,
      hasCctv: false,
      hasAiInterior: false,
      features: [
        "Basic health score",
        "Email support",
        "1 property",
        "Plumbing + Electrical",
      ],
    },
    {
      id: randomUUID(),
      name: "Pro",
      tier: "pro",
      priceMonthlyPaise: 99900, // ₹999
      priceYearlyPaise: 959900, // ₹9,599 (2 months free)
      servicesPerMonth: 5,
      reportFrequency: "monthly",
      maxProperties: 3,
      hasSos: true,
      hasDoorbell: false,
      hasCctv: true,
      hasAiInterior: false,
      features: [
        "Room-wise breakdown",
        "Priority support",
        "Up to 3 properties",
        "Risk alerts",
        "SOS emergency button",
        "CCTV installation",
      ],
    },
    {
      id: randomUUID(),
      name: "Elite",
      tier: "elite",
      priceMonthlyPaise: 199900, // ₹1,999
      priceYearlyPaise: 1919900, // ₹19,199 (2 months free)
      servicesPerMonth: 999, // Effectively unlimited
      reportFrequency: "weekly",
      maxProperties: 999, // Unlimited
      hasSos: true,
      hasDoorbell: true,
      hasCctv: true,
      hasAiInterior: true,
      features: [
        "Full AI analysis + trends",
        "Dedicated account manager",
        "Unlimited properties",
        "Emergency priority booking",
        "Smart doorbell with ads",
        "AI interior designer",
        "CCTV installation",
        "SOS emergency button",
      ],
    },
  ]);

  console.log("✅ Plans seeded");
  console.log("🌱 Seeding services...");

  await db.insert(services).values([
    {
      id: randomUUID(),
      name: "Plumbing Service",
      description:
        "Monthly plumbing inspection and repair. Labour charges included, material cost (taps, pipes, fittings) to be borne by the homeowner.",
      category: "plumbing",
      frequency: "monthly",
      materialPolicy: "labour_only",
      basePricePaise: 29900, // ₹299 labour
      durationMinutes: 60,
      iconKey: "Wrench",
      inclusions: [
        "Leak detection",
        "Pipe inspection",
        "Joint repair",
        "Tap servicing",
        "Drain cleaning",
      ],
      exclusions: ["Taps", "Pipes", "Fittings", "Water heater parts"],
    },
    {
      id: randomUUID(),
      name: "Electrical Service",
      description:
        "Monthly electrical inspection and repair. Labour charges included, material cost (switches, wires, MCBs) to be borne by the homeowner.",
      category: "electrical",
      frequency: "monthly",
      materialPolicy: "labour_only",
      basePricePaise: 34900, // ₹349 labour
      durationMinutes: 60,
      iconKey: "Lightning",
      inclusions: [
        "Wiring inspection",
        "Switch/socket repair",
        "MCB check",
        "Earthing test",
        "Fan/light servicing",
      ],
      exclusions: ["Switches", "Sockets", "MCBs", "Wires", "Fans", "Lights"],
    },
    {
      id: randomUUID(),
      name: "Pest Control",
      description:
        "Comprehensive pest control treatment for your entire home. All chemicals and materials included.",
      category: "pest_control",
      frequency: "biannual",
      materialPolicy: "all_inclusive",
      basePricePaise: 149900, // ₹1,499
      durationMinutes: 120,
      iconKey: "Bug",
      inclusions: [
        "Cockroach treatment",
        "Ant control",
        "Termite inspection",
        "Mosquito treatment",
        "All chemicals",
      ],
      exclusions: [],
    },
    {
      id: randomUUID(),
      name: "Paint & Sealant",
      description:
        "Annual painting and sealant service. All materials including paint, primer, and sealant are included.",
      category: "paint_and_sealant",
      frequency: "annual",
      materialPolicy: "all_inclusive",
      basePricePaise: 499900, // ₹4,999
      durationMinutes: 480,
      iconKey: "PaintBrush",
      inclusions: [
        "Wall painting",
        "Primer coat",
        "Waterproof sealant",
        "Crack filling",
        "All paint materials",
      ],
      exclusions: ["Furniture moving", "Wall texture/design work"],
    },
    {
      id: randomUUID(),
      name: "Smart Doorbell",
      description:
        "Free smart doorbell installation with 24/7 ad-supported display. Shows advertisements on screen, visitor detection, and Blinkit-like quick commerce integration.",
      category: "doorbell",
      frequency: "on_demand",
      materialPolicy: "no_charge",
      basePricePaise: 0, // Free — ad-supported
      durationMinutes: 60,
      iconKey: "Doorbell",
      inclusions: [
        "Doorbell device",
        "Installation",
        "24/7 ad display",
        "Visitor detection",
        "Ring notifications",
        "Blinkit integration",
      ],
      exclusions: ["Internet connectivity (user provides)"],
    },
    {
      id: randomUUID(),
      name: "CCTV Installation",
      description:
        "On-demand CCTV installation. No labour charges — material cost (cameras, DVR, cables) to be purchased by the homeowner.",
      category: "cctv",
      frequency: "on_demand",
      materialPolicy: "material_on_user",
      basePricePaise: 0, // Free labour
      durationMinutes: 180,
      iconKey: "VideoCamera",
      inclusions: [
        "Installation",
        "Wiring",
        "DVR setup",
        "App configuration",
        "Basic training",
      ],
      exclusions: ["Cameras", "DVR/NVR", "Hard disk", "Cables", "Power supply"],
    },
    {
      id: randomUUID(),
      name: "Tank Cleaning",
      description:
        "Professional water tank cleaning and sanitization service every 6 months.",
      category: "tank_cleaning",
      frequency: "biannual",
      materialPolicy: "all_inclusive",
      basePricePaise: 99900, // ₹999
      durationMinutes: 90,
      iconKey: "Drop",
      inclusions: [
        "Tank draining",
        "Scrubbing",
        "Sanitization",
        "Anti-bacterial treatment",
        "Refill supervision",
      ],
      exclusions: ["Tank repair", "Pipe replacement"],
    },
    {
      id: randomUUID(),
      name: "AI Interior Designer",
      description:
        "AI-powered interior design suggestions. Upload photos of your room, describe your style, and get personalized design recommendations with cost estimates.",
      category: "interior_design",
      frequency: "on_demand",
      materialPolicy: "labour_only",
      basePricePaise: 0, // Included in plan
      durationMinutes: 0, // Digital service
      iconKey: "Palette",
      inclusions: [
        "AI room analysis",
        "Style recommendations",
        "3D mockups",
        "Cost estimates",
        "Material suggestions",
      ],
      exclusions: ["Actual renovation work", "Material procurement"],
    },
  ]);

  console.log("✅ Services seeded");
  console.log("🎉 Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
