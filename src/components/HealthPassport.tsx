import React, { useState } from "react";
import {
  QrCode,
  ShieldCheck,
  Heart,
  AlertCircle,
  Clock,
  Phone,
  User,
  Share2,
  Lock,
  Eye,
  EyeOff,
  Printer,
  CheckCircle2,
  FileText,
  Pill,
} from "lucide-react";
import { Language, UserProfile, Medication, HealthDocument } from "../types";

interface HealthPassportProps {
  userProfile: UserProfile;
  medications: Medication[];
  documents: HealthDocument[];
  language: Language;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export const HealthPassport: React.FC<HealthPassportProps> = ({
  userProfile,
  medications,
  documents,
  language,
}) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [shareMedications, setShareMedications] = useState(true);
  const [shareDocuments, setShareDocuments] = useState(true);
  const [shareEmergencyOnly, setShareEmergencyOnly] = useState(false);
  const [qrToken, setQrToken] = useState("SS-PASSPORT-" + Math.floor(100000 + Math.random() * 900000));
  const [qrExpiresIn, setQrExpiresIn] = useState("14 mins");

  const generateNewQR = () => {
    setQrToken("SS-PASSPORT-" + Math.floor(100000 + Math.random() * 900000));
    setQrExpiresIn("15 mins");
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Emergency & Records
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {language === "te"
              ? "డిజిటల్ ఆరోగ్య పాస్‌పోర్ట్"
              : language === "hi"
              ? "डिजिटल स्वास्थ्य पासपोर्ट"
              : "Digital Health Passport"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mt-1">
            {language === "te"
              ? "ఆసుపత్రి లేదా వైద్యుడికి చూపించడానికి మీ ముఖ్యమైన ఆరోగ్య రికార్డులు మరియు సురక్షితమైన తాత్కాలిక QR కోడ్."
              : language === "hi"
              ? "डॉक्टर को दिखाने के लिए आवश्यक स्वास्थ्य विवरण और सुरक्षित अस्थायी QR कोड।"
              : "Emergency vitals, chronic conditions, active prescriptions & consent-controlled QR for doctor visits."}
          </p>
        </div>

        <button
          onClick={() => setShowQRModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4" />
          <span>Show QR to Doctor</span>
        </button>
      </div>

      {/* Main Passport Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Identity & Emergency Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base">
                  {userProfile.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800 leading-tight">
                    {userProfile.name}
                  </h2>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">
                    ABHA: {userProfile.abhaId || "91-4820-9921-3412"}
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-200">
                {userProfile.bloodGroup}
              </span>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-bold block text-[11px]">Age / Gender</span>
                <span className="text-slate-800 font-bold text-sm mt-0.5 block">
                  {userProfile.age} yrs • {userProfile.gender}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-bold block text-[11px]">Location</span>
                <span className="text-slate-800 font-bold text-xs truncate block mt-0.5">
                  {userProfile.location}
                </span>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2.5">
                <Phone className="w-3.5 h-3.5 text-red-600" />
                <span>Emergency Contacts</span>
              </div>

              <div className="space-y-2">
                {userProfile.emergencyContacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="bg-red-50/60 border border-red-100 rounded-2xl p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{contact.name}</span>
                      <span className="text-slate-500 block text-[11px] mt-0.5">
                        {contact.relation} • {contact.phone}
                      </span>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="bg-red-600 text-white p-2 rounded-xl hover:bg-red-700 cursor-pointer shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Offline Safe Badge */}
            <div className="mt-4 bg-emerald-50 rounded-2xl p-3 text-[11px] text-emerald-800 flex items-center gap-2 border border-emerald-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Encrypted on-device copy available offline 24x7</span>
            </div>
          </div>
        </div>

        {/* Right Column: Conditions, Allergies & Medications */}
        <div className="lg:col-span-2 space-y-5">
          {/* Chronic Conditions & Allergies */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-600" />
              <span>Medical Conditions & Known Allergies</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Chronic Conditions */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Chronic Health Conditions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {userProfile.chronicConditions.map((cond, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-amber-200 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-2xs"
                    >
                      ⚠️ {cond}
                    </span>
                  ))}
                </div>
              </div>

              {/* Known Allergies */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
                <span className="text-xs font-bold text-red-700 block mb-2">
                  Known Allergies:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {userProfile.allergies.map((allg, idx) => (
                    <span
                      key={idx}
                      className="bg-red-50 border border-red-200 text-red-900 text-xs font-bold px-2.5 py-1 rounded-lg"
                    >
                      🚫 {allg}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-900">
              <span className="font-bold block mb-1">Clinical Note for Attending Officer:</span>
              <p className="text-amber-800 leading-relaxed">{userProfile.importantHealthNotes}</p>
            </div>
          </div>

          {/* Active Medications Summary */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Pill className="w-4 h-4 text-blue-600" />
                <span>Active Prescriptions ({medications.length})</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">Auto-synced</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800">{med.name}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {med.dosage} • {med.frequency}
                    </div>
                  </div>
                  <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                    {med.timing}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Presentation Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-white border-b border-slate-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-800">Show to Healthcare Professional</h3>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-center">
              {/* QR Code Display Canvas Simulation */}
              <div className="bg-slate-900 p-6 rounded-3xl inline-block mx-auto shadow-inner text-center">
                <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto flex flex-col items-center justify-center relative">
                  {/* Stylized QR simulation */}
                  <div className="w-full h-full border-4 border-black p-2 grid grid-cols-5 gap-1 bg-white">
                    <div className="bg-black col-span-2 row-span-2"></div>
                    <div className="bg-black"></div>
                    <div className="bg-black col-span-2 row-span-2"></div>
                    <div className="bg-black"></div>
                    <div className="bg-black col-span-1"></div>
                    <div className="bg-black"></div>
                    <div className="bg-black col-span-3"></div>
                    <div className="bg-black col-span-2 row-span-2"></div>
                    <div className="bg-black"></div>
                    <div className="bg-black col-span-2"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                      SEHAT QR
                    </div>
                  </div>
                </div>
                <div className="text-blue-400 text-xs font-mono font-bold mt-2">
                  Token: {qrToken}
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Valid for: <strong className="text-white">{qrExpiresIn}</strong>
                </div>
              </div>

              {/* Consent and Selective Privacy Controls */}
              <div className="text-left bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Consent & Privacy Controls:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareMedications}
                    onChange={(e) => setShareMedications(e.target.checked)}
                    className="accent-blue-600 rounded"
                  />
                  <span>Share active medication list & dosage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareDocuments}
                    onChange={(e) => setShareDocuments(e.target.checked)}
                    className="accent-blue-600 rounded"
                  />
                  <span>Share past lab reports & prescriptions</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-red-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={shareEmergencyOnly}
                    onChange={(e) => setShareEmergencyOnly(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span>Emergency Mode: Share only Blood Group & Allergies</span>
                </label>
              </div>

              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={generateNewQR}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                >
                  Regenerate Token
                </button>
                <button
                  onClick={() => alert("Printing formatted Medical Summary Sheet for Doctor.")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Summary</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
