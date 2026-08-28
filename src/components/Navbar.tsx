import React from "react";
import { Menu, Heart } from "lucide-react";
import { Language, UserProfile, AuthAccount } from "../types";
import { TRANSLATIONS } from "../data/initialData";

interface NavbarProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  isSimpleMode: boolean;
  onToggleSimpleMode: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onOpenEmergency: () => void;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onResetData: () => void;
  onOpenSidebar?: () => void;
  currentAccount?: AuthAccount | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  onOpenSidebar,
  onSelectTab,
}) => {
  const t = (key: string) =>
    TRANSLATIONS[key]?.[currentLanguage] || TRANSLATIONS[key]?.["en"] || key;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Sidebar Toggle + Brand */}
          <div className="flex items-center gap-3">
            {onOpenSidebar && (
              <button
                onClick={onOpenSidebar}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Toggle Sidebar Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div
              className="flex items-center space-x-2.5 cursor-pointer select-none"
              onClick={() => onSelectTab("home")}
            >
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-2xs">
                <Heart className="w-5 h-5 fill-white text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                  Sehat Saathi <span className="text-blue-600">AI</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
                  {t("tagline") || "Rural Health Navigator"}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Only Language Options */}
          <div className="flex items-center">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => onLanguageChange("te")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  currentLanguage === "te"
                    ? "bg-white text-blue-600 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="తెలుగు"
              >
                తెలుగు
              </button>
              <button
                onClick={() => onLanguageChange("hi")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  currentLanguage === "hi"
                    ? "bg-white text-blue-600 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="हिन्दी"
              >
                हिन्दी
              </button>
              <button
                onClick={() => onLanguageChange("en")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  currentLanguage === "en"
                    ? "bg-white text-blue-600 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="English"
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
