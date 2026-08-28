// Client-side API service with Bearer Token integration
import { auth } from "./firebase.ts";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const currentUser = auth.currentUser;
  let token = "user-default-session";
  if (currentUser) {
    try {
      token = await currentUser.getIdToken();
    } catch (err) {
      console.warn("Could not get Firebase ID token, using user uid:", err);
      token = currentUser.uid;
    }
  } else {
    // Check if a saved session/role token exists
    const localToken = localStorage.getItem("sehat_saathi_active_uid");
    if (localToken) {
      token = localToken;
    }
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const api = {
  // 1. User Profile
  async getProfile() {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/user/profile", { headers });
    if (!res.ok) throw new Error("Failed to load profile");
    return await res.json();
  },

  async updateProfile(data: any) {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return await res.json();
  },

  // 2. Medications
  async getMedications() {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/medications", { headers });
    if (!res.ok) throw new Error("Failed to load medications");
    return await res.json();
  },

  async addMedication(data: any) {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/medications", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add medication");
    return await res.json();
  },

  async toggleMedication(id: number | string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/medications/${id}/toggle`, {
      method: "PATCH",
      headers,
    });
    if (!res.ok) throw new Error("Failed to toggle medication");
    return await res.json();
  },

  async deleteMedication(id: number | string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/medications/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Failed to delete medication");
    return await res.json();
  },

  // 3. Appointments
  async getAppointments() {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/appointments", { headers });
    if (!res.ok) throw new Error("Failed to load appointments");
    return await res.json();
  },

  async addAppointment(data: any) {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to book appointment");
    return await res.json();
  },

  async cancelAppointment(id: number | string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/appointments/${id}/cancel`, {
      method: "PATCH",
      headers,
    });
    if (!res.ok) throw new Error("Failed to cancel appointment");
    return await res.json();
  },

  // 4. Health Documents
  async getDocuments() {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/documents", { headers });
    if (!res.ok) throw new Error("Failed to load health documents");
    return await res.json();
  },

  async addDocument(data: any) {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/documents", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to save health document");
    return await res.json();
  },

  async deleteDocument(id: number | string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/documents/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Failed to delete health document");
    return await res.json();
  },

  // 5. Caregivers / Care Circle
  async getCaregivers() {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/caregivers", { headers });
    if (!res.ok) throw new Error("Failed to load caregivers");
    return await res.json();
  },

  async addCaregiver(data: any) {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/caregivers", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add caregiver");
    return await res.json();
  },

  async deleteCaregiver(id: number | string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/caregivers/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Failed to remove caregiver");
    return await res.json();
  },

  // 6. Doctor Teleconsult Queue & Prescription
  async getTeleconsultQueue() {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/doctor/teleconsults", { headers });
    if (!res.ok) throw new Error("Failed to load teleconsult queue");
    return await res.json();
  },

  async bookTeleconsult(data: any) {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/teleconsults/book", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to book teleconsult session");
    return await res.json();
  },

  async doctorPrescribe(data: {
    sessionId: number;
    rxDiagnosis: string;
    rxMedicines: any[];
    rxAdvice: string;
  }) {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/doctor/prescribe", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to submit prescription");
    return await res.json();
  },

  // 7. Facilities & Hospital Capacities
  async getFacilities() {
    const res = await fetch("/api/facilities");
    if (!res.ok) throw new Error("Failed to load facilities");
    return await res.json();
  },

  async updateFacilityCapacity(id: number | string, data: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/facilities/${id}/capacity`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update facility beds");
    return await res.json();
  },

  // 8. Health Access Score
  async getHealthScore() {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/health-score", { headers });
    if (!res.ok) throw new Error("Failed to load health score");
    return await res.json();
  },

  // 9. Doctor OPD Patients by Date & Walk-in Registration
  async getDoctorPatientsByDate(date?: string, doctorId?: number, hospitalId?: number) {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    if (doctorId) params.append("doctorId", String(doctorId));
    if (hospitalId) params.append("hospitalId", String(hospitalId));
    
    const url = `/api/doctor/patients-by-date${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load doctor patients for date");
    return await res.json();
  },

  async createWalkinPatient(data: any) {
    const res = await fetch("/api/doctor/walkin-patient", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create walk-in patient");
    return await res.json();
  },

  async updateAppointmentDetails(id: number | string, data: any) {
    const res = await fetch(`/api/appointments/${id}/details`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update appointment details");
    return await res.json();
  },

  // 10. Hospital Management, Profile, Creation & Hospital-Only Doctors
  async getMyHospitalFacility() {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/hospital/my-facility", { headers });
    if (!res.ok) throw new Error("Failed to load hospital facility");
    return await res.json();
  },

  async getHospitalFacilityById(id: number | string) {
    const res = await fetch(`/api/hospital/facility/${id}`);
    if (!res.ok) throw new Error("Failed to load hospital facility");
    return await res.json();
  },

  async createHospitalFacility(data: any) {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/hospital/facility", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create hospital facility");
    return await res.json();
  },

  async updateHospitalFacility(id: number | string, data: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/hospital/facility/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update hospital facility");
    return await res.json();
  },

  async getHospitalDoctors(hospitalId: number | string) {
    const res = await fetch(`/api/hospital/${hospitalId}/doctors`);
    if (!res.ok) throw new Error("Failed to load hospital doctors");
    return await res.json();
  },

  async addDoctorToHospital(hospitalId: number | string, data: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/hospital/${hospitalId}/doctors`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add doctor to hospital");
    return await res.json();
  },

  async deleteDoctorFromHospital(hospitalId: number | string, doctorId: number | string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/hospital/${hospitalId}/doctors/${doctorId}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Failed to remove doctor from hospital");
    return await res.json();
  },

  async getAllDoctors() {
    const res = await fetch("/api/doctors");
    if (!res.ok) throw new Error("Failed to load doctors");
    return await res.json();
  },

  // 11. Health Articles
  async getHealthArticles() {
    const res = await fetch("/api/health-articles");
    if (!res.ok) throw new Error("Failed to load health articles");
    return await res.json();
  },
};
