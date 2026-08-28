import React from "react";
import {
  Gauge,
  MapPin,
  Heart,
  PhoneCall,
  Clock,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Pill,
  Wifi,
} from "lucide-react";
import { Language, HealthAccessScoreData } from "../types";

interface HealthAccessScoreProps {
  scoreData: HealthAccessScoreData;
  language: Language;
}

export const HealthAccessScore: React.FC<HealthAccessScoreProps> = ({
  scoreData,
  language,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 border-emerald-500 bg-emerald-50";
    if (score >= 60) return "text-teal-700 border-teal-500 bg-teal-50";
    if (score >= 40) return "text-amber-700 border-amber-500 bg-amber-50";
    return "text-rose-700 border-rose-500 bg-rose-50";
  };

  const categories = [
    {
      name: "Healthcare Proximity",
      score: scoreData.breakdown.proximityScore,
      icon: MapPin,
      desc: "Travel time & road connectivity to nearest PHC",
    },
    {
      name: "24x7 Emergency Access",
      score: scoreData.breakdown.emergencyScore,
      icon: PhoneCall,
      desc: "Ambulance response times & ICU trauma availability",
    },
    {
      name: "Generic Pharmacy Access",
      score: scoreData.breakdown.pharmacyScore,
      icon: Pill,
      desc: "Availability of Jan Aushadhi generic medicines",
    },
    {
      name: "Doctor & Specialist Availability",
      score: scoreData.breakdown.doctorAvailabilityScore,
      icon: Heart,
      desc: "Regular duty medical officers & weekly specialist clinics",
    },
    {
      name: "Telehealth Connectivity",
      score: scoreData.breakdown.connectivityScore,
      icon: Wifi,
      desc: "4G/Offline sync reliability for digital consultations",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Mandal Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {language === "te"
              ? "గ్రామీణ ఆరోగ్య ప్రాప్యత స్కోరు"
              : language === "hi"
              ? "ग्रामीण स्वास्थ्य पहुँच स्कोर"
              : "Rural Health Access Score"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mt-1">
            {language === "te"
              ? "మీ ప్రాంతంలో ఆసుపత్రులు, అంబులెన్స్ మరియు మందుల లభ్యత ఆధారంగా పారదర్శక ఆరోగ్య సూచిక."
              : language === "hi"
              ? "आपके क्षेत्र में स्वास्थ्य केंद्रों और एम्बुलेंस सुविधा का निष्पक्ष आकलन।"
              : "A multi-dimensional equity index measuring geographic, emergency, and medicinal access in rural mandals."}
          </p>
        </div>
      </div>

      {/* Main Score Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Radial Circular Score Badge */}
          <div
            className={`w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center font-bold ${getScoreColor(
              scoreData.overallScore
            )} shrink-0 shadow-sm`}
          >
            <span className="text-4xl sm:text-5xl tracking-tighter">{scoreData.overallScore}</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              / 100
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-0.5 rounded-full border border-blue-200 uppercase">
                {scoreData.region}
              </span>
              <span className="text-xs text-slate-400 font-medium">Updated this week</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Moderate Health Access Tier
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg leading-relaxed">
              Your mandal has strong Primary Health Centre coverage and generic pharmacies, but emergency ambulance transit times can be optimized with advance planning.
            </p>
          </div>
        </div>

        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 w-full md:w-72 space-y-2.5 text-xs">
          <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
            Key Takeaways:
          </span>
          <div className="text-slate-600 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>PHC is within 3.2 km (8 mins)</span>
          </div>
          <div className="text-slate-600 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Jan Aushadhi store accessible</span>
          </div>
          <div className="text-amber-800 flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Trauma ICU is 14.8 km away</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Bars */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Access Score Dimension Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span>{cat.name}</span>
                  </div>
                  <span className="font-bold text-blue-700 text-sm">{cat.score}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${cat.score}%` }}
                  ></div>
                </div>

                <p className="text-[11px] text-slate-500 font-medium">{cat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Action Checklist */}
      <div className="bg-blue-50/40 border border-blue-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>Recommended Preparedness Actions For Your Mandal</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium">
          {scoreData.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-700 flex items-start gap-2.5 shadow-2xs"
            >
              <span className="font-bold text-blue-600">{idx + 1}.</span>
              <span className="leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
