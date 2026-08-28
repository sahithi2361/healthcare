import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// 1. Users Table (Core identity, patient, doctor, hospital)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase Auth UID or Unique ID
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // 'user' | 'doctor' | 'hospital'
  phone: text("phone"),
  abhaNumber: text("abha_number"),
  bloodGroup: text("blood_group"),
  allergies: text("allergies"),
  chronicConditions: text("chronic_conditions"),
  village: text("village"),
  district: text("district"),
  preferredLanguage: text("preferred_language").default("te"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactRelation: text("emergency_contact_relation"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Medications Table
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  genericName: text("generic_name"),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  timings: text("timings"), // JSON string array
  condition: text("condition"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  instructions: text("instructions"),
  isTakenToday: boolean("is_taken_today").default(false),
  refillReminderDate: text("refill_reminder_date"),
  remainingDoses: integer("remaining_doses").default(30),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. Appointments Table (Patient bookings and Doctor OPD queue)
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  hospitalId: integer("hospital_id"),
  doctorId: integer("doctor_id"),
  doctorName: text("doctor_name").notNull(),
  specialty: text("specialty").notNull(),
  facilityName: text("facility_name").notNull(),
  patientName: text("patient_name"),
  patientAge: integer("patient_age"),
  patientGender: text("patient_gender"),
  patientPhone: text("patient_phone"),
  patientVillage: text("patient_village"),
  patientBloodGroup: text("patient_blood_group"),
  patientAbha: text("patient_abha"),
  date: text("date").notNull(), // YYYY-MM-DD
  time: text("time").notNull(),
  status: text("status").notNull().default("confirmed"), // 'confirmed' | 'in-consultation' | 'completed' | 'cancelled'
  type: text("type").notNull().default("in-person"), // 'in-person' | 'teleconsult'
  symptoms: text("symptoms"),
  vitalsBp: text("vitals_bp"),
  vitalsPulse: integer("vitals_pulse"),
  vitalsSpo2: integer("vitals_spo2"),
  vitalsTemp: text("vitals_temp"),
  triagePriority: text("triage_priority").default("medium"), // 'high' | 'medium' | 'low'
  rxDiagnosis: text("rx_diagnosis"),
  rxMedicines: text("rx_medicines"), // JSON string
  rxAdvice: text("rx_advice"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 4. Health Documents Table
export const healthDocuments = pgTable("health_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'prescription' | 'lab-report' | 'discharge' | 'vaccination'
  date: text("date").notNull(),
  doctorOrHospital: text("doctor_or_hospital").notNull(),
  summary: text("summary"),
  fileUrl: text("file_url"),
  tags: text("tags"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. Caregivers Table
export const caregivers = pgTable("caregivers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  relation: text("relation").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  accessLevel: text("access_level").notNull().default("view"), // 'view' | 'manage' | 'emergency'
  isEmergencyContact: boolean("is_emergency_contact").default(false),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 6. Teleconsult Sessions (OPD Queue & Rx) Table
export const teleconsultSessions = pgTable("teleconsult_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  doctorId: integer("doctor_id").references(() => users.id, { onDelete: "set null" }),
  patientName: text("patient_name").notNull(),
  patientAge: integer("patient_age"),
  patientGender: text("patient_gender"),
  village: text("village"),
  symptoms: text("symptoms").notNull(),
  triagePriority: text("triage_priority").default("medium"), // 'high' | 'medium' | 'low'
  status: text("status").default("waiting"), // 'waiting' | 'in-call' | 'completed'
  scheduledTime: text("scheduled_time"),
  rxDiagnosis: text("rx_diagnosis"),
  rxMedicines: text("rx_medicines"), // JSON string
  rxAdvice: text("rx_advice"),
  callDurationMinutes: integer("call_duration_minutes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 7. Hospital Facilities & Realtime Capacity Table
export const hospitalFacilities = pgTable("hospital_facilities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'PHC' | 'CHC' | 'Area Hospital' | 'District Hospital' | 'Jan Aushadhi' | 'Super Specialty'
  address: text("address").notNull(),
  district: text("district").notNull(),
  pincode: text("pincode"),
  phone: text("phone").notNull(),
  emergencyPhone: text("emergency_phone"),
  lat: text("lat").notNull(),
  lng: text("lng").notNull(),
  rating: text("rating").default("4.5"),
  totalBeds: integer("total_beds").default(50),
  occupiedBeds: integer("occupied_beds").default(35),
  totalIcu: integer("total_icu").default(10),
  occupiedIcu: integer("occupied_icu").default(6),
  totalOxygen: integer("total_oxygen").default(20),
  occupiedOxygen: integer("occupied_oxygen").default(12),
  totalMaternity: integer("total_maternity").default(15),
  occupiedMaternity: integer("occupied_maternity").default(8),
  hasEmergency: boolean("has_emergency").default(true),
  hasJanAushadhi: boolean("has_jan_aushadhi").default(true),
  hasTeleconsult: boolean("has_teleconsult").default(true),
  facilitiesList: text("facilities_list"), // Comma-separated or JSON list of services entered at creation
  ambulanceStatus: text("ambulance_status"), // JSON telemetry array
  pharmacyStock: text("pharmacy_stock"), // JSON generic medicine array
  staffRoster: text("staff_roster"), // JSON staff array
  createdAt: timestamp("created_at").defaultNow(),
});

// 8. Doctors Table (Associated with specific hospitals)
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  hospitalId: integer("hospital_id")
    .references(() => hospitalFacilities.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  qualification: text("qualification").default("MBBS"),
  licenseNumber: text("license_number"),
  phone: text("phone"),
  email: text("email"),
  experienceYears: integer("experience_years").default(5),
  opdTimings: text("opd_timings").default("09:00 AM - 02:00 PM"),
  opdFeeInr: integer("opd_fee_inr").default(0),
  status: text("status").default("available"), // 'available' | 'in-opd' | 'off-duty'
  rating: text("rating").default("4.8"),
  totalConsultations: integer("total_consultations").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// 9. Health Articles Table (Educational content in DB)
export const healthArticles = pgTable("health_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleTe: text("title_te"),
  titleHi: text("title_hi"),
  category: text("category").notNull(),
  readTimeMinutes: integer("read_time_minutes").default(3),
  summary: text("summary").notNull(),
  summaryTe: text("summary_te"),
  summaryHi: text("summary_hi"),
  content: text("content").notNull(),
  contentTe: text("content_te"),
  contentHi: text("content_hi"),
  keyTakeaways: text("key_takeaways"), // JSON string
  tags: text("tags"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 10. Voice Chat Logs Table
export const voiceChatLogs = pgTable("voice_chat_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  role: text("role").notNull(), // 'user' | 'assistant'
  message: text("message").notNull(),
  language: text("language").default("te"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 11. Health Access Scores Table
export const healthAccessScores = pgTable("health_access_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  overallScore: integer("overall_score").default(78),
  facilityProximity: integer("facility_proximity").default(82),
  genericMedSavings: integer("generic_med_savings").default(88),
  emergencyReadiness: integer("emergency_readiness").default(70),
  vaccinationCoverage: integer("vaccination_coverage").default(90),
  monthlySavingsInr: integer("monthly_savings_inr").default(1850),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many, one }) => ({
  medications: many(medications),
  appointments: many(appointments),
  documents: many(healthDocuments),
  caregivers: many(caregivers),
  teleconsultSessions: many(teleconsultSessions),
  hospitalFacilities: many(hospitalFacilities),
  doctorProfiles: many(doctors),
  voiceChatLogs: many(voiceChatLogs),
  healthAccessScore: one(healthAccessScores, {
    fields: [users.id],
    references: [healthAccessScores.userId],
  }),
}));

export const hospitalFacilitiesRelations = relations(hospitalFacilities, ({ one, many }) => ({
  admin: one(users, {
    fields: [hospitalFacilities.userId],
    references: [users.id],
  }),
  doctors: many(doctors),
  appointments: many(appointments),
}));

export const doctorsRelations = relations(doctors, ({ one }) => ({
  hospital: one(hospitalFacilities, {
    fields: [doctors.hospitalId],
    references: [hospitalFacilities.id],
  }),
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id],
  }),
}));

export const medicationsRelations = relations(medications, ({ one }) => ({
  user: one(users, {
    fields: [medications.userId],
    references: [users.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
}));

export const healthDocumentsRelations = relations(healthDocuments, ({ one }) => ({
  user: one(users, {
    fields: [healthDocuments.userId],
    references: [users.id],
  }),
}));

export const caregiversRelations = relations(caregivers, ({ one }) => ({
  user: one(users, {
    fields: [caregivers.userId],
    references: [users.id],
  }),
}));

export const teleconsultSessionsRelations = relations(teleconsultSessions, ({ one }) => ({
  patient: one(users, {
    fields: [teleconsultSessions.userId],
    references: [users.id],
  }),
  doctor: one(users, {
    fields: [teleconsultSessions.doctorId],
    references: [users.id],
  }),
}));

export const voiceChatLogsRelations = relations(voiceChatLogs, ({ one }) => ({
  user: one(users, {
    fields: [voiceChatLogs.userId],
    references: [users.id],
  }),
}));

export const healthAccessScoresRelations = relations(healthAccessScores, ({ one }) => ({
  user: one(users, {
    fields: [healthAccessScores.userId],
    references: [users.id],
  }),
}));
