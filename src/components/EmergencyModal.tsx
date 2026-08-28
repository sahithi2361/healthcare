import React, { useState } from "react";
import {
  X,
  PhoneCall,
  MapPin,
  Users,
  Share2,
  AlertTriangle,
  HeartPulse,
  Clock,
  ShieldCheck,
  Check,
  Phone,
  Navigation,
} from "lucide-react";
import { Language, UserProfile, HealthcareFacility } from "../types";
import { TRANSLATIONS } from "../data/initialData";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  userProfile: UserProfile;
  facilities: HealthcareFacility[];
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  language,
  userProfile,
  facilities,
}) => {
  const [alertSentToCaregiver, setAlertSentToCaregiver] = useState(false);
  const [locationShared, setLocationShared] = useState(false);

  if (!isOpen) return null;

  const t = (key: string) => TRANSLATIONS[key]?.[language] || TRANSLATIONS[key]?.["en"] || key;

  const emergencyFacilities = facilities.filter(
    (f) => f.hasEmergencyServices || f.type === "District Hospital" || f.type === "Emergency Facility"
  );
  const nearestEmergency = emergencyFacilities[0] || facilities[0];

  const handleSendCaregiverAlert = () => {
    setAlertSentToCaregiver(true);
    setTimeout(() => {
      // simulate background SMS/Notification dispatched
    }, 1500);
  };

  const handleShareLocation = () => {
    setLocationShared(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Urgent Header */}
        <div className="bg-rose-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {t("emergency")}
                </h2>
                <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Immediate Help
                </span>
              </div>
              <p className="text-rose-100 text-xs sm:text-sm font-medium mt-0.5">
                {language === "te"
                  ? "తక్షణ అత్యవసర వైద్య సహాయం మరియు అంబులెన్స్ సేవలు"
                  : language === "hi"
                  ? "तत्काल आपातकालीन चिकित्सा सहायता और एम्बुलेंस"
                  : "Immediate urgent medical response & 24x7 helpline"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Critical Warning Box */}
          <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-2xl">
            <div className="flex items-start gap-3">
              <HeartPulse className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">
                  {language === "te"
                    ? "ఈ లక్షణాలు ఉంటే తక్షణమే 108 కి కాల్ చేయండి:"
                    : language === "hi"
                    ? "इन लक्षणों में तुरंत 108 डायल करें:"
                    : "Immediate Warning Signs — Call 108 Right Away:"}
                </h4>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed font-medium">
                  {language === "te"
                    ? "తీవ్రమైన గుండె నొప్పి, ఊపిరి ఆడకపోవడం, స్పృహ కోల్పోవడం, అధిక రక్తస్రావం, ఫిట్స్ లేదా పక్షవాతం లక్షణాలు."
                    : language === "hi"
                    ? "सीने में तेज दर्द, सांस लेने में गंभीर तकलीफ, बेहोशी, अत्यधिक रक्तस्राव या दौरे।"
                    : "Severe chest pain, difficulty breathing, sudden unconsciousness, uncontrollable bleeding, seizures, or sudden paralysis."}
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Call 108 Ambulance */}
            <a
              href="tel:108"
              className="bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white p-5 rounded-2xl shadow-md shadow-rose-600/20 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xl">
                  <PhoneCall className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold tracking-tight leading-tight">
                    CALL 108
                  </div>
                  <div className="text-xs text-rose-100 font-medium">
                    {language === "te"
                      ? "ఉచిత ప్రభుత్వ అంబులెన్స్"
                      : language === "hi"
                      ? "मुफ्त आपातकालीन एम्बुलेंस"
                      : "Free Emergency Ambulance"}
                  </div>
                </div>
              </div>
              <span className="text-xs bg-white text-rose-700 font-bold px-3 py-1 rounded-full">
                DIAL NOW
              </span>
            </a>

            {/* Call 112 National Helpline */}
            <a
              href="tel:112"
              className="bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white p-5 rounded-2xl shadow-sm flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xl">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold tracking-tight leading-tight">
                    CALL 112
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {language === "te"
                      ? "అఖిల భారత అత్యవసర రక్షణ"
                      : language === "hi"
                      ? "अखिल भारतीय आपातकालीन नंबर"
                      : "All-India Emergency Helpline"}
                  </div>
                </div>
              </div>
              <span className="text-xs bg-white/20 text-white font-bold px-3 py-1 rounded-full">
                24x7
              </span>
            </a>
          </div>

          {/* Secondary Helpline Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
            <a
              href="tel:102"
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-3 rounded-2xl border border-slate-200 flex items-center gap-2.5"
            >
              <span className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                102
              </span>
              <span>Maternal / Infant Van</span>
            </a>
            <a
              href="tel:104"
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-3 rounded-2xl border border-slate-200 flex items-center gap-2.5"
            >
              <span className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                104
              </span>
              <span>Health Advice Helpline</span>
            </a>
          </div>

          {/* Nearest Emergency Hospital Card */}
          {nearestEmergency && (
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {language === "te"
                    ? "సమీప అత్యవసర ఆసుపత్రి"
                    : language === "hi"
                    ? "निकटतम आपातकालीन अस्पताल"
                    : "Nearest 24x7 Emergency Facility"}
                </span>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  {nearestEmergency.distanceKm} km ({nearestEmergency.travelTimeMin} mins)
                </span>
              </div>

              <div className="text-base font-bold text-slate-800">
                {language === "te" ? nearestEmergency.nameTe : language === "hi" ? nearestEmergency.nameHi : nearestEmergency.name}
              </div>
              <div className="text-xs text-slate-500 font-medium">{nearestEmergency.address}</div>

              <div className="mt-2 flex items-center gap-2.5">
                <a
                  href={`tel:${nearestEmergency.phone}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Direct Call ({nearestEmergency.phone})</span>
                </a>
                <button
                  onClick={() =>
                    alert(`Routing to ${nearestEmergency.name} via GPS coordinate: ${nearestEmergency.latitude}, ${nearestEmergency.longitude}`)
                  }
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs py-2.5 px-3.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Directions</span>
                </button>
              </div>
            </div>
          )}

          {/* Alert Family / Caregiver & Share GPS Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Caregiver Alert */}
            <div className="border border-slate-200/80 rounded-2xl p-4 bg-white shadow-2xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Alert Care Circle</span>
              </div>
              <p className="text-xs text-slate-500 mb-3 font-medium">
                {userProfile.emergencyContacts[0]
                  ? `${userProfile.emergencyContacts[0].name} (${userProfile.emergencyContacts[0].phone})`
                  : "No caregiver linked"}
              </p>
              <button
                id="emergency-alert-caregiver-btn"
                onClick={handleSendCaregiverAlert}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  alertSentToCaregiver
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                }`}
              >
                {alertSentToCaregiver ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Emergency SMS & Alert Sent!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Notify Caregiver</span>
                  </>
                )}
              </button>
            </div>

            {/* Live GPS Location */}
            <div className="border border-slate-200/80 rounded-2xl p-4 bg-white shadow-2xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Live Location Pin</span>
              </div>
              <p className="text-xs text-slate-500 mb-3 font-medium">
                {userProfile.location || "Mahabubnagar Rural, Telangana"}
              </p>
              <button
                id="emergency-share-gps-btn"
                onClick={handleShareLocation}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  locationShared
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-800 hover:bg-slate-900 text-white shadow-xs"
                }`}
              >
                {locationShared ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>GPS Broadcasted</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Share GPS with Ambulance</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Safety Guidelines while waiting */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700">
            <span className="font-bold text-slate-800">What to do while waiting for ambulance:</span>
            <ul className="list-disc list-inside mt-1.5 space-y-1 text-xs text-slate-600 font-medium">
              <li>Keep patient seated or lying down comfortably in fresh air.</li>
              <li>Loosen tight collars or belts. Do not feed solid food if unconscious.</li>
              <li>Keep phone line open for the emergency driver to call for directions.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Government Health Emergency Dispatch System
          </span>
          <button
            onClick={onClose}
            className="text-slate-700 hover:text-slate-900 font-bold px-4 py-2 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
