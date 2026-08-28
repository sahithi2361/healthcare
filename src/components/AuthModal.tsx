import React, { useState, useEffect } from "react";
import {
  User,
  Stethoscope,
  Building2,
  Lock,
  Mail,
  Phone,
  CheckCircle,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  IdCard,
  HeartHandshake,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Smartphone,
  Hospital,
  MapPin,
  FileCheck,
  ShieldAlert,
} from "lucide-react";
import { UserRole, AuthAccount, Language } from "../types";
import { PRESET_ACCOUNTS } from "../data/initialData";
import { StorageManager } from "../utils/storage";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: AuthAccount | null;
  onLogin: (account: AuthAccount) => void;
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentAccount,
  onLogin,
  language,
}) => {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loginMethod, setLoginMethod] = useState<"otp" | "password">("otp");
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");

  // OTP State Simulation
  const [otpStep, setOtpStep] = useState<"phone_input" | "otp_verify">("phone_input");
  const [otpValue, setOtpValue] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("Bhoothpur, Mahabubnagar, Telangana");

  // Role specific fields
  const [abhaId, setAbhaId] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialty, setSpecialty] = useState("General Physician");
  const [facilityName, setFacilityName] = useState("");
  const [facilityType, setFacilityType] = useState("Primary Health Centre (PHC)");
  const [ashaId, setAshaId] = useState("");
  const [villageName, setVillageName] = useState("Bhoothpur Village");
  const [mandalName, setMandalName] = useState("Bhoothpur Mandal");
  const [assignedFamiliesCount, setAssignedFamiliesCount] = useState<number>(140);

  // Timer effect for OTP countdown
  useEffect(() => {
    let interval: any = null;
    if (otpStep === "otp_verify" && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, otpTimer]);

  if (!isOpen) return null;

  const roleDefinitions = [
    {
      id: "user" as UserRole,
      title: "Patient / Family",
      titleTe: "రోగి / గ్రామీణ కుటుంబం",
      titleHi: "मरीज / परिवार",
      desc: "ABHA Health Passport, AI Voice, Jan Aushadhi & QR",
      icon: User,
      color: "blue",
      badge: "ABHA ID",
    },
    {
      id: "doctor" as UserRole,
      title: "Doctor / MO",
      titleTe: "వైద్యులు (డాక్టర్)",
      titleHi: "चिकित्सक / डॉक्टर",
      desc: "Teleconsultation OPD, Digital Rx, Patient Records",
      icon: Stethoscope,
      color: "emerald",
      badge: "MCI Verified",
    },
    {
      id: "hospital" as UserRole,
      title: "Hospital / CHC",
      titleTe: "ఆసుపత్రి / CHC నిర్వహణ",
      titleHi: "अस्पताल / सीएचसी",
      desc: "Bed Tracking, 108 Fleet, Jan Aushadhi Stock",
      icon: Building2,
      color: "purple",
      badge: "Govt CHC",
    },
    {
      id: "asha" as UserRole,
      title: "ASHA Worker",
      titleTe: "గ్రామ ఆశా కార్యకర్త",
      titleHi: "आशा कार्यकर्ता",
      desc: "Village Field Survey, Maternal Care, Offline Sync",
      icon: HeartHandshake,
      color: "amber",
      badge: "NRHM Field",
    },
  ];

  const handleQuickPresetLogin = (presetRole: UserRole) => {
    const matched = PRESET_ACCOUNTS.find((a) => a.role === presetRole);
    if (matched) {
      StorageManager.saveAccount(matched);
      onLogin(matched);
      onClose();
    }
  };

  // Simulate Sending OTP to Mobile
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;

    setIsOtpSending(true);
    setTimeout(() => {
      setIsOtpSending(false);
      setOtpStep("otp_verify");
      setOtpTimer(30);
      setOtpSuccessMsg(`SMS OTP sent to ${emailOrPhone}. Use demo code: 123456`);
      // Auto-fill demo OTP after 1 second for user convenience
      setTimeout(() => {
        setOtpValue("123456");
      }, 1000);
    }, 800);
  };

  // Verify OTP and Log In
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length < 4) return;

    // Check if preset matches or generate account
    const matched = PRESET_ACCOUNTS.find((a) => a.role === selectedRole);
    if (matched) {
      const updated = {
        ...matched,
        phone: emailOrPhone.includes("+") ? emailOrPhone : `+91 ${emailOrPhone}`,
      };
      StorageManager.registerOrUpdateAccount(updated);
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
        phone: emailOrPhone,
        email: `${emailOrPhone.replace(/\D/g, "")}@sehatsaathi.gov.in`,
        location: "Bhoothpur Village, Mahabubnagar",
      };
      StorageManager.registerOrUpdateAccount(customAcc);
      onLogin(customAcc);
    }
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() && authMode === "signup") return;
    if (!emailOrPhone.trim()) return;

    const newAccount: AuthAccount = {
      id: `acc_${Date.now()}`,
      role: selectedRole,
      name:
        fullName.trim() ||
        (selectedRole === "doctor"
          ? "Dr. Healthcare Specialist"
          : selectedRole === "hospital"
          ? "Community Health Centre (CHC)"
          : selectedRole === "asha"
          ? "Village ASHA Health Worker"
          : "Community Member"),
      email: emailOrPhone.includes("@")
        ? emailOrPhone.trim()
        : `${emailOrPhone.replace(/\D/g, "")}@ruralhealth.gov.in`,
      phone: emailOrPhone.includes("@") ? "+91 98480 11223" : emailOrPhone.trim(),
      location,
      ...(selectedRole === "user" && {
        abhaId:
          abhaId.trim() ||
          `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
            1000 + Math.random() * 9000
          )}-${Math.floor(1000 + Math.random() * 9000)}`,
        bloodGroup: "O+",
        age: 38,
        gender: "Female",
      }),
      ...(selectedRole === "doctor" && {
        licenseNumber:
          licenseNumber.trim() || `TS-MCI-${Math.floor(10000 + Math.random() * 90000)}`,
        specialty: specialty || "General Physician",
        qualification: "MBBS, MD (General Medicine)",
        facilityName: facilityName.trim() || "Bhoothpur Primary Health Centre",
        experienceYears: 8,
      }),
      ...(selectedRole === "hospital" && {
        facilityId: `fac_custom_${Date.now()}`,
        facilityType: facilityType || "Community Health Centre (CHC)",
        registrationNumber: `TS-HOSP-REG-${Math.floor(1000 + Math.random() * 9000)}`,
        bedCapacity: 120,
      }),
      ...(selectedRole === "asha" && {
        ashaId: ashaId.trim() || `TS-ASHA-MBNR-${Math.floor(100 + Math.random() * 900)}`,
        villageName: villageName.trim() || "Bhoothpur Village",
        mandalName: mandalName.trim() || "Bhoothpur Mandal",
        assignedFamiliesCount: Number(assignedFamiliesCount) || 142,
      }),
    };

    StorageManager.registerOrUpdateAccount(newAccount);
    onLogin(newAccount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full p-5 sm:p-7 relative animate-in fade-in zoom-in-95 duration-200 my-6 max-h-[94vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Header & Brand Badge */}
        <div className="text-center space-y-1 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-1 border border-blue-200/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ayushman Bharat (ABDM) & NRHM Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {authMode === "login"
              ? "Access Sehat Saathi AI"
              : "Register Healthcare Account"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg mx-auto">
            {language === "te"
              ? "మీ పాత్రను ఎంచుకోండి: రోగులు, ప్రభుత్వ వైద్యులు, CHC ఆసుపత్రులు మరియు ఆశా కార్యకర్తలు."
              : language === "hi"
              ? "अपनी भूमिका चुनें: मरीज, सरकारी डॉक्टर, अस्पताल अथवा आशा कार्यकर्ता।"
              : "Select your role for tailored clinical workflows, patient lockers, or field health registers."}
          </p>
        </div>

        {/* 2. Four Interactive Role Selector Cards */}
        <div className="mb-5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
            Choose Healthcare Role
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {roleDefinitions.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(r.id);
                    if (r.id === "doctor" && !facilityName) setFacilityName("Bhoothpur PHC");
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-100"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {r.badge}
                    </span>
                  </div>

                  <div>
                    <div
                      className={`text-xs font-bold truncate ${
                        isSelected ? "text-blue-900" : "text-slate-800"
                      }`}
                    >
                      {language === "te"
                        ? r.titleTe
                        : language === "hi"
                        ? r.titleHi
                        : r.title}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                      {r.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Fast 1-Click Instant Demo Accounts Bar */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              1-Click Demo Profiles (For Evaluators)
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Instant Switch
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_ACCOUNTS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  StorageManager.saveAccount(preset);
                  onLogin(preset);
                  onClose();
                }}
                className="p-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-colors cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-blue-600 uppercase">
                      {preset.role}
                    </span>
                    <ArrowRight className="w-2.5 h-2.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="font-bold text-slate-800 text-xs truncate mt-0.5">
                    {preset.name}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-1">
                  {preset.location || preset.specialty || "Telangana"}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Login Mode Tabs: Aadhaar/Mobile OTP vs Password PIN */}
        {authMode === "login" && (
          <div className="flex items-center justify-center p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setLoginMethod("otp");
                setOtpStep("phone_input");
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                loginMethod === "otp"
                  ? "bg-white text-blue-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Aadhaar / Mobile OTP</span>
            </button>

            <button
              type="button"
              onClick={() => setLoginMethod("password")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                loginMethod === "password"
                  ? "bg-white text-blue-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Official PIN / Password</span>
            </button>
          </div>
        )}

        {/* 5. Main Form: OTP or Password or Sign Up */}
        {authMode === "login" && loginMethod === "otp" ? (
          /* OTP Flow */
          <div className="space-y-4">
            {otpStep === "phone_input" ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number (linked to Aadhaar / ABHA)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="+91 98480 12345 or 9848012345"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    An OTP will be generated instantly for mobile authentication.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isOtpSending || !emailOrPhone.trim()}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isOtpSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending OTP SMS...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>Get 6-Digit OTP</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5 animate-in fade-in">
                {otpSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{otpSuccessMsg}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Enter 6-Digit Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpValue("123456")}
                      className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Fill Demo OTP (123456)
                    </button>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.5em] text-lg font-black py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>
                    {otpTimer > 0 ? (
                      `Resend code in ${otpTimer}s`
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setOtpTimer(30);
                          setOtpSuccessMsg("New OTP sent: 123456");
                        }}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Resend OTP SMS
                      </button>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpStep("phone_input")}
                    className="text-slate-500 hover:text-slate-800 underline"
                  >
                    Change Number
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={otpValue.length < 4}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify & Enter Portal</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Password Form / Sign Up Form */
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            {authMode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {selectedRole === "doctor"
                    ? "Doctor Full Name with Honorific"
                    : selectedRole === "hospital"
                    ? "Facility / Hospital Official Name"
                    : selectedRole === "asha"
                    ? "ASHA Worker Full Name"
                    : "Patient Full Name"}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={
                    selectedRole === "doctor"
                      ? "e.g. Dr. K. Ramesh, MD"
                      : selectedRole === "hospital"
                      ? "e.g. Jadcherla Community Health Centre"
                      : selectedRole === "asha"
                      ? "e.g. Vanitha (ASHA Staff)"
                      : "e.g. Lakshmi Devi"
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number or Official Email
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="+91 98480 12345 or user@health.gov.in"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Security PIN or Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter 4-6 digit security PIN"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                />
              </div>
            </div>

            {/* Role Specific Dynamic Fields on Sign Up */}
            {authMode === "signup" && selectedRole === "user" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  14-Digit ABHA Health ID (Optional)
                </label>
                <input
                  type="text"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  placeholder="e.g. 91-4820-9921-3412 (Auto-created if empty)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>
            )}

            {authMode === "signup" && selectedRole === "doctor" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State MCI Registration No.
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. TS-MCI-48291"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specialty</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-hidden"
                  >
                    <option>General Physician</option>
                    <option>Cardiologist (Heart)</option>
                    <option>Pediatrician (Child Specialist)</option>
                    <option>Gynecologist & Obstetrician</option>
                    <option>Orthopedic Surgeon</option>
                    <option>ENT Specialist</option>
                  </select>
                </div>
              </div>
            )}

            {authMode === "signup" && selectedRole === "hospital" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Facility Type</label>
                  <select
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-hidden"
                  >
                    <option>Primary Health Centre (PHC)</option>
                    <option>Community Health Centre (CHC)</option>
                    <option>District General Hospital</option>
                    <option>Jan Aushadhi Pharmacy Hub</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">District / Mandal</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Mahabubnagar, Telangana"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>
            )}

            {authMode === "signup" && selectedRole === "asha" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Village & Mandal
                  </label>
                  <input
                    type="text"
                    value={villageName}
                    onChange={(e) => setVillageName(e.target.value)}
                    placeholder="e.g. Bhoothpur Village"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Families Under Coverage
                  </label>
                  <input
                    type="number"
                    value={assignedFamiliesCount}
                    onChange={(e) => setAssignedFamiliesCount(Number(e.target.value))}
                    placeholder="140"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {authMode === "login"
                  ? `Sign In as ${
                      selectedRole === "doctor"
                        ? "Doctor"
                        : selectedRole === "hospital"
                        ? "Hospital Admin"
                        : selectedRole === "asha"
                        ? "ASHA Worker"
                        : "Patient"
                    }`
                  : `Create ${
                      selectedRole === "doctor"
                        ? "Doctor"
                        : selectedRole === "hospital"
                        ? "Hospital"
                        : selectedRole === "asha"
                        ? "ASHA Staff"
                        : "Patient"
                    } Account`}
              </span>
            </button>
          </form>
        )}

        {/* 6. Mode Switcher: Sign In <-> Register */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
          <div>
            {authMode === "login" ? (
              <span>
                Need a new healthcare account?{" "}
                <button
                  onClick={() => setAuthMode("signup")}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Register Here
                </button>
              </span>
            ) : (
              <span>
                Already registered?{" "}
                <button
                  onClick={() => setAuthMode("login")}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
