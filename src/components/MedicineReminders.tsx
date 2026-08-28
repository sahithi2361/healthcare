import React, { useState } from "react";
import {
  Pill,
  CheckCircle,
  Clock,
  AlertCircle,
  Volume2,
  Plus,
  Flame,
  Users,
  Check,
  RotateCcw,
  Sparkles,
  Share2,
  Calendar,
} from "lucide-react";
import { Language, Medication, UserProfile, MedicationLog } from "../types";
import { speakText } from "../utils/speech";
import { StorageManager } from "../utils/storage";

interface MedicineRemindersProps {
  medications: Medication[];
  language: Language;
  userProfile: UserProfile;
  onUpdateMedications: (meds: Medication[]) => void;
}

export const MedicineReminders: React.FC<MedicineRemindersProps> = ({
  medications,
  language,
  userProfile,
  onUpdateMedications,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [missedAlertPromptMed, setMissedAlertPromptMed] = useState<Medication | null>(null);
  const [caregiverNotified, setCaregiverNotified] = useState(false);
  const [streakDays, setStreakDays] = useState(14);

  // Form State
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Once daily");
  const [timing, setTiming] = useState("Morning (8:00 AM)");
  const [instructions, setInstructions] = useState("After breakfast with water");

  const handleMarkTaken = (med: Medication) => {
    const updated = medications.map((m) =>
      m.id === med.id ? { ...m, isTakenToday: true, isSkippedToday: false } : m
    );
    onUpdateMedications(updated);
    StorageManager.saveMedications(updated);

    StorageManager.recordMedLog({
      id: "log_" + Date.now(),
      medicationId: med.id,
      medicationName: med.name,
      timestamp: new Date().toISOString(),
      status: "taken",
    });

    speakText(
      language === "te"
        ? `${med.name} మందు వేసుకున్నారు. చాలా మంచిది!`
        : `${med.name} marked as taken. Well done!`,
      language
    );
  };

  const handleMarkSkipped = (med: Medication) => {
    const updated = medications.map((m) =>
      m.id === med.id ? { ...m, isTakenToday: false, isSkippedToday: true } : m
    );
    onUpdateMedications(updated);
    StorageManager.saveMedications(updated);

    StorageManager.recordMedLog({
      id: "log_" + Date.now(),
      medicationId: med.id,
      medicationName: med.name,
      timestamp: new Date().toISOString(),
      status: "skipped",
    });

    setMissedAlertPromptMed(med);
  };

  const handleNotifyCaregiver = () => {
    setCaregiverNotified(true);
    setTimeout(() => {
      setMissedAlertPromptMed(null);
      setCaregiverNotified(false);
    }, 2000);
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMed: Medication = {
      id: "med_" + Date.now(),
      name,
      dosage,
      frequency,
      timing,
      instructions,
      isTakenToday: false,
      isSkippedToday: false,
      stockRemaining: 30,
      prescribedFor: "General Maintenance",
    };

    const updated = StorageManager.addMedication(newMed);
    onUpdateMedications(updated);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDosage("");
    setFrequency("Once daily");
    setTiming("Morning (8:00 AM)");
    setInstructions("After breakfast with water");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Medication Schedule
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {language === "te"
              ? "మందుల సమయం & రిమైండర్లు"
              : language === "hi"
              ? "दवाओं का समय और रिमाइंडर"
              : "Daily Medication Reminders"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mt-1">
            {language === "te"
              ? "మీ రోజువారీ మందుల సమయాలు, అడ్హెరెన్స్ ట్రాకింగ్ మరియు తప్పిపోయిన మందుల హెచ్చరికలు."
              : language === "hi"
              ? "दवाओं का सही समय, नियमितता का रिकॉर्ड और देखभालकर्ता को अलर्ट।"
              : "Track doses, maintain strict compliance streaks, and alert caregivers if critical doses are missed."}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Adherence Streak & Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Adherence Streak
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mt-1">
              {streakDays} Days <span className="text-amber-500 text-xl">🔥</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Consistent daily routine</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
              Monthly Compliance
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">94.2%</div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Target: &gt;90% adherence</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
              Caregiver Sync
            </span>
            <div className="text-base font-bold text-slate-800 mt-1">
              {userProfile.emergencyContacts[0]?.name || "Suresh (Son)"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Auto-alerts enabled</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Missed Medicine Alert Prompt Modal */}
      {missedAlertPromptMed && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-red-950">
                Missed Dose Alert: {missedAlertPromptMed.name} ({missedAlertPromptMed.dosage})
              </h3>
              <p className="text-xs text-red-800 mt-0.5">
                {language === "te"
                  ? "మీరు ఈ మందును దాటవేశారు. మీ సంరక్షకుడు సురేష్ లేదా ASHA కార్యకర్తకు SMS ద్వారా తెలియజేయాలా?"
                  : "You marked this dose as skipped. Would you like to notify your family caregiver or ASHA worker?"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setMissedAlertPromptMed(null)}
              className="flex-1 sm:flex-none px-3 py-2 bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={handleNotifyCaregiver}
              className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              {caregiverNotified ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Alert Sent!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Notify Caregiver Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Today's Medication Cards List */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Today's Medicine Schedule ({medications.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {medications.map((med) => (
            <div
              key={med.id}
              className={`rounded-3xl p-6 transition-all shadow-sm flex flex-col justify-between ${
                med.isTakenToday
                  ? "bg-emerald-50/60 border border-emerald-300"
                  : med.isSkippedToday
                  ? "bg-red-50/50 border border-red-200"
                  : "bg-white border border-slate-200/80 hover:border-blue-200"
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-3 py-0.5 rounded-full">
                      {med.timing}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 mt-2">{med.name}</h3>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Dosage: {med.dosage} • {med.frequency}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      speakText(
                        language === "te"
                          ? `${med.name} మందు. మోతాదు: ${med.dosage}. సమయం: ${med.timing}. ${med.instructions}`
                          : `Medicine: ${med.name}. Dosage: ${med.dosage}. Time: ${med.timing}. ${med.instructions}`,
                        language
                      )
                    }
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                    title="Speak medicine details"
                  >
                    <Volume2 className="w-4 h-4 text-blue-600" />
                  </button>
                </div>

                <div className="mt-3.5 p-3 bg-slate-50 rounded-2xl text-xs text-slate-700 font-medium border border-slate-100">
                  📝 {med.instructions}
                </div>
              </div>

              {/* Status & Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {med.isTakenToday ? (
                  <div className="w-full bg-emerald-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs">
                    <CheckCircle className="w-4 h-4" />
                    <span>Dose Taken for Today</span>
                  </div>
                ) : med.isSkippedToday ? (
                  <div className="w-full flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-red-700">Dose Skipped</span>
                    <button
                      onClick={() => handleMarkTaken(med)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                    >
                      Undo & Mark Taken
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex items-center gap-2">
                    <button
                      onClick={() => handleMarkTaken(med)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>MARK TAKEN</span>
                    </button>
                    <button
                      onClick={() => handleMarkSkipped(med)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Skip
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold">Add New Medicine Reminder</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amlodipine 5mg"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dosage</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 1 Tablet"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden font-medium"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Thrice daily">Thrice daily</option>
                    <option value="As needed">As needed (SOS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Timing</label>
                <input
                  type="text"
                  value={timing}
                  onChange={(e) => setTiming(e.target.value)}
                  placeholder="e.g. Morning (8:00 AM)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Instructions</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. After breakfast with warm water"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
