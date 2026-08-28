import {
  Medication,
  Appointment,
  HealthDocument,
  Caregiver,
  HealthcareFacility,
  Doctor,
  HealthArticle,
  UserProfile,
  HospitalBedData,
  AmbulanceTelemetry,
  PharmacyStockItem,
} from "../types";

export function mapDbMedication(dbMed: any): Medication {
  return {
    id: String(dbMed.id),
    name: dbMed.name,
    dosage: dbMed.dosage || "500mg",
    frequency: dbMed.frequency || "Once daily",
    instructions: dbMed.instructions || "Take with water",
    timing: dbMed.timings || "Morning",
    startDate: dbMed.startDate,
    endDate: dbMed.endDate,
    isActive: true,
    isTakenToday: Boolean(dbMed.isTakenToday),
    isSkippedToday: false,
    stockRemaining: dbMed.remainingDoses ?? 30,
    prescribedFor: dbMed.condition || "General",
  };
}

export function mapDbAppointment(dbAppt: any): Appointment {
  return {
    id: String(dbAppt.id),
    facilityName: dbAppt.facilityName || "Primary Health Centre",
    doctorName: dbAppt.doctorName || "Dr. Medical Officer",
    specialty: dbAppt.specialty || "General Medicine",
    date: dbAppt.date || new Date().toISOString().split("T")[0],
    time: dbAppt.time || "10:00 AM",
    reasonForVisit: dbAppt.symptoms || "Routine Consultation",
    status: dbAppt.status === "cancelled" ? "cancelled" : "confirmed",
  };
}

export function mapDbDocument(dbDoc: any): HealthDocument {
  return {
    id: String(dbDoc.id),
    title: dbDoc.title,
    documentCategory: (dbDoc.type === "lab-report"
      ? "Lab Report"
      : dbDoc.type === "vaccination"
      ? "Vaccine Card"
      : "Prescription") as any,
    documentDate: dbDoc.date,
    doctorName: dbDoc.doctorOrHospital,
    facilityName: dbDoc.doctorOrHospital,
    extractedSummary: dbDoc.summary,
    tags: dbDoc.tags ? dbDoc.tags.split(",") : [],
    isVerified: true,
  };
}

export function mapDbCaregiver(dbCg: any): Caregiver {
  return {
    id: String(dbCg.id),
    name: dbCg.name,
    relationship: dbCg.relation || "Family",
    phone: dbCg.phone || "",
    email: dbCg.email || "",
    isPrimary: Boolean(dbCg.isEmergencyContact),
    permissions: {
      viewMedicines: true,
      viewAppointments: true,
      viewDocuments: true,
      receiveMissedDoseAlerts: true,
      receiveEmergencyLocation: true,
    },
  };
}

export function mapDbFacility(dbFac: any): HealthcareFacility {
  const lat = parseFloat(dbFac.lat) || 17.4699;
  const lng = parseFloat(dbFac.lng) || 78.3578;

  return {
    id: String(dbFac.id),
    name: dbFac.name,
    nameTe: dbFac.name,
    nameHi: dbFac.name,
    type: dbFac.type as any,
    address: dbFac.address,
    district: dbFac.district,
    state: "Telangana",
    distanceKm: 2.5,
    travelTimeMin: 10,
    phone: dbFac.phone || "+91 8462 230114",
    isOpenNow: true,
    hasEmergencyServices: Boolean(dbFac.hasEmergency),
    services: [
      "OPD Consultation",
      "Essential Medicines (Free/Generic)",
      "Maternal & Child Health",
      "Immunization & Lab Tests",
      "Telemedicine Connectivity",
    ],
    latitude: lat,
    longitude: lng,
  };
}

export function mapDbDoctor(dbDoc: any): Doctor {
  return {
    id: String(dbDoc.id),
    name: dbDoc.name,
    nameTe: dbDoc.name,
    nameHi: dbDoc.name,
    specialty: dbDoc.specialty || "General Physician",
    specialtyTe: dbDoc.specialty || "జనరల్ ఫిజీషియన్",
    specialtyHi: dbDoc.specialty || "सामान्य चिकित्सक",
    qualification: dbDoc.qualification || "MBBS",
    experienceYears: Number(dbDoc.experienceYears) || 5,
    facilityName: "Primary Health Centre",
    facilityId: String(dbDoc.hospitalId || 1),
    district: "Telangana Rural",
    state: "Telangana",
    rating: parseFloat(dbDoc.rating) || 4.8,
    reviewCount: 42,
    languages: ["Telugu", "Hindi", "English"],
    opdTimings: dbDoc.opdTimings || "09:00 AM - 02:00 PM",
    consultationFee: Number(dbDoc.opdFeeInr) || 0,
    isAvailableToday: dbDoc.status === "available" || dbDoc.status === "in-opd",
    isTelemedicineAvailable: true,
    phone: dbDoc.phone || "+91 94401 23456",
  };
}

export function mapDbArticle(dbArt: any): HealthArticle {
  return {
    id: String(dbArt.id),
    category: dbArt.category || "General Health",
    title: dbArt.title,
    titleTe: dbArt.titleTe || dbArt.title,
    titleHi: dbArt.titleHi || dbArt.title,
    summary: dbArt.summary,
    summaryTe: dbArt.summaryTe || dbArt.summary,
    summaryHi: dbArt.summaryHi || dbArt.summary,
    content: dbArt.content,
    contentTe: dbArt.contentTe || dbArt.content,
    contentHi: dbArt.contentHi || dbArt.content,
    readTimeMin: dbArt.readTimeMinutes || 3,
  };
}
