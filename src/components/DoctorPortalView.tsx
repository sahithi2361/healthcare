import React, { useState } from "react";
import {
  Stethoscope,
  Users,
  Video,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pill,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  PhoneCall,
  Calendar,
  ShieldCheck,
  Send,
  UserCheck,
} from "lucide-react";
import {
  Doctor,
  TeleconsultSession,
  DoctorPrescription,
  Language,
  AuthAccount,
} from "../types";
import {
  INITIAL_TELECONSULT_REQUESTS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_PHARMACY_STOCK,
} from "../data/initialData";

interface DoctorPortalViewProps {
  currentAccount: AuthAccount | null;
  language: Language;
}

export const DoctorPortalView: React.FC<DoctorPortalViewProps> = ({
  currentAccount,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<"queue" | "rx" | "history">("queue");
  const [teleconsultQueue, setTeleconsultQueue] = useState<TeleconsultSession[]>(
    INITIAL_TELECONSULT_REQUESTS
  );
  const [prescriptions, setPrescriptions] = useState<DoctorPrescription[]>(
    INITIAL_PRESCRIPTIONS
  );
  const [activeCallSession, setActiveCallSession] = useState<TeleconsultSession | null>(
    null
  );
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // New Prescription Form State
  const [rxPatientName, setRxPatientName] = useState("Lakshmi Devi");
  const [rxPatientAge, setRxPatientAge] = useState(54);
  const [rxPatientGender, setRxPatientGender] = useState("Female");
  const [rxDiagnosis, setRxDiagnosis] = useState("Essential Hypertension & Tension Headache");
  const [rxMedicines, setRxMedicines] = useState([
    {
      name: "Amlodipine 5mg",
      genericEquivalent: "Amlodipine Besylate IP 5mg",
      dosage: "5mg",
      frequency: "Once daily (Morning)",
      duration: "30 days",
      instructions: "Take after breakfast with water",
      janAushadhiAvailable: true,
    },
    {
      name: "Paracetamol 650mg",
      genericEquivalent: "Paracetamol IP 650mg",
      dosage: "650mg",
      frequency: "SOS (As needed)",
      duration: "5 days",
      instructions: "For headache only",
      janAushadhiAvailable: true,
    },
  ]);
  const [rxAdvice, setRxAdvice] = useState(
    "Reduce daily salt intake. 30 mins brisk walking. Check BP weekly at PHC/Sub-centre."
  );
  const [rxSuccessMessage, setRxSuccessMessage] = useState(false);

  const handleStartCall = (session: TeleconsultSession) => {
    setActiveCallSession(session);
    setIsCalling(true);
    setCallDuration(0);
  };

  const handleEndCall = () => {
    if (activeCallSession) {
      setTeleconsultQueue((prev) =>
        prev.map((s) =>
          s.id === activeCallSession.id ? { ...s, status: "completed" } : s
        )
      );
    }
    setIsCalling(false);
    setActiveCallSession(null);
  };

  const handleAddMedicine = () => {
    setRxMedicines([
      ...rxMedicines,
      {
        name: "ORS Sachet",
        genericEquivalent: "Oral Rehydration Salts WHO Formula",
        dosage: "21.8g",
        frequency: "1 sachet in 1L boiled water",
        duration: "2 days",
        instructions: "Sip regularly throughout the day",
        janAushadhiAvailable: true,
      },
    ]);
  };

  const handleRemoveMedicine = (idx: number) => {
    setRxMedicines(rxMedicines.filter((_, i) => i !== idx));
  };

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    const newRx: DoctorPrescription = {
      id: `rx_${Date.now()}`,
      prescriptionNumber: `RX-TS-PHC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: `pat_${Date.now()}`,
      patientName: rxPatientName,
      patientAge: Number(rxPatientAge),
      patientGender: rxPatientGender,
      doctorName: currentAccount?.name || "Dr. K. Srinivas Rao",
      doctorSpecialty: currentAccount?.specialty || "Medical Officer, PHC Bhoothpur",
      facilityName: currentAccount?.facilityName || "Primary Health Centre (PHC), Bhoothpur",
      date: new Date().toISOString().split("T")[0],
      diagnosis: rxDiagnosis,
      symptoms: ["Headache", "Blood Pressure Check", "Dizziness"],
      medicines: rxMedicines,
      advice: rxAdvice,
      followUpDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    };

    setPrescriptions([newRx, ...prescriptions]);
    setRxSuccessMessage(true);
    setTimeout(() => setRxSuccessMessage(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Doctor Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                Medical Officer Workspace
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                OPD Live & Telemedicine Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              {currentAccount?.name || "Dr. K. Srinivas Rao"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {currentAccount?.facilityName || "Primary Health Centre (PHC), Bhoothpur"} • License:{" "}
              {currentAccount?.licenseNumber || "TS-MCI-48291"}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 gap-1 shrink-0">
          <button
            onClick={() => setActiveTab("queue")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === "queue"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            OPD & Teleconsult Queue ({teleconsultQueue.filter((q) => q.status === "waiting").length})
          </button>
          <button
            onClick={() => setActiveTab("rx")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === "rx"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Create Generic e-Prescription
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Issued Prescriptions ({prescriptions.length})
          </button>
        </div>
      </div>

      {/* Live Video Consultation Modal Simulator */}
      {isCalling && activeCallSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Video className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{activeCallSession.patientName}</h3>
                  <p className="text-xs text-slate-400">
                    Age: {activeCallSession.patientAge} • {activeCallSession.patientLocation}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
                Live Teleconsultation Connected
              </span>
            </div>

            {/* Video Canvas Simulation */}
            <div className="h-64 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600/20 border-2 border-blue-500 flex items-center justify-center text-2xl font-bold text-blue-300 mb-3">
                {activeCallSession.patientName.charAt(0)}
              </div>
              <p className="text-sm font-semibold text-slate-200">{activeCallSession.patientName}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                "{activeCallSession.chiefComplaint}"
              </p>

              <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-lg text-xs text-slate-300">
                Self: Dr. Srinivas Rao (PHC Bhoothpur)
              </div>
            </div>

            {/* Clinical Summary */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-1 text-xs">
              <span className="font-bold text-blue-400 uppercase tracking-wider text-[10px]">
                AI-Prepared Clinical Summary
              </span>
              <p className="text-slate-300 font-medium">
                {activeCallSession.clinicalSummary || "Patient reporting mild symptoms. History of hypertension."}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setRxPatientName(activeCallSession.patientName);
                  setRxPatientAge(activeCallSession.patientAge);
                  handleEndCall();
                  setActiveTab("rx");
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Write e-Prescription
              </button>

              <button
                onClick={handleEndCall}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                End Consultation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: OPD & Teleconsult Queue */}
      {activeTab === "queue" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Queue List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">
                  Today's OPD & Telemedicine Requests
                </h2>
                <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full">
                  Real-time Queue
                </span>
              </div>

              <div className="space-y-3">
                {teleconsultQueue.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 bg-slate-50/70 hover:bg-blue-50/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                          #{session.tokenNumber}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">
                          {session.patientName}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          ({session.patientAge} yrs, {session.patientLocation})
                        </span>
                        {session.urgency === "priority" && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                            Priority
                          </span>
                        )}
                        {session.status === "completed" && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        <strong>Complaint:</strong> {session.chiefComplaint}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Scheduled Slot: {session.scheduledTime} • Phone: {session.patientPhone}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      {session.status === "waiting" ? (
                        <button
                          onClick={() => handleStartCall(session)}
                          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Start Teleconsult</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Consulted
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* OPD Stats & Teleconsult Guidelines */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">PHC Clinical Guidance</h3>
              <div className="space-y-3 text-xs text-slate-600 font-medium">
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1">
                  <p className="font-bold text-blue-800">PMBJP Generic Prescription Rule</p>
                  <p className="text-blue-900">
                    Always prescribe generic drug molecules available at Jan Aushadhi Kendras to minimize rural patient out-of-pocket costs.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <p className="font-bold text-slate-800">Emergency Red Flag Protocol</p>
                  <p className="text-slate-600">
                    If patient displays acute chest pain, SpO2 &lt; 92%, or altered consciousness, immediately dispatch 108 ALS ambulance for transfer to District Hospital.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Create Generic e-Prescription */}
      {activeTab === "rx" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Digital e-Prescription with Jan Aushadhi Generic Mapping
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Prescribe verified generic formulations with instant cost-savings calculation for patients.
              </p>
            </div>
            {rxSuccessMessage && (
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Prescription Issued & Sent to Patient!
              </span>
            )}
          </div>

          <form onSubmit={handleSavePrescription} className="space-y-6">
            {/* Patient Demographic Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={rxPatientName}
                  onChange={(e) => setRxPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  required
                  value={rxPatientAge}
                  onChange={(e) => setRxPatientAge(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={rxPatientGender}
                  onChange={(e) => setRxPatientGender(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-hidden"
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Clinical Diagnosis */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Diagnosis & Findings
              </label>
              <input
                type="text"
                required
                value={rxDiagnosis}
                onChange={(e) => setRxDiagnosis(e.target.value)}
                placeholder="e.g. Essential Hypertension (Mild), Seasonal Viral Fever"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-hidden"
              />
            </div>

            {/* Prescribed Medicines with Generic Tag */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Prescribed Generic Drugs (Jan Aushadhi PMBJP)
                </label>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Drug</span>
                </button>
              </div>

              <div className="space-y-3">
                {rxMedicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 relative"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                          Drug Name & Strength
                        </label>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => {
                            const updated = [...rxMedicines];
                            updated[idx].name = e.target.value;
                            setRxMedicines(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                          Frequency
                        </label>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => {
                            const updated = [...rxMedicines];
                            updated[idx].frequency = e.target.value;
                            setRxMedicines(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => {
                            const updated = [...rxMedicines];
                            updated[idx].duration = e.target.value;
                            setRxMedicines(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                          Instructions
                        </label>
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => {
                            const updated = [...rxMedicines];
                            updated[idx].instructions = e.target.value;
                            setRxMedicines(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                      <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Available under PMBJP Jan Aushadhi (~75% cheaper)
                      </span>

                      {rxMedicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Advice & Lifestyle Guidance */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lifestyle & Dietary Advice
              </label>
              <textarea
                rows={2}
                value={rxAdvice}
                onChange={(e) => setRxAdvice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-hidden"
              />
            </div>

            {/* Submit & Sign */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Digitally Sign & Issue e-Prescription</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Issued Prescriptions History */}
      {activeTab === "history" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Prescriptions Issued by You</h2>
          <div className="space-y-4">
            {prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {rx.prescriptionNumber}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base mt-1">
                      Patient: {rx.patientName} ({rx.patientAge} yrs, {rx.patientGender})
                    </h3>
                  </div>
                  <div className="text-right text-xs text-slate-500 font-medium">
                    <div>Date: {rx.date}</div>
                    <div className="text-emerald-600 font-bold">Follow-up: {rx.followUpDate}</div>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-slate-700">
                    <strong>Diagnosis:</strong> {rx.diagnosis}
                  </p>
                  <p className="text-slate-600">
                    <strong>Advice:</strong> {rx.advice}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-700 uppercase">
                    Prescribed Medicines:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rx.medicines.map((m, mi) => (
                      <div
                        key={mi}
                        className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-xs space-y-0.5"
                      >
                        <p className="font-bold text-slate-800">{m.name}</p>
                        <p className="text-slate-500 text-[11px]">
                          {m.frequency} • {m.duration}
                        </p>
                        <p className="text-blue-600 text-[10px] font-medium">{m.instructions}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
