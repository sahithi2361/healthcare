export type Language = "en" | "te" | "hi";

export type UserRole = "user" | "doctor" | "hospital" | "asha";

export interface AuthAccount {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  // User/Patient specifics
  abhaId?: string;
  bloodGroup?: string;
  location?: string;
  age?: number;
  gender?: string;
  // Doctor specifics
  specialty?: string;
  qualification?: string;
  licenseNumber?: string;
  facilityName?: string;
  experienceYears?: number;
  // Hospital specifics
  facilityId?: string;
  facilityType?: string;
  registrationNumber?: string;
  bedCapacity?: number;
  // ASHA Worker specifics
  ashaId?: string;
  villageName?: string;
  mandalName?: string;
  assignedFamiliesCount?: number;
}

export interface Doctor {
  id: string;
  name: string;
  nameTe?: string;
  nameHi?: string;
  specialty: string;
  specialtyTe?: string;
  specialtyHi?: string;
  qualification: string;
  experienceYears: number;
  facilityName: string;
  facilityId: string;
  district: string;
  state: string;
  rating: number;
  reviewCount: number;
  languages: string[];
  opdTimings: string;
  consultationFee: number; // 0 for free Govt PHC/District Hospital
  isAvailableToday: boolean;
  isTelemedicineAvailable: boolean;
  phone: string;
  avatarUrl?: string;
  bio?: string;
  matchSymptoms?: string[];
}

export interface HospitalBedData {
  generalTotal: number;
  generalOccupied: number;
  icuTotal: number;
  icuOccupied: number;
  oxygenTotal: number;
  oxygenOccupied: number;
  maternityTotal: number;
  maternityOccupied: number;
  lastUpdated: string;
}

export interface AmbulanceTelemetry {
  id: string;
  callSign: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  status: "available" | "dispatched" | "on_scene" | "transporting" | "maintenance";
  currentLocation: string;
  destinationFacility: string;
  assignedEmergency?: string;
  etaMinutes: number;
  latitude: number;
  longitude: number;
  speedKmh: number;
}

export interface PharmacyStockItem {
  id: string;
  genericName: string;
  brandNameEquivalent: string;
  strength: string;
  mrpJanAushadhi: number;
  mrpBranded: number;
  stockUnits: number;
  minThreshold: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  category: string;
}

export interface DoctorPrescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorName: string;
  doctorSpecialty: string;
  facilityName: string;
  date: string;
  diagnosis: string;
  symptoms: string[];
  medicines: {
    name: string;
    genericEquivalent: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    janAushadhiAvailable: boolean;
  }[];
  advice: string;
  followUpDate?: string;
}

export interface TeleconsultSession {
  id: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientLocation: string;
  chiefComplaint: string;
  urgency: "routine" | "priority" | "urgent";
  scheduledTime: string;
  status: "waiting" | "in_call" | "completed" | "cancelled";
  tokenNumber: number;
  clinicalSummary?: string;
}

export interface EmergencyContact {
  id?: string;
  name: string;
  relation?: string;
  relationship?: string;
  phone: string;
  isPrimary?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  preferredLanguage: Language;
  location: string;
  district?: string;
  state?: string;
  abhaId?: string;
  emergencyContacts: EmergencyContact[];
  bloodGroup: string;
  chronicConditions?: string[];
  allergies: string[];
  importantHealthNotes: string;
  isLowLiteracyMode?: boolean;
  onboardingCompleted?: boolean;
}

export interface CarePathwayStep {
  step: number;
  title: string;
  description: string;
  icon?: string;
  isCompleted?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  language: Language;
  isVoice?: boolean;
  isEmergency?: boolean;
  emergencyReason?: string | null;
  carePathway?: CarePathwayStep[];
  suggestedFacilityType?: string;
  simplifiedExplanation?: string;
  suggestedFollowUpQuestions?: string[];
  recommendedDoctors?: Doctor[];
}

export type FacilityType =
  | "Primary Health Centre (PHC)"
  | "Community Health Centre (CHC)"
  | "District Hospital"
  | "Sub-Centre / Health & Wellness Centre"
  | "Jan Aushadhi Pharmacy"
  | "Diagnostic Lab"
  | "Vaccination Centre"
  | "Emergency Facility";

export interface HealthcareFacility {
  id: string;
  name: string;
  nameTe: string;
  nameHi: string;
  type: FacilityType;
  address: string;
  district: string;
  state: string;
  distanceKm: number;
  travelTimeMin: number;
  phone: string;
  isOpenNow: boolean;
  hasEmergencyServices: boolean;
  services: string[];
  latitude: number;
  longitude: number;
  matchScore?: number;
  recommendationReason?: string;
}

export interface HealthArticle {
  id: string;
  category: string;
  title: string;
  titleTe: string;
  titleHi: string;
  summary?: string;
  summaryTe?: string;
  summaryHi?: string;
  content: string;
  contentTe: string;
  contentHi: string;
  simpleExplanation?: string;
  simplifiedText?: string;
  simplifiedTextTe?: string;
  simplifiedTextHi?: string;
  voiceAudioText?: string;
  tips?: string[];
  icon?: string;
  readTimeMin?: number;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  timing?: string;
  reminderTime?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  isTakenToday?: boolean;
  isSkippedToday?: boolean;
  stockRemaining?: number;
  prescribedFor?: string;
  prescribedBy?: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  scheduledTime?: string;
  actionTime?: string;
  timestamp?: string;
  status: "taken" | "skipped" | "remind_later";
  notifiedCaregiver?: boolean;
}

export interface CareBundle {
  appointmentId?: string;
  items?: { text: string; completed: boolean }[];
  specialInstructions?: string;
  reportsToBring?: string[];
  currentMedications?: string[];
  instructions?: string[];
  remindersSet?: boolean;
  caregiverNotified?: boolean;
}

export interface Appointment {
  id: string;
  facilityId?: string;
  facilityName: string;
  doctorName: string;
  department?: string;
  specialty?: string;
  date: string;
  time: string;
  location?: string;
  reasonForVisit?: string;
  status: "Scheduled" | "Completed" | "Follow-up Needed" | "confirmed" | "pending" | "cancelled";
  preparationChecklist?: CareBundle;
  careBundle?: CareBundle;
  caregiverNotified?: boolean;
}

export type DocumentCategory =
  | "Prescription"
  | "Lab Report"
  | "Vaccine Card"
  | "Vaccination Card"
  | "Discharge Summary"
  | "Insurance / Scheme"
  | "Other";

export interface ExtractedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
}

export interface ExtractedLabTest {
  testName: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
}

export interface HealthDocument {
  id: string;
  title: string;
  category?: DocumentCategory;
  documentCategory?: DocumentCategory;
  date?: string;
  doctorName?: string;
  facilityName?: string;
  documentDate?: string;
  extractedSummary?: string;
  detectedMedicines?: ExtractedMedicine[];
  medicinesDetected?: ExtractedMedicine[];
  labTestsDetected?: ExtractedLabTest[];
  nextAppointmentDate?: string;
  instructions?: string[];
  uploadedAt?: string;
  isVerified?: boolean;
  tags?: string[];
  notes?: string;
}

export interface CaregiverPermissions {
  viewMedicines?: boolean;
  viewAppointments?: boolean;
  viewDocuments?: boolean;
  receiveMissedDoseAlerts?: boolean;
  receiveEmergencyLocation?: boolean;
  appointments?: boolean;
  medicineReminders?: boolean;
  healthDocuments?: boolean;
  healthPassport?: boolean;
  emergencyLocation?: boolean;
}

export interface Caregiver {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  avatarColor?: string;
  isPrimary?: boolean;
  permissions: CaregiverPermissions;
  addedDate?: string;
  lastNotified?: string;
}

export interface HealthAccessScoreData {
  overallScore: number;
  region?: string;
  breakdown?: {
    proximityScore: number;
    emergencyScore: number;
    pharmacyScore: number;
    doctorAvailabilityScore: number;
    connectivityScore: number;
  };
  recommendations?: string[];
  proximityScore?: number;
  emergencyScore?: number;
  pharmacyScore?: number;
  connectivityScore?: number;
  professionalAccessScore?: number;
  actionableTips?: { id: string; text: string; action: string; icon: string; done?: boolean }[];
}

export interface CommunityHealthRegion {
  id: string;
  name: string;
  district: string;
  state: string;
  accessTier?: "Better" | "Moderate" | "Limited";
  population?: number;
  facilityCount: number;
  pharmacyCount?: number;
  avgAmbulanceTimeMin?: number;
  score?: number;
  status?: "better" | "moderate" | "limited";
  emergencyResponseTimeMin?: number;
  connectivityPct?: number;
  populationServed?: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "medicine" | "appointment" | "emergency" | "caregiver" | "system" | "sync";
  timestamp: string;
  read: boolean;
  actionLink?: string;
}

export interface DemoScenario {
  id: number | string;
  title: string;
  titleTe?: string;
  titleHi?: string;
  description: string;
  icon: string;
  tag?: string;
}

export interface ClinicalSummary {
  patientOverview: string;
  chiefComplaint: string;
  timelineAndProgression: string;
  vitalContext: string;
  redFlagsCheck: string;
  suggestedQuestionsForDoctor: string[];
}
