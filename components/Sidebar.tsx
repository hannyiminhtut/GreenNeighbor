import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Trash,
  Coins,
  Medal,
  Home,
  Download,
} from "lucide-react";
import { getUserByEmail } from "@/utils/db/actions";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

const sidebarItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/report", icon: MapPin, label: "Report Waste" },
  { href: "/collect", icon: Trash, label: "Collect Waste" },
  { href: "/rewards", icon: Coins, label: "Rewards" },
  { href: "/leaderboard", icon: Medal, label: "Leaderboard" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const pathname = usePathname();
  interface User {
    id: number;
    name: string;
    role: string;
    email: string;
    createdAt: Date;
  }
  
  const [user, setUser] = useState<User | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
          const user = await getUserByEmail(userEmail);
          console.log("user from layout", user);
          setUser(user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    getUserRole();
  }, []);

  if (user?.role === "staff" && !sidebarItems.some(item => item.href === "/download")) {
    sidebarItems.push({ href: "/download", icon: Download, label: "Reports" });
  }


  return (
    <>
    {open && (
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="fixed inset-0 z-20 bg-slate-950/35 backdrop-blur-[1px] lg:hidden"
      />
    )}
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-gray-200 bg-white pt-16 text-gray-800 shadow-xl transition-transform duration-300 ease-in-out lg:pt-20 lg:shadow-none ${
        open ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <nav className="h-full flex flex-col">
        <div className="px-4 py-6 space-y-8">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href} passHref onClick={onClose}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={`w-full justify-start py-3 ${
                  pathname === item.href
                    ? "bg-green-100 text-green-800"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span className="text-base">{t(item.label)}</span>
              </Button>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
    </>
  );
}
