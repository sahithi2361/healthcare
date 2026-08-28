import React, { useState } from "react";
import {
  Users,
  ShieldCheck,
  Phone,
  Share2,
  Check,
  Plus,
  Lock,
  Eye,
  AlertCircle,
  Bell,
  Heart,
} from "lucide-react";
import { Language, Caregiver, UserProfile } from "../types";
import { StorageManager } from "../utils/storage";
import { api } from "../lib/api";
import { mapDbCaregiver } from "../utils/adapters";

interface CareCircleProps {
  caregivers: Caregiver[];
  userProfile: UserProfile;
  language: Language;
  onUpdateCaregivers: (caregivers: Caregiver[]) => void;
}

export const CareCircle: React.FC<CareCircleProps> = ({
  caregivers,
  userProfile,
  language,
  onUpdateCaregivers,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [testAlertSentId, setTestAlertSentId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Son");
  const [phone, setPhone] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  const togglePermission = (caregiverId: string, permKey: keyof Caregiver["permissions"]) => {
    const updated = caregivers.map((c) => {
      if (c.id !== caregiverId) return c;
      return {
        ...c,
        permissions: {
          ...c.permissions,
          [permKey]: !c.permissions[permKey],
        },
      };
    });

    onUpdateCaregivers(updated);
    StorageManager.saveCaregivers(updated);
  };

  const handleSendTestAlert = (caregiver: Caregiver) => {
    setTestAlertSentId(caregiver.id);
    setTimeout(() => {
      setTestAlertSentId(null);
    }, 2500);
  };

  const handleAddCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    try {
      const saved = await api.addCaregiver({
        name,
        relation: relationship,
        phone,
        isEmergencyContact: isPrimary,
        accessLevel: "manage",
      }).catch(() => null);

      const newCaregiver: Caregiver = saved
        ? mapDbCaregiver(saved)
        : {
            id: "cg_" + Date.now(),
            name,
            relationship,
            phone,
            isPrimary,
            permissions: {
              viewMedicines: true,
              viewAppointments: true,
              viewDocuments: false,
              receiveMissedDoseAlerts: true,
              receiveEmergencyLocation: true,
            },
          };

      const updated = [newCaregiver, ...caregivers];
      onUpdateCaregivers(updated);
      StorageManager.saveCaregivers(updated);
    } catch (err) {
      console.warn("Save caregiver err:", err);
    }

    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setRelationship("Son");
    setPhone("");
    setIsPrimary(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Family & Support
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {language === "te"
              ? "కుటుంబ & కేర్ సర్కిల్"
              : language === "hi"
              ? "परिवार और देखभाल मंडल"
              : "Family & Caregiver Circle"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mt-1">
            {language === "te"
              ? "మీ కుటుంబ సభ్యులు లేదా ASHA కార్యకర్తకు అత్యవసర సమాచారం మరియు మందుల హెచ్చరికలను పంచుకోండి."
              : language === "hi"
              ? "परिवार के सदस्यों और आशा कार्यकर्ताओं को दवा व आपात स्थिति से जोड़ें।"
              : "Manage family caregivers and ASHA workers with granular, user-controlled data sharing permissions."}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Caregiver</span>
        </button>
      </div>

      {/* Caregiver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {caregivers.map((cg) => (
          <div
            key={cg.id}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold text-lg">
                  {cg.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-800">{cg.name}</h3>
                    {cg.isPrimary && (
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wide">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    {cg.relationship} • {cg.phone}
                  </div>
                </div>
              </div>

              <a
                href={`tel:${cg.phone}`}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                title="Call Caregiver"
              >
                <Phone className="w-4 h-4 text-blue-600" />
              </a>
            </div>

            {/* Granular Permission Toggles */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                Consent & Sharing Permissions:
              </span>

              <label className="flex items-center justify-between cursor-pointer select-none py-1">
                <span className="text-slate-600 font-medium">Missed Medicine Alerts (SMS)</span>
                <input
                  type="checkbox"
                  checked={cg.permissions.receiveMissedDoseAlerts}
                  onChange={() => togglePermission(cg.id, "receiveMissedDoseAlerts")}
                  className="accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer select-none py-1">
                <span className="text-slate-600 font-medium">Emergency GPS Location Sharing</span>
                <input
                  type="checkbox"
                  checked={cg.permissions.receiveEmergencyLocation}
                  onChange={() => togglePermission(cg.id, "receiveEmergencyLocation")}
                  className="accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer select-none py-1">
                <span className="text-slate-600 font-medium">View Active Medicine Schedule</span>
                <input
                  type="checkbox"
                  checked={cg.permissions.viewMedicines}
                  onChange={() => togglePermission(cg.id, "viewMedicines")}
                  className="accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer select-none py-1">
                <span className="text-slate-600 font-medium">View Consultation Appointments</span>
                <input
                  type="checkbox"
                  checked={cg.permissions.viewAppointments}
                  onChange={() => togglePermission(cg.id, "viewAppointments")}
                  className="accent-blue-600 rounded"
                />
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleSendTestAlert(cg)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  testAlertSentId === cg.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {testAlertSentId === cg.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>SMS Ping Sent!</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5 text-blue-600" />
                    <span>Send Test SMS Notification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Caregiver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-white border-b border-slate-100 p-5 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Add New Family Caregiver / ASHA</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCaregiver} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium bg-slate-50"
                  >
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Spouse">Spouse</option>
                    <option value="ASHA Worker">ASHA Worker</option>
                    <option value="Neighbour">Neighbour / Village Volunteer</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98480 22334"
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="primaryCaregiverCheck"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="accent-blue-600 rounded"
                />
                <label htmlFor="primaryCaregiverCheck" className="font-bold text-slate-700 cursor-pointer">
                  Set as primary emergency recipient
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  Add to Care Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
