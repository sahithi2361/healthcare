import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckSquare,
  Square,
  Plus,
  Building2,
  CheckCircle2,
  FileText,
  AlertCircle,
  PhoneCall,
  Bell,
  Sparkles,
} from "lucide-react";
import { Language, Appointment, HealthcareFacility } from "../types";
import { StorageManager } from "../utils/storage";

interface AppointmentCenterProps {
  appointments: Appointment[];
  facilities: HealthcareFacility[];
  language: Language;
  onUpdateAppointments: (appointments: Appointment[]) => void;
}

export const AppointmentCenter: React.FC<AppointmentCenterProps> = ({
  appointments,
  facilities,
  language,
  onUpdateAppointments,
}) => {
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(appointments[0] || null);
  const [showBookModal, setShowBookModal] = useState(false);

  // Booking Form State
  const [doctorName, setDoctorName] = useState("Dr. Srinivas Rao, MBBS");
  const [facilityName, setFacilityName] = useState("Bhoothpur Primary Health Centre");
  const [department, setDepartment] = useState("General Medicine & NCD Clinic");
  const [date, setDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
  );
  const [time, setTime] = useState("10:00 AM - 11:30 AM");
  const [reason, setReason] = useState("Routine BP & Diabetes Checkup");

  const toggleChecklist = (aptId: string, itemIdx: number) => {
    const updated = appointments.map((apt) => {
      if (apt.id !== aptId || !apt.preparationChecklist) return apt;
      const newItems = [...apt.preparationChecklist.items];
      newItems[itemIdx] = { ...newItems[itemIdx], completed: !newItems[itemIdx].completed };
      return {
        ...apt,
        preparationChecklist: {
          ...apt.preparationChecklist,
          items: newItems,
        },
      };
    });

    onUpdateAppointments(updated);
    StorageManager.saveAppointments(updated);
    const curr = updated.find((a) => a.id === aptId);
    if (curr) setSelectedApt(curr);
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();

    const newApt: Appointment = {
      id: "apt_" + Date.now(),
      doctorName,
      facilityName,
      facilityId: facilities.find((f) => f.name === facilityName)?.id || "fac_phc_bhoothpur",
      department,
      date,
      time,
      status: "Scheduled",
      reasonForVisit: reason,
      preparationChecklist: {
        items: [
          { text: "Carry previous prescription & BP diary", completed: false },
          { text: "Bring current medication strips", completed: false },
          { text: "Fasting not required unless instructed", completed: false },
          { text: "Carry Aadhaar / ABHA Card ID", completed: false },
        ],
        specialInstructions: "Arrive 15 minutes early at OP counter 2.",
      },
    };

    const updated = StorageManager.addAppointment(newApt);
    onUpdateAppointments(updated);
    setSelectedApt(newApt);
    setShowBookModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Care Bundles & Visits
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {language === "te"
              ? "వైద్య సంప్రదింపులు & కేర్ బండిల్"
              : language === "hi"
              ? "डॉक्टर अपॉइंटमेंट और तैयारी चेकलिस्ट"
              : "Appointments & Care Bundle Preparation"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mt-1">
            {language === "te"
              ? "ప్రాథమిక ఆరోగ్య కేంద్రాల అపాయింట్‌మెంట్లు మరియు డాక్టర్ విజిట్‌కు సిద్ధం కావడానికి చెక్‌లిస్ట్."
              : language === "hi"
              ? "सरकारी स्वास्थ्य केंद्रों में परामर्श समय और पर्चे-दवाइयों की तैयारी।"
              : "Organize clinical consultations and auto-generate preparation checklists for doctor visits."}
          </p>
        </div>

        <button
          onClick={() => setShowBookModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Consultation</span>
        </button>
      </div>

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Appointments List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Scheduled Consultations ({appointments.length})</span>
          </h2>

          <div className="space-y-3">
            {appointments.map((apt) => {
              const isSelected = selectedApt?.id === apt.id;
              return (
                <div
                  key={apt.id}
                  onClick={() => setSelectedApt(apt)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/50 border-blue-600 shadow-sm"
                      : "bg-white border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        apt.status === "Scheduled"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : apt.status === "Completed"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {apt.status}
                    </span>
                    <span className="text-xs font-medium text-slate-400">{apt.date}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mt-2.5">{apt.doctorName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{apt.facilityName}</p>
                  <div className="text-[11px] text-blue-600 font-semibold mt-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{apt.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: "Prepare My Visit" Care Bundle Checklist */}
        <div className="lg:col-span-2">
          {selectedApt ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Top Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                    {selectedApt.department}
                  </span>
                  <h2 className="text-xl font-bold text-slate-800 mt-2.5">
                    {selectedApt.doctorName}
                  </h2>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-1.5">
                    <span className="flex items-center gap-1 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {selectedApt.facilityName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-blue-600">
                      <Calendar className="w-3.5 h-3.5" />
                      {selectedApt.date} ({selectedApt.time})
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => alert("SMS & Reminder alert sent to your registered phone.")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Bell className="w-3.5 h-3.5 text-blue-600" />
                  <span>Set SMS Reminder</span>
                </button>
              </div>

              {/* Purpose of consultation */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700">
                <span className="font-bold text-slate-800">Reason for visit: </span>
                <span>{selectedApt.reasonForVisit}</span>
              </div>

              {/* Care Bundle Checklist */}
              {selectedApt.preparationChecklist && (
                <div className="bg-slate-50/80 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      "Prepare My Visit" Care Bundle
                    </span>
                    <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-3 py-0.5 rounded-full border border-blue-200">
                      Auto-generated
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Check off each item before leaving your home for the consultation to ensure a productive clinical visit:
                  </p>

                  <div className="space-y-2.5">
                    {selectedApt.preparationChecklist.items.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleChecklist(selectedApt.id, idx)}
                        className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs transition-all cursor-pointer select-none ${
                          item.completed
                            ? "bg-white/60 border-emerald-300 text-slate-400 line-through"
                            : "bg-white border-slate-200/80 text-slate-800 hover:border-blue-300 font-medium shadow-2xs"
                        }`}
                      >
                        {item.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {selectedApt.preparationChecklist.specialInstructions && (
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700">
                      <span className="font-bold text-slate-900">Special Note: </span>
                      {selectedApt.preparationChecklist.specialInstructions}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-medium">Select an appointment from the list to view its Care Bundle checklist.</p>
            </div>
          )}
        </div>
      </div>

      {/* Request Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-white border-b border-slate-100 p-5 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Request Consultation Appointment</h3>
              <button
                onClick={() => setShowBookModal(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Facility *</label>
                <select
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium bg-slate-50"
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name} ({f.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Doctor / Medical Officer</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Srinivas Rao"
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. General Medicine"
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Preferred Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 10:00 AM - 11:30 AM"
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Visit</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-md shadow-blue-600/20"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
