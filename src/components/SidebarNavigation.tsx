import React, { useState } from "react";
import {
  Home,
  MessageSquare,
  MapPin,
  Stethoscope,
  Pill,
  Calendar,
  FolderLock,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Heart,
  User,
} from "lucide-react";
import { AuthAccount, Language } from "../types";

export type NavTabId =
  | "home"
  | "assistant"
  | "healthcare"
  | "doctors"
  | "medicines"
  | "appointments"
  | "records"
  | "caregivers";

interface SidebarNavigationProps {
  activeTab: NavTabId | string;
  onSelectTab: (tab: any) => void;
  currentAccount: AuthAccount | null;
  onOpenAuthModal: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isSimpleMode: boolean;
  onToggleSimpleMode: () => void;
  isOnline: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeTab,
  onSelectTab,
  currentAccount,
  language,
  isMobileOpen,
  onCloseMobile,
  onOpenProfile,
  onLogout,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navGroups = [
    {
      title: language === "te" ? "ప్రధాన సేవలు" : language === "hi" ? "मुख्य सेवाएं" : "Core Health",
      items: [
        {
          id: "home" as NavTabId,
          icon: Home,
          label: language === "te" ? "హోమ్" : language === "hi" ? "होम" : "Home Overview",
        },
        {
          id: "assistant" as NavTabId,
          icon: MessageSquare,
          label: language === "te" ? "సాథీ వాయిస్ AI" : language === "hi" ? "साथी वॉयस AI" : "Ask Saathi AI",
        },
        {
          id: "healthcare" as NavTabId,
          icon: MapPin,
          label: language === "te" ? "ఆసుపత్రులు & మ్యాప్" : language === "hi" ? "अस्पताल व मैप" : "Find Facilities",
        },
        {
          id: "doctors" as NavTabId,
          icon: Stethoscope,
          label: language === "te" ? "వైద్యుల సంప్రదింపు" : language === "hi" ? "डॉक्टर परामर्श" : "Consult Doctors",
        },
        {
          id: "medicines" as NavTabId,
          icon: Pill,
          label: language === "te" ? "మందుల రిమైండర్" : language === "hi" ? "दवा रिमाइंडर" : "Medication Tracker",
        },
        {
          id: "appointments" as NavTabId,
          icon: Calendar,
          label: language === "te" ? "అపాయింట్‌మెంట్లు" : language === "hi" ? "अपॉइंटमेंट्स" : "Appointments",
        },
      ],
    },
    {
      title: language === "te" ? "ఆరోగ్య రికార్డులు" : language === "hi" ? "हेल्थ रिकॉर्ड्स" : "Health Records",
      items: [
        {
          id: "records" as NavTabId,
          icon: FolderLock,
          label: language === "te" ? "వైద్య పత్రాలు" : language === "hi" ? "मेडिकल रिपोर्ट्स" : "Health Locker",
        },
      ],
    },
    {
      title: language === "te" ? "కుటుంబ సంరక్షణ" : language === "hi" ? "परिवार देखभाल" : "Family Care",
      items: [
        {
          id: "caregivers" as NavTabId,
          icon: Users,
          label: language === "te" ? "కుటుంబ సంరక్షకులు" : language === "hi" ? "परिवार केयरगिवर" : "Care Circle",
        },
      ],
    },
  ];

  const handleSelect = (tab: NavTabId | string) => {
    onSelectTab(tab);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Clean Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-white border-r border-slate-200/90 flex flex-col justify-between transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        } ${
          isMobileOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div
            onClick={() => handleSelect("home")}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              <Heart className="w-4 h-4 fill-white text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-bold text-slate-900 text-sm leading-tight block">
                  Sehat Saathi <span className="text-blue-600">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  Rural Health
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              {!isCollapsed && (
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const ItemIcon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    title={item.label}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <ItemIcon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-blue-600" : "text-slate-400"
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Clean Footer Account Area */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between gap-2">
            <div
              onClick={onOpenProfile}
              className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {currentAccount?.name || "Lakshmi Devi"}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate capitalize">
                    {currentAccount?.role || "Patient"}
                  </div>
                </div>
              )}
            </div>

            {onLogout && !isCollapsed && (
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
