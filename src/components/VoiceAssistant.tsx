import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  AlertTriangle,
  Heart,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
  Building2,
  MapPin,
  Calendar,
  Pill,
  UserCheck,
  Languages,
} from "lucide-react";
import { Language, UserProfile, ChatMessage, CarePathwayStep, Doctor } from "../types";
import { speakText, stopSpeaking, createSpeechRecognizer } from "../utils/speech";
import { StorageManager } from "../utils/storage";

interface VoiceAssistantProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  userProfile: UserProfile;
  isOffline: boolean;
  onTriggerEmergency: () => void;
  onNavigateTab?: (tab: string) => void;
  onSelectDoctor?: (doctor: Doctor) => void;
  initialQuery?: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  language,
  onLanguageChange,
  userProfile,
  isOffline,
  onTriggerEmergency,
  onNavigateTab,
  onSelectDoctor,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognizerRef = useRef<any>(null);

  // Initialize initial greeting in preferred language
  useEffect(() => {
    let initialGreeting = "";
    let initialSimplified = "";

    if (language === "te") {
      initialGreeting = `నమస్కారం ${userProfile.name.split(" ")[0]} గారు! నేను మీ "సాథీ AI" ఆరోగ్య సహచరుడిని. మీ ఆరోగ్యం గురించి ఏదైనా అడగండి లేదా మాట్లాడండి.`;
      initialSimplified = "మీ ఆరోగ్య సహాయం కోసం మాట్లాడండి లేదా టైప్ చేయండి.";
    } else if (language === "hi") {
      initialGreeting = `नमस्ते ${userProfile.name.split(" ")[0]} जी! मैं आपकी "साथी AI" स्वास्थ्य साथी हूँ। अपने स्वास्थ्य के बारे में बोलकर या लिखकर पूछें।`;
      initialSimplified = "स्वास्थ्य से जुड़े सवालों के लिए माइक दबाकर बोलें।";
    } else {
      initialGreeting = `Namaste ${userProfile.name.split(" ")[0]}! I am "Saathi AI", your non-diagnostic healthcare navigation companion. Speak or type your health question.`;
      initialSimplified = "Ask any general health or clinic navigation question.";
    }

    const welcomeMsg: ChatMessage = {
      id: "msg_welcome",
      sender: "assistant",
      text: initialGreeting,
      timestamp: "Just now",
      language,
      simplifiedExplanation: initialSimplified,
      suggestedFollowUpQuestions: [
        language === "te" ? "సమీప ఆసుపత్రి ఎక్కడ ఉంది?" : language === "hi" ? "निकटतम अस्पताल कहाँ है?" : "Find a nearby health centre",
        language === "te" ? "రక్తపోటు (BP) జాగ్రత్తలు ఏమిటి?" : language === "hi" ? "बीपी के लिए क्या करें?" : "How to manage high BP?",
        language === "te" ? "మందుల రిమైండర్ చూడండి" : language === "hi" ? "दवा की याद दिखाएं" : "Show my medicine reminders",
        language === "te" ? "డాక్టర్ అపాయింట్‌మెంట్ తీసుకోవడం ఎలా?" : language === "hi" ? "डॉक्टर से मिलने का समय" : "How to prepare for doctor visit?",
      ],
    };

    setMessages([welcomeMsg]);
  }, [language, userProfile.name]);

  // Handle initial query if passed from demo scenario
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Auto scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const recognizer = createSpeechRecognizer(
      (transcript, isFinal) => {
        setInputQuery(transcript);
        if (isFinal && transcript.trim()) {
          setIsListening(false);
          handleSendMessage(transcript.trim());
        }
      },
      (err) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    recognizerRef.current = recognizer;
    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {}
      }
    };
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {}
      }
      setIsListening(false);
    } else {
      if (recognizerRef.current) {
        try {
          if (language === "te") recognizerRef.current.lang = "te-IN";
          else if (language === "hi") recognizerRef.current.lang = "hi-IN";
          else recognizerRef.current.lang = "en-IN";

          recognizerRef.current.start();
          setIsListening(true);
        } catch (err) {
          console.warn("Could not start speech recognition directly:", err);
          // Fallback simulation for environments without audio permissions
          simulateSpeechInput();
        }
      } else {
        simulateSpeechInput();
      }
    }
  };

  // Quick fallback speech simulator for testing in iframe / sandboxes without microphone hardware
  const simulateSpeechInput = () => {
    setIsListening(true);
    setTimeout(() => {
      let sampleSpoken = "";
      if (language === "te") {
        sampleSpoken = "నాకు కొద్దిగా తలనొప్పి మరియు నీరసంగా ఉంది, ఏమి చేయాలి?";
      } else if (language === "hi") {
        sampleSpoken = "मुझे हल्का सिरदर्द और कमजोरी लग रही है, क्या करना चाहिए?";
      } else {
        sampleSpoken = "I have a mild headache and fatigue, what should I do next?";
      }
      setInputQuery(sampleSpoken);
      setIsListening(false);
      handleSendMessage(sampleSpoken);
    }, 1800);
  };

  const handleSendMessage = async (queryText?: string) => {
    const text = (queryText || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      language,
      isVoice: isListening,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      if (isOffline) {
        // Deterministic offline safety engine response
        await new Promise((resolve) => setTimeout(resolve, 600));

        const lower = text.toLowerCase();
        const isEmergency =
          lower.includes("chest pain") ||
          lower.includes("gunde noppi") ||
          lower.includes("seene me dard") ||
          lower.includes("unconscious") ||
          lower.includes("breathing") ||
          lower.includes("raktham");

        let replyText = "";
        let simplified = "";
        let pathway: CarePathwayStep[] = [];

        if (isEmergency) {
          replyText =
            language === "te"
              ? "🚨 ఇది అత్యవసర పరిస్థితి కావచ్చు. దయచేసి వెంటనే 108 అంబులెన్స్ లేదా సమీప ఆసుపత్రికి వెళ్లండి."
              : language === "hi"
              ? "🚨 यह आपातकालीन स्थिति हो सकती है। तुरंत 108 पर कॉल करें या नजदीकी अस्पताल जाएं।"
              : "🚨 Potential emergency warning signs detected. Please call 108 or visit the nearest emergency centre immediately.";
          simplified = "Urgent: Call 108 or go to emergency room.";
          pathway = [
            { step: 1, title: "Emergency Safety", description: "Dial 108 or 112 immediately" },
            { step: 2, title: "Nearest Hospital", description: "Proceed to District Hospital Mahabubnagar" },
            { step: 3, title: "Notify Family", description: "Alert your caregiver" },
          ];
        } else {
          replyText =
            language === "te"
              ? `నేను డాక్టర్‌ను కాను, కానీ మీ ప్రశ్నకు మార్గదర్శకత్వం: విశ్రాంతి తీసుకోండి, పుష్కలంగా నీరు త్రాగండి. లక్షణాలు 24 గంటల్లో తగ్గకపోతే భూత్‌పూర్ PHC లో సంప్రదించండి.`
              : language === "hi"
              ? `मैं डॉक्टर नहीं हूँ, लेकिन आपकी सुविधा के लिए: आराम करें, पर्याप्त पानी या ओआरएस पिएं। यदि 24 घंटे में सुधार न हो तो PHC केंद्र जाएं।`
              : `I am a non-diagnostic assistant: Rest well and hydrate with clean boiled water or ORS. If symptoms persist for more than 24-48 hours, visit your local Primary Health Centre (PHC).`;
          simplified = "Rest, drink water/ORS, and visit the PHC if symptoms continue.";
          pathway = [
            { step: 1, title: "Rest & Hydrate", description: "Drink clean water and rest in a comfortable space" },
            { step: 2, title: "Monitor Symptoms", description: "Check if temperature or pain eases within 24 hours" },
            { step: 3, title: "Visit Local PHC", description: "Consult Dr. Srinivas Rao at Bhoothpur PHC" },
            { step: 4, title: "Follow-up", description: "Update your digital health passport with doctor notes" },
          ];
        }

        const botMsg: ChatMessage = {
          id: "msg_bot_" + Date.now(),
          sender: "assistant",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          language,
          isEmergency,
          simplifiedExplanation: simplified,
          carePathway: pathway,
          suggestedFacilityType: isEmergency ? "Emergency Facility" : "Primary Health Centre (PHC)",
          suggestedFollowUpQuestions: [
            language === "te" ? "సమీప PHC సమయాలు ఏమిటి?" : "When is the PHC open?",
            language === "te" ? "మందుల రిమైండర్ ఎలా సెట్ చేయాలి?" : "How do I take my BP medicine?",
          ],
        };

        setMessages((prev) => [...prev, botMsg]);
        // Auto voice read response
        speakResponse(botMsg.text, botMsg.id);
        return;
      }

      // Online: Call server-side Gemini API
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          language,
          context: {
            age: userProfile.age,
            location: userProfile.location,
            bloodGroup: userProfile.bloodGroup,
            notes: userProfile.importantHealthNotes,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Server response error");
      }

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: "msg_bot_" + Date.now(),
        sender: "assistant",
        text: data.response || "General health guidance received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language,
        isEmergency: data.isEmergency,
        emergencyReason: data.emergencyReason,
        simplifiedExplanation: data.simplifiedExplanation,
        carePathway: data.carePathway,
        suggestedFacilityType: data.suggestedFacilityType,
        suggestedFollowUpQuestions: data.suggestedFollowUpQuestions,
      };

      setMessages((prev) => [...prev, botMsg]);

      // If red flag triggered, voice speak urgent alert
      speakResponse(botMsg.text, botMsg.id);
    } catch (err) {
      console.error("Chat error:", err);
      const fallbackErrorMsg: ChatMessage = {
        id: "msg_err_" + Date.now(),
        sender: "assistant",
        text:
          language === "te"
            ? "సాధారణ సమాచారం: విశ్రాంతి తీసుకోండి, పుష్కలంగా నీరు త్రాగండి. అవసరమైతే సమీప ప్రాథమిక ఆరోగ్య కేంద్రాన్ని (PHC) సంప్రదించండి."
            : language === "hi"
            ? "सामान्य सलाह: पर्याप्त आराम करें और पानी पिएं। आवश्यकता होने पर निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC) जाएं।"
            : "General guidance: Rest, stay hydrated with clean water, and consult your nearest Primary Health Centre (PHC) if symptoms persist.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language,
        carePathway: [
          { step: 1, title: "Home Rest", description: "Take adequate rest and hydration" },
          { step: 2, title: "Visit PHC", description: "Consult a qualified medical officer" },
        ],
      };
      setMessages((prev) => [...prev, fallbackErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakResponse = (text: string, msgId: string) => {
    stopSpeaking();
    setActiveSpeakingMsgId(msgId);
    setIsSpeaking(true);
    speakText(
      text,
      language,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        setActiveSpeakingMsgId(null);
      }
    );
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setActiveSpeakingMsgId(null);
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header with Language selector and Mode indicator */}
      <div className="p-4 sm:p-5 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                Saathi Assistant
              </h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Non-Diagnostic AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {language === "te"
                ? "వాయిస్-ఫస్ట్ నాన్-డయాగ్నస్టిక్ ఆరోగ్య సహచరుడు"
                : language === "hi"
                ? "वॉयस-फर्स्ट गैर-नैदानिक स्वास्थ्य सहायक"
                : "Your Voice Healthcare Companion"}
            </p>
          </div>
        </div>

        {/* Language quick pill toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-full gap-1 border border-slate-200">
          <button
            onClick={() => onLanguageChange("te")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              language === "te"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            తెలుగు
          </button>
          <button
            onClick={() => onLanguageChange("hi")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              language === "hi"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => onLanguageChange("en")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              language === "en"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            {/* Sender Label */}
            <div className="text-[11px] font-semibold text-slate-400 mb-1 px-1 flex items-center gap-1.5">
              {msg.sender === "user" ? (
                <>
                  <span>You</span>
                  {msg.isVoice && <Mic className="w-3 h-3 text-blue-600" />}
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>Saathi AI</span>
                </>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none font-medium shadow-md"
                  : msg.isEmergency
                  ? "bg-red-50 border-2 border-red-500 text-red-950 rounded-bl-none shadow-sm"
                  : "bg-white border-2 border-blue-100 text-slate-800 rounded-bl-none shadow-sm"
              }`}
            >
              {/* Emergency Banner inside bubble if detected */}
              {msg.isEmergency && (
                <div className="mb-3 p-3 bg-red-600 text-white rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                    <span>POTENTIAL RED FLAG WARNING DETECTED</span>
                  </div>
                  <button
                    onClick={onTriggerEmergency}
                    className="bg-white text-red-600 font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer hover:bg-red-50 active:scale-95 shadow-sm"
                  >
                    OPEN EMERGENCY 🚨
                  </button>
                </div>
              )}

              {/* Main Text Content */}
              <div className="whitespace-pre-line text-sm sm:text-base font-normal">
                {msg.text}
              </div>

              {/* Simplified Explanation Pill for Low-Literacy users */}
              {msg.simplifiedExplanation && (
                <div className="mt-3 p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-slate-700 flex items-start gap-2">
                  <span className="font-bold text-blue-600 uppercase tracking-wider text-[10px] shrink-0 mt-0.5">
                    Safety Check:
                  </span>
                  <span className="font-medium leading-relaxed">
                    {msg.simplifiedExplanation}
                  </span>
                </div>
              )}

              {/* Visual Care Pathway Component */}
              {msg.carePathway && msg.carePathway.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-blue-600" />
                      Care Pathway (కార్యాచరణ మార్గం)
                    </span>
                    {msg.suggestedFacilityType && (
                      <span className="text-[11px] font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-200">
                        {msg.suggestedFacilityType}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mt-2">
                    {msg.carePathway.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-start gap-3 text-xs text-slate-800"
                      >
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {step.step || idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-900">{step.title}</div>
                          <div className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                            {step.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons under pathway */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab("healthcare")}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Find Nearest Health Centre</span>
                      </button>
                    )}
                    {onNavigateTab && (
                      <button
                        onClick={() => {
                          const liveDocs = StorageManager.getDoctors();
                          if (onSelectDoctor && liveDocs.length > 0) {
                            onSelectDoctor(liveDocs[0]);
                          }
                          onNavigateTab("appointments");
                        }}
                        className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>Request Doctor Appointment</span>
                      </button>
                    )}
                    {onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab("doctor")}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Browse Verified Doctors</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Bubble Audio Controls */}
              {msg.sender === "assistant" && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        activeSpeakingMsgId === msg.id && isSpeaking
                          ? handleStopSpeaking()
                          : speakResponse(msg.text, msg.id)
                      }
                      className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200 cursor-pointer transition-colors"
                    >
                      {activeSpeakingMsgId === msg.id && isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-red-600" />
                          <span>Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Read Aloud (వాయిస్ వినండి)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Non-diagnostic navigation
                  </span>
                </div>
              )}
            </div>

            {/* Suggested Follow-up Quick Chips */}
            {msg.suggestedFollowUpQuestions &&
              msg.suggestedFollowUpQuestions.length > 0 &&
              messages[messages.length - 1]?.id === msg.id && (
                <div className="mt-2.5 flex flex-wrap gap-2 max-w-[85%]">
                  {msg.suggestedFollowUpQuestions.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => handleSendMessage(q)}
                      className="bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5 text-slate-500 text-xs font-medium bg-white border border-slate-200 px-4 py-3 rounded-2xl w-fit shadow-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
              <span
                className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                style={{ animationDelay: "0.15s" }}
              ></span>
              <span
                className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                style={{ animationDelay: "0.3s" }}
              ></span>
            </div>
            <span>
              {language === "te"
                ? "సాథీ సమాధానం సిద్ధం చేస్తోంది..."
                : language === "hi"
                ? "साथी जवाब तैयार कर रही है..."
                : "Saathi is preparing guidance & checking safety rules..."}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recording Active Animation Banner */}
      {isListening && (
        <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold">
              {language === "te"
                ? "వింటున్నాను... మాట్లాడండి (తెలుగు)"
                : language === "hi"
                ? "सुन रहा हूँ... बोलिए (हिन्दी)"
                : "Listening to your voice... Speak naturally"}
            </span>
          </div>
          <button
            onClick={toggleListening}
            className="bg-white text-blue-800 text-xs font-bold px-3 py-1 rounded-full cursor-pointer"
          >
            Done
          </button>
        </div>
      )}

      {/* Input Bar & Large Voice Button */}
      <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col items-center space-y-3">
        <div className="relative">
          {isListening && (
            <div className="absolute -inset-4 bg-blue-400 opacity-20 rounded-full animate-ping pointer-events-none"></div>
          )}
          <button
            type="button"
            id="voice-mic-main-btn"
            onClick={toggleListening}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white transition-all shadow-xl active:scale-95 cursor-pointer relative z-10 ${
              isListening
                ? "bg-red-600 ring-4 ring-red-200 animate-pulse"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            title="Press to speak in Telugu, Hindi or English"
          >
            {isListening ? (
              <MicOff className="w-8 h-8 sm:w-10 sm:h-10" />
            ) : (
              <Mic className="w-8 h-8 sm:w-10 sm:h-10" />
            )}
          </button>
        </div>
        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
          {isListening ? "Listening..." : "Tap to Speak (Multilingual)"}
        </p>

        {/* Text Input Row */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="w-full flex items-center gap-2 max-w-xl pt-1"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                language === "te"
                  ? "ఆరోగ్య సందేహం మాట్లాడండి లేదా టైప్ చేయండి..."
                  : language === "hi"
                  ? "स्वास्थ्य सवाल बोलें या टाइप करें..."
                  : "Speak or type your healthcare question..."
              }
              className="w-full h-11 pl-4 pr-12 rounded-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden text-sm text-slate-800 transition-all font-medium shadow-xs"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className={`absolute right-1.5 top-1.5 h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                inputQuery.trim() && !isLoading
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Safety Notice */}
        <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
          <span>
            {language === "te"
              ? "సేహత్ సాథీ AI వైద్యుడి స్థానాన్ని భర్తీ చేయదు. అత్యవసరమైతే 108 కి కాల్ చేయండి."
              : language === "hi"
              ? "सेहत साथी AI डॉक्टर का विकल्प नहीं है। आपातकाल में 108 डायल करें।"
              : "Sehat Saathi AI is strictly non-diagnostic. For emergencies, dial 108 immediately."}
          </span>
        </div>
      </div>
    </div>
  );
};
