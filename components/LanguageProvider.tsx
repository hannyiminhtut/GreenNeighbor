"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Language = "en" | "my";

const translations: Record<string, string> = {
  "Smart Waste Management System": "စမတ်အမှိုက်စီမံခန့်ခွဲမှုစနစ်",
  Home: "ပင်မစာမျက်နှာ",
  "Report Waste": "အမှိုက်သတင်းပို့ရန်",
  "Collect Waste": "အမှိုက်စုဆောင်းရန်",
  Rewards: "ဆုလက်ဆောင်များ",
  Leaderboard: "အဆင့်စာရင်း",
  "Top Performers": "ထိပ်တန်းပါဝင်သူများ",
  Level: "အဆင့်",
  Reports: "အစီရင်ခံစာများ",
  Settings: "ဆက်တင်များ",
  Login: "အကောင့်ဝင်ရန်",
  "Connecting...": "ချိတ်ဆက်နေသည်...",
  "Sign Out": "အကောင့်ထွက်ရန်",
  Profile: "ကိုယ်ရေးအချက်အလက်",
  "No new notifications": "အသိပေးချက်အသစ်မရှိပါ",
  Search: "ရှာဖွေရန်",
  "Search...": "ရှာဖွေရန်...",
  "Get Started": "စတင်အသုံးပြုရန်",
  "Join our community in making waste management more efficient and rewarding!":
    "အမှိုက်စီမံခန့်ခွဲမှုကို ပိုမိုထိရောက်ပြီး အကျိုးရှိစေရန် ကျွန်ုပ်တို့နှင့် ပူးပေါင်းပါ။",
  "Eco-Friendly": "ပတ်ဝန်းကျင်နှင့်သဟဇာတ",
  "Earn Rewards": "ဆုများရယူပါ",
  "Community-Driven": "လူထုဦးဆောင်မှု",
  "Our Impact": "ကျွန်ုပ်တို့၏ အကျိုးသက်ရောက်မှု",
  "Community partners": "လူထုမိတ်ဖက်များ",
  "Supported by brands that reward positive action":
    "ကောင်းမွန်သောလုပ်ဆောင်မှုများကို ဆုပေးသည့် အမှတ်တံဆိပ်များ၏ ပံ့ပိုးမှု",
  "Growing a cleaner future together":
    "ပိုမိုသန့်ရှင်းသော အနာဂတ်ကို အတူတည်ဆောက်ကြမည်",
  "Waste Collected": "စုဆောင်းပြီးအမှိုက်",
  "Reports Submitted": "တင်သွင်းပြီးအစီရင်ခံစာ",
  "Tokens Earned": "ရရှိပြီးတိုကင်များ",
  "CO2 Offset": "CO₂ လျှော့ချမှု",
  "Assigned organizations": "တာဝန်ပေးအဖွဲ့အစည်းများ",
  "Teams ready to make an impact": "သန့်ရှင်းရေးအတွက် အဆင်သင့်အဖွဲ့များ",
  "Available for smart dispatch": "စမတ်တာဝန်ပေးမှုအတွက် အဆင်သင့်",
  "Community action": "လူထုလှုပ်ရှားမှု",
  "Spot waste. Report it.": "အမှိုက်တွေ့ပါက သတင်းပို့ပါ။",
  "Make your city cleaner.": "သင့်မြို့ကို ပိုမိုသန့်ရှင်းစေပါ။",
  "Add a clear photo": "ရှင်းလင်းသောဓာတ်ပုံ ထည့်ပါ",
  "Keep the waste visible and well lit.": "အမှိုက်ကို ထင်ရှားပြီး အလင်းရောင်ကောင်းစွာ ရိုက်ပါ။",
  "Choose a photo": "ဓာတ်ပုံရွေးပါ",
  "or drag and drop": "သို့မဟုတ် ဆွဲထည့်ပါ",
  "Verify with AI": "AI ဖြင့် စစ်ဆေးရန်",
  "Analysing photo...": "ဓာတ်ပုံစစ်ဆေးနေသည်...",
  "Verification Successful": "စစ်ဆေးမှုအောင်မြင်သည်",
  "Waste successfully identified": "အမှိုက်ကို အောင်မြင်စွာခွဲခြားပြီးပါပြီ",
  "Pin the location": "နေရာသတ်မှတ်ပါ",
  "Search an address or place the marker precisely.": "လိပ်စာရှာပါ သို့မဟုတ် marker ကို တိကျစွာထားပါ။",
  "Waste Type": "အမှိုက်အမျိုးအစား",
  "Waste type": "အမှိုက်အမျိုးအစား",
  "Estimated Amount": "ခန့်မှန်းပမာဏ",
  "Awaiting verification": "စစ်ဆေးမှုစောင့်နေသည်",
  "Submit report": "အစီရင်ခံစာတင်ရန်",
  "Submitting...": "တင်သွင်းနေသည်...",
  "Recent reports": "လတ်တလောအစီရင်ခံစာများ",
  "Recent Reports": "လတ်တလောအစီရင်ခံစာများ",
  "Community activity": "လူထုလှုပ်ရှားမှု",
  "Live updates": "တိုက်ရိုက်အပ်ဒိတ်",
  Location: "နေရာ",
  Type: "အမျိုးအစား",
  Amount: "ပမာဏ",
  "Reported at (MMT)": "သတင်းပို့ချိန် (MMT)",
  "No reports yet": "အစီရင်ခံစာမရှိသေးပါ",
  "Waste Collection Tasks": "အမှိုက်စုဆောင်းရေးတာဝန်များ",
  "Reported Locations": "သတင်းပို့ထားသောနေရာများ",
  Pending: "စောင့်ဆိုင်းနေသည်",
  "In progress": "လုပ်ဆောင်နေသည်",
  Completed: "ပြီးစီးသည်",
  Verified: "အတည်ပြုပြီး",
  "Collection queue": "စုဆောင်းရေးအစီအစဉ်",
  "Start Collection": "စတင်စုဆောင်းရန်",
  "View AI Match": "AI အကြံပြုချက်ကြည့်ရန်",
  "Hide AI Match": "AI အကြံပြုချက်ပိတ်ရန်",
  "Complete & Verify": "ပြီးစီး၍ စစ်ဆေးရန်",
  "Reminder: upload a clear after-cleanup photo.":
    "သတိပေးချက် — ရှင်းလင်းပြီးနောက် ဓာတ်ပုံကို ထင်ရှားစွာတင်ပါ။",
  "Reward Earned": "ဆုအမှတ်ရရှိသည်",
  "Verify Collection": "စုဆောင်းမှုစစ်ဆေးရန်",
  "Same Place:": "တူညီသောနေရာ:",
  "Waste Removed:": "အမှိုက်ဖယ်ရှားပြီး:",
  "Verifying...": "စစ်ဆေးနေသည်...",
  Close: "ပိတ်ရန်",
  Previous: "ရှေ့သို့",
  Next: "နောက်သို့",
  "Reward Balance": "ဆုအမှတ်လက်ကျန်",
  "Available Points": "အသုံးပြုနိုင်သောအမှတ်",
  "Recent Transactions": "လတ်တလောငွေစာရင်း",
  "Available Rewards": "ရနိုင်သောဆုများ",
  "Your Points": "သင့်အမှတ်များ",
  "Redeem All Points": "အမှတ်အားလုံးဖြင့် ဆုယူရန်",
  "Redeem Reward": "ဆုရယူရန်",
  "No transactions yet": "ငွေစာရင်းမရှိသေးပါ",
  "No rewards available at the moment.": "လောလောဆယ် ရနိုင်သောဆုမရှိပါ။",
  Rank: "အဆင့်",
  User: "အသုံးပြုသူ",
  Points: "အမှတ်များ",
  "Download Reports": "အစီရင်ခံစာဒေါင်းလုဒ်",
  "User Activity Reports": "အသုံးပြုသူလှုပ်ရှားမှုအစီရင်ခံစာ",
  "Waste Collection Reports": "အမှိုက်စုဆောင်းမှုအစီရင်ခံစာ",
  Download: "ဒေါင်းလုဒ်",
  "Loading map...": "မြေပုံဖွင့်နေသည်...",
  "Go to my location": "လက်ရှိနေရာသို့သွားရန်",
  "Use selected point": "ရွေးထားသောနေရာကိုသုံးရန်",
  "Search city, street or address": "မြို့၊ လမ်း သို့မဟုတ် လိပ်စာရှာရန်",
  "Search recent reports by area...": "ဧရိယာအလိုက် လတ်တလောအစီရင်ခံစာရှာရန်...",
};
const reverseTranslations = Object.fromEntries(
  Object.entries(translations).map(([english, burmese]) => [burmese, english])
);

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (text: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const storedLanguage = localStorage.getItem("greenNeighborLanguage");
    if (storedLanguage === "my") setLanguageState("my");
  }, []);

  useEffect(() => {
    const translateValue = (value: string) => {
      const trimmed = value.trim();
      const translated =
        language === "my"
          ? translations[trimmed]
          : reverseTranslations[trimmed];
      return translated
        ? value.replace(trimmed, translated)
        : value;
    };

    const translateNode = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE && root.nodeValue) {
        const translated = translateValue(root.nodeValue);
        if (translated !== root.nodeValue) root.nodeValue = translated;
        return;
      }

      if (!(root instanceof Element)) return;
      if (root.matches("script, style, code, pre, [data-no-translate]")) return;

      for (const attribute of ["placeholder", "title", "aria-label"]) {
        const value = root.getAttribute(attribute);
        if (value) {
          const translated = translateValue(value);
          if (translated !== value) root.setAttribute(attribute, translated);
        }
      }

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let textNode = walker.nextNode();
      while (textNode) {
        const parent = textNode.parentElement;
        if (
          parent &&
          !parent.closest("script, style, code, pre, [data-no-translate]") &&
          textNode.nodeValue
        ) {
          const translated = translateValue(textNode.nodeValue);
          if (translated !== textNode.nodeValue) {
            textNode.nodeValue = translated;
          }
        }
        textNode = walker.nextNode();
      }
    };

    translateNode(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(translateNode);
        if (mutation.type === "characterData") translateNode(mutation.target);
      }
    });
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    localStorage.setItem("greenNeighborLanguage", nextLanguage);
    document.documentElement.lang = nextLanguage === "my" ? "my" : "en";
  }, []);

  const toggleLanguage = useCallback(
    () => setLanguage(language === "en" ? "my" : "en"),
    [language, setLanguage]
  );

  const t = useCallback(
    (text: string) =>
      language === "my" ? translations[text.trim()] ?? text : text,
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider.");
  }
  return context;
}
