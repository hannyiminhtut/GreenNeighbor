"use client";

import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import "leaflet/dist/leaflet.css";
import { Toaster } from "react-hot-toast";
import { getAllRewards, getUserByEmail } from "@/utils/db/actions";
import { calculateUserRewardScore } from "@/lib/reward-score";
import { LanguageProvider } from "@/components/LanguageProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const fetchTotalEarnings = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
          const user = await getUserByEmail(userEmail);
          console.log("user from layout", user);

          if (user) {
            const rewards = await getAllRewards();
            setTotalEarnings(calculateUserRewardScore(rewards, user.id));
          }
        }
      } catch (error) {
        console.error("Error fetching total earnings:", error);
      }
    };

    fetchTotalEarnings();
  }, []);

  return (
    <html lang="en">
      <body className={`${inter.className} overflow-x-hidden`}>
        <LanguageProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            totalEarnings={totalEarnings}
          />
          <div className="flex flex-1">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="ml-0 min-w-0 flex-1 p-2 transition-all duration-300 sm:p-4 lg:ml-64 lg:p-8">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
