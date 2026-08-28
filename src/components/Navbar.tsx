import React, { useState } from "react";
import {
  ShieldAlert,
  Wifi,
  WifiOff,
  Globe,
  Bell,
  User,
  Sparkles,
  Volume2,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Language, UserProfile, NotificationItem } from "../types";
import { TRANSLATIONS } from "../data/initialData";
import { StorageManager } from "../utils/storage";

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
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  isSimpleMode,
  onToggleSimpleMode,
  isOffline,
  onToggleOffline,
  onOpenEmergency,
  userProfile,
  onOpenProfile,
  unreadNotificationsCount,
  activeTab,
  onSelectTab,
  onResetData,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  const t = (key: string) => TRANSLATIONS[key]?.[currentLanguage] || TRANSLATIONS[key]?.["en"] || key;

  const handleManualSync = () => {
    StorageManager.touchSync();
    setShowSyncSuccess(true);
    setTimeout(() => setShowSyncSuccess(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Urgent Emergency Alert Bar */}
      <div className="bg-red-600 text-white px-3 py-1.5 sm:px-6 flex items-center justify-between text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <span className="font-bold tracking-wide flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t("emergency")}:
          </span>
          <span className="hidden sm:inline text-red-100">{t("emergencySubtitle")}</span>
          <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full text-white text-[11px]">
            Dial 108 / 112
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="emergency-top-banner-btn"
            onClick={onOpenEmergency}
            className="bg-white text-red-600 hover:bg-red-50 px-3 py-1 rounded-full font-bold text-xs sm:text-sm shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>{t("emergency")} HUB</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => onSelectTab("home")}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-none">
                Sehat Saathi <span className="text-blue-600">AI</span>
              </h1>
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mt-0.5">
                {t("tagline") || "Your Healthcare Companion"}
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-semibold">
            <button
              onClick={() => onSelectTab("home")}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === "home"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-medium"
              }`}
            >
              {t("navHome")}
            </button>
            <button
              onClick={() => onSelectTab("assistant")}
              className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === "assistant"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-medium"
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              {t("navAssistant")}
            </button>
            <button
              onClick={() => onSelectTab("healthcare")}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === "healthcare"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-medium"
              }`}
            >
              {t("navHealthcare")}
            </button>
            <button
              onClick={() => onSelectTab("medicines")}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === "medicines"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-medium"
              }`}
            >
              Medicines
            </button>
            <button
              onClick={() => onSelectTab("appointments")}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === "appointments"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-medium"
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => onSelectTab("passport")}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === "passport"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-medium"
              }`}
            >
              Passport & QR
            </button>
            <button
              onClick={() => onSelectTab("more")}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === "more"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-medium"
              }`}
            >
              More Tools
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-3">
            {/* Simple / Low-Literacy Mode Toggle */}
            <button
              id="toggle-simple-mode-btn"
              onClick={onToggleSimpleMode}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                isSimpleMode
                  ? "bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
              }`}
              title="Toggle Large Icon Simple Mode for Elderly & Low-Literacy users"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("simpleMode")}</span>
              <span className="sm:hidden">Simple</span>
            </button>

            {/* Online / Offline Simulator Toggle */}
            <button
              id="toggle-offline-btn"
              onClick={onToggleOffline}
              className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
              title={isOffline ? "App running locally from offline cache" : "App connected to cloud AI & live sync"}
            >
              <span className={`w-2 h-2 rounded-full ${isOffline ? "bg-amber-500" : "bg-green-500"}`}></span>
              <span className="text-xs font-semibold text-slate-600">
                {isOffline ? "OFFLINE" : "ONLINE"}
              </span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                id="language-select-btn"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center space-x-2 text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-600" />
                <span className="uppercase">{currentLanguage}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Language
                  </div>
                  <button
                    onClick={() => {
                      onLanguageChange("te");
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between hover:bg-blue-50 ${
                      currentLanguage === "te" ? "font-bold text-blue-600 bg-blue-50/60" : "text-slate-700"
                    }`}
                  >
                    <span>తెలుగు (Telugu)</span>
                    {currentLanguage === "te" && <CheckCircle className="w-4 h-4 text-blue-600" />}
                  </button>
                  <button
                    onClick={() => {
                      onLanguageChange("hi");
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between hover:bg-blue-50 ${
                      currentLanguage === "hi" ? "font-bold text-blue-600 bg-blue-50/60" : "text-slate-700"
                    }`}
                  >
                    <span>हिन्दी (Hindi)</span>
                    {currentLanguage === "hi" && <CheckCircle className="w-4 h-4 text-blue-600" />}
                  </button>
                  <button
                    onClick={() => {
                      onLanguageChange("en");
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between hover:bg-blue-50 ${
                      currentLanguage === "en" ? "font-bold text-blue-600 bg-blue-50/60" : "text-slate-700"
                    }`}
                  >
                    <span>English</span>
                    {currentLanguage === "en" && <CheckCircle className="w-4 h-4 text-blue-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Profile Avatar Button */}
            <button
              id="navbar-profile-btn"
              onClick={onOpenProfile}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              title="User Health Profile & Care Circle"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                {userProfile.name.charAt(0)}
              </div>
              <span className="hidden sm:inline font-bold text-slate-800">{userProfile.name.split(" ")[0]}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
