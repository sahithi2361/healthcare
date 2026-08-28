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
  Doctor,
  AuthAccount,
} from "./types";
import { StorageManager } from "./utils/storage";
import { INITIAL_DOCTORS } from "./data/initialData";
import { Navbar } from "./components/Navbar";
import { SidebarNavigation } from "./components/SidebarNavigation";
import { AuthModal } from "./components/AuthModal";
import { AuthLandingPage } from "./components/AuthLandingPage";
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
import { DoctorDirectory } from "./components/DoctorDirectory";
import { DoctorPortalView } from "./components/DoctorPortalView";
import { HospitalPortalView } from "./components/HospitalPortalView";
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

  // Auth & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => StorageManager.isAuthenticated());
  const [currentAccount, setCurrentAccount] = useState<AuthAccount>(StorageManager.getAccount());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState<boolean>(false);

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
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);

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
    setCurrentAccount(StorageManager.getAccount());
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

  const handleLogin = (account: AuthAccount) => {
    setCurrentAccount(account);
    StorageManager.saveAccount(account);
    StorageManager.setAuthenticated(true);
    setIsAuthenticated(true);

    // If logging in as doctor or hospital, switch to their respective workspace
    if (account.role === "doctor") {
      setActiveTab("doctor-portal");
    } else if (account.role === "hospital") {
      setActiveTab("hospital-portal");
    } else if (account.role === "asha") {
      setActiveTab("community");
    } else {
      setActiveTab("home");
    }
  };

  const handleLogout = () => {
    StorageManager.logout();
    setIsAuthenticated(false);
  };

  // If not authenticated, show the Login & Sign Up landing portal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 selection:bg-blue-600 selection:text-white">
        <AuthLandingPage
          onLogin={handleLogin}
          language={language}
          onLanguageChange={setLanguage}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
        />
        {/* Emergency 108 SOS Modal */}
        <EmergencyModal
          isOpen={isEmergencyOpen}
          onClose={() => setIsEmergencyOpen(false)}
          language={language}
          userProfile={userProfile}
          facilities={facilities}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans selection:bg-blue-100">
      {/* Left Collapsible & Mobile Drawer Sidebar */}
      <SidebarNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentAccount={currentAccount}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        language={language}
        onLanguageChange={setLanguage}
        isSimpleMode={isSimpleMode}
        onToggleSimpleMode={() => setIsSimpleMode(!isSimpleMode)}
        isOnline={!isOffline}
        isMobileOpen={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Multilingual Navbar */}
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
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onResetData={handleResetAllData}
          onOpenSidebar={() => setIsSidebarMobileOpen(true)}
          currentAccount={currentAccount}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main View Switching */}
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
                    onSelectDoctor={(_doc) => {
                      setActiveTab("appointments");
                    }}
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

              {(activeTab === "doctors" || activeTab === "doctor") && (
                <DoctorDirectory
                  doctors={doctors}
                  language={language}
                  onBookAppointment={(doc) => {
                    setActiveTab("appointments");
                  }}
                  onStartTeleconsult={(doc) => {
                    setActiveTab("doctor-portal");
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

              {(activeTab === "records" || activeTab === "documents") && (
                <DocumentOrganizer
                  documents={documents}
                  language={language}
                  onDocumentAdded={(newDoc) => {
                    setDocuments([newDoc, ...documents]);
                  }}
                  isOffline={isOffline}
                />
              )}

              {activeTab === "doctor-portal" && (
                <DoctorPortalView
                  currentAccount={currentAccount}
                  language={language}
                />
              )}

              {activeTab === "hospital-portal" && (
                <HospitalPortalView
                  currentAccount={currentAccount}
                  language={language}
                />
              )}

              {activeTab === "caregivers" && (
                <CareCircle
                  caregivers={caregivers}
                  userProfile={userProfile}
                  language={language}
                  onUpdateCaregivers={setCaregivers}
                />
              )}

              {(activeTab === "score" || activeTab === "access_score") && (
                <HealthAccessScore scoreData={accessScore} language={language} />
              )}

              {(activeTab === "community" || activeTab === "community_map") && (
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
                        Rural Healthcare & Clinical Ecosystem
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                        Access specialized portals, care circle management, ASHA worker tools, and health scoring
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => setActiveTab("doctor-portal")}
                        className="p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50 text-left transition-all cursor-pointer group shadow-2xs"
                      >
                        <div className="text-2xl mb-2.5">🩺</div>
                        <div className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">
                          Doctor Workspace & Tele-OPD
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          Video consult queue & digital e-Prescriptions (Rx)
                        </p>
                      </button>

                      <button
                        onClick={() => setActiveTab("hospital-portal")}
                        className="p-5 rounded-2xl border border-slate-200/80 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-50 text-left transition-all cursor-pointer group shadow-2xs"
                      >
                        <div className="text-2xl mb-2.5">🏢</div>
                        <div className="font-bold text-slate-800 text-sm group-hover:text-purple-700 transition-colors">
                          Hospital & CHC Operations
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          Real-time ICU/Oxygen beds & 108 Ambulance GPS
                        </p>
                      </button>

                      <button
                        onClick={() => setActiveTab("caregivers")}
                        className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/50 text-left transition-all cursor-pointer group shadow-2xs"
                      >
                        <div className="text-2xl mb-2.5">👨‍👩‍👧</div>
                        <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                          Family & Caregiver Circle
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          Manage emergency SMS alerts & family access
                        </p>
                      </button>

                      <button
                        onClick={() => setActiveTab("score")}
                        className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/50 text-left transition-all cursor-pointer group shadow-2xs"
                      >
                        <div className="text-2xl mb-2.5">📊</div>
                        <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                          Rural Health Access Score
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          Equity index, road proximity & resource index
                        </p>
                      </button>

                      <button
                        onClick={() => setActiveTab("community")}
                        className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/50 text-left transition-all cursor-pointer group shadow-2xs"
                      >
                        <div className="text-2xl mb-2.5">🗺️</div>
                        <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                          Community Health Map & ASHA
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          Village indices, ambulance ETAs & clinic tiers
                        </p>
                      </button>

                      <button
                        onClick={() => setActiveTab("education")}
                        className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/50 text-left transition-all cursor-pointer group shadow-2xs"
                      >
                        <div className="text-2xl mb-2.5">📚</div>
                        <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                          Health Education Hub
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          12 rural wellness guides with Telugu & Hindi audio
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around text-[10px] font-bold text-slate-500 shadow-sm">
          <button
            onClick={() => {
              setActiveTab("home");
              setIsSimpleMode(false);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              activeTab === "home" && !isSimpleMode
                ? "text-blue-600 bg-blue-50/80 font-bold"
                : "hover:text-slate-700"
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
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              activeTab === "assistant" && !isSimpleMode
                ? "text-blue-600 bg-blue-50/80 font-bold"
                : "hover:text-slate-700"
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
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              activeTab === "healthcare" && !isSimpleMode
                ? "text-blue-600 bg-blue-50/80 font-bold"
                : "hover:text-slate-700"
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
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              activeTab === "medicines" && !isSimpleMode
                ? "text-blue-600 bg-blue-50/80 font-bold"
                : "hover:text-slate-700"
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Meds</span>
          </button>

          <button
            onClick={() => setIsSidebarMobileOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer text-blue-600 hover:text-blue-800"
          >
            <span className="text-base leading-none">☰</span>
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* Emergency 108 SOS Modal */}
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
        onLogout={() => {
          setIsProfileOpen(false);
          handleLogout();
        }}
      />

      {/* Multi-Role & Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentAccount={currentAccount}
        onLogin={handleLogin}
        language={language}
      />
    </div>
  );
}

export default App;
