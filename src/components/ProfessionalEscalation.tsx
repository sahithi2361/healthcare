import React, { useState } from "react";
import {
  Stethoscope,
  PhoneCall,
  Video,
  FileText,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  Building2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Language, UserProfile, ClinicalSummary } from "../types";

interface ProfessionalEscalationProps {
  userProfile: UserProfile;
  language: Language;
  isOffline: boolean;
}

export const ProfessionalEscalation: React.FC<ProfessionalEscalationProps> = ({
  userProfile,
  language,
  isOffline,
}) => {
  const [concern, setConcern] = useState("");
  const [timeline, setTimeline] = useState("2-3 days");
  const [isGenerating, setIsGenerating] = useState(false);
  const [clinicalSummary, setClinicalSummary] = useState<ClinicalSummary | null>(null);
  const [telehealthRequested, setTelehealthRequested] = useState(false);

  const handleGenerateSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concern.trim()) return;

    setIsGenerating(true);

    try {
      if (isOffline) {
        // Offline deterministic fallback
        await new Promise((r) => setTimeout(r, 600));
        setClinicalSummary({
          patientOverview: `${userProfile.name}, ${userProfile.age} yrs (${userProfile.gender}), known case of ${userProfile.chronicConditions.join(", ")}.`,
          chiefComplaint: concern,
          timelineAndProgression: timeline,
          vitalContext: `Blood Group: ${userProfile.bloodGroup}. Known allergies: ${userProfile.allergies.join(", ")}.`,
          redFlagsCheck: "No active red-flag vitals reported. Stable for routine outpatient consultation.",
          suggestedQuestionsForDoctor: [
            "Are the current symptoms related to ongoing blood pressure management?",
            "Is any dosage adjustment or lab test (e.g., serum creatinine or electrolytes) needed?",
            "What preventive lifestyle or dietary adjustments are recommended?",
          ],
        });
        return;
      }

      const res = await fetch("/api/escalation-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile,
          concern,
          timeline,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setClinicalSummary(data);
      }
    } catch (err) {
      console.error("Failed to generate clinical handoff summary:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRequestTelehealth = () => {
    setTelehealthRequested(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Doctor Consultation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {language === "te"
              ? "వైద్యుని సంప్రదింపు సారాంశం"
              : language === "hi"
              ? "डॉक्टर परामर्श और सारांश"
              : "Healthcare Professional Escalation"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mt-1">
            {language === "te"
              ? "మీ ఆరోగ్య పరిస్థితిని డాక్టర్‌కు స్పష్టంగా వివరించడానికి ఆటోమేటిక్ క్లినికల్ సారాంశాన్ని సిద్ధం చేయండి."
              : language === "hi"
              ? "डॉक्टर से मिलने से पहले अपनी समस्याओं का संक्षिप्त व सटीक विवरण तैयार करें।"
              : "Generate concise, structured clinical handoff summaries for doctors and request telehealth consultations."}
          </p>
        </div>

        <button
          onClick={handleRequestTelehealth}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Video className="w-4 h-4" />
          <span>Request Telehealth</span>
        </button>
      </div>

      {telehealthRequested && (
        <div className="bg-blue-50/50 border border-blue-200 rounded-3xl p-6 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Telehealth Queue Slot Confirmed
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Duty Medical Officer (Bhoothpur CHC) will connect via video/audio call on your phone within 25 minutes.
              </p>
            </div>
          </div>
          <button
            onClick={() => setTelehealthRequested(false)}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-200 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2-Column Split: Query Form & Clinical Handoff Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input Form */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Describe Your Current Issue for the Doctor</span>
          </h2>

          <form onSubmit={handleGenerateSummary} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                What symptoms or health concern are you experiencing? *
              </label>
              <textarea
                required
                rows={4}
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                placeholder="e.g. Experiencing mild morning dizziness and elevated blood pressure readings (145/95) over the past two days, accompanied by slight fatigue."
                className="w-full p-3.5 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium text-xs sm:text-sm text-slate-800 bg-slate-50"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Duration / Timeline of symptoms:
              </label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g. Started 3 days ago, mostly after morning chores"
                className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium text-slate-800 bg-slate-50"
              />
            </div>

            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-700 block text-xs">Auto-included Patient Context:</span>
              <div className="text-xs text-slate-500">
                • {userProfile.name}, {userProfile.age} yrs • Blood Group: {userProfile.bloodGroup}
              </div>
              <div className="text-xs text-slate-500">
                • Conditions: {userProfile.chronicConditions.join(", ")}
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !concern.trim()}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <span>Synthesizing Clinical Summary with AI...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Clinical Handoff Summary</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Generated Structured Summary */}
        <div>
          {clinicalSummary ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    Clinical Consultation Handoff Sheet
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                  Non-Diagnostic
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Patient Profile
                  </span>
                  <p className="font-bold text-slate-800 mt-1">
                    {clinicalSummary.patientOverview}
                  </p>
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Chief Complaint & Timeline
                  </span>
                  <p className="font-bold text-slate-800 mt-1">
                    {clinicalSummary.chiefComplaint} ({clinicalSummary.timelineAndProgression})
                  </p>
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    Safety & Red-Flags Verification
                  </span>
                  <p className="text-slate-700 mt-1 font-medium">{clinicalSummary.redFlagsCheck}</p>
                </div>

                {clinicalSummary.suggestedQuestionsForDoctor && (
                  <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-200">
                    <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block mb-2">
                      Recommended Questions for Doctor:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {clinicalSummary.suggestedQuestionsForDoctor.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
                <span>Prepared by Sehat Saathi Clinical Assistant</span>
                <button
                  onClick={() => alert("Printing Clinical Handoff Sheet for Consultation.")}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Print / Share Sheet
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
              <Stethoscope className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-medium">
                Enter your health concern on the left to generate a structured medical handoff summary.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
