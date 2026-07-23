"use client";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Leaf,
  Recycle,
  Users,
  Coins,
  MapPin,
  Building2,
  Factory,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Poppins } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import {
  getRecentReports,
  getAllRewards,
  getWasteCollectionTasks,
} from "@/utils/db/actions";
const poppins = Poppins({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  display: "swap",
});

const sponsors = [
  { name: "ShopSphere", logo: "/sponsors/shopsphere.png" },
  { name: "EcoMart", logo: "/sponsors/ecomart.png" },
  { name: "GreenCart Market", logo: "/sponsors/greencart-market.png" },
  { name: "FreshBite Foods", logo: "/sponsors/freshbite-foods.png" },
  { name: "NovaTech", logo: "/sponsors/novatech.png" },
];

function AnimatedGlobe() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8">
      <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-pulse"></div>
      <div className="absolute inset-2 rounded-full bg-green-400 opacity-40 animate-ping"></div>
      <div className="absolute inset-4 rounded-full bg-green-300 opacity-60 animate-spin"></div>
      <div className="absolute inset-6 rounded-full bg-green-200 opacity-80 animate-bounce"></div>
      <Leaf className="absolute inset-0 m-auto h-16 w-16 text-green-600 animate-pulse" />
    </div>
  );
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [impactData, setImpactData] = useState({
    wasteCollected: 0,
    reportsSubmitted: 0,
    tokensEarned: 0,
    co2Offset: 0,
  });

  useEffect(() => {
    async function fetchImpactData() {
      try {
        const reports = await getRecentReports(100); // Fetch last 100 reports
        const rewards = await getAllRewards();
        const tasks = await getWasteCollectionTasks(100); // Fetch last 100 tasks

        const wasteCollected = tasks.reduce((total, task) => {
          const match = task.amount.match(/(\d+(\.\d+)?)/);
          const amount = match ? parseFloat(match[0]) : 0;
          return total + amount;
        }, 0);

        const reportsSubmitted = reports.length;
        const tokensEarned = rewards.reduce(
          (total, reward) => total + (reward.points || 0),
          0
        );
        const co2Offset = wasteCollected * 0.5; // Assuming 0.5 kg CO2 offset per kg of waste

        setImpactData({
          wasteCollected: Math.round(wasteCollected * 10) / 10, // Round to 1 decimal place
          reportsSubmitted,
          tokensEarned,
          co2Offset: Math.round(co2Offset * 10) / 10, // Round to 1 decimal place
        });
      } catch (error) {
        console.error("Error fetching impact data:", error);
        // Set default values in case of error
        setImpactData({
          wasteCollected: 0,
          reportsSubmitted: 0,
          tokensEarned: 0,
          co2Offset: 0,
        });
      }
    }

    fetchImpactData();
  }, []);

  const login = () => {
    setLoggedIn(true);
  };

  return (
    <div className={`container mx-auto px-4 py-16 ${poppins.className}`}>
      <section className="text-center mb-20">
        <AnimatedGlobe />
        <h1 className="mb-3 text-5xl font-bold tracking-tight text-green-600 sm:text-6xl">
          GreenNeighbor
        </h1>
        <p className="mb-3 text-xl font-medium text-gray-700">
          Smart Waste Management System
        </p>
        <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-gray-500">
          Join our community in making waste management more efficient and
          rewarding!
        </p>
        {!loggedIn ? (
          <Button
            onClick={login}
            className="bg-green-600 hover:bg-green-700 text-white text-lg py-6 px-10 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Link href="/report">
            <Button className="bg-green-600 hover:bg-green-700 text-white text-lg py-6 px-10 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105">
              Report Waste
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        )}
      </section>

      <section className="grid md:grid-cols-3 gap-10 mb-20">
        <FeatureCard
          icon={Leaf}
          title="Eco-Friendly"
          description="Contribute to a cleaner environment by reporting and collecting waste."
        />
        <FeatureCard
          icon={Coins}
          title="Earn Rewards"
          description="Get tokens for your contributions to waste management efforts."
        />
        <FeatureCard
          icon={Users}
          title="Community-Driven"
          description="Be part of a growing community committed to sustainable practices."
        />
      </section>

      <section className="mb-20">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-600">
            Assigned organizations
          </p>
          <h2 className="mt-3 text-3xl font-bold text-gray-800">
            Teams ready to make an impact
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-500">
            Each report is matched with a collection team suited to the waste
            type, size, and location.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <OrganizationCard
            icon={Building2}
            title="Yangon Local Cleanup"
            description="A neighborhood team handling nearby, lightweight household waste."
            accent="emerald"
          />
          <OrganizationCard
            icon={Factory}
            title="GreenLoop Recycling Team"
            description="Recycling specialists for plastic, paper, glass, metal, and electronics."
            accent="lime"
          />
          <OrganizationCard
            icon={Truck}
            title="City Heavy Cleanup Unit"
            description="A high-capacity crew equipped for heavy, mixed, and hazardous cleanup."
            accent="teal"
          />
        </div>
      </section>

      <section className="bg-white p-10 rounded-3xl shadow-lg mb-20">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">
          Our Impact
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <ImpactCard
            title="Waste Collected"
            value={`${impactData.wasteCollected} kg`}
            icon={Recycle}
          />
          <ImpactCard
            title="Reports Submitted"
            value={impactData.reportsSubmitted.toString()}
            icon={MapPin}
          />
          <ImpactCard
            title="Tokens Earned"
            value={impactData.tokensEarned.toString()}
            icon={Coins}
          />
          <ImpactCard
            title="CO2 Offset"
            value={`${impactData.co2Offset} kg`}
            icon={Leaf}
          />
        </div>
      </section>

      <section
        className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/50 to-lime-50/60 py-10 shadow-[0_20px_60px_-35px_rgba(5,150,105,0.45)] sm:py-12"
        aria-labelledby="sponsors-title"
      >
        <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-0 h-64 w-64 rounded-full bg-lime-200/40 blur-3xl" />
        <div className="relative mb-8 px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">
            Community partners
          </p>
          <h2
            id="sponsors-title"
            className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            Supported by brands that reward positive action
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Our sponsors help turn verified environmental contributions into
            meaningful community rewards.
          </p>
        </div>

        <div className="sponsor-marquee-mask relative">
          <div className="sponsor-marquee-track flex w-max hover:[animation-play-state:paused]">
            {[0, 1].map((groupIndex) => (
              <div
                key={groupIndex}
                aria-hidden={groupIndex === 1}
                className="flex shrink-0 gap-4 pr-4 sm:gap-6 sm:pr-6"
              >
                {sponsors.map((sponsor) => (
                  <div
                    key={`${groupIndex}-${sponsor.name}`}
                    className="group flex h-28 w-44 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white bg-white/90 p-3 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)] ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(5,150,105,0.3)] sm:h-32 sm:w-52"
                  >
                    <Image
                      src={sponsor.logo}
                      alt={`${sponsor.name} sponsor logo`}
                      width={180}
                      height={110}
                      className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-7 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Growing a cleaner future together
          </span>
        </div>
      </section>
    </div>
  );
}

function ImpactCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  const formattedValue =
    typeof value === "number"
      ? value.toLocaleString("en-US", { maximumFractionDigits: 1 })
      : value;

  return (
    <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-md">
      <Icon className="h-10 w-10 text-green-500 mb-4" />
      <p className="text-3xl font-bold mb-2 text-gray-800">{formattedValue}</p>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col items-center text-center">
      <div className="bg-green-100 p-4 rounded-full mb-6">
        <Icon className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function OrganizationCard({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accent: "emerald" | "lime" | "teal";
}) {
  const accentStyles = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    lime: "bg-lime-50 text-lime-700 ring-lime-100",
    teal: "bg-teal-50 text-teal-700 ring-teal-100",
  };

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_14px_40px_-28px_rgba(15,23,42,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_-28px_rgba(15,23,42,0.45)]">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-green-100/50 blur-2xl transition group-hover:bg-green-200/60" />
      <div className={`relative mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-inset ${accentStyles[accent]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="relative text-lg font-semibold text-slate-900">{title}</h3>
      <p className="relative mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>
      <div className="relative mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-emerald-700">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Available for smart dispatch
      </div>
    </article>
  );
}
