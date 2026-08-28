import React from "react";
import { Sparkles, Play, ShieldAlert, WifiOff, QrCode, FileText, Pill, Calendar, MapPin, Mic } from "lucide-react";
import { Language } from "../types";

interface HackathonDemoBarProps {
  onRunScenario: (scenarioId: string) => void;
  currentLanguage: Language;
}

export const HackathonDemoBar: React.FC<HackathonDemoBarProps> = ({
  onRunScenario,
}) => {
  const scenarios = [
    {
      id: "telugu_voice",
      title: "1. Telugu Voice Health Query",
      icon: "🎙️",
      desc: "Tests Voice-first multilingual conversational AI in Telugu",
    },
    {
      id: "emergency_redflag",
      title: "2. Red Flag Chest Pain Alert",
      icon: "🚨",
      desc: "Triggers deterministic emergency bypass & 108 helpline",
    },
    {
      id: "offline_toggle",
      title: "3. Offline-First Resilience",
      icon: "📶",
      desc: "Simulates zero-connectivity local cached operations",
    },
    {
      id: "care_bundle",
      title: "4. Visit Care Bundle Checklist",
      icon: "📅",
      desc: "Auto-generates preparation checklist for doctor consultation",
    },
    {
      id: "passport_qr",
      title: "5. Digital Health Passport & QR",
      icon: "🪪",
      desc: "Generates offline consent-controlled token for physicians",
    },
    {
      id: "missed_medicine",
      title: "6. Missed Dose Caregiver Alert",
      icon: "💊",
      desc: "Dispatches SMS notification to Son & ASHA worker",
    },
    {
      id: "doc_extraction",
      title: "7. Prescription OCR Extraction",
      icon: "📄",
      desc: "Extracts clinical fields via server Gemini engine",
    },
    {
      id: "resource_locator",
      title: "8. Smart PHC / Jan Aushadhi Locator",
      icon: "🏥",
      desc: "Ranks nearest rural clinics & 24x7 generic medicine stores",
    },
    {
      id: "doctor_handoff",
      title: "9. Doctor Clinical Summary Handoff",
      icon: "👨‍⚕️",
      desc: "Prepares structured handover sheet for physician",
    },
    {
      id: "community_map",
      title: "10. Rural Mandal Health Equity Map",
      icon: "🗺️",
      desc: "Visualizes regional ambulance ETAs & access tiers",
    },
  ];

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 px-3 py-2 sm:px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto text-xs pb-1">
        <div className="flex items-center gap-2 shrink-0 font-bold text-blue-400">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="uppercase tracking-wider text-[11px]">Judge Demo Scenarios:</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onRunScenario(sc.id)}
              className="bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-xl border border-slate-700 hover:border-blue-500 whitespace-nowrap font-medium text-[11px] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
              title={sc.desc}
            >
              <span>{sc.icon}</span>
              <span>{sc.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
