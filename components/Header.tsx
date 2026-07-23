"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Coins,
  Search,
  Bell,
  User,
  ChevronDown,
  LogIn,
  Languages,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { toast } from "react-hot-toast";
import {
  createUser,
  getUnreadNotifications,
  markNotificationAsRead,
  getUserByEmail,
  getAllRewards,
} from "@/utils/db/actions";
import { calculateUserRewardScore } from "@/lib/reward-score";
import { useLanguage } from "@/components/LanguageProvider";

const clientId = process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID ?? "";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://ethereum-sepolia-rpc.publicnode.com",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://assets.web3auth.io/evm-chains/sepolia.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
});

interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings: number;
}

function normalizeBalance(value: unknown): number {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? Math.max(numericValue, 0) : 0;
}

type WasteNotification = Awaited<
  ReturnType<typeof getUnreadNotifications>
>[number];

export default function Header({ onMenuClick, totalEarnings }: HeaderProps) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<
    Awaited<ReturnType<typeof web3auth.getUserInfo>> | null
  >(null);
  const [notifications, setNotifications] = useState<WasteNotification[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [balance, setBalance] = useState<number>(() =>
    normalizeBalance(totalEarnings)
  );
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(
    () => setBalance(normalizeBalance(totalEarnings)),
    [totalEarnings]
  );

  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        if (web3auth.connected) {
          setLoggedIn(true);
          const user = await web3auth.getUserInfo();
          setUserInfo(user);
          if (user.email) {
            localStorage.setItem("userEmail", user.email);
            try {
              await createUser(user.email, user.name || "Anonymous User");
            } catch (error) {
              console.error("Error creating user:", error);
              // Handle the error appropriately, maybe show a message to the user
            }
          }
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
        toast.error(
          error instanceof Error
            ? `Web3Auth initialization failed: ${error.message}`
            : "Web3Auth initialization failed."
        );
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const unreadNotifications = await getUnreadNotifications(user.id);
          setNotifications(unreadNotifications);
        }
      }
    };

    fetchNotifications();

    const handleAccountDataUpdate = () => {
      void fetchNotifications();
    };
    window.addEventListener("accountDataUpdated", handleAccountDataUpdate);

    // Set up periodic checking for new notifications
    const notificationInterval = setInterval(fetchNotifications, 30000); // Check every 30 seconds

    return () => {
      clearInterval(notificationInterval);
      window.removeEventListener(
        "accountDataUpdated",
        handleAccountDataUpdate
      );
    };
  }, [userInfo]);

  useEffect(() => {
    const fetchUserBalance = async () => {
      const email = userInfo?.email || localStorage.getItem("userEmail");
      if (email) {
        const user = await getUserByEmail(email);
        if (user) {
          const rewards = await getAllRewards();
          setBalance(
            normalizeBalance(calculateUserRewardScore(rewards, user.id))
          );
        }
      }
    };

    fetchUserBalance();

    // Add an event listener for balance updates
    const handleBalanceUpdate = (event: CustomEvent<unknown>) => {
      setBalance(normalizeBalance(event.detail));
    };

    window.addEventListener(
      "balanceUpdated",
      handleBalanceUpdate as EventListener
    );
    window.addEventListener("accountDataUpdated", fetchUserBalance);

    return () => {
      window.removeEventListener(
        "balanceUpdated",
        handleBalanceUpdate as EventListener
      );
      window.removeEventListener("accountDataUpdated", fetchUserBalance);
    };
  }, [userInfo]);

  const login = async () => {
    setLoginLoading(true);
    try {
      await web3auth.connect();
      setLoggedIn(true);
      const user = await web3auth.getUserInfo();
      setUserInfo(user);

      console.log("user info from header", user);

      if (user.email) {
        localStorage.setItem("userEmail", user.email);
        
        try {
          await createUser(user.email, user.name || "Anonymous User");
        } catch (error) {
          console.error("Error creating user:", error);
          // Handle the error appropriately, maybe show a message to the user
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error(
        error instanceof Error
          ? `Login failed: ${error.message}`
          : "Login failed. Please try again."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    try {
      await web3auth.logout();
      setLoggedIn(false);
      setUserInfo(null);
      localStorage.removeItem("userEmail");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const getUserInfo = async () => {
    if (web3auth.connected) {
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      if (user.email) {
        localStorage.setItem("userEmail", user.email);
        try {
          await createUser(user.email, user.name || "Anonymous User");
        } catch (error) {
          console.error("Error creating user:", error);
          // Handle the error appropriately, maybe show a message to the user
        }
      }
    }
  };

  const handleNotificationClick = async (notificationId: number) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) => notification.id !== notificationId
      )
    );
  };

  if (loading) {
    return <div>Loading Web3Auth...</div>;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="flex min-h-16 items-center justify-between gap-1 px-2 py-2 sm:gap-2 sm:px-4">
        <div className="flex min-w-0 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-1 shrink-0 md:mr-3"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/" className="flex items-center">
            <Image
              src="/green-neighbor-logo.png"
              alt="GreenNeighbor logo"
              width={44}
              height={44}
              priority
              className="mr-2 h-9 w-9 rounded-lg object-cover md:h-11 md:w-11"
            />
            <div className="hidden min-w-0 flex-col sm:flex">
              <span className="font-bold text-base md:text-lg text-gray-800">
                GreenNeighbor
              </span>
              <span className="text-[8px] md:text-[10px] text-gray-500 -mt-1">
                {t("Smart Waste Management System")}
              </span>
            </div>
          </Link>
        </div>
        {!isMobile && (
          <div className="mx-3 hidden max-w-xl flex-1 md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        )}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Button
            type="button"
            variant="ghost"
            onClick={toggleLanguage}
            aria-label={
              language === "en" ? "Switch to Burmese" : "Switch to English"
            }
            className="h-9 rounded-full px-2 text-xs font-semibold text-emerald-700 sm:px-3"
          >
            <Languages className="mr-1 h-4 w-4" />
            {language === "en" ? "မြန်" : "EN"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{notification.type}</span>
                      <span className="text-sm text-gray-500">
                        {notification.message}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem>No new notifications</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex h-9 items-center rounded-full bg-gray-100 px-2 sm:px-3">
            <Coins className="h-4 w-4 md:h-5 md:w-5 mr-1 text-green-500" />
            <span className="font-semibold text-sm md:text-base text-gray-800">
              {balance.toFixed(2)}
            </span>
          </div>
          {!loggedIn ? (
            <Button
              onClick={login}
              disabled={loginLoading}
              className="h-9 w-9 bg-green-600 p-0 text-white hover:bg-green-700 sm:w-auto sm:px-4"
            >
              <span className="hidden sm:inline">
                {loginLoading ? t("Connecting...") : t("Login")}
              </span>
              <LogIn className="h-4 w-4 sm:ml-2" />
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center"
                >
                  <User className="h-5 w-5 mr-1" />
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={getUserInfo}>
                  {userInfo ? userInfo.name : "Fetch User Info"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
