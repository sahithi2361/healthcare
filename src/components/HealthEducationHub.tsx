import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { Language, HealthArticle } from "../types";
import { speakText, stopSpeaking } from "../utils/speech";

interface HealthEducationHubProps {
  articles: HealthArticle[];
  language: Language;
}

export const HealthEducationHub: React.FC<HealthEducationHubProps> = ({
  articles,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<HealthArticle | null>(
    articles[0] || null
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  const filteredArticles = articles.filter((art) => {
    if (selectedCategory !== "all" && art.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        art.title.toLowerCase().includes(q) ||
        art.titleTe.toLowerCase().includes(q) ||
        art.titleHi.toLowerCase().includes(q) ||
        art.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getArticleTitle = (art: HealthArticle) => {
    if (language === "te") return art.titleTe || art.title;
    if (language === "hi") return art.titleHi || art.title;
    return art.title;
  };

  const getArticleContent = (art: HealthArticle) => {
    if (language === "te") return art.contentTe || art.content;
    if (language === "hi") return art.contentHi || art.content;
    return art.content;
  };

  const handleSpeak = (text: string) => {
    stopSpeaking();
    setIsSpeaking(true);
    speakText(
      text,
      language,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Education & Guides
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {language === "te"
              ? "ఆరోగ్య జ్ఞాన నిధి & నివారణ చిట్కాలు"
              : language === "hi"
              ? "स्वास्थ्य शिक्षा और रोकथाम गाइड"
              : "Health Education & Prevention Hub"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mt-1">
            {language === "te"
              ? "సాధారణ ఆరోగ్య సమస్యలు, రక్తపోటు, మధుమేహం మరియు నివారణ మార్గదర్శకత్వం (తెలుగులో వినండి)."
              : language === "hi"
              ? "सामान्य स्वास्थ्य समस्याओं और सावधानियों की प्रमाणित जानकारी (आवाज में सुनें)।"
              : "Bilingual, non-diagnostic preventative wellness guides with text-to-speech audio support."}
          </p>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List & Filter */}
        <div className="lg:col-span-1 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search health guides..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden text-xs sm:text-sm text-slate-800 font-medium shadow-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {["all", "Chronic Care", "Emergency First Aid", "Maternal Health", "Infection Prevention"].map(
              (c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer text-xs ${
                    selectedCategory === c
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {c === "all" ? "All" : c}
                </button>
              )
            )}
          </div>

          {/* Article List */}
          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {filteredArticles.map((art) => {
              const isSelected = selectedArticle?.id === art.id;
              return (
                <div
                  key={art.id}
                  onClick={() => {
                    setSelectedArticle(art);
                    stopSpeaking();
                    setIsSpeaking(false);
                  }}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? "bg-blue-50/40 border-blue-600 ring-2 ring-blue-100"
                      : "bg-white border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                    {art.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 mt-2 leading-snug">
                    {getArticleTitle(art)}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {getArticleContent(art)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Article View */}
        <div className="lg:col-span-2">
          {selectedArticle ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                    {selectedArticle.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-2.5">
                    {getArticleTitle(selectedArticle)}
                  </h2>
                </div>

                <button
                  onClick={() =>
                    isSpeaking
                      ? (stopSpeaking(), setIsSpeaking(false))
                      : handleSpeak(getArticleContent(selectedArticle))
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/20 active:scale-95 self-start sm:self-auto"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>Stop Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Read Aloud</span>
                    </>
                  )}
                </button>
              </div>

              {/* Simplified Summary Pill */}
              {selectedArticle.simpleExplanation && (
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 flex items-start gap-2.5">
                  <span className="font-bold text-blue-600 uppercase tracking-wider text-[11px] shrink-0 mt-0.5">
                    Simple Guide:
                  </span>
                  <p className="font-medium leading-relaxed">
                    {selectedArticle.simpleExplanation}
                  </p>
                </div>
              )}

              {/* Main Content */}
              <div className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-3 font-normal whitespace-pre-line">
                {getArticleContent(selectedArticle)}
              </div>

              {/* Preventative Tips Box */}
              {selectedArticle.tips && selectedArticle.tips.length > 0 && (
                <div className="bg-blue-50/40 border border-blue-200 rounded-2xl p-5 space-y-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Key Health Tips:
                  </span>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                    {selectedArticle.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Non-diagnostic notice */}
              <div className="pt-3 text-xs text-slate-400 italic flex items-center gap-1.5 border-t border-slate-100">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  For informational awareness only. Consult a medical officer for prescription or diagnosis.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-medium">Select an article from the left to read and listen.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
