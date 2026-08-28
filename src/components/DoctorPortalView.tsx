import React, { useState, useEffect, useMemo } from "react";
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
  Search,
  Activity,
  Heart,
  Thermometer,
  RefreshCw,
  MapPin,
  FileCheck,
  ChevronRight,
  Phone,
  AlertTriangle,
  Radio,
} from "lucide-react";
import {
  Language,
  AuthAccount,
} from "../types";
import { api } from "../lib/api";

interface PatientForDate {
  id: number;
  userId: number;
  doctorId?: number;
  hospitalId?: number;
  doctorName: string;
  specialty: string;
  facilityName: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  patientVillage?: string;
  patientBloodGroup?: string;
  patientAbha?: string;
  date: string;
  time: string;
  status: "confirmed" | "in-consultation" | "completed" | "cancelled";
  type: "in-person" | "teleconsult";
  symptoms?: string;
  vitalsBp?: string;
  vitalsPulse?: number;
  vitalsSpo2?: number;
  vitalsTemp?: string;
  triagePriority?: "high" | "medium" | "low";
  rxDiagnosis?: string;
  rxMedicines?: string; // JSON string or array
  rxAdvice?: string;
  notes?: string;
  createdAt?: string;
}

interface DoctorPortalViewProps {
  currentAccount: AuthAccount | null;
  language: Language;
  initialTab?: "queue" | "rx" | "history";
  onTabChange?: (tab: "queue" | "rx" | "history") => void;
}

export const DoctorPortalView: React.FC<DoctorPortalViewProps> = ({
  currentAccount,
  language,
  initialTab = "queue",
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<"queue" | "rx" | "history">(initialTab);
  const todayDateString = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayDateString);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Live Database State
  const [patients, setPatients] = useState<PatientForDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active Consultation Modal / In-Progress Call
  const [activeConsultation, setActiveConsultation] = useState<PatientForDate | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Walk-In Patient Registration Form Modal
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInAge, setWalkInAge] = useState<number | "">(45);
  const [walkInGender, setWalkInGender] = useState("Female");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInVillage, setWalkInVillage] = useState("");
  const [walkInSymptoms, setWalkInSymptoms] = useState("");
  const [walkInBp, setWalkInBp] = useState("120/80 mmHg");
  const [walkInPulse, setWalkInPulse] = useState<number | "">(74);
  const [walkInSpo2, setWalkInSpo2] = useState<number | "">(98);
  const [walkInTemp, setWalkInTemp] = useState("98.6°F");
  const [walkInPriority, setWalkInPriority] = useState<"high" | "medium" | "low">("medium");
  const [walkInTime, setWalkInTime] = useState("12:00 PM");
  const [isSubmittingWalkIn, setIsSubmittingWalkIn] = useState(false);

  // Prescription Pad State
  const [selectedPatientForRx, setSelectedPatientForRx] = useState<PatientForDate | null>(null);
  const [rxDiagnosis, setRxDiagnosis] = useState("Essential Stage-1 Hypertension");
  const [rxAdvice, setRxAdvice] = useState("Low sodium salt diet. 30 mins morning walk. Regular BP monitoring.");
  const [rxMedicinesList, setRxMedicinesList] = useState<
    { name: string; dosage: string; frequency: string; duration: string; janAushadhi: boolean }[]
  >([
    { name: "Amlodipine 5mg (PMBJP)", dosage: "5mg", frequency: "Once daily morning", duration: "30 days", janAushadhi: true },
    { name: "Paracetamol 500mg (PMBJP)", dosage: "500mg", frequency: "SOS as needed", duration: "5 days", janAushadhi: true },
  ]);
  const [rxSuccessNotice, setRxSuccessNotice] = useState(false);

  // 1. Fetch Patients by Date from PostgreSQL API
  const fetchPatients = async (date: string) => {
    setIsLoading(true);
    try {
      const data = await api.getDoctorPatientsByDate(date);
      if (Array.isArray(data)) {
        setPatients(data);
      }
    } catch (error) {
      console.warn("Could not fetch patients for date:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPatients(selectedDate);
  }, [selectedDate]);

  // Call timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const handleTabSwitch = (tab: "queue" | "rx" | "history") => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // Filtered Patients for the selected date
  const filteredPatients = useMemo(() => {
    return patients.filter((pt) => {
      if (priorityFilter !== "all" && pt.triagePriority !== priorityFilter) return false;
      if (statusFilter !== "all" && pt.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = pt.patientName?.toLowerCase().includes(q);
        const matchesVillage = pt.patientVillage?.toLowerCase().includes(q);
        const matchesPhone = pt.patientPhone?.includes(q);
        const matchesAbha = pt.patientAbha?.includes(q);
        const matchesSymptoms = pt.symptoms?.toLowerCase().includes(q);
        return matchesName || matchesVillage || matchesPhone || matchesAbha || matchesSymptoms;
      }
      return true;
    });
  }, [patients, priorityFilter, statusFilter, searchQuery]);

  // Statistics for the date
  const stats = useMemo(() => {
    const total = patients.length;
    const waiting = patients.filter((p) => p.status === "confirmed").length;
    const inConsultation = patients.filter((p) => p.status === "in-consultation").length;
    const completed = patients.filter((p) => p.status === "completed").length;
    const highPriority = patients.filter((p) => p.triagePriority === "high").length;
    return { total, waiting, inConsultation, completed, highPriority };
  }, [patients]);

  // Register Walk-In Patient
  const handleRegisterWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) return;

    setIsSubmittingWalkIn(true);
    try {
      const newPatientData = {
        doctorId: 1,
        hospitalId: 1,
        doctorName: currentAccount?.name || "Dr. K. Srinivas Rao, MBBS",
        specialty: currentAccount?.specialty || "General Physician",
        facilityName: currentAccount?.facilityName || "Primary Health Centre (PHC), Bhoothpur",
        patientName: walkInName.trim(),
        patientAge: walkInAge ? Number(walkInAge) : 40,
        patientGender: walkInGender,
        patientPhone: walkInPhone.trim() || "+91 98480 00000",
        patientVillage: walkInVillage.trim() || "Bhoothpur Rural",
        patientBloodGroup: "O+",
        date: selectedDate,
        time: walkInTime || "12:00 PM",
        status: "confirmed",
        type: "in-person",
        symptoms: walkInSymptoms.trim() || "General OPD Walk-in",
        vitalsBp: walkInBp || "120/80 mmHg",
        vitalsPulse: walkInPulse ? Number(walkInPulse) : 74,
        vitalsSpo2: walkInSpo2 ? Number(walkInSpo2) : 98,
        vitalsTemp: walkInTemp || "98.6°F",
        triagePriority: walkInPriority,
      };

      const created = await api.createWalkinPatient(newPatientData);
      if (created) {
        setPatients((prev) => [created, ...prev]);
        setIsWalkInModalOpen(false);
        setWalkInName("");
        setWalkInPhone("");
        setWalkInVillage("");
        setWalkInSymptoms("");
      }
    } catch (err) {
      console.error("Failed to register walk-in patient:", err);
    } finally {
      setIsSubmittingWalkIn(false);
    }
  };

  // Start Consultation
  const handleStartConsultation = (patient: PatientForDate) => {
    setActiveConsultation(patient);
    setIsCallActive(true);
    setCallDuration(0);
    // Mark as in-consultation in PostgreSQL
    api.updateAppointmentDetails(patient.id, { status: "in-consultation" })
      .then(() => {
        setPatients((prev) =>
          prev.map((p) => (p.id === patient.id ? { ...p, status: "in-consultation" } : p))
        );
      })
      .catch((e) => console.warn(e));
  };

  // End Consultation
  const handleEndConsultation = () => {
    if (activeConsultation) {
      api.updateAppointmentDetails(activeConsultation.id, { status: "completed" })
        .then(() => {
          setPatients((prev) =>
            prev.map((p) => (p.id === activeConsultation.id ? { ...p, status: "completed" } : p))
          );
        })
        .catch((e) => console.warn(e));
    }
    setIsCallActive(false);
    setActiveConsultation(null);
  };

  // Quick Open Rx Modal for a patient
  const handleOpenRxForPatient = (patient: PatientForDate) => {
    setSelectedPatientForRx(patient);
    if (patient.rxDiagnosis) setRxDiagnosis(patient.rxDiagnosis);
    if (patient.rxAdvice) setRxAdvice(patient.rxAdvice);
    if (patient.rxMedicines) {
      try {
        const parsed = JSON.parse(patient.rxMedicines);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRxMedicinesList(parsed);
        }
      } catch (err) {
        console.warn("Could not parse existing medicines:", err);
      }
    }
    setActiveTab("rx");
  };

  // Submit Prescription to PostgreSQL
  const handleSubmitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForRx) return;

    try {
      await api.updateAppointmentDetails(selectedPatientForRx.id, {
        status: "completed",
        rxDiagnosis,
        rxMedicines: rxMedicinesList,
        rxAdvice,
      });

      setPatients((prev) =>
        prev.map((p) =>
          p.id === selectedPatientForRx.id
            ? {
                ...p,
                status: "completed",
                rxDiagnosis,
                rxMedicines: JSON.stringify(rxMedicinesList),
                rxAdvice,
              }
            : p
        )
      );

      setRxSuccessNotice(true);
      setTimeout(() => setRxSuccessNotice(false), 3500);
    } catch (err) {
      console.error("Failed to submit prescription:", err);
    }
  };

  const addMedicineRow = () => {
    setRxMedicinesList((prev) => [
      ...prev,
      {
        name: "Cetirizine 10mg (PMBJP)",
        dosage: "10mg",
        frequency: "Once daily at night",
        duration: "5 days",
        janAushadhi: true,
      },
    ]);
  };

  const removeMedicineRow = (index: number) => {
    setRxMedicinesList((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* 1. Doctor Profile & Real-Time OPD Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {currentAccount?.specialty || "General Physician & Rural Care"}
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                MCI License: {currentAccount?.licenseNumber || "TS-MCI-48291"}
              </span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-purple-600 animate-pulse" />
                Live Cloud SQL Connected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {currentAccount?.name || "Dr. K. Srinivas Rao, MBBS"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {currentAccount?.facilityName || "Primary Health Centre (PHC), Bhoothpur"} • OPD Hours: 09:00 AM - 02:00 PM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsWalkInModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Add Walk-In Patient
          </button>

          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchPatients(selectedDate);
            }}
            disabled={isRefreshing}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all cursor-pointer"
            title="Refresh patient roster"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Date Selection & Counter Badges */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-500" />
              <label htmlFor="date-picker" className="text-sm font-bold text-slate-800">
                Select Date for OPD Roster:
              </label>
            </div>
            <input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {selectedDate === todayDateString && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                ● Today
              </span>
            )}
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate(todayDateString)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDate === todayDateString
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setSelectedDate(tomorrow.toISOString().split("T")[0]);
              }}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* 5 High-Impact Metric Blocks for the Date */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500">Total Patients</span>
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.total}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Scheduled for {selectedDate}</p>
          </div>

          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-amber-700">Waiting in Queue</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-900">{stats.waiting}</div>
            <p className="text-[11px] text-amber-600 mt-0.5">Ready for consultation</p>
          </div>

          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-blue-700">In-Consultation</span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-900">{stats.inConsultation}</div>
            <p className="text-[11px] text-blue-600 mt-0.5">Active doctor session</p>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-emerald-700">Completed OPD</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900">{stats.completed}</div>
            <p className="text-[11px] text-emerald-600 mt-0.5">Rx issued & finished</p>
          </div>

          <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-rose-700">High Priority</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-900">{stats.highPriority}</div>
            <p className="text-[11px] text-rose-600 mt-0.5">Urgent triage cases</p>
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation (Patients Queue vs Digital Rx Pad) */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => handleTabSwitch("queue")}
          className={`pb-2.5 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "queue"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          Patient Details for {selectedDate} ({filteredPatients.length})
        </button>

        <button
          onClick={() => handleTabSwitch("rx")}
          className={`pb-2.5 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "rx"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Pill className="w-4 h-4" />
          Jan Aushadhi Prescription Pad
        </button>
      </div>

      {/* TAB 1: Patients for Date View */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient name, ABHA, village, symptoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                aria-label="Filter by priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="high">High / Urgent</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low / Routine</option>
              </select>

              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Waiting Queue</option>
                <option value="in-consultation">In-Consultation</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Patients List / Table */}
          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm font-semibold">Loading patients from PostgreSQL...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-3">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-800">No Patients Found for {selectedDate}</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                There are no scheduled patients matching your filter on this date. You can add a new walk-in patient using the button above.
              </p>
              <button
                onClick={() => setIsWalkInModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer"
              >
                + Register First Walk-In Patient
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPatients.map((patient, index) => {
                const isHighPriority = patient.triagePriority === "high";
                const isCompleted = patient.status === "completed";
                const isInConsultation = patient.status === "in-consultation";

                return (
                  <div
                    key={patient.id || index}
                    className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-sm transition-all hover:shadow-md ${
                      isHighPriority
                        ? "border-rose-300 bg-rose-50/20"
                        : isInConsultation
                        ? "border-blue-300 bg-blue-50/20"
                        : isCompleted
                        ? "border-emerald-200 bg-emerald-50/10"
                        : "border-slate-200/80"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Patient Core Identity & Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                            Token #{index + 1} • {patient.time}
                          </span>

                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              patient.triagePriority === "high"
                                ? "bg-rose-100 text-rose-800"
                                : patient.triagePriority === "medium"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {patient.triagePriority === "high"
                              ? "⚠️ High Priority Triage"
                              : patient.triagePriority === "medium"
                              ? "⚡ Priority Review"
                              : "✓ Routine Check"}
                          </span>

                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-800"
                                : isInConsultation
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            Status: {patient.status.toUpperCase()}
                          </span>

                          <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {patient.type === "teleconsult" ? "📹 Tele-Consultation" : "🏥 In-Person PHC Visit"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-900">{patient.patientName}</h3>
                          <span className="text-xs text-slate-500 font-semibold">
                            {patient.patientAge} yrs • {patient.patientGender} • Blood: {patient.patientBloodGroup || "O+"}
                          </span>
                        </div>

                        {/* Patient Demographics & ABHA */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{patient.patientPhone || "+91 98480 12345"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{patient.patientVillage || "Bhoothpur Village, Telangana"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                            <span className="font-mono text-[11px] text-blue-700">ABHA: {patient.patientAbha || "91-4829-1029-4821"}</span>
                          </div>
                        </div>

                        {/* Symptoms & Chief Complaint */}
                        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 text-xs text-slate-800 mt-2">
                          <span className="font-bold text-slate-600 block mb-0.5">Chief Complaint / Symptoms:</span>
                          <p>{patient.symptoms || "Regular Follow-up and general health review."}</p>
                        </div>

                        {/* Patient Vitals Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            <div>
                              <span className="text-[10px] text-slate-400 block">BP</span>
                              <span className="text-xs font-bold text-slate-800">{patient.vitalsBp || "120/80 mmHg"}</span>
                            </div>
                          </div>

                          <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-rose-500" />
                            <div>
                              <span className="text-[10px] text-slate-400 block">Pulse</span>
                              <span className="text-xs font-bold text-slate-800">{patient.vitalsPulse || 76} bpm</span>
                            </div>
                          </div>

                          <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-600" />
                            <div>
                              <span className="text-[10px] text-slate-400 block">SpO2</span>
                              <span className="text-xs font-bold text-slate-800">{patient.vitalsSpo2 || 98}%</span>
                            </div>
                          </div>

                          <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-amber-500" />
                            <div>
                              <span className="text-[10px] text-slate-400 block">Temp</span>
                              <span className="text-xs font-bold text-slate-800">{patient.vitalsTemp || "98.6°F"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Existing Prescription details if already completed */}
                        {patient.rxDiagnosis && (
                          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs space-y-1">
                            <span className="font-bold text-emerald-800 block">✓ Issued Diagnosis & Rx:</span>
                            <p className="text-emerald-950 font-semibold">{patient.rxDiagnosis}</p>
                            {patient.rxAdvice && <p className="text-emerald-800 text-[11px]">Advice: {patient.rxAdvice}</p>}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons for Doctor */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-stretch gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-4">
                        {!isCompleted && (
                          <button
                            onClick={() => handleStartConsultation(patient)}
                            className="flex-1 lg:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                          >
                            <Video className="w-4 h-4" />
                            {isInConsultation ? "Resume Call" : "Start Consultation"}
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenRxForPatient(patient)}
                          className="flex-1 lg:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                        >
                          <Pill className="w-4 h-4" />
                          {patient.rxDiagnosis ? "Edit Prescription" : "Write Digital Rx"}
                        </button>

                        {!isCompleted && (
                          <button
                            onClick={() => {
                              api.updateAppointmentDetails(patient.id, { status: "completed" })
                                .then(() => {
                                  setPatients((prev) =>
                                    prev.map((p) => (p.id === patient.id ? { ...p, status: "completed" } : p))
                                  );
                                })
                                .catch((e) => console.warn(e));
                            }}
                            className="flex-1 lg:flex-none px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Mark Done
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Prescription Pad (Generic Jan Aushadhi Writer) */}
      {activeTab === "rx" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)
                </span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  Jan Aushadhi Generic Savings
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Digital OPD Prescription & Generic Medicines</h2>
              <p className="text-xs text-slate-500">
                Prescribing affordable, WHO-GMP certified generic equivalents directly reduces patient out-of-pocket expenses by up to 80%.
              </p>
            </div>

            {selectedPatientForRx && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs">
                <span className="text-emerald-600 font-bold block">Active Patient:</span>
                <p className="font-bold text-emerald-950">{selectedPatientForRx.patientName}</p>
                <p className="text-emerald-700">{selectedPatientForRx.patientAge}y • {selectedPatientForRx.patientGender} • {selectedPatientForRx.patientVillage}</p>
              </div>
            )}
          </div>

          {rxSuccessNotice && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>Digital Prescription saved to PostgreSQL and patient record updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmitPrescription} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Clinical Diagnosis / Findings
              </label>
              <input
                type="text"
                required
                value={rxDiagnosis}
                onChange={(e) => setRxDiagnosis(e.target.value)}
                placeholder="e.g. Essential Stage-1 Hypertension / Allergic Bronchospasm"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Generic Medicines Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Prescribed Generic Medicines (Jan Aushadhi Formulations)
                </label>
                <button
                  type="button"
                  onClick={addMedicineRow}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Medicine
                </button>
              </div>

              <div className="space-y-2">
                {rxMedicinesList.map((med, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 items-center"
                  >
                    <div className="sm:col-span-4">
                      <span className="text-[10px] text-slate-400 block sm:hidden">Medicine Name</span>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRxMedicinesList((prev) =>
                            prev.map((m, i) => (i === idx ? { ...m, name: val } : m))
                          );
                        }}
                        placeholder="e.g. Amlodipine 5mg (PMBJP)"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-slate-400 block sm:hidden">Dosage</span>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRxMedicinesList((prev) =>
                            prev.map((m, i) => (i === idx ? { ...m, dosage: val } : m))
                          );
                        }}
                        placeholder="500mg / 1 tab"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <span className="text-[10px] text-slate-400 block sm:hidden">Frequency</span>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRxMedicinesList((prev) =>
                            prev.map((m, i) => (i === idx ? { ...m, frequency: val } : m))
                          );
                        }}
                        placeholder="Twice daily after meals"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-slate-400 block sm:hidden">Duration</span>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRxMedicinesList((prev) =>
                            prev.map((m, i) => (i === idx ? { ...m, duration: val } : m))
                          );
                        }}
                        placeholder="30 days"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeMedicineRow(idx)}
                        disabled={rxMedicinesList.length <= 1}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-30 cursor-pointer"
                        title="Remove medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Dietary & Lifestyle Advice (Multilingual / Voice Compatible)
              </label>
              <textarea
                rows={3}
                value={rxAdvice}
                onChange={(e) => setRxAdvice(e.target.value)}
                placeholder="e.g. Low sodium salt intake. Avoid fried foods. Drink boiled cooled water. Regular BP follow-up at nearest PHC."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print PMBJP Prescription
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save & Issue Prescription
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 1: Register Walk-In Patient Modal */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Walk-In Patient for {selectedDate}</h3>
                <p className="text-xs text-slate-500">Register on-spot patient arriving at Doctor OPD counter.</p>
              </div>
              <button
                onClick={() => setIsWalkInModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterWalkIn} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder="e.g. Venkanna Goud"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    placeholder="+91 98480 12345"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={walkInAge}
                    onChange={(e) => setWalkInAge(e.target.value ? Number(e.target.value) : "")}
                    placeholder="45"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={walkInGender}
                    onChange={(e) => setWalkInGender(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={walkInTime}
                    onChange={(e) => setWalkInTime(e.target.value)}
                    placeholder="12:15 PM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Village / Mandal Address</label>
                <input
                  type="text"
                  value={walkInVillage}
                  onChange={(e) => setWalkInVillage(e.target.value)}
                  placeholder="e.g. Kothakota Mandal, Rural Telangana"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Symptoms / Chief Complaint</label>
                <textarea
                  rows={2}
                  value={walkInSymptoms}
                  onChange={(e) => setWalkInSymptoms(e.target.value)}
                  placeholder="e.g. Mild headache, chest heaviness, fasting sugar check"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">BP (mmHg)</label>
                  <input
                    type="text"
                    value={walkInBp}
                    onChange={(e) => setWalkInBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Pulse (bpm)</label>
                  <input
                    type="number"
                    value={walkInPulse}
                    onChange={(e) => setWalkInPulse(e.target.value ? Number(e.target.value) : "")}
                    placeholder="74"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={walkInSpo2}
                    onChange={(e) => setWalkInSpo2(e.target.value ? Number(e.target.value) : "")}
                    placeholder="98"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Triage Priority</label>
                  <select
                    value={walkInPriority}
                    onChange={(e) => setWalkInPriority(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWalkIn}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  {isSubmittingWalkIn ? "Registering..." : "Add to Today's Queue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Active Tele-Consultation Call / Room */}
      {isCallActive && activeConsultation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-white space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Live OPD Video Session with {activeConsultation.patientName}</h3>
                  <p className="text-xs text-slate-400">ABHA: {activeConsultation.patientAbha || "91-4829-1029-4821"}</p>
                </div>
              </div>
              <div className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                {formatSeconds(callDuration)}
              </div>
            </div>

            {/* Patient Vitals & Summary inside active call */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Age/Gender: {activeConsultation.patientAge}y, {activeConsultation.patientGender}</span>
                <span>Village: {activeConsultation.patientVillage}</span>
              </div>
              <p className="text-slate-200">
                <strong className="text-emerald-400">Chief Symptoms:</strong> {activeConsultation.symptoms}
              </p>
              <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">BP</span>
                  <span className="font-bold text-white">{activeConsultation.vitalsBp || "120/80"}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">Pulse</span>
                  <span className="font-bold text-white">{activeConsultation.vitalsPulse || 76} bpm</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">SpO2</span>
                  <span className="font-bold text-white">{activeConsultation.vitalsSpo2 || 98}%</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">Temp</span>
                  <span className="font-bold text-white">{activeConsultation.vitalsTemp || "98.6°F"}</span>
                </div>
              </div>
            </div>

            {/* Doctor Call Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  handleOpenRxForPatient(activeConsultation);
                  setIsCallActive(false);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Pill className="w-4 h-4" />
                Write Digital Prescription Now
              </button>

              <button
                onClick={handleEndConsultation}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 rotate-135" />
                End Consultation & Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
