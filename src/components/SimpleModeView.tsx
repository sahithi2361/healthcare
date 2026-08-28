import React from "react";
import {
  Building2,
  Pill,
  Calendar,
  FileText,
  AlertTriangle,
  Stethoscope,
  Mic,
  Volume2,
  VolumeX,
  X,
  PhoneCall,
} from "lucide-react";
import { Language, UserProfile } from "../types";
import { speakText, stopSpeaking } from "../utils/speech";

interface SimpleModeViewProps {
  language: Language;
  userProfile: UserProfile;
  onSelectAction: (tab: string) => void;
  onTriggerEmergency: () => void;
  onExitSimpleMode: () => void;
}

export const SimpleModeView: React.FC<SimpleModeViewProps> = ({
  language,
  userProfile,
  onSelectAction,
  onTriggerEmergency,
  onExitSimpleMode,
}) => {
  const playTileVoice = (text: string) => {
    stopSpeaking();
    speakText(text, language);
  };

  const simpleTiles = [
    {
      id: "emergency",
      titleEn: "EMERGENCY 108",
      titleTe: "అత్యవసరం 108",
      titleHi: "आपातकाल 108",
      voiceEn: "Emergency. Call 108 ambulance immediately.",
      voiceTe: "అత్యవసరం. తక్షణమే 108 అంబులెన్స్ కి కాల్ చేయండి.",
      voiceHi: "आपातकाल. तुरंत 108 एम्बुलेंस को कॉल करें.",
      icon: "🚨",
      iconComponent: AlertTriangle,
      color: "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20",
      action: onTriggerEmergency,
      spanFull: true,
    },
    {
      id: "assistant",
      titleEn: "Ask Saathi (Voice)",
      titleTe: "సాథీతో మాట్లాడండి",
      titleHi: "साथी से बोलें",
      voiceEn: "Ask Saathi. Press and speak your question.",
      voiceTe: "సాథీ తో మాట్లాడండి. మైక్ నొక్కి మీ సమస్య చెప్పండి.",
      voiceHi: "साथी से बात करें. माइक दबाकर अपना सवाल पूछें.",
      icon: "🎙️",
      iconComponent: Mic,
      color: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20",
      action: () => onSelectAction("assistant"),
      spanFull: true,
    },
    {
      id: "healthcare",
      titleEn: "Hospital & PHC",
      titleTe: "ఆసుపత్రి / క్లినిక్",
      titleHi: "अस्पताल / केंद्र",
      voiceEn: "Find nearest government hospital or primary health centre.",
      voiceTe: "సమీప ప్రభుత్వ ఆసుపత్రి లేదా ప్రాథమిక ఆరోగ్య కేంద్రం చూడండి.",
      voiceHi: "निकटतम सरकारी अस्पताल या स्वास्थ्य केंद्र खोजें.",
      icon: "🏥",
      iconComponent: Building2,
      color: "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 shadow-sm",
      isLight: true,
      action: () => onSelectAction("healthcare"),
    },
    {
      id: "medicines",
      titleEn: "My Medicines",
      titleTe: "నా మందులు",
      titleHi: "मेरी दवाएं",
      voiceEn: "Your daily medicine reminders and schedule.",
      voiceTe: "మీ రోజువారీ మందుల సమయం మరియు రిమైండర్లు.",
      voiceHi: "आपकी रोजाना की दवाएं और समय.",
      icon: "💊",
      iconComponent: Pill,
      color: "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 shadow-sm",
      isLight: true,
      action: () => onSelectAction("medicines"),
    },
    {
      id: "appointments",
      titleEn: "Appointments",
      titleTe: "అపాయింట్‌మెంట్లు",
      titleHi: "डॉक्टर का समय",
      voiceEn: "Your doctor visits and care bundle checklist.",
      voiceTe: "డాక్టర్ విజిట్ సమయం మరియు తీసుకెళ్లాల్సిన రిపోర్టులు.",
      voiceHi: "डॉक्टर से मिलने का समय और जरूरी पर्चे.",
      icon: "📅",
      iconComponent: Calendar,
      color: "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 shadow-sm",
      isLight: true,
      action: () => onSelectAction("appointments"),
    },
    {
      id: "passport",
      titleEn: "Health Records & QR",
      titleTe: "ఆరోగ్య రికార్డులు & QR",
      titleHi: "स्वास्थ्य पर्चे और QR",
      voiceEn: "Show your health passport or QR code to the doctor.",
      voiceTe: "డాక్టర్‌కు చూపించడానికి మీ ఆరోగ్య పాస్‌పోర్ట్ మరియు QR కోడ్.",
      voiceHi: "डॉक्टर को दिखाने के लिए आपका हेल्थ पासपोर्ट और QR कोड.",
      icon: "📄",
      iconComponent: FileText,
      color: "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 shadow-sm",
      isLight: true,
      action: () => onSelectAction("passport"),
    },
    {
      id: "doctor",
      titleEn: "Talk to Doctor",
      titleTe: "వైద్యుడిని సంప్రదించండి",
      titleHi: "डॉक्टर से परामर्श",
      voiceEn: "Talk to a healthcare professional or request tele-callback.",
      voiceTe: "వైద్యుడితో మాట్లాడండి లేదా టెలిమెడిసిన్ సలహా కోరండి.",
      voiceHi: "डॉक्टर से बात करें या टेलीमेडिसिन सहायता लें.",
      icon: "👨‍⚕️",
      iconComponent: Stethoscope,
      color: "bg-slate-800 hover:bg-slate-900 text-white shadow-sm",
      action: () => onSelectAction("doctor"),
      spanFull: true,
    },
  ];

  const getTitle = (tile: (typeof simpleTiles)[0]) => {
    if (language === "te") return tile.titleTe;
    if (language === "hi") return tile.titleHi;
    return tile.titleEn;
  };

  const getVoice = (tile: (typeof simpleTiles)[0]) => {
    if (language === "te") return tile.voiceTe;
    if (language === "hi") return tile.voiceHi;
    return tile.voiceEn;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Low-literacy spoken guide */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">
            📢
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              {language === "te"
                ? "సరళ మోడ్ (సులభ రూపం)"
                : language === "hi"
                ? "सरल मोड (आसान रूप)"
                : "Simple Accessible Mode"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {language === "te"
                ? "పెద్ద బటన్లు, ఐకాన్లు మరియు వాయిస్ సూచనలు"
                : language === "hi"
                ? "बड़े बटन, चित्र और आवाज निर्देश"
                : "Large icons & spoken audio navigation for low-literacy users"}
            </p>
          </div>
        </div>

        <button
          onClick={onExitSimpleMode}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95 self-start sm:self-auto"
        >
          <X className="w-4 h-4" />
          <span>Exit Simple Mode</span>
        </button>
      </div>

      {/* Spoken Instruction Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() =>
              playTileVoice(
                language === "te"
                  ? "మీకు కావాల్సిన విభాగాన్ని నొక్కండి. మేము మీకు వాయిస్ ద్వారా సహాయం చేస్తాము."
                  : language === "hi"
                  ? "अपनी पसंद का विकल्प चुनें। हम आवाज से आपकी सहायता करेंगे।"
                  : "Tap any large tile below to navigate. Voice guidance is active."
              )
            }
            className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold hover:bg-blue-100 cursor-pointer transition-colors"
            title="Listen to instruction"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <div>
            <div className="text-sm font-bold text-slate-800">
              {language === "te"
                ? "మీకు కావాల్సిన ఐకాన్ పై నొక్కండి:"
                : language === "hi"
                ? "नीचे दिए गए चित्र पर दबाएं:"
                : "Tap any tile or speaker icon below:"}
            </div>
            <div className="text-xs text-slate-400 font-medium">
              {language === "te"
                ? "నొక్కగానే వాయిస్ వివరణ వినిపిస్తుంది"
                : language === "hi"
                ? "दबाने पर आवाज से निर्देश मिलेंगे"
                : "Spoken audio plays on tap in your language"}
            </div>
          </div>
        </div>
      </div>

      {/* Big Tile Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {simpleTiles.map((tile) => (
          <div
            key={tile.id}
            className={`relative rounded-3xl p-6 transition-all active:scale-[0.98] select-none ${
              tile.color
            } ${tile.spanFull ? "sm:col-span-2" : ""}`}
          >
            <div className="flex items-center justify-between">
              {/* Tile Clickable Action Area */}
              <div
                onClick={() => {
                  playTileVoice(getVoice(tile));
                  tile.action();
                }}
                className="flex items-center gap-4 cursor-pointer flex-1"
              >
                <div className={`text-4xl shrink-0 p-3 rounded-2xl ${tile.isLight ? 'bg-slate-100' : 'bg-white/20'}`}>
                  {tile.icon}
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
                    {getTitle(tile)}
                  </div>
                  <div className={`text-xs sm:text-sm font-medium mt-1 ${tile.isLight ? 'text-slate-500' : 'text-white/80'}`}>
                    {getVoice(tile).split(".")[0]}
                  </div>
                </div>
              </div>

              {/* Dedicated Speaker Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playTileVoice(getVoice(tile));
                }}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform active:scale-90 cursor-pointer shrink-0 ml-2 ${
                  tile.isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                title="Hear audio instruction"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
