import React, { useState, useEffect } from "react";
import {
  User,
  Stethoscope,
  Building2,
  Lock,
  Phone,
  CheckCircle,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { UserRole, AuthAccount, Language } from "../types";
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
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("Mahabubnagar, Telangana");

  // Role specific fields
  const [patientAge, setPatientAge] = useState<number | "">("");
  const [patientGender, setPatientGender] = useState("Female");
  const [bloodGroup, setBloodGroup] = useState("B+");

  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialty, setSpecialty] = useState("General Physician");
  const [doctorFacility, setDoctorFacility] = useState("");

  const [facilityName, setFacilityName] = useState("");
  const [facilityType, setFacilityType] = useState("Community Health Centre (CHC)");
  const [hospitalRegNo, setHospitalRegNo] = useState("");
  const [bedCapacity, setBedCapacity] = useState<number | "">(120);

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
      title: language === "te" ? "రోగి / కుటుంబం" : language === "hi" ? "मरीज / परिवार" : "Patient / Family",
      desc: "Voice AI, Nearby Facilities, Medicines",
      icon: User,
      color: "blue",
    },
    {
      id: "doctor" as UserRole,
      title: language === "te" ? "వైద్యులు (డాక్టర్)" : language === "hi" ? "चिकित्सक / डॉक्टर" : "Doctor / MO",
      desc: "Teleconsultation OPD & Digital Rx",
      icon: Stethoscope,
      color: "emerald",
    },
    {
      id: "hospital" as UserRole,
      title: language === "te" ? "ఆసుపత్రి నిర్వహణ" : language === "hi" ? "अस्पताल प्रबंधन" : "Hospital / CHC",
      desc: "Live Beds, 108 Fleet & Pharmacy",
      icon: Building2,
      color: "purple",
    },
  ];

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
      }, 500);
    }, 400);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length < 4) return;

    const account: AuthAccount = {
      id: `acc_${selectedRole}_${Date.now()}`,
      role: selectedRole,
      name:
        fullName.trim() ||
        (selectedRole === "doctor"
          ? "Dr. K. Srinivas Rao"
          : selectedRole === "hospital"
          ? "District Hospital Operations"
          : "Lakshmi Devi"),
      phone: phone.startsWith("+") ? phone : `+91 ${phone}`,
      email: `${phone.replace(/\D/g, "")}@ruralhealth.gov.in`,
      location: location.trim() || "Mahabubnagar, Telangana",
      ...(selectedRole === "user" && {
        age: Number(patientAge) || 45,
        gender: patientGender,
        bloodGroup: bloodGroup,
        abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
          1000 + Math.random() * 9000
        )}-${Math.floor(1000 + Math.random() * 9000)}`,
      }),
      ...(selectedRole === "doctor" && {
        licenseNumber: licenseNumber.trim() || `TS-MCI-${Math.floor(10000 + Math.random() * 90000)}`,
        specialty: specialty || "General Physician",
        qualification: "MBBS, MD",
        facilityName: doctorFacility.trim() || "Primary Health Centre (PHC), Bhoothpur",
        experienceYears: 10,
      }),
      ...(selectedRole === "hospital" && {
        facilityId: `fac_${Date.now()}`,
        facilityType: facilityType || "District General Hospital",
        registrationNumber: hospitalRegNo.trim() || `TS-HOSP-REG-${Math.floor(1000 + Math.random() * 9000)}`,
        bedCapacity: Number(bedCapacity) || 150,
      }),
    };

    StorageManager.registerOrUpdateAccount(account);
    StorageManager.setAuthenticated(true);
    onLogin(account);
    onClose();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    const account: AuthAccount = {
      id: `acc_${selectedRole}_${Date.now()}`,
      role: selectedRole,
      name:
        fullName.trim() ||
        (selectedRole === "doctor"
          ? "Dr. K. Srinivas Rao"
          : selectedRole === "hospital"
          ? "District Hospital Operations"
          : "Lakshmi Devi"),
      phone: phone.startsWith("+") ? phone : `+91 ${phone}`,
      email: `${phone.replace(/\D/g, "")}@ruralhealth.gov.in`,
      location: location.trim() || "Mahabubnagar, Telangana",
      ...(selectedRole === "user" && {
        age: Number(patientAge) || 45,
        gender: patientGender,
        bloodGroup: bloodGroup,
        abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
          1000 + Math.random() * 9000
        )}-${Math.floor(1000 + Math.random() * 9000)}`,
      }),
      ...(selectedRole === "doctor" && {
        licenseNumber: licenseNumber.trim() || `TS-MCI-${Math.floor(10000 + Math.random() * 90000)}`,
        specialty: specialty || "General Physician",
        qualification: "MBBS, MD",
        facilityName: doctorFacility.trim() || "Primary Health Centre (PHC), Bhoothpur",
        experienceYears: 10,
      }),
      ...(selectedRole === "hospital" && {
        facilityId: `fac_${Date.now()}`,
        facilityType: facilityType || "District General Hospital",
        registrationNumber: hospitalRegNo.trim() || `TS-HOSP-REG-${Math.floor(1000 + Math.random() * 9000)}`,
        bedCapacity: Number(bedCapacity) || 150,
      }),
    };

    StorageManager.registerOrUpdateAccount(account);
    StorageManager.setAuthenticated(true);
    onLogin(account);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="text-center mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            {authMode === "login" ? "Account Sign In" : "Create New Account"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select your healthcare role to switch or sign in
          </p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {roleDefinitions.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setSelectedRole(r.id);
                  setOtpStep("phone_input");
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  isSelected
                    ? "bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? "text-blue-600" : "text-slate-500"}`} />
                <span className="text-xs">{r.title}</span>
              </button>
            );
          })}
        </div>

        {/* Form */}
        <div className="space-y-4">
          {authMode === "login" && (
            <div className="flex justify-center gap-4 text-xs font-semibold border-b border-slate-100 pb-2">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("otp");
                  setOtpStep("phone_input");
                }}
                className={`pb-1 border-b-2 transition-colors cursor-pointer ${
                  loginMethod === "otp"
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent text-slate-500"
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
                    : "border-transparent text-slate-500"
                }`}
              >
                🔒 Password
              </button>
            </div>
          )}

          {loginMethod === "otp" && authMode === "login" ? (
            otpStep === "phone_input" ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9848012345"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isOtpSending}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isOtpSending ? "Sending..." : "Send OTP"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                {otpSuccessMsg && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{otpSuccessMsg}</span>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2.5 text-center tracking-widest text-base font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Verify & Enter
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              {authMode === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9848012345"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {authMode === "signup" && selectedRole === "doctor" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specialty & MCI Reg
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="General Physician"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="TS-MCI-48291"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {authMode === "signup" && selectedRole === "hospital" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Facility Name & Type
                  </label>
                  <input
                    type="text"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    placeholder="e.g. CHC Bhoothpur"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{authMode === "login" ? "Sign In" : "Register"}</span>
              </button>
            </form>
          )}
        </div>

        {/* Mode Switcher */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            {authMode === "login" ? (
              <span>
                New account?{" "}
                <button
                  onClick={() => setAuthMode("signup")}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Register
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
            <span>Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
