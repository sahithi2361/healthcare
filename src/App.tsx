import React, { useState, useEffect } from "react";
import {
  Language,
  UserProfile,
  HealthcareFacility,
  HealthArticle,
  Medication,
  Appointment,
  HealthDocument,
  Caregiver,
  HealthAccessScoreData,
  CommunityHealthRegion,
} from "./types";
import { StorageManager } from "./utils/storage";
import { Navbar } from "./components/Navbar";
import { HackathonDemoBar } from "./components/HackathonDemoBar";
import { EmergencyModal } from "./components/EmergencyModal";
import { ProfileModal } from "./components/ProfileModal";
import { SimpleModeView } from "./components/SimpleModeView";
import { HomeOverview } from "./components/HomeOverview";
import { VoiceAssistant } from "./components/VoiceAssistant";
import { HealthcareLocator } from "./components/HealthcareLocator";
import { MedicineReminders } from "./components/MedicineReminders";
import { AppointmentCenter } from "./components/AppointmentCenter";
import { HealthPassport } from "./components/HealthPassport";
import { DocumentOrganizer } from "./components/DocumentOrganizer";
import { CareCircle } from "./components/CareCircle";
import { ProfessionalEscalation } from "./components/ProfessionalEscalation";
import { HealthAccessScore } from "./components/HealthAccessScore";
import { CommunityHealthMap } from "./components/CommunityHealthMap";
import { HealthEducationHub } from "./components/HealthEducationHub";
import {
  Sparkles,
  Home,
  Mic,
  Building2,
  Pill,
  Calendar,
  FileText,
  Users,
  Stethoscope,
  BarChart3,
  Map as MapIcon,
  BookOpen,
  ShieldCheck,
  HeartHandshake,
  AlertTriangle,
} from "lucide-react";

export function App() {
  // App-level State
  const [language, setLanguage] = useState<Language>("te"); // Default to Telugu for authentic rural showcase
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("home");

  // Modals State
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [initialVoiceQuery, setInitialVoiceQuery] = useState<string>("");

  // Domain Data State loaded from StorageManager
  const [userProfile, setUserProfile] = useState<UserProfile>(StorageManager.getProfile());
  const [facilities, setFacilities] = useState<HealthcareFacility[]>(StorageManager.getFacilities());
  const [medications, setMedications] = useState<Medication[]>(StorageManager.getMedications());
  const [appointments, setAppointments] = useState<Appointment[]>(StorageManager.getAppointments());
  const [documents, setDocuments] = useState<HealthDocument[]>(StorageManager.getDocuments());
  const [caregivers, setCaregivers] = useState<Caregiver[]>(StorageManager.getCaregivers());
  const [accessScore, setAccessScore] = useState<HealthAccessScoreData>(StorageManager.getAccessScore());
  const [communityRegions, setCommunityRegions] = useState<CommunityHealthRegion[]>(StorageManager.getCommunityRegions());
  const [articles, setArticles] = useState<HealthArticle[]>(StorageManager.getArticles());

  // Initialize storage once on mount
  useEffect(() => {
    StorageManager.initialize();
    setIsOffline(StorageManager.isSimulatedOffline());
    reloadAllState();
  }, []);

  const reloadAllState = () => {
    setUserProfile(StorageManager.getProfile());
    setFacilities(StorageManager.getFacilities());
    setMedications(StorageManager.getMedications());
    setAppointments(StorageManager.getAppointments());
    setDocuments(StorageManager.getDocuments());
    setCaregivers(StorageManager.getCaregivers());
    setAccessScore(StorageManager.getAccessScore());
    setCommunityRegions(StorageManager.getCommunityRegions());
    setArticles(StorageManager.getArticles());
  };

  const handleToggleOffline = () => {
    const next = !isOffline;
    setIsOffline(next);
    StorageManager.setSimulatedOffline(next);
  };

  const handleResetAllData = () => {
    StorageManager.resetAll();
    reloadAllState();
  };

  // 10 Hackathon Judge Demo Scenarios Handler
  const handleRunScenario = (scenarioId: string) => {
    switch (scenarioId) {
      case "telugu_voice":
        setLanguage("te");
        setActiveTab("assistant");
        setInitialVoiceQuery("నాకు 2 రోజులుగా తలనొప్పి మరియు కళ్ళు తిరుగుతున్నాయి, నేను ఏమి చేయాలి?");
        break;

      case "emergency_redflag":
        setLanguage("te");
        setIsEmergencyOpen(true);
        break;

      case "offline_toggle":
        handleToggleOffline();
        break;

      case "care_bundle":
        setActiveTab("appointments");
        break;

      case "passport_qr":
        setActiveTab("passport");
        break;

      case "missed_medicine":
        setActiveTab("medicines");
        break;

      case "doc_extraction":
        setActiveTab("documents");
        break;

      case "resource_locator":
        setActiveTab("healthcare");
        break;

      case "doctor_handoff":
        setActiveTab("doctor");
        break;

      case "community_map":
        setActiveTab("community_map");
        break;

      default:
        setActiveTab("home");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-100">
      {/* Top Judge Scenarios Bar */}
      <HackathonDemoBar onRunScenario={handleRunScenario} currentLanguage={language} />

      {/* Main Multilingual Header */}
      <Navbar
        currentLanguage={language}
        onLanguageChange={setLanguage}
        isSimpleMode={isSimpleMode}
        onToggleSimpleMode={() => setIsSimpleMode(!isSimpleMode)}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNotifications={() => {}}
        unreadNotificationsCount={2}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onResetData={handleResetAllData}
      />

      {/* Main Body View Switching */}
      <main className="flex-1 pb-20 lg:pb-8">
        {isSimpleMode ? (
          <SimpleModeView
            language={language}
            userProfile={userProfile}
            onSelectAction={(tab) => {
              setActiveTab(tab);
              setIsSimpleMode(false);
            }}
            onTriggerEmergency={() => setIsEmergencyOpen(true)}
            onExitSimpleMode={() => setIsSimpleMode(false)}
          />
        ) : (
          <>
            {activeTab === "home" && (
              <HomeOverview
                userProfile={userProfile}
                medications={medications}
                appointments={appointments}
                facilities={facilities}
                accessScore={accessScore}
                language={language}
                onNavigate={setActiveTab}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                onMarkMedTaken={(med) => {
                  const updated = medications.map((m) =>
                    m.id === med.id ? { ...m, isTakenToday: true } : m
                  );
                  setMedications(updated);
                  StorageManager.saveMedications(updated);
                }}
              />
            )}

            {activeTab === "assistant" && (
              <div className="max-w-4xl mx-auto p-4 sm:p-8 h-[85vh]">
                <VoiceAssistant
                  language={language}
                  onLanguageChange={setLanguage}
                  userProfile={userProfile}
                  isOffline={isOffline}
                  onTriggerEmergency={() => setIsEmergencyOpen(true)}
                  onNavigateTab={setActiveTab}
                  initialQuery={initialVoiceQuery}
                />
              </div>
            )}

            {activeTab === "healthcare" && (
              <HealthcareLocator
                facilities={facilities}
                language={language}
                onBookAppointment={(fac) => {
                  setActiveTab("appointments");
                }}
              />
            )}

            {activeTab === "medicines" && (
              <MedicineReminders
                medications={medications}
                language={language}
                userProfile={userProfile}
                onUpdateMedications={setMedications}
              />
            )}

            {activeTab === "appointments" && (
              <AppointmentCenter
                appointments={appointments}
                facilities={facilities}
                language={language}
                onUpdateAppointments={setAppointments}
              />
            )}

            {activeTab === "passport" && (
              <HealthPassport
                userProfile={userProfile}
                medications={medications}
                documents={documents}
                language={language}
                onUpdateProfile={setUserProfile}
              />
            )}

            {activeTab === "documents" && (
              <DocumentOrganizer
                documents={documents}
                language={language}
                onDocumentAdded={(newDoc) => {
                  setDocuments([newDoc, ...documents]);
                }}
                isOffline={isOffline}
              />
            )}

            {activeTab === "care_circle" && (
              <CareCircle
                caregivers={caregivers}
                userProfile={userProfile}
                language={language}
                onUpdateCaregivers={setCaregivers}
              />
            )}

            {activeTab === "doctor" && (
              <ProfessionalEscalation
                userProfile={userProfile}
                language={language}
                isOffline={isOffline}
              />
            )}

            {activeTab === "access_score" && (
              <HealthAccessScore scoreData={accessScore} language={language} />
            )}

            {activeTab === "community_map" && (
              <CommunityHealthMap regions={communityRegions} language={language} />
            )}

            {activeTab === "education" && (
              <HealthEducationHub articles={articles} language={language} />
            )}

            {activeTab === "more" && (
              <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                      Additional Rural Healthcare Tools
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                      Explore full ecosystem capabilities, caregiver network, community indices, and guides
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab("care_circle")}
                      className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/50 text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="text-2xl mb-2.5">👨‍👩‍👧</div>
                      <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">Family & Caregiver Circle</div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Manage permissions & SMS alerts</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("doctor")}
                      className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/50 text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="text-2xl mb-2.5">👨‍⚕️</div>
                      <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">Doctor Consultation Handoff</div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Generate clinical summary & request call</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("access_score")}
                      className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/50 text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="text-2xl mb-2.5">📊</div>
                      <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">Rural Health Access Score</div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Equity index & road proximity</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("community_map")}
                      className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/50 text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="text-2xl mb-2.5">🗺️</div>
                      <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">Community Health Map</div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Regional ambulance ETAs & clinic tiers</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("education")}
                      className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/50 text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="text-2xl mb-2.5">📚</div>
                      <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">Health Education Hub</div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">12 wellness guides with Telugu audio</p>
                    </button>

                    <button
                      onClick={() => setIsProfileOpen(true)}
                      className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/50 text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="text-2xl mb-2.5">⚙️</div>
                      <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">Profile & Data Reset</div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">ABHA ID & emergency settings</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around text-[10px] font-bold text-slate-500 shadow-sm">
        <button
          onClick={() => {
            setActiveTab("home");
            setIsSimpleMode(false);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === "home" && !isSimpleMode ? "text-blue-600 bg-blue-50/80 font-bold" : "hover:text-slate-700"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("assistant");
            setIsSimpleMode(false);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === "assistant" && !isSimpleMode ? "text-blue-600 bg-blue-50/80 font-bold" : "hover:text-slate-700"
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Voice</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("healthcare");
            setIsSimpleMode(false);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === "healthcare" && !isSimpleMode ? "text-blue-600 bg-blue-50/80 font-bold" : "hover:text-slate-700"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Clinics</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("medicines");
            setIsSimpleMode(false);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === "medicines" && !isSimpleMode ? "text-blue-600 bg-blue-50/80 font-bold" : "hover:text-slate-700"
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Meds</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("more");
            setIsSimpleMode(false);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === "more" && !isSimpleMode ? "text-blue-600 bg-blue-50/80 font-bold" : "hover:text-slate-700"
          }`}
        >
          <span className="text-base leading-none">⋯</span>
          <span>More</span>
        </button>
      </div>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        language={language}
        userProfile={userProfile}
        facilities={facilities}
      />

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
        onResetAllData={handleResetAllData}
        language={language}
      />
    </div>
  );
}

export default App;
