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
import { api } from "./lib/api";
import {
  mapDbMedication,
  mapDbAppointment,
  mapDbDocument,
  mapDbCaregiver,
  mapDbFacility,
  mapDbDoctor,
} from "./utils/adapters";
import { Navbar } from "./components/Navbar";
import { SidebarNavigation } from "./components/SidebarNavigation";
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
import { DoctorDirectory } from "./components/DoctorDirectory";
import { DoctorPortalView } from "./components/DoctorPortalView";
import { HospitalPortalView } from "./components/HospitalPortalView";
import {
  Home,
  Mic,
  Building2,
  Pill,
  Video,
  FileText,
  Clock,
  BedDouble,
  Ambulance,
  Stethoscope,
} from "lucide-react";

export function App() {
  // App-level State
  const [language, setLanguage] = useState<Language>("te"); // Default to Telugu
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Auth & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    StorageManager.isAuthenticated()
  );
  const [currentAccount, setCurrentAccount] = useState<AuthAccount>(() =>
    StorageManager.getAccount()
  );

  // Determine initial active tab based on account role
  const getDefaultTabForRole = (role?: string) => {
    if (role === "doctor") return "doctor-queue";
    if (role === "hospital") return "hospital-beds";
    return "home";
  };

  const [activeTab, setActiveTab] = useState<string>(() =>
    getDefaultTabForRole(StorageManager.getAccount()?.role)
  );

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
  const [doctors, setDoctors] = useState<Doctor[]>(StorageManager.getDoctors());

  // Initialize storage and fetch dynamic PostgreSQL data on mount and auth change
  useEffect(() => {
    StorageManager.initialize();
    setIsOffline(StorageManager.isSimulatedOffline());
    reloadAllState();
    if (isAuthenticated) {
      syncWithPostgres();
    }
  }, [isAuthenticated, currentAccount?.id]);

  const syncWithPostgres = async () => {
    try {
      // 1. Fetch Profile & Health Score
      const profileData = await api.getProfile().catch(() => null);
      if (profileData?.profile) {
        const p = profileData.profile;
        const mappedProfile: UserProfile = {
          id: String(p.id),
          name: p.name,
          age: 48,
          gender: "Male",
          phone: p.phone || "+91 98490 12345",
          email: p.email,
          preferredLanguage: (p.preferredLanguage as Language) || language,
          location: `${p.village || "Kondapur"}, ${p.district || "Nizamabad"}`,
          district: p.district || "Nizamabad",
          state: "Telangana",
          abhaId: p.abhaNumber || "91-4829-1029-4821",
          emergencyContacts: [
            {
              name: p.emergencyContactName || "Laxmi Rao",
              relationship: p.emergencyContactRelation || "Spouse",
              phone: p.emergencyContactPhone || "+91 98490 54321",
              isPrimary: true,
            },
          ],
          bloodGroup: p.bloodGroup || "O+",
          allergies: ["Penicillin (mild rash)"],
          importantHealthNotes: "Hypertension & T2DM controlled on generic PMBJP medicines.",
        };
        setUserProfile(mappedProfile);
        StorageManager.saveProfile(mappedProfile);
      }

      if (profileData?.score) {
        const sc = profileData.score;
        setAccessScore({
          overallScore: sc.overallScore || 82,
          proximityScore: sc.facilityProximity || 86,
          pharmacyScore: sc.genericMedSavings || 94,
          emergencyScore: sc.emergencyReadiness || 76,
          connectivityScore: sc.vaccinationCoverage || 92,
        });
      }

      // 2. Fetch Dynamic Medications
      const medsData = await api.getMedications().catch(() => null);
      if (Array.isArray(medsData) && medsData.length > 0) {
        const mappedMeds = medsData.map(mapDbMedication);
        setMedications(mappedMeds);
        StorageManager.saveMedications(mappedMeds);
      }

      // 3. Fetch Dynamic Appointments
      const apptsData = await api.getAppointments().catch(() => null);
      if (Array.isArray(apptsData) && apptsData.length > 0) {
        const mappedAppts = apptsData.map(mapDbAppointment);
        setAppointments(mappedAppts);
        StorageManager.saveAppointments(mappedAppts);
      }

      // 4. Fetch Dynamic Health Documents
      const docsData = await api.getDocuments().catch(() => null);
      if (Array.isArray(docsData) && docsData.length > 0) {
        const mappedDocs = docsData.map(mapDbDocument);
        setDocuments(mappedDocs);
        StorageManager.saveDocuments(mappedDocs);
      }

      // 5. Fetch Dynamic Caregivers
      const cgData = await api.getCaregivers().catch(() => null);
      if (Array.isArray(cgData) && cgData.length > 0) {
        const mappedCg = cgData.map(mapDbCaregiver);
        setCaregivers(mappedCg);
        StorageManager.saveCaregivers(mappedCg);
      }

      // 6. Fetch Live Hospital Facilities
      const facData = await api.getFacilities().catch(() => null);
      if (Array.isArray(facData) && facData.length > 0) {
        const mappedFac = facData.map(mapDbFacility);
        setFacilities(mappedFac);
        StorageManager.saveFacilities(mappedFac);
      }

      // 7. Fetch Live Doctors
      const docData = await api.getAllDoctors().catch(() => null);
      if (Array.isArray(docData) && docData.length > 0) {
        const mappedDocs = docData.map(mapDbDoctor);
        setDoctors(mappedDocs);
        StorageManager.saveDoctors(mappedDocs);
      }
    } catch (err) {
      console.warn("PostgreSQL live sync note (using cached local fallback):", err);
    }
  };

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
    setDoctors(StorageManager.getDoctors());
    const acc = StorageManager.getAccount();
    setCurrentAccount(acc);
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

    // Switch to role-specific default view
    if (account.role === "doctor") {
      setActiveTab("doctor-queue");
    } else if (account.role === "hospital") {
      setActiveTab("hospital-beds");
    } else {
      setActiveTab("home");
    }
  };

  const handleLogout = () => {
    StorageManager.logout();
    setIsAuthenticated(false);
    setActiveTab("home");
  };

  // If not authenticated, show the Role-Isolated Login & Sign Up landing portal
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

  const userRole = currentAccount?.role || "user";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans selection:bg-blue-100">
      {/* Left Collapsible & Mobile Drawer Sidebar */}
      <SidebarNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentAccount={currentAccount}
        onOpenAuthModal={() => {}}
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
          onOpenAuthModal={() => {}}
          onLogout={handleLogout}
        />

        {/* Main View Switching */}
        <main className="flex-1 pb-20 lg:pb-8">
          {/* 1. DOCTOR WORKSPACE: Isolated to Doctors */}
          {userRole === "doctor" ? (
            <DoctorPortalView
              currentAccount={currentAccount}
              language={language}
              initialTab={
                activeTab === "doctor-rx"
                  ? "rx"
                  : activeTab === "doctor-history"
                  ? "history"
                  : "queue"
              }
              onTabChange={(tab) => setActiveTab(`doctor-${tab}`)}
            />
          ) : /* 2. HOSPITAL OPERATIONS: Isolated to Hospital Admin */
          userRole === "hospital" ? (
            <HospitalPortalView
              currentAccount={currentAccount}
              language={language}
              initialTab={
                activeTab === "hospital-triage"
                  ? "triage"
                  : activeTab === "hospital-pharmacy"
                  ? "pharmacy"
                  : activeTab === "hospital-staff"
                  ? "staff"
                  : "beds"
              }
              onTabChange={(tab) => setActiveTab(`hospital-${tab}`)}
            />
          ) : /* 3. PATIENT CARE: Isolated to Patients */
          isSimpleMode ? (
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

              {activeTab === "caregivers" && (
                <CareCircle
                  caregivers={caregivers}
                  userProfile={userProfile}
                  language={language}
                  onUpdateCaregivers={setCaregivers}
                />
              )}

              {/* Fallback to home for unrecognized tabs in patient view */}
              {!["home", "assistant", "healthcare", "doctors", "doctor", "medicines", "appointments", "passport", "records", "documents", "caregivers"].includes(activeTab) && (
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
            </>
          )}
        </main>

        {/* Role-Specific Mobile Bottom Navigation Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around text-[10px] font-bold text-slate-500 shadow-sm">
          {userRole === "doctor" ? (
            <>
              <button
                onClick={() => setActiveTab("doctor-queue")}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === "doctor-queue"
                    ? "text-emerald-600 bg-emerald-50/80 font-bold"
                    : "hover:text-slate-700"
                }`}
              >
                <Video className="w-4 h-4" />
                <span>OPD Queue</span>
              </button>
              <button
                onClick={() => setActiveTab("doctor-rx")}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === "doctor-rx"
                    ? "text-emerald-600 bg-emerald-50/80 font-bold"
                    : "hover:text-slate-700"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Rx Writer</span>
              </button>
              <button
                onClick={() => setActiveTab("doctor-history")}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === "doctor-history"
                    ? "text-emerald-600 bg-emerald-50/80 font-bold"
                    : "hover:text-slate-700"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>History</span>
              </button>
            </>
          ) : userRole === "hospital" ? (
            <>
              <button
                onClick={() => setActiveTab("hospital-beds")}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === "hospital-beds"
                    ? "text-purple-600 bg-purple-50/80 font-bold"
                    : "hover:text-slate-700"
                }`}
              >
                <BedDouble className="w-4 h-4" />
                <span>Beds</span>
              </button>
              <button
                onClick={() => setActiveTab("hospital-triage")}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === "hospital-triage"
                    ? "text-purple-600 bg-purple-50/80 font-bold"
                    : "hover:text-slate-700"
                }`}
              >
                <Ambulance className="w-4 h-4" />
                <span>108 Fleet</span>
              </button>
              <button
                onClick={() => setActiveTab("hospital-pharmacy")}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === "hospital-pharmacy"
                    ? "text-purple-600 bg-purple-50/80 font-bold"
                    : "hover:text-slate-700"
                }`}
              >
                <Pill className="w-4 h-4" />
                <span>Jan Aushadhi</span>
              </button>
              <button
                onClick={() => setActiveTab("hospital-staff")}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === "hospital-staff"
                    ? "text-purple-600 bg-purple-50/80 font-bold"
                    : "hover:text-slate-700"
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>Staff</span>
              </button>
            </>
          ) : (
            <>
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
            </>
          )}

          <button
            onClick={() => setIsSidebarMobileOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer text-slate-600 hover:text-slate-900"
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

      {/* User Profile & Health Info Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
        language={language}
        onLanguageChange={setLanguage}
        onResetData={handleResetAllData}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        currentAccount={currentAccount}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
