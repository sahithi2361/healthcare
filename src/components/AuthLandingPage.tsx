import React, { useState, useEffect } from "react";
import {
  User,
  Stethoscope,
  Building2,
  Lock,
  Phone,
  ArrowRight,
  ShieldAlert,
  Volume2,
  Heart,
  CheckCircle2,
  Mail,
  Award,
  IdCard,
  MapPin,
} from "lucide-react";
import { UserRole, AuthAccount, Language } from "../types";
import { StorageManager } from "../utils/storage";
import { api } from "../lib/api";

interface AuthLandingPageProps {
  onLogin: (account: AuthAccount) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenEmergency: () => void;
}

type PortalType = "patient" | "doctor" | "hospital";

export const AuthLandingPage: React.FC<AuthLandingPageProps> = ({
  onLogin,
  language,
  onLanguageChange,
  onOpenEmergency,
}) => {
  // Current active portal page
  const [activePortal, setActivePortal] = useState<PortalType>("patient");

  // Auth mode (Sign In vs Sign Up)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loginMethod, setLoginMethod] = useState<"otp" | "password">("otp");

  // OTP State
  const [otpStep, setOtpStep] = useState<"phone_input" | "otp_verify">("phone_input");
  const [otpValue, setOtpValue] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);

  // Common Fields
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");

  // Patient Fields
  const [patientAge, setPatientAge] = useState<number | "">("");
  const [patientGender, setPatientGender] = useState("Female");
  const [bloodGroup, setBloodGroup] = useState("B+");

  // Doctor Fields
  const [mciLicense, setMciLicense] = useState("");
  const [specialty, setSpecialty] = useState("General Physician");
  const [doctorFacility, setDoctorFacility] = useState("");
  const [experienceYears, setExperienceYears] = useState<number | "">(8);

  // Hospital Fields entered at creation
  const [facilityName, setFacilityName] = useState("");
  const [facilityType, setFacilityType] = useState("Community Health Centre (CHC)");
  const [hospitalRegNo, setHospitalRegNo] = useState("");
  const [bedCapacity, setBedCapacity] = useState<number | "">(120);
  const [hospitalAddress, setHospitalAddress] = useState("Station Road, Old Town");
  const [hospitalDistrict, setHospitalDistrict] = useState("Mahabubnagar");
  const [hospitalPincode, setHospitalPincode] = useState("509001");
  const [hospitalEmergencyPhone, setHospitalEmergencyPhone] = useState("108 / 08542-242301");
  const [hasEmergency, setHasEmergency] = useState(true);
  const [hasMaternity, setHasMaternity] = useState(true);
  const [hasPharmacy, setHasPharmacy] = useState(true);
  const [hasTeleconsult, setHasTeleconsult] = useState(true);
  const [hasPathologyLab, setHasPathologyLab] = useState(true);
  const [hasImmunization, setHasImmunization] = useState(true);

  // Audio prompt voice simulation
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (otpStep === "otp_verify" && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, otpTimer]);

  const handlePortalSwitch = (portal: PortalType) => {
    setActivePortal(portal);
    setAuthMode("login");
    setOtpStep("phone_input");
    setOtpValue("");
    setOtpSuccessMsg(null);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setIsOtpSending(true);
    setTimeout(() => {
      setIsOtpSending(false);
      setOtpStep("otp_verify");
      setOtpTimer(30);
      setOtpSuccessMsg(`OTP sent to +91 ${phone}. (Enter OTP: 123456)`);
      setTimeout(() => {
        setOtpValue("123456");
      }, 600);
    }, 450);
  };

  const handleVerifyOtpAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length < 4) return;

    const userRole: UserRole =
      activePortal === "doctor" ? "doctor" : activePortal === "hospital" ? "hospital" : "user";

    const account: AuthAccount = {
      id: `acc_${activePortal}_${Date.now()}`,
      role: userRole,
      name:
        fullName.trim() ||
        (activePortal === "doctor"
          ? "Dr. K. Srinivas Rao"
          : activePortal === "hospital"
          ? "District Hospital Operations"
          : "Lakshmi Devi"),
      phone: phone.startsWith("+") ? phone : `+91 ${phone}`,
      email: email.trim() || `${phone.replace(/\D/g, "")}@ruralhealth.gov.in`,
      location: location.trim() || `${hospitalDistrict}, Telangana`,
      ...(userRole === "user" && {
        age: Number(patientAge) || 45,
        gender: patientGender,
        bloodGroup: bloodGroup,
        abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
          1000 + Math.random() * 9000
        )}-${Math.floor(1000 + Math.random() * 9000)}`,
      }),
      ...(userRole === "doctor" && {
        licenseNumber: mciLicense.trim() || `TS-MCI-${Math.floor(10000 + Math.random() * 90000)}`,
        specialty: specialty || "General Physician",
        qualification: "MBBS, MD",
        facilityName: doctorFacility.trim() || "Primary Health Centre (PHC), Bhoothpur",
        experienceYears: Number(experienceYears) || 10,
      }),
      ...(userRole === "hospital" && {
        facilityId: `fac_${Date.now()}`,
        facilityType: facilityType || "District General Hospital",
        registrationNumber: hospitalRegNo.trim() || `TS-HOSP-REG-${Math.floor(1000 + Math.random() * 9000)}`,
        bedCapacity: Number(bedCapacity) || 150,
      }),
    };

    if (userRole === "hospital") {
      api.createHospitalFacility({
        name: account.name,
        type: facilityType,
        registrationNumber: hospitalRegNo.trim() || `TS-HOSP-${Math.floor(1000 + Math.random() * 9000)}`,
        address: hospitalAddress,
        district: hospitalDistrict,
        state: "Telangana",
        pincode: hospitalPincode,
        phone: account.phone,
        emergencyPhone: hospitalEmergencyPhone,
        totalBeds: Number(bedCapacity) || 120,
        occupiedBeds: Math.round((Number(bedCapacity) || 120) * 0.65),
        totalIcu: 15,
        occupiedIcu: 10,
        totalOxygen: 30,
        occupiedOxygen: 18,
        totalMaternity: 25,
        occupiedMaternity: 14,
        hasEmergency,
        hasMaternity,
        hasPharmacy,
        hasTeleconsult,
        hasPathologyLab,
        hasImmunization,
      }).catch((err) => console.warn("Facility registration sync:", err));
    }

    StorageManager.registerOrUpdateAccount(account);
    StorageManager.setAuthenticated(true);
    onLogin(account);
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) return;

    const userRole: UserRole =
      activePortal === "doctor" ? "doctor" : activePortal === "hospital" ? "hospital" : "user";

    const account: AuthAccount = {
      id: `acc_${activePortal}_${Date.now()}`,
      role: userRole,
      name:
        fullName.trim() ||
        (activePortal === "doctor"
          ? "Dr. K. Srinivas Rao"
          : activePortal === "hospital"
          ? "District Hospital Operations"
          : "Lakshmi Devi"),
      phone: phone.startsWith("+") ? phone : `+91 ${phone}`,
      email: email.trim() || `${phone.replace(/\D/g, "")}@ruralhealth.gov.in`,
      location: location.trim() || `${hospitalDistrict}, Telangana`,
      ...(userRole === "user" && {
        age: Number(patientAge) || 45,
        gender: patientGender,
        bloodGroup: bloodGroup,
        abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
          1000 + Math.random() * 9000
        )}-${Math.floor(1000 + Math.random() * 9000)}`,
      }),
      ...(userRole === "doctor" && {
        licenseNumber: mciLicense.trim() || `TS-MCI-${Math.floor(10000 + Math.random() * 90000)}`,
        specialty: specialty || "General Physician",
        qualification: "MBBS, MD",
        facilityName: doctorFacility.trim() || "Primary Health Centre (PHC), Bhoothpur",
        experienceYears: Number(experienceYears) || 10,
      }),
      ...(userRole === "hospital" && {
        facilityId: `fac_${Date.now()}`,
        facilityType: facilityType || "District General Hospital",
        registrationNumber: hospitalRegNo.trim() || `TS-HOSP-REG-${Math.floor(1000 + Math.random() * 9000)}`,
        bedCapacity: Number(bedCapacity) || 150,
      }),
    };

    if (userRole === "hospital") {
      api.createHospitalFacility({
        name: account.name,
        type: facilityType,
        registrationNumber: hospitalRegNo.trim() || `TS-HOSP-${Math.floor(1000 + Math.random() * 9000)}`,
        address: hospitalAddress,
        district: hospitalDistrict,
        state: "Telangana",
        pincode: hospitalPincode,
        phone: account.phone,
        emergencyPhone: hospitalEmergencyPhone,
        totalBeds: Number(bedCapacity) || 120,
        occupiedBeds: Math.round((Number(bedCapacity) || 120) * 0.65),
        totalIcu: 15,
        occupiedIcu: 10,
        totalOxygen: 30,
        occupiedOxygen: 18,
        totalMaternity: 25,
        occupiedMaternity: 14,
        hasEmergency,
        hasMaternity,
        hasPharmacy,
        hasTeleconsult,
        hasPathologyLab,
        hasImmunization,
      }).catch((err) => console.warn("Facility registration sync:", err));
    }

    StorageManager.registerOrUpdateAccount(account);
    StorageManager.setAuthenticated(true);
    onLogin(account);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    const userRole: UserRole =
      activePortal === "doctor" ? "doctor" : activePortal === "hospital" ? "hospital" : "user";

    const account: AuthAccount = {
      id: `acc_${activePortal}_${Date.now()}`,
      role: userRole,
      name: fullName.trim(),
      phone: phone.startsWith("+") ? phone : `+91 ${phone}`,
      email: email.trim() || `${phone.replace(/\D/g, "")}@ruralhealth.gov.in`,
      location: location.trim() || `${hospitalDistrict}, Telangana`,
      ...(userRole === "user" && {
        age: Number(patientAge) || 30,
        gender: patientGender,
        bloodGroup: bloodGroup,
        abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
          1000 + Math.random() * 9000
        )}-${Math.floor(1000 + Math.random() * 9000)}`,
      }),
      ...(userRole === "doctor" && {
        licenseNumber: mciLicense.trim() || `TS-MCI-${Math.floor(10000 + Math.random() * 90000)}`,
        specialty: specialty || "General Physician",
        qualification: "MBBS, MD",
        facilityName: doctorFacility.trim() || "Bhoothpur Health Centre",
        experienceYears: Number(experienceYears) || 5,
      }),
      ...(userRole === "hospital" && {
        facilityId: `fac_${Date.now()}`,
        facilityType: facilityType || "Community Health Centre (CHC)",
        registrationNumber: hospitalRegNo.trim() || `TS-HOSP-REG-${Math.floor(1000 + Math.random() * 9000)}`,
        bedCapacity: Number(bedCapacity) || 100,
      }),
    };

    if (userRole === "hospital") {
      api.createHospitalFacility({
        name: account.name,
        type: facilityType,
        registrationNumber: hospitalRegNo.trim() || `TS-HOSP-${Math.floor(1000 + Math.random() * 9000)}`,
        address: hospitalAddress,
        district: hospitalDistrict,
        state: "Telangana",
        pincode: hospitalPincode,
        phone: account.phone,
        emergencyPhone: hospitalEmergencyPhone,
        totalBeds: Number(bedCapacity) || 120,
        occupiedBeds: Math.round((Number(bedCapacity) || 120) * 0.65),
        totalIcu: 15,
        occupiedIcu: 10,
        totalOxygen: 30,
        occupiedOxygen: 18,
        totalMaternity: 25,
        occupiedMaternity: 14,
        hasEmergency,
        hasMaternity,
        hasPharmacy,
        hasTeleconsult,
        hasPathologyLab,
        hasImmunization,
      }).catch((err) => console.warn("Facility registration sync:", err));
    }

    StorageManager.registerOrUpdateAccount(account);
    StorageManager.setAuthenticated(true);
    onLogin(account);
  };

  const handlePlayVoiceHint = () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      const utterance = new SpeechSynthesisUtterance();
      if (language === "te") {
        utterance.text =
          activePortal === "patient"
            ? "నమస్కారం. పేషెంట్ పోర్టల్‌కు స్వాగతం. మీ మొబైల్ నంబర్ నమోదు చేసి లాగిన్ అవ్వండి."
            : activePortal === "doctor"
            ? "వైద్యుల పోర్టల్. దయచేసి మీ రిజిస్ట్రేషన్ నంబర్ లేదా మొబైల్ తో లాగిన్ అవ్వండి."
            : "ఆసుపత్రి పోర్టల్. మీ ఆసుపత్రి ఐడీ ద్వారా లాగిన్ అవ్వండి.";
        utterance.lang = "te-IN";
      } else if (language === "hi") {
        utterance.text =
          activePortal === "patient"
            ? "नमस्ते। मरीज पोर्टल में आपका स्वागत है। मोबाइल नंबर दर्ज कर लॉगिन करें।"
            : activePortal === "doctor"
            ? "डॉक्टर पोर्टल। अपने रजिस्ट्रेशन नंबर या मोबाइल से लॉगिन करें।"
            : "अस्पताल प्रबंधन पोर्टल। अस्पताल आईडी से लॉगिन करें।";
        utterance.lang = "hi-IN";
      } else {
        utterance.text =
          activePortal === "patient"
            ? "Welcome to the Patient Portal. Please sign in with your mobile number."
            : activePortal === "doctor"
            ? "Welcome to the Doctor Portal. Please sign in with your credentials."
            : "Welcome to Hospital Operations Portal. Please sign in.";
        utterance.lang = "en-IN";
      }
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-blue-100">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 leading-none">
                Sehat Saathi <span className="text-blue-600">AI</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {language === "te"
                ? "గ్రామీణ ఆరోగ్య సంరక్షణ వేదిక"
                : language === "hi"
                ? "ग्रामीण स्वास्थ्य रक्षा पोर्टल"
                : "Rural Healthcare Companion"}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handlePlayVoiceHint}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              isPlayingAudio
                ? "bg-blue-600 text-white border-blue-600 animate-pulse"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs"
            }`}
            title="Listen to voice instructions"
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">
              {language === "te" ? "వాయిస్ సహాయం" : language === "hi" ? "आवाज सुनें" : "Voice Guide"}
            </span>
          </button>

          {/* Language Options */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => onLanguageChange("te")}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                language === "te"
                  ? "bg-white text-blue-600 font-bold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => onLanguageChange("hi")}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                language === "hi"
                  ? "bg-white text-blue-600 font-bold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => onLanguageChange("en")}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                language === "en"
                  ? "bg-white text-blue-600 font-bold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={onOpenEmergency}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="108 Emergency SOS"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>108 SOS</span>
          </button>
        </div>
      </header>

      {/* Main Centered Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-10 flex flex-col items-center justify-center space-y-6">
        {/* Dedicated Portal Page Switcher */}
        <div className="w-full max-w-xl bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-300/80 shadow-2xs">
          <button
            type="button"
            onClick={() => handlePortalSwitch("patient")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activePortal === "patient"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-4 h-4 text-blue-600" />
            <span>{language === "te" ? "పేషెంట్ పోర్టల్" : language === "hi" ? "मरीज पोर्टल" : "Patient Portal"}</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch("doctor")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activePortal === "doctor"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            <span>{language === "te" ? "వైద్యుల పోర్టల్" : language === "hi" ? "डॉक्टर पोर्टल" : "Doctor Portal"}</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch("hospital")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activePortal === "hospital"
                ? "bg-white text-purple-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>{language === "te" ? "ఆసుపత్రి పోర్టల్" : language === "hi" ? "अस्पताल पोर्टल" : "Hospital Portal"}</span>
          </button>
        </div>

        {/* Active Dedicated Portal Card */}
        <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Portal Header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-1 bg-slate-100 text-slate-700">
              {activePortal === "patient" && (
                <>
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Patient & Family Services</span>
                </>
              )}
              {activePortal === "doctor" && (
                <>
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Doctor Tele-OPD & Digital Rx</span>
                </>
              )}
              {activePortal === "hospital" && (
                <>
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Hospital & CHC Operations</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {activePortal === "patient"
                ? authMode === "login"
                  ? language === "te"
                    ? "పేషెంట్ లాగిన్"
                    : language === "hi"
                    ? "मरीज लॉगिन"
                    : "Patient Sign In"
                  : language === "te"
                  ? "పేషెంట్ రిజిస్ట్రేషన్"
                  : language === "hi"
                  ? "मरीज पंजीकरण"
                  : "Patient Sign Up"
                : activePortal === "doctor"
                ? authMode === "login"
                  ? language === "te"
                    ? "వైద్యుల లాగిన్"
                    : language === "hi"
                    ? "डॉक्टर लॉगिन"
                    : "Doctor Sign In"
                  : language === "te"
                  ? "వైద్యుల నమోదు"
                  : language === "hi"
                  ? "डॉक्टर पंजीकरण"
                  : "Doctor Registration"
                : authMode === "login"
                ? language === "te"
                  ? "ఆసుపత్రి లాగిన్"
                  : language === "hi"
                  ? "अस्पताल लॉगिन"
                  : "Hospital Sign In"
                : language === "te"
                ? "ఆసుపత్రి నమోదు"
                : language === "hi"
                ? "अस्पताल पंजीकरण"
                : "Hospital Registration"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500">
              {activePortal === "patient"
                ? "Access Saathi Voice AI, nearby PHC/CHC facilities, medicines and records"
                : activePortal === "doctor"
                ? "Manage patient teleconsultation queues and write digital prescriptions"
                : "Manage real-time ICU/Oxygen beds, 108 ambulance fleet and pharmacy stock"}
            </p>
          </div>

          {/* Mode Switch Tabs: Login vs Sign Up */}
          <div className="flex bg-slate-100 p-1 rounded-2xl max-w-xs mx-auto border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setOtpStep("phone_input");
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                authMode === "login"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setOtpStep("phone_input");
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                authMode === "signup"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Sign In Form */}
          {authMode === "login" && (
            <div className="space-y-4">
              {/* Method Switch: Mobile OTP or Password */}
              <div className="flex justify-center gap-6 text-xs font-semibold border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("otp");
                    setOtpStep("phone_input");
                  }}
                  className={`pb-1 border-b-2 transition-colors cursor-pointer ${
                    loginMethod === "otp"
                      ? "border-blue-600 text-blue-600 font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  📱 Mobile OTP
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("password")}
                  className={`pb-1 border-b-2 transition-colors cursor-pointer ${
                    loginMethod === "password"
                      ? "border-blue-600 text-blue-600 font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🔒 Password Login
                </button>
              </div>

              {loginMethod === "otp" ? (
                otpStep === "phone_input" ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {activePortal === "patient"
                          ? "Patient Mobile Number"
                          : activePortal === "doctor"
                          ? "Doctor Registered Mobile Number"
                          : "Hospital Admin Mobile Number"}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 9848012345"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isOtpSending}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      {isOtpSending ? "Sending OTP..." : "Send Verification OTP"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtpAndLogin} className="space-y-4">
                    {otpSuccessMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-medium text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{otpSuccessMsg}</span>
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Enter 6-Digit OTP
                        </label>
                        <button
                          type="button"
                          onClick={() => setOtpStep("phone_input")}
                          className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Change Number
                        </button>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        placeholder="123456"
                        className="w-full px-4 py-3 text-center tracking-widest text-lg font-bold bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      Verify & Access {activePortal === "patient" ? "Patient Dashboard" : activePortal === "doctor" ? "Doctor OPD" : "Hospital Operations"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )
              ) : (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {activePortal === "patient"
                        ? "Mobile Number or ABHA ID"
                        : activePortal === "doctor"
                        ? "MCI Reg No / Registered Email"
                        : "Hospital ID / Registered Email"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={
                          activePortal === "patient"
                            ? "9848012345"
                            : activePortal === "doctor"
                            ? "TS-MCI-48291"
                            : "TS-HOSP-001"
                        }
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Sign Up Form */}
          {authMode === "signup" && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {activePortal === "patient"
                      ? "Patient Full Name"
                      : activePortal === "doctor"
                      ? "Doctor Full Name"
                      : "Hospital / Facility Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={
                      activePortal === "patient"
                        ? "e.g. Lakshmi Devi"
                        : activePortal === "doctor"
                        ? "e.g. Dr. K. Srinivas Rao"
                        : "e.g. Community Health Centre"
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9848012345"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / Mandal / District
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bhoothpur Mandal, Mahabubnagar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Patient Specific Fields */}
              {activePortal === "patient" && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value ? Number(e.target.value) : "")}
                      placeholder="45"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none"
                    >
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="O+">O+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Doctor Specific Fields */}
              {activePortal === "doctor" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        MCI / State Medical Council Reg No.
                      </label>
                      <input
                        type="text"
                        value={mciLicense}
                        onChange={(e) => setMciLicense(e.target.value)}
                        placeholder="TS-MCI-48291"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Medical Specialty
                      </label>
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        placeholder="General Physician / Pediatrician"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Primary Hospital / PHC Affiliation
                    </label>
                    <input
                      type="text"
                      value={doctorFacility}
                      onChange={(e) => setDoctorFacility(e.target.value)}
                      placeholder="Primary Health Centre (PHC), Bhoothpur"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Hospital Specific Fields */}
              {activePortal === "hospital" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Govt Facility Registration No.
                      </label>
                      <input
                        type="text"
                        value={hospitalRegNo}
                        onChange={(e) => setHospitalRegNo(e.target.value)}
                        placeholder="TS-HOSP-MBNR-001"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Facility Type
                      </label>
                      <select
                        value={facilityType}
                        onChange={(e) => setFacilityType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none"
                      >
                        <option value="Primary Health Centre (PHC)">Primary Health Centre (PHC)</option>
                        <option value="Community Health Centre (CHC)">Community Health Centre (CHC)</option>
                        <option value="Area Hospital">Area Hospital</option>
                        <option value="District General Hospital">District General Hospital</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Hospital Location / Address
                      </label>
                      <input
                        type="text"
                        value={hospitalAddress}
                        onChange={(e) => setHospitalAddress(e.target.value)}
                        placeholder="Station Road, Old Town"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={hospitalPincode}
                        onChange={(e) => setHospitalPincode(e.target.value)}
                        placeholder="509001"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        value={hospitalDistrict}
                        onChange={(e) => setHospitalDistrict(e.target.value)}
                        placeholder="Mahabubnagar"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Total Bed Capacity
                      </label>
                      <input
                        type="number"
                        value={bedCapacity}
                        onChange={(e) => setBedCapacity(e.target.value ? Number(e.target.value) : "")}
                        placeholder="120"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Registered Facilities Checkboxes */}
                  <div className="pt-1">
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Facilities Enabled at Creation
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={hasEmergency}
                          onChange={(e) => setHasEmergency(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span className="font-medium text-slate-800">24x7 Emergency</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={hasMaternity}
                          onChange={(e) => setHasMaternity(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span className="font-medium text-slate-800">Maternity & NICU</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={hasPharmacy}
                          onChange={(e) => setHasPharmacy(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span className="font-medium text-slate-800">Jan Aushadhi</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={hasTeleconsult}
                          onChange={(e) => setHasTeleconsult(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span className="font-medium text-slate-800">Teleconsult Hub</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={hasPathologyLab}
                          onChange={(e) => setHasPathologyLab(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span className="font-medium text-slate-800">Pathology Lab</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={hasImmunization}
                          onChange={(e) => setHasImmunization(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span className="font-medium text-slate-800">Immunization</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                Register & Enter {activePortal === "patient" ? "Patient Portal" : activePortal === "doctor" ? "Doctor OPD" : "Hospital Operations"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/80 bg-white">
        <p>Sehat Saathi AI • Rural Healthcare Navigation • ABDM Compliant</p>
      </footer>
    </div>
  );
};
