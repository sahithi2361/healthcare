import React, { useState, useEffect } from "react";
import {
  User,
  Stethoscope,
  Building2,
  HeartHandshake,
  Lock,
  Phone,
  ArrowRight,
  ShieldCheck,
  IdCard,
  Volume2,
  Heart,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  KeyRound,
  UserCheck,
} from "lucide-react";
import { UserRole, AuthAccount, Language } from "../types";
import { PRESET_ACCOUNTS, TRANSLATIONS } from "../data/initialData";
import { StorageManager } from "../utils/storage";

interface AuthLandingPageProps {
  onLogin: (account: AuthAccount) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenEmergency: () => void;
}

export const AuthLandingPage: React.FC<AuthLandingPageProps> = ({
  onLogin,
  language,
  onLanguageChange,
  onOpenEmergency,
}) => {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loginMethod, setLoginMethod] = useState<"otp" | "password">("otp");
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");

  // OTP State
  const [otpStep, setOtpStep] = useState<"phone_input" | "otp_verify">("phone_input");
  const [otpValue, setOtpValue] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("9848011223");
  const [password, setPassword] = useState("123456");
  const [location, setLocation] = useState("Bhoothpur, Mahabubnagar");

  // Role specific fields
  const [specialty, setSpecialty] = useState("General Physician");
  const [facilityName, setFacilityName] = useState("Bhoothpur Community Health Centre");
  const [villageName, setVillageName] = useState("Bhoothpur Village");

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

  const roleDefinitions = [
    {
      id: "user" as UserRole,
      title: "Patient / Family",
      titleTe: "రోగి / కుటుంబం",
      titleHi: "मरीज / परिवार",
      desc: "ABHA Card & Voice AI",
      icon: User,
    },
    {
      id: "doctor" as UserRole,
      title: "Doctor",
      titleTe: "వైద్యులు (డాక్టర్)",
      titleHi: "चिकित्सक / डॉक्टर",
      desc: "OPD & Prescriptions",
      icon: Stethoscope,
    },
    {
      id: "hospital" as UserRole,
      title: "Hospital / CHC",
      titleTe: "ఆసుపత్రి / CHC",
      titleHi: "अस्पताल / सीएचसी",
      desc: "ICU Beds & 108 Fleet",
      icon: Building2,
    },
    {
      id: "asha" as UserRole,
      title: "ASHA Worker",
      titleTe: "ఆశా కార్యకర్త",
      titleHi: "आशा कार्यकर्ता",
      desc: "Village Field Registry",
      icon: HeartHandshake,
    },
  ];

  const handleQuickPresetLogin = (presetRole: UserRole) => {
    const matched = PRESET_ACCOUNTS.find((a) => a.role === presetRole);
    if (matched) {
      StorageManager.registerOrUpdateAccount(matched);
      StorageManager.setAuthenticated(true);
      onLogin(matched);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail.trim()) return;

    setIsOtpSending(true);
    setTimeout(() => {
      setIsOtpSending(false);
      setOtpStep("otp_verify");
      setOtpTimer(30);
      setOtpSuccessMsg(`OTP sent to ${phoneOrEmail}. Demo OTP: 123456`);
      setTimeout(() => {
        setOtpValue("123456");
      }, 600);
    }, 500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length < 4) return;

    const matched = PRESET_ACCOUNTS.find((a) => a.role === selectedRole);
    if (matched) {
      const updated = {
        ...matched,
        phone: phoneOrEmail.includes("+") ? phoneOrEmail : `+91 ${phoneOrEmail}`,
      };
      StorageManager.registerOrUpdateAccount(updated);
      StorageManager.setAuthenticated(true);
      onLogin(updated);
    } else {
      const customAcc: AuthAccount = {
        id: `acc_${Date.now()}`,
        role: selectedRole,
        name:
          selectedRole === "doctor"
            ? "Dr. Srinivas Rao (PHC)"
            : selectedRole === "hospital"
            ? "Bhoothpur Community Health Centre"
            : selectedRole === "asha"
            ? "Vanitha (ASHA Worker)"
            : "Lakshmi Devi",
        phone: phoneOrEmail,
        email: `${phoneOrEmail.replace(/\D/g, "")}@sehatsaathi.gov.in`,
        location: "Bhoothpur Village, Mahabubnagar",
      };
      StorageManager.registerOrUpdateAccount(customAcc);
      StorageManager.setAuthenticated(true);
      onLogin(customAcc);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() && authMode === "signup") return;
    if (!phoneOrEmail.trim()) return;

    const newAccount: AuthAccount = {
      id: `acc_${Date.now()}`,
      role: selectedRole,
      name:
        fullName.trim() ||
        (selectedRole === "doctor"
          ? "Dr. K. Ramesh, MD"
          : selectedRole === "hospital"
          ? "Community Health Centre (CHC)"
          : selectedRole === "asha"
          ? "Village ASHA Health Worker"
          : "Lakshmi Devi"),
      email: phoneOrEmail.includes("@")
        ? phoneOrEmail.trim()
        : `${phoneOrEmail.replace(/\D/g, "")}@ruralhealth.gov.in`,
      phone: phoneOrEmail.includes("@") ? "+91 98480 11223" : phoneOrEmail.trim(),
      location,
      ...(selectedRole === "user" && {
        abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
          1000 + Math.random() * 9000
        )}-${Math.floor(1000 + Math.random() * 9000)}`,
        bloodGroup: "O+",
        age: 38,
        gender: "Female",
      }),
      ...(selectedRole === "doctor" && {
        licenseNumber: `TS-MCI-${Math.floor(10000 + Math.random() * 90000)}`,
        specialty: specialty || "General Physician",
        qualification: "MBBS, MD (General Medicine)",
        facilityName: facilityName.trim() || "Bhoothpur Primary Health Centre",
        experienceYears: 8,
      }),
      ...(selectedRole === "hospital" && {
        facilityId: `fac_custom_${Date.now()}`,
        facilityType: "Community Health Centre (CHC)",
        registrationNumber: `TS-HOSP-REG-${Math.floor(1000 + Math.random() * 9000)}`,
        bedCapacity: 120,
      }),
      ...(selectedRole === "asha" && {
        ashaId: `TS-ASHA-MBNR-${Math.floor(100 + Math.random() * 900)}`,
        villageName: villageName.trim() || "Bhoothpur Village",
        mandalName: "Bhoothpur Mandal",
        assignedFamiliesCount: 142,
      }),
    };

    StorageManager.registerOrUpdateAccount(newAccount);
    StorageManager.setAuthenticated(true);
    onLogin(newAccount);
  };

  const handlePlayVoiceHint = () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      const utterance = new SpeechSynthesisUtterance();
      if (language === "te") {
        utterance.text =
          "నమస్కారం. సెహత్ సాథి ఏఐ కు స్వాగతం. దయచేసి మీ మొబైల్ నంబర్ ద్వారా లాగిన్ అవ్వండి.";
        utterance.lang = "te-IN";
      } else if (language === "hi") {
        utterance.text =
          "नमस्ते। सेहत साथी एआई में आपका स्वागत है। कृपया मोबाइल नंबर से लॉगिन करें।";
        utterance.lang = "hi-IN";
      } else {
        utterance.text =
          "Welcome to Sehat Saathi AI. Please enter your mobile number or select a profile to get started.";
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
      {/* Top Simple Clean Header */}
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

        {/* Right Controls: Clean Language Toggle, Voice Hint & SOS */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Voice Prompt Button */}
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

          {/* Simple Language Pills */}
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

          {/* Emergency 108 */}
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

      {/* Main Clean Centered Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        {/* Simple Clean Card */}
        <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
          {/* Header Title & Subtitle */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {authMode === "login"
                ? language === "te"
                  ? "లాగిన్ అవ్వండి"
                  : language === "hi"
                  ? "लॉगिन करें"
                  : "Sign In"
                : language === "te"
                ? "కొత్త ఖాతా తెరవండి"
                : language === "hi"
                ? "नया खाता बनाएं"
                : "Create Account"}
            </h1>
            <p className="text-sm text-slate-500">
              {language === "te"
                ? "మీ పాత్రను ఎంచుకుని మొబైల్ ద్వారా సులభంగా ప్రవేశించండి"
                : language === "hi"
                ? "अपनी भूमिका चुनें और मोबाइल नंबर से आसानी से प्रवेश करें"
                : "Select your role and sign in with your mobile number"}
            </p>
          </div>

          {/* Mode Switch Tabs: Login vs Sign Up */}
          <div className="flex bg-slate-100 p-1 rounded-2xl max-w-sm mx-auto border border-slate-200/80">
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
              {language === "te" ? "లాగిన్ (Sign In)" : language === "hi" ? "लॉगिन (Sign In)" : "Sign In"}
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
              {language === "te" ? "నమోదు (Sign Up)" : language === "hi" ? "साइन अप (Sign Up)" : "Sign Up"}
            </button>
          </div>

          {/* Role Selector Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block text-center sm:text-left">
              {language === "te" ? "మీ పాత్రను ఎంచుకోండి" : language === "hi" ? "अपनी भूमिका चुनें" : "Select Role"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {roleDefinitions.map((role) => {
                const RoleIcon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start text-center sm:text-left gap-2 ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 text-blue-900"
                        : "bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      <RoleIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">
                        {language === "te" ? role.titleTe : language === "hi" ? role.titleHi : role.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                        {role.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          {authMode === "login" && (
            <div className="space-y-4 max-w-lg mx-auto">
              {/* Method Switch: OTP or Password */}
              <div className="flex justify-center gap-4 text-xs font-semibold border-b border-slate-100 pb-3">
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
                        {language === "te" ? "మొబైల్ నంబర్" : language === "hi" ? "मोबाइल नंबर" : "Mobile Number"}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          required
                          value={phoneOrEmail}
                          onChange={(e) => setPhoneOrEmail(e.target.value)}
                          placeholder="e.g. 9848011223"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isOtpSending}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      {isOtpSending ? "Sending OTP..." : "Send OTP"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                      Verify & Log In
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Phone Number or Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={phoneOrEmail}
                        onChange={(e) => setPhoneOrEmail(e.target.value)}
                        placeholder="e.g. 9848011223"
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
                    Log In
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {authMode === "signup" && (
            <form onSubmit={handleFormSubmit} className="space-y-4 max-w-lg mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Lakshmi Devi"
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
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    placeholder="9848011223"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / Village
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bhoothpur, Mahabubnagar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {selectedRole === "doctor" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Medical Specialty
                  </label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="General Physician / Pediatrician"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              )}

              {selectedRole === "hospital" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hospital / CHC Name
                  </label>
                  <input
                    type="text"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    placeholder="e.g. Bhoothpur Community Health Centre"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              )}

              {selectedRole === "asha" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Village
                  </label>
                  <input
                    type="text"
                    value={villageName}
                    onChange={(e) => setVillageName(e.target.value)}
                    placeholder="e.g. Bhoothpur Village"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                Create Account & Enter
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Clean 1-Click Demo Profiles Row */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Or Continue with a Demo Profile
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_ACCOUNTS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleQuickPresetLogin(preset.role)}
                  className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 rounded-2xl text-left transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 group-hover:border-blue-300 group-hover:text-blue-600">
                      {preset.role}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="mt-2">
                    <div className="font-bold text-slate-800 text-xs truncate">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {preset.specialty || preset.location || "Telangana"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/80 bg-white">
        <p>Sehat Saathi AI • Rural Healthcare Navigation • ABDM Compliant</p>
      </footer>
    </div>
  );
};
