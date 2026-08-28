import React, { useState } from "react";
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
} from "lucide-react";
import {
  HospitalBedData,
  AmbulanceTelemetry,
  PharmacyStockItem,
  AuthAccount,
  Language,
} from "../types";
import {
  INITIAL_BED_DATA,
  INITIAL_AMBULANCE_FLEET,
  INITIAL_PHARMACY_STOCK,
  INITIAL_DOCTORS,
} from "../data/initialData";

interface HospitalPortalViewProps {
  currentAccount: AuthAccount | null;
  language: Language;
}

export const HospitalPortalView: React.FC<HospitalPortalViewProps> = ({
  currentAccount,
  language,
}) => {
  const [bedData, setBedData] = useState<HospitalBedData>(INITIAL_BED_DATA);
  const [ambulanceFleet, setAmbulanceFleet] = useState<AmbulanceTelemetry[]>(
    INITIAL_AMBULANCE_FLEET
  );
  const [pharmacyStock, setPharmacyStock] = useState<PharmacyStockItem[]>(
    INITIAL_PHARMACY_STOCK
  );
  const [activeTab, setActiveTab] = useState<"beds" | "triage" | "pharmacy" | "staff">("beds");
  const [livePulse, setLivePulse] = useState(true);

  const handleSimulateAdmission = (bedType: "general" | "icu" | "oxygen" | "maternity") => {
    setBedData((prev) => {
      if (bedType === "general" && prev.generalOccupied < prev.generalTotal) {
        return { ...prev, generalOccupied: prev.generalOccupied + 1 };
      }
      if (bedType === "icu" && prev.icuOccupied < prev.icuTotal) {
        return { ...prev, icuOccupied: prev.icuOccupied + 1 };
      }
      if (bedType === "oxygen" && prev.oxygenOccupied < prev.oxygenTotal) {
        return { ...prev, oxygenOccupied: prev.oxygenOccupied + 1 };
      }
      if (bedType === "maternity" && prev.maternityOccupied < prev.maternityTotal) {
        return { ...prev, maternityOccupied: prev.maternityOccupied + 1 };
      }
      return prev;
    });
  };

  const handleSimulateDischarge = (bedType: "general" | "icu" | "oxygen" | "maternity") => {
    setBedData((prev) => {
      if (bedType === "general" && prev.generalOccupied > 0) {
        return { ...prev, generalOccupied: prev.generalOccupied - 1 };
      }
      if (bedType === "icu" && prev.icuOccupied > 0) {
        return { ...prev, icuOccupied: prev.icuOccupied - 1 };
      }
      if (bedType === "oxygen" && prev.oxygenOccupied > 0) {
        return { ...prev, oxygenOccupied: prev.oxygenOccupied - 1 };
      }
      if (bedType === "maternity" && prev.maternityOccupied > 0) {
        return { ...prev, maternityOccupied: prev.maternityOccupied - 1 };
      }
      return prev;
    });
  };

  const handleRestockMedicine = (id: string) => {
    setPharmacyStock((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, stockUnits: item.stockUnits + 500, status: "in_stock" }
          : item
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Hospital Ops Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                District Health Command & PHC Cluster
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
                Live District Telemetry Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              {currentAccount?.name || "Mahabubnagar District Health Command"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Monitoring 1 District Hospital, 4 CHCs, 18 Rural PHCs & 6 Jan Aushadhi Kendras
            </p>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 gap-1 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab("beds")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "beds"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Live Bed Capacity
          </button>
          <button
            onClick={() => setActiveTab("triage")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "triage"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            108 Ambulance Telemetry
          </button>
          <button
            onClick={() => setActiveTab("pharmacy")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "pharmacy"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Jan Aushadhi Inventory
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "staff"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Doctors on Duty
          </button>
        </div>
      </div>

      {/* TAB 1: Live Bed Capacity */}
      {activeTab === "beds" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* General Ward */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  General Inpatient Beds
                </span>
                <BedDouble className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-800">
                  {bedData.generalTotal - bedData.generalOccupied}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    / {bedData.generalTotal} Available
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(bedData.generalOccupied / bedData.generalTotal) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                <button
                  onClick={() => handleSimulateAdmission("general")}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded-lg cursor-pointer transition-colors"
                >
                  + Admit Patient
                </button>
                <button
                  onClick={() => handleSimulateDischarge("general")}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                >
                  - Discharge
                </button>
              </div>
            </div>

            {/* ICU Beds */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  ICU / Critical Beds
                </span>
                <Activity className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-800">
                  {bedData.icuTotal - bedData.icuOccupied}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    / {bedData.icuTotal} Available
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(bedData.icuOccupied / bedData.icuTotal) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                <button
                  onClick={() => handleSimulateAdmission("icu")}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-red-50 text-red-700 rounded-lg cursor-pointer transition-colors"
                >
                  + Admit ICU
                </button>
                <button
                  onClick={() => handleSimulateDischarge("icu")}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                >
                  - Discharge
                </button>
              </div>
            </div>

            {/* Oxygen Beds */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Oxygen Supported Beds
                </span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-800">
                  {bedData.oxygenTotal - bedData.oxygenOccupied}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    / {bedData.oxygenTotal} Available
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(bedData.oxygenOccupied / bedData.oxygenTotal) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                <button
                  onClick={() => handleSimulateAdmission("oxygen")}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-emerald-700 rounded-lg cursor-pointer transition-colors"
                >
                  + Admit O2
                </button>
                <button
                  onClick={() => handleSimulateDischarge("oxygen")}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                >
                  - Discharge
                </button>
              </div>
            </div>

            {/* Maternity Ward */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Maternity & Delivery Ward
                </span>
                <ShieldCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-800">
                  {bedData.maternityTotal - bedData.maternityOccupied}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    / {bedData.maternityTotal} Available
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(bedData.maternityOccupied / bedData.maternityTotal) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                <button
                  onClick={() => handleSimulateAdmission("maternity")}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-purple-50 text-purple-700 rounded-lg cursor-pointer transition-colors"
                >
                  + Admit Delivery
                </button>
                <button
                  onClick={() => handleSimulateDischarge("maternity")}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                >
                  - Discharge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 108 Ambulance Telemetry */}
      {activeTab === "triage" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                108 Emergency Ambulance Telemetry & Fleet Tracking
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Live GPS beacons, patient transit status, and ETA tracking for Mahabubnagar district.
              </p>
            </div>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Live Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ambulanceFleet.map((amb) => (
              <div
                key={amb.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-800">
                    {amb.callSign}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      amb.status === "transporting"
                        ? "bg-amber-100 text-amber-800 animate-pulse"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {amb.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Ambulance className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-bold text-slate-800">{amb.vehicleNumber}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Location: {amb.currentLocation}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>ETA to Destination: <strong>{amb.etaMinutes} mins</strong> ({amb.speedKmh} km/h)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{amb.driverName}</span>
                  <a
                    href={`tel:${amb.driverPhone}`}
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Jan Aushadhi Inventory */}
      {activeTab === "pharmacy" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Pradhan Mantri Jan Aushadhi (PMBJP) Essential Drug Inventory
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Live monitoring of affordable generic medicines with automated replenishment triggers.
              </p>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
              6 Jan Aushadhi Kendras Linked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Generic Molecule Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Branded Equivalent</th>
                  <th className="p-3">PMBJP Price vs Market</th>
                  <th className="p-3">In Stock</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {pharmacyStock.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-800">
                      {item.genericName}
                      <span className="block text-[11px] font-normal text-slate-500">
                        {item.strength}
                      </span>
                    </td>
                    <td className="p-3">{item.category}</td>
                    <td className="p-3 text-slate-500">{item.brandNameEquivalent}</td>
                    <td className="p-3">
                      <span className="text-emerald-600 font-bold">₹{item.mrpJanAushadhi}</span>
                      <span className="text-slate-400 line-through ml-1.5 text-[11px]">
                        ₹{item.mrpBranded}
                      </span>
                    </td>
                    <td className="p-3 font-bold">{item.stockUnits} units</td>
                    <td className="p-3">
                      {item.status === "in_stock" ? (
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          Adequate
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          Low Stock Alert
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRestockMedicine(item.id)}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors cursor-pointer text-[11px]"
                      >
                        + Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Doctors on Duty */}
      {activeTab === "staff" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800">Hospital Duty Roster & Specialists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INITIAL_DOCTORS.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-start gap-3"
              >
                <img
                  src={doc.avatarUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150"}
                  alt={doc.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div className="space-y-0.5 text-xs">
                  <h4 className="font-bold text-slate-800">{doc.name}</h4>
                  <p className="text-blue-600 font-semibold text-[11px]">{doc.specialty}</p>
                  <p className="text-slate-500 text-[10px]">{doc.facilityName}</p>
                  <span className="inline-block text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md mt-1">
                    On Duty ({doc.opdTimings})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
