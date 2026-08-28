import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  BedDouble,
  Activity,
  Ambulance,
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Pill,
  UserCheck,
  RefreshCw,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Radio,
  Plus,
  Trash2,
  Edit,
  Stethoscope,
  Phone,
  Search,
  Check,
  Layers,
  Sparkles,
  Award,
  Navigation,
} from "lucide-react";
import {
  AuthAccount,
  Language,
} from "../types";
import { api } from "../lib/api";

interface HospitalFacilityData {
  id: number;
  userId?: number;
  name: string;
  type: string;
  registrationNumber?: string;
  address: string;
  district: string;
  state: string;
  pincode?: string;
  lat: string;
  lng: string;
  phone: string;
  emergencyPhone?: string;
  totalBeds: number;
  occupiedBeds: number;
  totalIcu: number;
  occupiedIcu: number;
  totalOxygen: number;
  occupiedOxygen: number;
  totalMaternity: number;
  occupiedMaternity: number;
  hasEmergency: boolean;
  hasMaternity: boolean;
  hasPharmacy: boolean;
  hasTeleconsult: boolean;
  hasPathologyLab: boolean;
  hasImmunization: boolean;
  facilitiesList?: string;
  operationalStatus?: string;
}

interface HospitalDoctor {
  id: number;
  hospitalId: number;
  userId?: number;
  name: string;
  specialty: string;
  qualification: string;
  licenseNumber: string;
  experienceYears: number;
  opdTimings: string;
  opdFeeInr: number;
  phone: string;
  rating: string;
  totalConsultations: number;
  status: "available" | "in-opd" | "on-break" | "off-duty";
}

interface HospitalPortalViewProps {
  currentAccount: AuthAccount | null;
  language: Language;
  initialTab?: "overview" | "doctors" | "beds" | "facilities" | "pharmacy";
  onTabChange?: (tab: "overview" | "doctors" | "beds" | "facilities" | "pharmacy") => void;
}

export const HospitalPortalView: React.FC<HospitalPortalViewProps> = ({
  currentAccount,
  language,
  initialTab = "overview",
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "doctors" | "beds" | "facilities" | "pharmacy">(
    initialTab
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hospital Facility Details (Entered at creation / saved in DB)
  const [facility, setFacility] = useState<HospitalFacilityData | null>(null);

  // Doctors belonging to this specific hospital
  const [hospitalDoctors, setHospitalDoctors] = useState<HospitalDoctor[]>([]);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");

  // Modal State for Onboarding New Doctor to this Hospital
  const [isOnboardDoctorModalOpen, setIsOnboardDoctorModalOpen] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState("");
  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState("General Physician");
  const [newDoctorQualification, setNewDoctorQualification] = useState("MBBS, MD");
  const [newDoctorLicense, setNewDoctorLicense] = useState("");
  const [newDoctorExp, setNewDoctorExp] = useState<number | "">(8);
  const [newDoctorPhone, setNewDoctorPhone] = useState("+91 94401 23456");
  const [newDoctorTimings, setNewDoctorTimings] = useState("09:00 AM - 02:00 PM");
  const [newDoctorFee, setNewDoctorFee] = useState<number | "">(0);
  const [isOnboardingDoctor, setIsOnboardingDoctor] = useState(false);

  // Modal State for Editing Hospital Location & Facilities
  const [isEditFacilityModalOpen, setIsEditFacilityModalOpen] = useState(false);
  const [editAddress, setEditAddress] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmergencyPhone, setEditEmergencyPhone] = useState("108 / 08542-242301");
  const [editLat, setEditLat] = useState("16.7431");
  const [editLng, setEditLng] = useState("77.9890");
  const [editHasEmergency, setEditHasEmergency] = useState(true);
  const [editHasMaternity, setEditHasMaternity] = useState(true);
  const [editHasPharmacy, setEditHasPharmacy] = useState(true);
  const [editHasTeleconsult, setEditHasTeleconsult] = useState(true);
  const [editHasPathologyLab, setEditHasPathologyLab] = useState(true);
  const [editHasImmunization, setEditHasImmunization] = useState(true);
  const [isSavingFacility, setIsSavingFacility] = useState(false);

  // Pharmacy Inventory State
  const [pharmacyItems, setPharmacyItems] = useState([
    { id: "p1", name: "Paracetamol 500mg (PMBJP)", category: "Antipyretic", stockUnits: 4200, minThreshold: 1000, price: 5.5, status: "in_stock" },
    { id: "p2", name: "Metformin 500mg (PMBJP)", category: "Antidiabetic", stockUnits: 2800, minThreshold: 800, price: 12.0, status: "in_stock" },
    { id: "p3", name: "Amlodipine 5mg (PMBJP)", category: "Antihypertensive", stockUnits: 3100, minThreshold: 600, price: 8.5, status: "in_stock" },
    { id: "p4", name: "Amoxicillin 500mg (PMBJP)", category: "Antibiotic", stockUnits: 140, minThreshold: 500, price: 35.0, status: "low_stock" },
    { id: "p5", name: "ORS WHO Sachet 21.8g", category: "Rehydration", stockUnits: 1500, minThreshold: 400, price: 4.2, status: "in_stock" },
    { id: "p6", name: "Cetirizine 10mg (PMBJP)", category: "Antihistamine", stockUnits: 1800, minThreshold: 400, price: 6.0, status: "in_stock" },
  ]);

  // Fetch Hospital Facility and Doctors strictly belonging to this hospital
  const loadHospitalData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Facility Details
      const fac = await api.getMyHospitalFacility();
      if (fac) {
        setFacility(fac);
        setEditAddress(fac.address || "");
        setEditDistrict(fac.district || "");
        setEditPincode(fac.pincode || "509001");
        setEditPhone(fac.phone || "+91 8542 242300");
        setEditEmergencyPhone(fac.emergencyPhone || "108 / 08542-242301");
        setEditLat(fac.lat || "16.7431");
        setEditLng(fac.lng || "77.9890");
        setEditHasEmergency(Boolean(fac.hasEmergency));
        setEditHasMaternity(Boolean(fac.hasMaternity));
        setEditHasPharmacy(Boolean(fac.hasPharmacy));
        setEditHasTeleconsult(Boolean(fac.hasTeleconsult));
        setEditHasPathologyLab(Boolean(fac.hasPathologyLab));
        setEditHasImmunization(Boolean(fac.hasImmunization));

        // 2. Fetch Doctors strictly for this Hospital
        const docs = await api.getHospitalDoctors(fac.id);
        if (Array.isArray(docs)) {
          setHospitalDoctors(docs);
        }
      }
    } catch (err) {
      console.warn("Error fetching hospital portal data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadHospitalData();
  }, [currentAccount?.id]);

  const handleTabSwitch = (tab: "overview" | "doctors" | "beds" | "facilities" | "pharmacy") => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // Filtered Doctors for this Hospital
  const filteredDoctors = useMemo(() => {
    return hospitalDoctors.filter((doc) => {
      if (doctorSearchQuery.trim()) {
        const q = doctorSearchQuery.toLowerCase();
        return (
          doc.name.toLowerCase().includes(q) ||
          doc.specialty.toLowerCase().includes(q) ||
          doc.qualification.toLowerCase().includes(q) ||
          doc.licenseNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [hospitalDoctors, doctorSearchQuery]);

  // Handle Bed Occupancy Updates
  const handleUpdateBed = async (
    type: "general" | "icu" | "oxygen" | "maternity",
    delta: number
  ) => {
    if (!facility) return;

    let updatedGeneral = facility.occupiedBeds;
    let updatedIcu = facility.occupiedIcu;
    let updatedOxygen = facility.occupiedOxygen;
    let updatedMaternity = facility.occupiedMaternity;

    if (type === "general") {
      updatedGeneral = Math.max(0, Math.min(facility.totalBeds, facility.occupiedBeds + delta));
    } else if (type === "icu") {
      updatedIcu = Math.max(0, Math.min(facility.totalIcu, facility.occupiedIcu + delta));
    } else if (type === "oxygen") {
      updatedOxygen = Math.max(0, Math.min(facility.totalOxygen, facility.occupiedOxygen + delta));
    } else if (type === "maternity") {
      updatedMaternity = Math.max(0, Math.min(facility.totalMaternity, facility.occupiedMaternity + delta));
    }

    setFacility({
      ...facility,
      occupiedBeds: updatedGeneral,
      occupiedIcu: updatedIcu,
      occupiedOxygen: updatedOxygen,
      occupiedMaternity: updatedMaternity,
    });

    try {
      await api.updateHospitalFacility(facility.id, {
        occupiedBeds: updatedGeneral,
        occupiedIcu: updatedIcu,
        occupiedOxygen: updatedOxygen,
        occupiedMaternity: updatedMaternity,
      });
    } catch (err) {
      console.warn("Failed to sync bed count:", err);
    }
  };

  // Onboard New Doctor to this Hospital
  const handleOnboardDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctorName.trim() || !facility) return;

    setIsOnboardingDoctor(true);
    try {
      const created = await api.addDoctorToHospital(facility.id, {
        name: newDoctorName.trim(),
        specialty: newDoctorSpecialty,
        qualification: newDoctorQualification.trim(),
        licenseNumber: newDoctorLicense.trim() || `TS-MCI-${Math.floor(10000 + Math.random() * 90000)}`,
        experienceYears: newDoctorExp ? Number(newDoctorExp) : 5,
        opdTimings: newDoctorTimings,
        opdFeeInr: newDoctorFee ? Number(newDoctorFee) : 0,
        phone: newDoctorPhone.trim(),
        rating: "4.8",
        status: "available",
      });

      if (created) {
        setHospitalDoctors((prev) => [created, ...prev]);
        setIsOnboardDoctorModalOpen(false);
        setNewDoctorName("");
        setNewDoctorLicense("");
      }
    } catch (err) {
      console.error("Failed to onboard doctor:", err);
    } finally {
      setIsOnboardingDoctor(false);
    }
  };

  // Remove / Relieve Doctor from Hospital
  const handleDeleteDoctor = async (doctorId: number) => {
    if (!facility) return;
    try {
      await api.deleteDoctorFromHospital(facility.id, doctorId);
      setHospitalDoctors((prev) => prev.filter((d) => d.id !== doctorId));
    } catch (err) {
      console.error("Failed to delete doctor:", err);
    }
  };

  // Save Updated Facility Location and Registered Capabilities
  const handleSaveFacilityDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facility) return;

    setIsSavingFacility(true);
    try {
      const updated = await api.updateHospitalFacility(facility.id, {
        address: editAddress,
        district: editDistrict,
        pincode: editPincode,
        phone: editPhone,
        emergencyPhone: editEmergencyPhone,
        lat: editLat,
        lng: editLng,
        hasEmergency: editHasEmergency,
        hasMaternity: editHasMaternity,
        hasPharmacy: editHasPharmacy,
        hasTeleconsult: editHasTeleconsult,
        hasPathologyLab: editHasPathologyLab,
        hasImmunization: editHasImmunization,
      });

      if (updated) {
        setFacility(updated);
        setIsEditFacilityModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to update facility details:", err);
    } finally {
      setIsSavingFacility(false);
    }
  };

  const handleRestock = (id: string) => {
    setPharmacyItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, stockUnits: item.stockUnits + 500, status: "in_stock" } : item
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* 1. Hospital Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                {facility?.type || currentAccount?.facilityType || "District General Hospital"}
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Govt Reg: {facility?.registrationNumber || currentAccount?.registrationNumber || "TS-HOSP-MBNR-001"}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                Live District Telemetry Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {facility?.name || currentAccount?.name || "Mahabubnagar District Health Command"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {facility?.address || "Station Road, Old Town"}, {facility?.district || "Mahabubnagar"}, {facility?.state || "Telangana"} • PIN: {facility?.pincode || "509001"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditFacilityModalOpen(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-slate-600" />
            Edit Location & Facilities
          </button>

          <button
            onClick={() => setIsOnboardDoctorModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Onboard Doctor to Hospital
          </button>

          <button
            onClick={() => {
              setIsRefreshing(true);
              loadHospitalData();
            }}
            disabled={isRefreshing}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all cursor-pointer"
            title="Refresh hospital data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Hospital Doctors</span>
            <Stethoscope className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{hospitalDoctors.length}</div>
          <p className="text-[11px] text-blue-600 font-medium mt-0.5">
            {hospitalDoctors.filter((d) => d.status === "available" || d.status === "in-opd").length} on Active Duty
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Total Bed Capacity</span>
            <BedDouble className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {facility ? facility.totalBeds : 120}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {facility ? facility.totalBeds - facility.occupiedBeds : 42} Vacant Beds
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">ICU & Oxygen Units</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {facility ? facility.totalIcu + facility.totalOxygen : 45}
          </div>
          <p className="text-[11px] text-purple-600 font-medium mt-0.5">
            {facility ? facility.occupiedIcu : 12} ICU in Use
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Emergency Helpline</span>
            <PhoneCall className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-lg font-extrabold text-rose-700 font-mono">
            {facility?.emergencyPhone || "108 / 08542-242301"}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">24x7 Casualty Desk</p>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => handleTabSwitch("overview")}
          className={`pb-2.5 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Hospital Profile & Location
        </button>

        <button
          onClick={() => handleTabSwitch("doctors")}
          className={`pb-2.5 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === "doctors"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Hospital Doctors ({hospitalDoctors.length})
        </button>

        <button
          onClick={() => handleTabSwitch("facilities")}
          className={`pb-2.5 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === "facilities"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          Registered Facilities & Wings
        </button>

        <button
          onClick={() => handleTabSwitch("beds")}
          className={`pb-2.5 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === "beds"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BedDouble className="w-4 h-4" />
          Live Bed Management
        </button>

        <button
          onClick={() => handleTabSwitch("pharmacy")}
          className={`pb-2.5 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === "pharmacy"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Pill className="w-4 h-4" />
          PMBJP Generic Pharmacy
        </button>
      </div>

      {/* TAB 1: Hospital Overview & Location */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Location & Geographic Profile Card */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">Hospital Location & Geographic Coordinates</h2>
              </div>
              <button
                onClick={() => setIsEditFacilityModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Location
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Physical Address</span>
                <p className="text-sm font-bold text-slate-800">{facility?.address || "Station Road, Old Town"}</p>
                <p className="text-xs text-slate-500">Mandal: Mahabubnagar Urban, Telangana</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">District & Postal Code</span>
                <p className="text-sm font-bold text-slate-800">{facility?.district || "Mahabubnagar"} District, Telangana</p>
                <p className="text-xs text-slate-500 font-mono">PIN Code: {facility?.pincode || "509001"}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">GPS Geo-Coordinates</span>
                <p className="text-sm font-bold font-mono text-slate-800">
                  Lat: {facility?.lat || "16.7431"}° N, Lng: {facility?.lng || "77.9890"}° E
                </p>
                <p className="text-xs text-emerald-600 font-medium">ABDM GIS Registry Mapped</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Telecommunication Lines</span>
                <p className="text-sm font-bold text-slate-800">{facility?.phone || "+91 8542 242300"}</p>
                <p className="text-xs text-rose-600 font-bold">Emergency 24x7: {facility?.emergencyPhone || "108 / 08542-242301"}</p>
              </div>
            </div>

            {/* Interactive Map Visual Mock */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Geospatial Navigation Mapped</span>
                </div>
                <h4 className="text-base font-bold">{facility?.name || "District General Hospital"}</h4>
                <p className="text-xs text-slate-300">Fastest 108 Emergency Ambulance Response Radius: 15 km (Avg 12 mins)</p>
              </div>

              <div className="relative z-10 flex items-center gap-3 pt-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${facility?.lat || "16.7431"},${facility?.lng || "77.9890"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Open Live Map Navigation
                </a>
              </div>
            </div>
          </div>

          {/* Quick Doctor Summary on this Hospital */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Doctors at this Hospital ({hospitalDoctors.length})</h3>
              <button
                onClick={() => handleTabSwitch("doctors")}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {hospitalDoctors.slice(0, 4).map((doc) => (
                <div key={doc.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{doc.name}</h4>
                    <p className="text-[11px] text-slate-500">{doc.specialty} • {doc.qualification}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      doc.status === "available"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {doc.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsOnboardDoctorModalOpen(true)}
              className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Onboard Another Doctor
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Doctors belonging to THIS Hospital only */}
      {activeTab === "doctors" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search doctors at this hospital..."
                value={doctorSearchQuery}
                onChange={(e) => setDoctorSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">
                Strictly belonging to: <strong className="text-slate-800">{facility?.name || "This Hospital"}</strong>
              </span>
              <button
                onClick={() => setIsOnboardDoctorModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Doctor
              </button>
            </div>
          </div>

          {hospitalDoctors.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-3">
              <Stethoscope className="w-10 h-10 mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-800">No Doctors Assigned Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Onboard doctors belonging specifically to {facility?.name || "this hospital"} to manage their OPD timings and teleconsultation schedules.
              </p>
              <button
                onClick={() => setIsOnboardDoctorModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
              >
                + Onboard First Doctor
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-base">
                          {doc.name.replace("Dr. ", "").charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{doc.name}</h3>
                          <p className="text-xs text-blue-700 font-semibold">{doc.specialty}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          doc.status === "available"
                            ? "bg-emerald-100 text-emerald-800"
                            : doc.status === "in-opd"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {doc.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Qualifications:</span>
                        <span className="font-bold text-slate-800">{doc.qualification}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">MCI License:</span>
                        <span className="font-mono text-slate-700 font-semibold">{doc.licenseNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Experience:</span>
                        <span className="font-bold text-slate-800">{doc.experienceYears} Years</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">OPD Timings:</span>
                        <span className="font-bold text-slate-800">{doc.opdTimings}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Consultation Fee:</span>
                        <span className="font-bold text-emerald-700">
                          {doc.opdFeeInr === 0 ? "Free (Govt PHC/Hospital)" : `₹${doc.opdFeeInr}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 font-medium">
                      Phone: <strong className="text-slate-700">{doc.phone}</strong>
                    </div>

                    <button
                      onClick={() => handleDeleteDoctor(doc.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      title="Relieve doctor from this hospital"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Facilities Entered at Creation */}
      {activeTab === "facilities" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  Hospital Operational Wings & Clinical Capabilities
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Registered at Creation
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Hospital Facilities & Medical Services</h2>
              <p className="text-xs text-slate-500">
                These clinical facilities were entered during hospital registration and are active for district patients.
              </p>
            </div>

            <button
              onClick={() => setIsEditFacilityModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              Update Facilities
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              className={`p-5 rounded-2xl border transition-all ${
                facility?.hasEmergency ? "bg-emerald-50/40 border-emerald-200" : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-900">24x7 Emergency Trauma Unit</h4>
                {facility?.hasEmergency ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <span className="text-xs text-slate-400">Inactive</span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Equipped for acute trauma, cardiac arrest resuscitation, snake bite venom antiserum, and emergency triage.
              </p>
            </div>

            <div
              className={`p-5 rounded-2xl border transition-all ${
                facility?.hasMaternity ? "bg-emerald-50/40 border-emerald-200" : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-900">Maternity & Normal Delivery Ward</h4>
                {facility?.hasMaternity ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <span className="text-xs text-slate-400">Inactive</span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Obstetric delivery rooms, neonatal radiant warmers, and antenatal screening for high-risk pregnancies.
              </p>
            </div>

            <div
              className={`p-5 rounded-2xl border transition-all ${
                facility?.hasPharmacy ? "bg-emerald-50/40 border-emerald-200" : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-900">Jan Aushadhi Generic Pharmacy (PMBJP)</h4>
                {facility?.hasPharmacy ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <span className="text-xs text-slate-400">Inactive</span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Fully stocked generic dispensary providing WHO-GMP quality essential drugs at up to 80% discounted rates.
              </p>
            </div>

            <div
              className={`p-5 rounded-2xl border transition-all ${
                facility?.hasTeleconsult ? "bg-emerald-50/40 border-emerald-200" : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-900">Teleconsultation & Tele-OPD Hub</h4>
                {facility?.hasTeleconsult ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <span className="text-xs text-slate-400">Inactive</span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                High-speed video connection to super-specialists for remote cardiology, neurology, and pediatric triage.
              </p>
            </div>

            <div
              className={`p-5 rounded-2xl border transition-all ${
                facility?.hasPathologyLab ? "bg-emerald-50/40 border-emerald-200" : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-900">Diagnostic Pathology & Blood Lab</h4>
                {facility?.hasPathologyLab ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <span className="text-xs text-slate-400">Inactive</span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Automated cell counters for CBC, HbA1c, Liver & Renal function, Malaria/Dengue rapid kits, and blood storage.
              </p>
            </div>

            <div
              className={`p-5 rounded-2xl border transition-all ${
                facility?.hasImmunization ? "bg-emerald-50/40 border-emerald-200" : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-900">Cold Chain Routine Child Immunization</h4>
                {facility?.hasImmunization ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <span className="text-xs text-slate-400">Inactive</span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                ILR solar-powered cold chain vaccine storage for Universal Immunization Programme (UIP) scheduled doses.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Live Bed Management */}
      {activeTab === "beds" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Live Bed Availability & Ward Capacity</h2>
              <p className="text-xs text-slate-500">
                Changes made here immediately synchronize to the district ambulance dispatch and patient admission dashboard.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* General Ward */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800">General Wards</h4>
                <BedDouble className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{facility?.occupiedBeds || 78}</span>
                <span className="text-xs text-slate-400 font-bold">/ {facility?.totalBeds || 120} Total</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateBed("general", 1)}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  + Admit
                </button>
                <button
                  onClick={() => handleUpdateBed("general", -1)}
                  className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  - Discharge
                </button>
              </div>
            </div>

            {/* ICU Beds */}
            <div className="bg-purple-50/50 border border-purple-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-purple-900">ICU & Critical Care</h4>
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-purple-950">{facility?.occupiedIcu || 12}</span>
                <span className="text-xs text-purple-600 font-bold">/ {facility?.totalIcu || 15} Total</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateBed("icu", 1)}
                  className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  + Admit
                </button>
                <button
                  onClick={() => handleUpdateBed("icu", -1)}
                  className="flex-1 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  - Discharge
                </button>
              </div>
            </div>

            {/* Oxygen Supported */}
            <div className="bg-blue-50/50 border border-blue-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-blue-900">Oxygen Supported</h4>
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-950">{facility?.occupiedOxygen || 20}</span>
                <span className="text-xs text-blue-600 font-bold">/ {facility?.totalOxygen || 30} Total</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateBed("oxygen", 1)}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  + Admit
                </button>
                <button
                  onClick={() => handleUpdateBed("oxygen", -1)}
                  className="flex-1 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  - Discharge
                </button>
              </div>
            </div>

            {/* Maternity */}
            <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-rose-900">Maternity & Delivery</h4>
                <BedDouble className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-950">{facility?.occupiedMaternity || 16}</span>
                <span className="text-xs text-rose-600 font-bold">/ {facility?.totalMaternity || 25} Total</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateBed("maternity", 1)}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  + Admit
                </button>
                <button
                  onClick={() => handleUpdateBed("maternity", -1)}
                  className="flex-1 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  - Discharge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Generic Pharmacy Stock */}
      {activeTab === "pharmacy" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">PMBJP Jan Aushadhi Dispensary Stock</h2>
              <p className="text-xs text-slate-500">Inventory levels for low-cost generic pharmaceuticals.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pharmacyItems.map((item) => (
              <div key={item.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                    <span className="text-[10px] text-slate-500">{item.category}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === "in_stock"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.status === "in_stock" ? "IN STOCK" : "LOW STOCK"}
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">Available Units:</span>
                  <span className="font-extrabold text-slate-800">{item.stockUnits} units</span>
                </div>

                <button
                  onClick={() => handleRestock(item.id)}
                  className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  + Restock 500 Units
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Onboard Doctor to THIS Hospital */}
      {isOnboardDoctorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Onboard Doctor to {facility?.name || "Hospital"}</h3>
                <p className="text-xs text-slate-500">Doctor will be strictly associated with this hospital's OPD roster.</p>
              </div>
              <button
                onClick={() => setIsOnboardDoctorModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOnboardDoctorSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Full Name</label>
                  <input
                    type="text"
                    required
                    value={newDoctorName}
                    onChange={(e) => setNewDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Chander, MBBS"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Medical Specialty</label>
                  <input
                    type="text"
                    required
                    value={newDoctorSpecialty}
                    onChange={(e) => setNewDoctorSpecialty(e.target.value)}
                    placeholder="e.g. General Physician / Cardiologist"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={newDoctorQualification}
                    onChange={(e) => setNewDoctorQualification(e.target.value)}
                    placeholder="e.g. MBBS, MD (General Medicine)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">MCI / State Council Reg No.</label>
                  <input
                    type="text"
                    value={newDoctorLicense}
                    onChange={(e) => setNewDoctorLicense(e.target.value)}
                    placeholder="e.g. TS-MCI-48291"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    value={newDoctorExp}
                    onChange={(e) => setNewDoctorExp(e.target.value ? Number(e.target.value) : "")}
                    placeholder="8"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={newDoctorPhone}
                    onChange={(e) => setNewDoctorPhone(e.target.value)}
                    placeholder="+91 94401 23456"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">OPD Fee (INR)</label>
                  <input
                    type="number"
                    value={newDoctorFee}
                    onChange={(e) => setNewDoctorFee(e.target.value ? Number(e.target.value) : "")}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">OPD Timings</label>
                <input
                  type="text"
                  value={newDoctorTimings}
                  onChange={(e) => setNewDoctorTimings(e.target.value)}
                  placeholder="09:00 AM - 02:00 PM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOnboardDoctorModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOnboardingDoctor}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  {isOnboardingDoctor ? "Adding..." : "Onboard Doctor to Hospital"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Hospital Location & Facilities */}
      {isEditFacilityModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Hospital Location & Facilities</h3>
                <p className="text-xs text-slate-500">Update facility location and registered operational wings.</p>
              </div>
              <button
                onClick={() => setIsEditFacilityModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFacilityDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Station Road, Old Town"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    placeholder="Mahabubnagar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                    placeholder="509001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={editLat}
                    onChange={(e) => setEditLat(e.target.value)}
                    placeholder="16.7431"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={editLng}
                    onChange={(e) => setEditLng(e.target.value)}
                    placeholder="77.9890"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Landline Phone</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 8542 242300"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emergency 24x7 Phone</label>
                  <input
                    type="tel"
                    value={editEmergencyPhone}
                    onChange={(e) => setEditEmergencyPhone(e.target.value)}
                    placeholder="108 / 08542-242301"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Registered Facilities Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">Facilities Available at Hospital</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editHasEmergency}
                      onChange={(e) => setEditHasEmergency(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">24x7 Emergency Unit</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editHasMaternity}
                      onChange={(e) => setEditHasMaternity(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">Maternity Ward</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editHasPharmacy}
                      onChange={(e) => setEditHasPharmacy(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">PMBJP Pharmacy</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editHasTeleconsult}
                      onChange={(e) => setEditHasTeleconsult(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">Teleconsultation Hub</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editHasPathologyLab}
                      onChange={(e) => setEditHasPathologyLab(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">Pathology Lab</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editHasImmunization}
                      onChange={(e) => setEditHasImmunization(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">Cold Chain Vaccine</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditFacilityModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingFacility}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  {isSavingFacility ? "Saving..." : "Save Facility Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
