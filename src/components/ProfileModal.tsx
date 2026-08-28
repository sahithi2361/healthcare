import React, { useState } from "react";
import {
  X,
  User,
  ShieldCheck,
  RotateCcw,
  Save,
  Check,
  Heart,
  Phone,
  MapPin,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { UserProfile, Language } from "../types";
import { StorageManager } from "../utils/storage";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetAllData: () => void;
  language: Language;
  onLogout?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onResetAllData,
  language,
  onLogout,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [age, setAge] = useState(userProfile.age);
  const [gender, setGender] = useState(userProfile.gender);
  const [location, setLocation] = useState(userProfile.location);
  const [bloodGroup, setBloodGroup] = useState(userProfile.bloodGroup);
  const [abhaId, setAbhaId] = useState(userProfile.abhaId || "91-4820-9921-3412");
  const [notes, setNotes] = useState(userProfile.importantHealthNotes);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...userProfile,
      name,
      age: Number(age),
      gender,
      location,
      bloodGroup,
      abhaId,
      importantHealthNotes: notes,
    };

    StorageManager.saveProfile(updated);
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="bg-slate-800 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold">User Health Profile & Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 p-2 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium text-slate-800 bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium text-slate-800 bg-slate-50"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium text-slate-800 bg-slate-50 cursor-pointer"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium text-slate-800 bg-slate-50 cursor-pointer"
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Village & Mandal Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bhoothpur Mandal, Mahabubnagar"
              className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium text-slate-800 bg-slate-50"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">ABHA Health ID</label>
            <input
              type="text"
              value={abhaId}
              onChange={(e) => setAbhaId(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium text-slate-800 bg-slate-50"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Important Health Notes (for Doctor)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium text-slate-800 bg-slate-50"
            />
          </div>

          {/* Reset Demo Data & Logout */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Reset all medications, appointments, and records to initial demo state?")) {
                    onResetAllData();
                    onClose();
                  }
                }}
                className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset State</span>
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="text-slate-600 hover:text-red-600 font-bold flex items-center gap-1 cursor-pointer text-xs"
                  title="Sign out and return to Login screen"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer flex items-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
