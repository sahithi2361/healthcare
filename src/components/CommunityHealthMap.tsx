import React, { useState } from "react";
import {
  Globe,
  MapPin,
  Building2,
  Clock,
  Pill,
  Users,
  ShieldCheck,
  TrendingDown,
  Info,
} from "lucide-react";
import { Language, CommunityHealthRegion } from "../types";

interface CommunityHealthMapProps {
  regions: CommunityHealthRegion[];
  language: Language;
}

export const CommunityHealthMap: React.FC<CommunityHealthMapProps> = ({
  regions,
  language,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<CommunityHealthRegion>(
    regions[0] || null
  );

  const getTierBadge = (tier: string) => {
    if (tier === "Better") {
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
    if (tier === "Moderate") {
      return "bg-amber-100 text-amber-800 border-amber-300";
    }
    return "bg-rose-100 text-rose-800 border-rose-300";
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Health Equity
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {language === "te"
              ? "గ్రామీణ ప్రజా ఆరోగ్య సూచిక పటం"
              : language === "hi"
              ? "सामुदायिक स्वास्थ्य सूचकांक मानचित्र"
              : "Community Health Equity & Resource Map"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mt-1">
            {language === "te"
              ? "మండలాల వారీగా అంబులెన్స్ స్పందన సమయం, ఆరోగ్య కేంద్రాలు మరియు మందుల లభ్యత వివరాలు."
              : language === "hi"
              ? "मंडल स्तर पर एम्बुलेंस पहुंचने का समय, अस्पताल और जन औषधि उपलब्धता।"
              : "Anonymized rural healthcare accessibility benchmarking across regional administrative blocks."}
          </p>
        </div>
      </div>

      {/* Regional Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {regions.map((reg) => {
          const isSelected = selectedRegion?.id === reg.id;
          return (
            <div
              key={reg.id}
              onClick={() => setSelectedRegion(reg)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer shadow-sm ${
                isSelected
                  ? "bg-blue-50/40 border-blue-600 ring-2 ring-blue-100"
                  : "bg-white border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Mandal</span>
                <span
                  className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${getTierBadge(
                    reg.accessTier
                  )}`}
                >
                  {reg.accessTier} Access
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mt-2">{reg.name}</h3>
              <p className="text-xs text-slate-500 font-medium">{reg.district}</p>

              {/* Metrics */}
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">AMBULANCE ETA</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {reg.avgAmbulanceTimeMin} mins
                  </span>
                </div>
                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">PHC COUNT</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {reg.facilityCount} Centres
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Region Detailed Deep Dive */}
      {selectedRegion && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-0.5 rounded-full border ${getTierBadge(
                    selectedRegion.accessTier
                  )}`}
                >
                  Tier: {selectedRegion.accessTier}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedRegion.district}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mt-2">
                {selectedRegion.name} Mandal Health Infrastructure
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">POPULATION</span>
              <span className="font-bold text-slate-800 text-base mt-1 block">
                {selectedRegion.population.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">PHC / CHC TOTAL</span>
              <span className="font-bold text-slate-800 text-base mt-1 block">
                {selectedRegion.facilityCount}
              </span>
            </div>
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">JAN AUSHADHI STORES</span>
              <span className="font-bold text-slate-800 text-base mt-1 block">
                {selectedRegion.pharmacyCount}
              </span>
            </div>
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">AMBULANCE RESPONSE</span>
              <span className="font-bold text-slate-800 text-base mt-1 block">
                ~{selectedRegion.avgAmbulanceTimeMin} mins
              </span>
            </div>
          </div>

          <div className="bg-blue-50/40 border border-blue-200 rounded-2xl p-4 text-xs text-slate-700 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Public Health Equity Recommendation:</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed font-medium">
                {selectedRegion.accessTier === "Limited"
                  ? "Requires expanded mobile medical unit frequency and deployment of an additional 108 emergency vehicle near the tribal belt."
                  : selectedRegion.accessTier === "Moderate"
                  ? "Adequate primary clinic coverage; recommend stocking specialized hypertension and diabetes generic medicines at sub-centres."
                  : "Optimal healthcare accessibility hub. Serves as reference referral point for surrounding mandals."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
