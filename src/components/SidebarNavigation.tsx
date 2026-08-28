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
  Video,
  FileText,
  Clock,
  BedDouble,
  Ambulance,
  Building2,
  Activity,
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
  | "caregivers"
  | "doctor-queue"
  | "doctor-rx"
  | "doctor-history"
  | "hospital-beds"
  | "hospital-triage"
  | "hospital-pharmacy"
  | "hospital-staff";

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
  const userRole = currentAccount?.role || "user";

  // Build role-isolated navigation groups
  const getNavGroups = () => {
    if (userRole === "doctor") {
      return [
        {
          title:
            language === "te"
              ? "క్లినికల్ వర్క్‌స్పేస్"
              : language === "hi"
              ? "क्लीनिकल कार्यक्षेत्र"
              : "Doctor Clinical Workspace",
          items: [
            {
              id: "doctor-queue" as NavTabId,
              icon: Video,
              label:
                language === "te"
                  ? "OPD & టెలికన్సల్ట్ క్యూ"
                  : language === "hi"
                  ? "ओपीडी व वीडियो कंसल्ट"
                  : "OPD & Video Consult Queue",
            },
            {
              id: "doctor-rx" as NavTabId,
              icon: FileText,
              label:
                language === "te"
                  ? "డిజిటల్ ప్రిస్క్రిప్షన్ (Rx)"
                  : language === "hi"
                  ? "डिजिटल पर्चा (Rx)"
                  : "Digital Rx Writer",
            },
            {
              id: "doctor-history" as NavTabId,
              icon: Clock,
              label:
                language === "te"
                  ? "పూర్వ సంప్రదింపు రికార్డులు"
                  : language === "hi"
                  ? "मरीज परामर्श इतिहास"
                  : "Consultation History",
            },
          ],
        },
      ];
    }

    if (userRole === "hospital") {
      return [
        {
          title:
            language === "te"
              ? "ఆసుపత్రి కార్యకలాపాలు"
              : language === "hi"
              ? "अस्पताल प्रबंधन"
              : "Hospital Operations Hub",
          items: [
            {
              id: "hospital-beds" as NavTabId,
              icon: BedDouble,
              label:
                language === "te"
                  ? "బెడ్ & ICU నిర్వహణ"
                  : language === "hi"
                  ? "बेड व आईसीयू उपलब्धता"
                  : "Live Bed & ICU Tracker",
            },
            {
              id: "hospital-triage" as NavTabId,
              icon: Ambulance,
              label:
                language === "te"
                  ? "108 అంబులెన్స్ ఫ్లీట్"
                  : language === "hi"
                  ? "108 एम्बुलेंस नियंत्रण"
                  : "108 Ambulance Dispatch",
            },
            {
              id: "hospital-pharmacy" as NavTabId,
              icon: Pill,
              label:
                language === "te"
                  ? "జన్ ఔషధి ఔషధ నిల్వలు"
                  : language === "hi"
                  ? "जन औषधि दवा स्टॉक"
                  : "Jan Aushadhi Stock",
            },
            {
              id: "hospital-staff" as NavTabId,
              icon: Stethoscope,
              label:
                language === "te"
                  ? "డ్యూటీ వైద్యుల రోస్టర్"
                  : language === "hi"
                  ? "ड्यूटी डॉक्टर रोस्टर"
                  : "Specialist Duty Roster",
            },
          ],
        },
      ];
    }

    // Default: Patient Navigation
    return [
      {
        title:
          language === "te"
            ? "ప్రధాన సేవలు"
            : language === "hi"
            ? "मुख्य सेवाएं"
            : "Core Health",
        items: [
          {
            id: "home" as NavTabId,
            icon: Home,
            label: language === "te" ? "హోమ్" : language === "hi" ? "होम" : "Home Overview",
          },
          {
            id: "assistant" as NavTabId,
            icon: MessageSquare,
            label:
              language === "te"
                ? "సాథీ వాయిస్ AI"
                : language === "hi"
                ? "साथी वॉयस AI"
                : "Ask Saathi AI",
          },
          {
            id: "healthcare" as NavTabId,
            icon: MapPin,
            label:
              language === "te"
                ? "ఆసుపత్రులు & మ్యాప్"
                : language === "hi"
                ? "अस्पताल व मैप"
                : "Find Facilities",
          },
          {
            id: "doctors" as NavTabId,
            icon: Stethoscope,
            label:
              language === "te"
                ? "వైద్యుల సంప్రదింపు"
                : language === "hi"
                ? "डॉक्टर परामर्श"
                : "Consult Doctors",
          },
          {
            id: "medicines" as NavTabId,
            icon: Pill,
            label:
              language === "te"
                ? "మందుల రిమైండర్"
                : language === "hi"
                ? "दवा रिमाइंडर"
                : "Medication Tracker",
          },
          {
            id: "appointments" as NavTabId,
            icon: Calendar,
            label:
              language === "te"
                ? "అపాయింట్‌మెంట్లు"
                : language === "hi"
                ? "अपॉइंटमेंट्स"
                : "Appointments",
          },
        ],
      },
      {
        title:
          language === "te"
            ? "ఆరోగ్య రికార్డులు"
            : language === "hi"
            ? "हेल्थ रिकॉर्ड्स"
            : "Health Records",
        items: [
          {
            id: "records" as NavTabId,
            icon: FolderLock,
            label:
              language === "te"
                ? "వైద్య పత్రాలు"
                : language === "hi"
                ? "मेडिकल रिपोर्ट्स"
                : "Health Locker",
          },
        ],
      },
      {
        title:
          language === "te"
            ? "కుటుంబ సంరక్షణ"
            : language === "hi"
            ? "परिवार देखभाल"
            : "Family Care",
        items: [
          {
            id: "caregivers" as NavTabId,
            icon: Users,
            label:
              language === "te"
                ? "కుటుంబ సంరక్షకులు"
                : language === "hi"
                ? "परिवार केयरगिवर"
                : "Care Circle",
          },
        ],
      },
    ];
  };

  const navGroups = getNavGroups();

  const handleSelect = (tab: NavTabId | string) => {
    onSelectTab(tab);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const getDefaultRoleTab = () => {
    if (userRole === "doctor") return "doctor-queue";
    if (userRole === "hospital") return "hospital-beds";
    return "home";
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
            onClick={() => handleSelect(getDefaultRoleTab())}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-base shadow-xs shrink-0 ${
                userRole === "doctor"
                  ? "bg-emerald-600 text-white"
                  : userRole === "hospital"
                  ? "bg-purple-600 text-white"
                  : "bg-blue-600 text-white"
              }`}
            >
              {userRole === "doctor" ? (
                <Stethoscope className="w-4 h-4 text-white" />
              ) : userRole === "hospital" ? (
                <Building2 className="w-4 h-4 text-white" />
              ) : (
                <Heart className="w-4 h-4 fill-white text-white" />
              )}
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-bold text-slate-900 text-sm leading-tight block">
                  Sehat Saathi <span className={userRole === "doctor" ? "text-emerald-600" : userRole === "hospital" ? "text-purple-600" : "text-blue-600"}>AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium block capitalize">
                  {userRole === "doctor"
                    ? "Doctor OPD"
                    : userRole === "hospital"
                    ? "Hospital Ops"
                    : "Patient Care"}
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
                const activeColorClass =
                  userRole === "doctor"
                    ? "bg-emerald-50 text-emerald-700 font-bold"
                    : userRole === "hospital"
                    ? "bg-purple-50 text-purple-700 font-bold"
                    : "bg-blue-50 text-blue-600 font-bold";

                const activeIconClass =
                  userRole === "doctor"
                    ? "text-emerald-600"
                    : userRole === "hospital"
                    ? "text-purple-600"
                    : "text-blue-600";

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    title={item.label}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? activeColorClass
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <ItemIcon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? activeIconClass : "text-slate-400"
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
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  userRole === "doctor"
                    ? "bg-emerald-100 text-emerald-700"
                    : userRole === "hospital"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {userRole === "doctor" ? (
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                ) : userRole === "hospital" ? (
                  <Building2 className="w-4 h-4 text-purple-600" />
                ) : (
                  <User className="w-4 h-4 text-blue-600" />
                )}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {currentAccount?.name || (userRole === "doctor" ? "Dr. Srinivas Rao" : userRole === "hospital" ? "Hospital Admin" : "Lakshmi Devi")}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate capitalize">
                    {userRole === "doctor" ? "Doctor" : userRole === "hospital" ? "Hospital Admin" : "Patient"}
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
