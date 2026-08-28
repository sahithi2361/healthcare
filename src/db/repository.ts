import { db } from "./index.ts";
import {
  users,
  medications,
  appointments,
  healthDocuments,
  caregivers,
  teleconsultSessions,
  hospitalFacilities,
  doctors,
  healthArticles,
  voiceChatLogs,
  healthAccessScores,
} from "./schema.ts";
import { eq, desc, and, or, sql } from "drizzle-orm";

// 1. User Profile Repository
export async function getOrCreateDbUser(uid: string, email: string, name?: string, role: string = "user") {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }
    const cleanName = name || email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const inserted = await db
      .insert(users)
      .values({
        uid,
        email,
        name: cleanName,
        role,
        preferredLanguage: "te",
        village: "Kondapur",
        district: "Nizamabad",
        bloodGroup: "O+",
        abhaNumber: "91-4829-1029-4821",
        phone: "+91 98490 12345",
        emergencyContactName: "Laxmi Rao",
        emergencyContactPhone: "+91 98490 54321",
        emergencyContactRelation: "Spouse",
      })
      .returning();

    // Also seed default health access score for new user
    await db.insert(healthAccessScores).values({
      userId: inserted[0].id,
      overallScore: 78,
      facilityProximity: 84,
      genericMedSavings: 92,
      emergencyReadiness: 75,
      vaccinationCoverage: 90,
      monthlySavingsInr: 1850,
    });

    // Seed initial medications for user
    await db.insert(medications).values([
      {
        userId: inserted[0].id,
        name: "Metformin (Jan Aushadhi)",
        genericName: "Metformin Hydrochloride 500mg",
        dosage: "500mg",
        frequency: "Twice daily after food (ఉదయం & రాత్రి భోజనం తర్వాత)",
        timings: JSON.stringify(["08:30", "20:30"]),
        condition: "Type 2 Diabetes",
        startDate: "2026-08-01",
        instructions: "Take with plain water. Do not skip meals.",
        isTakenToday: true,
        remainingDoses: 24,
      },
      {
        userId: inserted[0].id,
        name: "Amlodipine (Jan Aushadhi)",
        genericName: "Amlodipine Besylate 5mg",
        dosage: "5mg",
        frequency: "Once daily morning (ఉదయం 8:00)",
        timings: JSON.stringify(["08:00"]),
        condition: "Hypertension / BP",
        startDate: "2026-08-01",
        instructions: "Take before breakfast.",
        isTakenToday: false,
        remainingDoses: 18,
      },
      {
        userId: inserted[0].id,
        name: "Atorvastatin (Generic)",
        genericName: "Atorvastatin Calcium 10mg",
        dosage: "10mg",
        frequency: "Once daily at bedtime (రాత్రి పడుకునే ముందు)",
        timings: JSON.stringify(["21:30"]),
        condition: "Cholesterol Control",
        startDate: "2026-08-10",
        instructions: "Regular evening dose.",
        isTakenToday: false,
        remainingDoses: 28,
      },
    ]);

    // Seed initial appointments for user
    await db.insert(appointments).values([
      {
        userId: inserted[0].id,
        doctorName: "Dr. K. Srinivas Rao, MBBS",
        specialty: "General Medicine / Medical Officer",
        facilityName: "Primary Health Centre (PHC), Kondapur",
        date: "2026-09-02",
        time: "10:30 AM",
        status: "confirmed",
        type: "in-person",
        symptoms: "Quarterly BP & Blood Glucose Follow-up",
        notes: "Bring previous HbA1c lab report and empty stomach for fasting test.",
      },
      {
        userId: inserted[0].id,
        doctorName: "Dr. Ananya Reddy, MD (Cardiology)",
        specialty: "Cardiology (Tele-OPD)",
        facilityName: "District Area Hospital, Nizamabad",
        date: "2026-09-08",
        time: "02:00 PM",
        status: "confirmed",
        type: "teleconsult",
        symptoms: "Teleconsultation review of ECG and BP trends",
        notes: "Join via Saathi Video consultation room.",
      },
    ]);

    // Seed initial health documents
    await db.insert(healthDocuments).values([
      {
        userId: inserted[0].id,
        title: "PHC OPD Prescription & Medication Plan",
        type: "prescription",
        date: "2026-08-15",
        doctorOrHospital: "Dr. K. Srinivas Rao (PHC Kondapur)",
        summary: "Routine prescription for Metformin 500mg and Amlodipine 5mg generic equivalents under PMBJP Jan Aushadhi scheme.",
        fileUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
        tags: "Diabetes,BP,Generic Rx",
      },
      {
        userId: inserted[0].id,
        title: "Annual Fasting Blood Sugar & Lipid Profile",
        type: "lab-report",
        date: "2026-08-12",
        doctorOrHospital: "Nizamabad District Diagnostic Hub",
        summary: "FBS: 118 mg/dL (Normal Fasting), HbA1c: 6.4%, Total Cholesterol: 185 mg/dL. Well controlled under generic medication.",
        fileUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500&auto=format&fit=crop&q=60",
        tags: "Lab,FBS,HbA1c,Lipids",
      },
      {
        userId: inserted[0].id,
        title: "ABHA Health Card & Ayushman Bharat Scheme",
        type: "vaccination",
        date: "2026-01-10",
        doctorOrHospital: "National Health Authority (Govt of India)",
        summary: "Digital ABHA Health ID linked with Aadhaar. PMJAY Ayushman Bharat eligible for cashless tertiary coverage up to ₹5 Lakh.",
        fileUrl: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=500&auto=format&fit=crop&q=60",
        tags: "ABHA,PMJAY,Insurance",
      },
    ]);

    // Seed initial Care Circle member
    await db.insert(caregivers).values([
      {
        userId: inserted[0].id,
        name: "Laxmi Rao",
        relation: "Spouse (భార్య)",
        phone: "+91 98490 54321",
        email: "laxmi.rao@example.com",
        accessLevel: "manage",
        isEmergencyContact: true,
        status: "active",
      },
      {
        userId: inserted[0].id,
        name: "Venkatesh Rao",
        relation: "Son (కుమారుడు)",
        phone: "+91 98490 98765",
        email: "venkatesh.rao@example.com",
        accessLevel: "view",
        isEmergencyContact: true,
        status: "active",
      },
    ]);

    // Seed initial Teleconsult session for OPD
    await db.insert(teleconsultSessions).values([
      {
        userId: inserted[0].id,
        patientName: cleanName,
        patientAge: 48,
        patientGender: "Male",
        village: "Kondapur, Nizamabad",
        symptoms: "Mild dizziness in morning and need Jan Aushadhi generic refill advice",
        triagePriority: "medium",
        status: "waiting",
        scheduledTime: "11:30 AM",
      },
    ]);

    return inserted[0];
  } catch (error) {
    console.error("Database user fetch/create error:", error);
    throw new Error("Failed to initialize user record in PostgreSQL.", { cause: error });
  }
}

export async function updateUserProfile(userId: number, data: Partial<typeof users.$inferInsert>) {
  try {
    const updated = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    return updated[0];
  } catch (error) {
    console.error("Error updating user profile in PostgreSQL:", error);
    throw new Error("Failed to update user profile.", { cause: error });
  }
}

// 2. Medications Queries
export async function getUserMedications(userId: number) {
  try {
    return await db
      .select()
      .from(medications)
      .where(eq(medications.userId, userId))
      .orderBy(desc(medications.createdAt));
  } catch (error) {
    console.error("Error fetching medications from PostgreSQL:", error);
    throw new Error("Failed to fetch medications.", { cause: error });
  }
}

export async function addMedication(userId: number, med: {
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  timings?: string;
  condition?: string;
  startDate?: string;
  endDate?: string;
  instructions?: string;
  remainingDoses?: number;
}) {
  try {
    const inserted = await db
      .insert(medications)
      .values({
        userId,
        name: med.name,
        genericName: med.genericName,
        dosage: med.dosage,
        frequency: med.frequency,
        timings: med.timings,
        condition: med.condition,
        startDate: med.startDate || new Date().toISOString().split("T")[0],
        endDate: med.endDate,
        instructions: med.instructions,
        remainingDoses: med.remainingDoses || 30,
        isTakenToday: false,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error("Error inserting medication into PostgreSQL:", error);
    throw new Error("Failed to create medication.", { cause: error });
  }
}

export async function toggleMedicationTaken(userId: number, medId: number) {
  try {
    const current = await db
      .select()
      .from(medications)
      .where(eq(medications.id, medId))
      .limit(1);

    if (current.length === 0 || current[0].userId !== userId) {
      throw new Error("Medication not found or unauthorized");
    }

    const nextState = !current[0].isTakenToday;
    const updated = await db
      .update(medications)
      .set({
        isTakenToday: nextState,
        remainingDoses: nextState
          ? Math.max(0, (current[0].remainingDoses || 30) - 1)
          : (current[0].remainingDoses || 30) + 1,
      })
      .where(eq(medications.id, medId))
      .returning();
    return updated[0];
  } catch (error) {
    console.error("Error toggling medication taken in PostgreSQL:", error);
    throw new Error("Failed to update medication status.", { cause: error });
  }
}

export async function deleteMedication(userId: number, medId: number) {
  try {
    await db
      .delete(medications)
      .where(eq(medications.id, medId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting medication from PostgreSQL:", error);
    throw new Error("Failed to delete medication.", { cause: error });
  }
}

// 3. Appointments Queries
export async function getUserAppointments(userId: number) {
  try {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, userId))
      .orderBy(desc(appointments.createdAt));
  } catch (error) {
    console.error("Error fetching appointments from PostgreSQL:", error);
    throw new Error("Failed to fetch appointments.", { cause: error });
  }
}

export async function addAppointment(userId: number, appt: {
  doctorName: string;
  specialty: string;
  facilityName: string;
  date: string;
  time: string;
  type?: string;
  symptoms?: string;
  notes?: string;
}) {
  try {
    const inserted = await db
      .insert(appointments)
      .values({
        userId,
        doctorName: appt.doctorName,
        specialty: appt.specialty,
        facilityName: appt.facilityName,
        date: appt.date,
        time: appt.time,
        type: appt.type || "in-person",
        symptoms: appt.symptoms,
        notes: appt.notes,
        status: "confirmed",
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error("Error booking appointment in PostgreSQL:", error);
    throw new Error("Failed to book appointment.", { cause: error });
  }
}

export async function cancelAppointment(userId: number, apptId: number) {
  try {
    const updated = await db
      .update(appointments)
      .set({ status: "cancelled" })
      .where(eq(appointments.id, apptId))
      .returning();
    return updated[0];
  } catch (error) {
    console.error("Error cancelling appointment in PostgreSQL:", error);
    throw new Error("Failed to cancel appointment.", { cause: error });
  }
}

// 4. Health Documents Queries
export async function getUserDocuments(userId: number) {
  try {
    return await db
      .select()
      .from(healthDocuments)
      .where(eq(healthDocuments.userId, userId))
      .orderBy(desc(healthDocuments.createdAt));
  } catch (error) {
    console.error("Error fetching documents from PostgreSQL:", error);
    throw new Error("Failed to fetch documents.", { cause: error });
  }
}

export async function addHealthDocument(userId: number, doc: {
  title: string;
  type: string;
  date: string;
  doctorOrHospital: string;
  summary?: string;
  fileUrl?: string;
  tags?: string;
}) {
  try {
    const inserted = await db
      .insert(healthDocuments)
      .values({
        userId,
        title: doc.title,
        type: doc.type,
        date: doc.date || new Date().toISOString().split("T")[0],
        doctorOrHospital: doc.doctorOrHospital,
        summary: doc.summary,
        fileUrl: doc.fileUrl,
        tags: doc.tags,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error("Error adding document to PostgreSQL:", error);
    throw new Error("Failed to save health document.", { cause: error });
  }
}

export async function deleteHealthDocument(userId: number, docId: number) {
  try {
    await db.delete(healthDocuments).where(eq(healthDocuments.id, docId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting document from PostgreSQL:", error);
    throw new Error("Failed to delete document.", { cause: error });
  }
}

// 5. Caregivers Queries
export async function getUserCaregivers(userId: number) {
  try {
    return await db
      .select()
      .from(caregivers)
      .where(eq(caregivers.userId, userId))
      .orderBy(desc(caregivers.createdAt));
  } catch (error) {
    console.error("Error fetching caregivers from PostgreSQL:", error);
    throw new Error("Failed to fetch caregivers.", { cause: error });
  }
}

export async function addCaregiver(userId: number, cg: {
  name: string;
  relation: string;
  phone: string;
  email?: string;
  accessLevel?: string;
  isEmergencyContact?: boolean;
}) {
  try {
    const inserted = await db
      .insert(caregivers)
      .values({
        userId,
        name: cg.name,
        relation: cg.relation,
        phone: cg.phone,
        email: cg.email,
        accessLevel: cg.accessLevel || "view",
        isEmergencyContact: cg.isEmergencyContact ?? false,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error("Error adding caregiver to PostgreSQL:", error);
    throw new Error("Failed to add caregiver.", { cause: error });
  }
}

export async function deleteCaregiver(userId: number, cgId: number) {
  try {
    await db.delete(caregivers).where(eq(caregivers.id, cgId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting caregiver from PostgreSQL:", error);
    throw new Error("Failed to delete caregiver.", { cause: error });
  }
}

// 6. Teleconsult Sessions (Doctor Workspace & Patient Queue)
export async function getTeleconsultQueue() {
  try {
    return await db
      .select()
      .from(teleconsultSessions)
      .orderBy(desc(teleconsultSessions.createdAt));
  } catch (error) {
    console.error("Error fetching teleconsult queue from PostgreSQL:", error);
    throw new Error("Failed to fetch teleconsult sessions.", { cause: error });
  }
}

export async function createTeleconsultRequest(userId: number, data: {
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  village?: string;
  symptoms: string;
  triagePriority?: string;
  scheduledTime?: string;
}) {
  try {
    const inserted = await db
      .insert(teleconsultSessions)
      .values({
        userId,
        patientName: data.patientName,
        patientAge: data.patientAge || 35,
        patientGender: data.patientGender || "Other",
        village: data.village || "Rural Area",
        symptoms: data.symptoms,
        triagePriority: data.triagePriority || "medium",
        status: "waiting",
        scheduledTime: data.scheduledTime || "Immediate OPD",
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error("Error creating teleconsult in PostgreSQL:", error);
    throw new Error("Failed to create teleconsult request.", { cause: error });
  }
}

export async function submitDoctorPrescription(sessionId: number, doctorId: number, data: {
  rxDiagnosis: string;
  rxMedicines: any[];
  rxAdvice: string;
}) {
  try {
    const updated = await db
      .update(teleconsultSessions)
      .set({
        doctorId,
        rxDiagnosis: data.rxDiagnosis,
        rxMedicines: JSON.stringify(data.rxMedicines),
        rxAdvice: data.rxAdvice,
        status: "completed",
        callDurationMinutes: 12,
      })
      .where(eq(teleconsultSessions.id, sessionId))
      .returning();
    return updated[0];
  } catch (error) {
    console.error("Error submitting doctor prescription to PostgreSQL:", error);
    throw new Error("Failed to submit prescription.", { cause: error });
  }
}

// 7. Hospital Facilities & Realtime Capacities
export async function getAllHospitalFacilities() {
  try {
    const list = await db.select().from(hospitalFacilities);
    if (list.length === 0) {
      // Seed default facilities with real coordinates and capacities
      return await seedHospitalFacilities();
    }
    return list;
  } catch (error) {
    console.error("Error fetching hospital facilities from PostgreSQL:", error);
    throw new Error("Failed to fetch hospital facilities.", { cause: error });
  }
}

export async function updateFacilityBeds(facilityId: number, data: {
  occupiedBeds?: number;
  occupiedIcu?: number;
  occupiedOxygen?: number;
  occupiedMaternity?: number;
}) {
  try {
    const updated = await db
      .update(hospitalFacilities)
      .set(data)
      .where(eq(hospitalFacilities.id, facilityId))
      .returning();
    return updated[0];
  } catch (error) {
    console.error("Error updating facility beds in PostgreSQL:", error);
    throw new Error("Failed to update bed capacity.", { cause: error });
  }
}

export async function seedHospitalFacilities() {
  try {
    // Get or create a system admin user for facility ownership
    const adminUser = await getOrCreateDbUser("admin-system-facility", "admin@sehatsaathi.gov.in", "Govt Health Directorate", "hospital");

    const defaultFacilities = [
      {
        userId: adminUser.id,
        name: "Primary Health Centre (PHC), Kondapur",
        type: "Primary Health Centre (PHC)",
        address: "Main Road, Kondapur Mandal, Nizamabad",
        district: "Nizamabad",
        pincode: "503001",
        phone: "+91 8462 230114",
        emergencyPhone: "108",
        lat: "17.4699",
        lng: "78.3578",
        rating: "4.7",
        totalBeds: 24,
        occupiedBeds: 14,
        totalIcu: 2,
        occupiedIcu: 1,
        totalOxygen: 8,
        occupiedOxygen: 3,
        totalMaternity: 6,
        occupiedMaternity: 2,
        hasEmergency: true,
        hasJanAushadhi: true,
        hasTeleconsult: true,
        ambulanceStatus: JSON.stringify([
          { id: "AMB-108-01", callSign: "Ambulance 108 - Zone A", status: "available", driver: "Raju Naik", phone: "+91 98491 10801", location: "Kondapur Base", lat: 17.471, lng: 78.359, etaMin: 4 },
          { id: "AMB-108-02", callSign: "Ambulance 108 - Zone B", status: "dispatched", driver: "Suresh Kumar", phone: "+91 98491 10802", location: "En route to Mandal Junction", lat: 17.465, lng: 78.362, etaMin: 8 },
        ]),
        pharmacyStock: JSON.stringify([
          { id: "MED-01", genericName: "Paracetamol 500mg (PMBJP)", brandEquivalent: "Crocin/Calpol", priceGeneric: 12, priceBranded: 35, stock: 450, status: "in_stock" },
          { id: "MED-02", genericName: "Metformin 500mg (PMBJP)", brandEquivalent: "Glycomet", priceGeneric: 18, priceBranded: 65, stock: 320, status: "in_stock" },
          { id: "MED-03", genericName: "Amlodipine 5mg (PMBJP)", brandEquivalent: "Amlong", priceGeneric: 10, priceBranded: 45, stock: 280, status: "in_stock" },
          { id: "MED-04", genericName: "ORS Sachets (PMBJP)", brandEquivalent: "Electral", priceGeneric: 8, priceBranded: 24, stock: 190, status: "in_stock" },
          { id: "MED-05", genericName: "Azithromycin 500mg (PMBJP)", brandEquivalent: "Azee 500", priceGeneric: 38, priceBranded: 130, stock: 15, status: "low_stock" },
        ]),
        staffRoster: JSON.stringify([
          { role: "Medical Officer", name: "Dr. K. Srinivas Rao, MBBS", shift: "Morning OPD (8 AM - 2 PM)", status: "on_duty" },
          { role: "Staff Nurse", name: "Sunitha Kumari, GNM", shift: "24x7 Emergency", status: "on_duty" },
          { role: "Pharmacist", name: "M. Anji Reddy, B.Pharm", shift: "Jan Aushadhi Counter", status: "on_duty" },
          { role: "Lab Technician", name: "P. Ravi Kumar", shift: "Diagnostic Wing", status: "on_duty" },
        ]),
      },
      {
        userId: adminUser.id,
        name: "Community Health Centre (CHC), Armoor",
        type: "Community Health Centre (CHC)",
        address: "Station Road, Armoor Sub-District, Nizamabad",
        district: "Nizamabad",
        pincode: "503224",
        phone: "+91 8463 222045",
        emergencyPhone: "108",
        lat: "17.4850",
        lng: "78.3750",
        rating: "4.6",
        totalBeds: 50,
        occupiedBeds: 34,
        totalIcu: 8,
        occupiedIcu: 5,
        totalOxygen: 18,
        occupiedOxygen: 11,
        totalMaternity: 12,
        occupiedMaternity: 7,
        hasEmergency: true,
        hasJanAushadhi: true,
        hasTeleconsult: true,
        ambulanceStatus: JSON.stringify([
          { id: "AMB-108-03", callSign: "Advanced Life Support (ALS) 108", status: "available", driver: "B. Mohan", phone: "+91 98491 10803", location: "CHC Station Yard", lat: 17.486, lng: 78.376, etaMin: 5 },
        ]),
        pharmacyStock: JSON.stringify([
          { id: "MED-06", genericName: "Ceftriaxone 1g Inj (PMBJP)", brandEquivalent: "Monocef", priceGeneric: 32, priceBranded: 85, stock: 140, status: "in_stock" },
          { id: "MED-07", genericName: "Pantoprazole 40mg (PMBJP)", brandEquivalent: "Pan-40", priceGeneric: 16, priceBranded: 98, stock: 220, status: "in_stock" },
        ]),
        staffRoster: JSON.stringify([
          { role: "Surgeon Specialist", name: "Dr. B. Satyanarayana, MS", shift: "General Surgery OPD", status: "on_duty" },
          { role: "Gynaecologist", name: "Dr. V. Lalitha, DGO", shift: "Maternal Care Wing", status: "on_duty" },
        ]),
      },
      {
        userId: adminUser.id,
        name: "District Headquarter Hospital, Nizamabad",
        type: "District Hospital",
        address: "Khaleelwadi, District Hospital Complex, Nizamabad",
        district: "Nizamabad",
        pincode: "503001",
        phone: "+91 8462 221088",
        emergencyPhone: "08462-221099",
        lat: "17.4420",
        lng: "78.3410",
        rating: "4.8",
        totalBeds: 250,
        occupiedBeds: 188,
        totalIcu: 35,
        occupiedIcu: 26,
        totalOxygen: 80,
        occupiedOxygen: 54,
        totalMaternity: 40,
        occupiedMaternity: 28,
        hasEmergency: true,
        hasJanAushadhi: true,
        hasTeleconsult: true,
        ambulanceStatus: JSON.stringify([
          { id: "AMB-108-04", callSign: "Critical Cardiac Ambulance", status: "available", driver: "G. Venkatesh", phone: "+91 98491 10804", location: "District Hospital Trauma Wing", lat: 17.443, lng: 78.342, etaMin: 3 },
          { id: "AMB-108-05", callSign: "Neonatal Care Ambulance", status: "available", driver: "M. Ramesh", phone: "+91 98491 10805", location: "District Hospital NICU", lat: 17.441, lng: 78.340, etaMin: 4 },
        ]),
        pharmacyStock: JSON.stringify([
          { id: "MED-08", genericName: "Insulin Human 40IU/ml (PMBJP)", brandEquivalent: "Human Mixtard", priceGeneric: 95, priceBranded: 240, stock: 180, status: "in_stock" },
          { id: "MED-09", genericName: "Telmisartan 40mg (PMBJP)", brandEquivalent: "Telma 40", priceGeneric: 14, priceBranded: 75, stock: 360, status: "in_stock" },
          { id: "MED-10", genericName: "Atorvastatin 10mg (PMBJP)", brandEquivalent: "Atorva 10", priceGeneric: 18, priceBranded: 82, stock: 290, status: "in_stock" },
        ]),
        staffRoster: JSON.stringify([
          { role: "Chief Medical Superintendent", name: "Dr. P. Madhusudhan Rao, MD", shift: "Admin & ICU Rounds", status: "on_duty" },
          { role: "Cardiologist", name: "Dr. Ananya Reddy, DM", shift: "Cardiac Care Unit", status: "on_duty" },
          { role: "Pediatrician", name: "Dr. Sandeep Varma, MD", shift: "NICU/PICU", status: "on_duty" },
        ]),
      },
      {
        userId: adminUser.id,
        name: "Pradhan Mantri Jan Aushadhi Kendra (PMBJP)",
        type: "Jan Aushadhi Pharmacy",
        address: "Near Bus Stand, Commercial Complex, Nizamabad",
        district: "Nizamabad",
        pincode: "503001",
        phone: "+91 8462 254321",
        emergencyPhone: "+91 8462 254321",
        lat: "17.4580",
        lng: "78.3620",
        rating: "4.9",
        totalBeds: 0,
        occupiedBeds: 0,
        totalIcu: 0,
        occupiedIcu: 0,
        totalOxygen: 0,
        occupiedOxygen: 0,
        totalMaternity: 0,
        occupiedMaternity: 0,
        hasEmergency: false,
        hasJanAushadhi: true,
        hasTeleconsult: false,
        ambulanceStatus: JSON.stringify([]),
        pharmacyStock: JSON.stringify([
          { id: "MED-11", genericName: "Voglibose 0.2mg (PMBJP)", brandEquivalent: "Volibo", priceGeneric: 22, priceBranded: 110, stock: 150, status: "in_stock" },
          { id: "MED-12", genericName: "Calcium + Vitamin D3 (PMBJP)", brandEquivalent: "Shelcal 500", priceGeneric: 24, priceBranded: 118, stock: 400, status: "in_stock" },
          { id: "MED-13", genericName: "Levocetirizine 5mg (PMBJP)", brandEquivalent: "Levocet", priceGeneric: 10, priceBranded: 45, stock: 300, status: "in_stock" },
        ]),
        staffRoster: JSON.stringify([
          { role: "Jan Aushadhi Pharmacist", name: "S. Nageshwar Rao", shift: "8:00 AM - 9:00 PM", status: "on_duty" },
        ]),
      },
    ];

    const inserted = await db.insert(hospitalFacilities).values(defaultFacilities).returning();
    return inserted;
  } catch (error) {
    console.error("Error seeding hospital facilities into PostgreSQL:", error);
    throw new Error("Failed to seed facilities.", { cause: error });
  }
}

// 8. Health Access Score Query
export async function getUserHealthScore(userId: number) {
  try {
    const scores = await db
      .select()
      .from(healthAccessScores)
      .where(eq(healthAccessScores.userId, userId))
      .limit(1);

    if (scores.length > 0) {
      return scores[0];
    }

    const created = await db
      .insert(healthAccessScores)
      .values({
        userId,
        overallScore: 82,
        facilityProximity: 86,
        genericMedSavings: 94,
        emergencyReadiness: 76,
        vaccinationCoverage: 92,
        monthlySavingsInr: 1950,
      })
      .returning();
    return created[0];
  } catch (error) {
    console.error("Error fetching health access score from PostgreSQL:", error);
    throw new Error("Failed to fetch health score.", { cause: error });
  }
}

// 9. Hospital Creation & Dedicated Management
export async function createHospitalFacility(userId: number, data: any) {
  try {
    const defaultServices = data.facilitiesList || "24x7 Emergency Services, Outpatient General OPD, Maternal & Antenatal Checkup, Free Jan Aushadhi Medicines, Routine Child Immunization, Diagnostic Pathology Lab";
    const [inserted] = await db
      .insert(hospitalFacilities)
      .values({
        userId,
        name: data.name || "Community Health Facility",
        type: data.type || "Community Health Centre (CHC)",
        address: data.address || "Main Road, Near Bus Stand",
        district: data.district || "Nizamabad",
        pincode: data.pincode || "503001",
        phone: data.phone || "+91 98490 11222",
        emergencyPhone: data.emergencyPhone || "108",
        lat: data.lat ? String(data.lat) : "17.4700",
        lng: data.lng ? String(data.lng) : "78.3600",
        rating: "4.8",
        totalBeds: data.totalBeds ? Number(data.totalBeds) : 50,
        occupiedBeds: data.occupiedBeds ? Number(data.occupiedBeds) : 25,
        totalIcu: data.totalIcu ? Number(data.totalIcu) : 8,
        occupiedIcu: data.occupiedIcu ? Number(data.occupiedIcu) : 4,
        totalOxygen: data.totalOxygen ? Number(data.totalOxygen) : 15,
        occupiedOxygen: data.occupiedOxygen ? Number(data.occupiedOxygen) : 7,
        totalMaternity: data.totalMaternity ? Number(data.totalMaternity) : 10,
        occupiedMaternity: data.occupiedMaternity ? Number(data.occupiedMaternity) : 5,
        hasEmergency: data.hasEmergency !== undefined ? Boolean(data.hasEmergency) : true,
        hasJanAushadhi: data.hasJanAushadhi !== undefined ? Boolean(data.hasJanAushadhi) : true,
        hasTeleconsult: data.hasTeleconsult !== undefined ? Boolean(data.hasTeleconsult) : true,
        facilitiesList: typeof defaultServices === "string" ? defaultServices : JSON.stringify(defaultServices),
        ambulanceStatus: JSON.stringify([
          { id: `AMB-${Date.now()}-1`, callSign: "Hospital Emergency Response ALS-1", status: "available", driver: "Paramedic Lead", phone: data.emergencyPhone || "+91 98491 10800", location: data.address || "Hospital Depot", lat: Number(data.lat) || 17.4700, lng: Number(data.lng) || 78.3600, etaMin: 5 }
        ]),
        pharmacyStock: JSON.stringify([
          { id: "MED-01", genericName: "Paracetamol 650mg (PMBJP)", brandEquivalent: "Dolo 650", priceGeneric: 8.5, priceBranded: 34, stock: 850, status: "in_stock" },
          { id: "MED-02", genericName: "Amlodipine 5mg (PMBJP)", brandEquivalent: "Amlong", priceGeneric: 5.2, priceBranded: 42, stock: 620, status: "in_stock" },
          { id: "MED-03", genericName: "Metformin 500mg (PMBJP)", brandEquivalent: "Glycomet", priceGeneric: 6.4, priceBranded: 48, stock: 540, status: "in_stock" },
          { id: "MED-04", genericName: "ORS Sachets (PMBJP)", brandEquivalent: "Electral", priceGeneric: 4.8, priceBranded: 22.5, stock: 1200, status: "in_stock" },
        ]),
        staffRoster: JSON.stringify([
          { role: "Chief Medical Officer", name: "Medical Superintendent", shift: "General Shift", status: "on_duty" },
          { role: "Emergency Duty Officer", name: "On-Call Casualty Physician", shift: "24x7 Emergency", status: "on_duty" },
        ]),
      })
      .returning();

    // Also seed a default doctor belonging specifically to this newly created hospital
    if (inserted) {
      await db.insert(doctors).values({
        hospitalId: inserted.id,
        name: "Dr. K. Srinivas Rao, MBBS",
        specialty: "General Medicine & Rural Care",
        qualification: "MBBS, MD (Community Medicine)",
        licenseNumber: `TS-MCI-${Math.floor(10000 + Math.random() * 90000)}`,
        phone: data.phone || "+91 94401 23456",
        email: "dr.srinivas@ruralhealth.org",
        experienceYears: 12,
        opdTimings: "Mon-Sat: 09:00 AM - 02:00 PM",
        opdFeeInr: 0,
        status: "available",
        rating: "4.9",
        totalConsultations: 340,
      });
    }

    return inserted;
  } catch (error) {
    console.error("Error creating hospital facility in PostgreSQL:", error);
    throw new Error("Failed to create hospital facility.", { cause: error });
  }
}

export async function getHospitalByUserId(userId: number) {
  try {
    const list = await db
      .select()
      .from(hospitalFacilities)
      .where(eq(hospitalFacilities.userId, userId))
      .limit(1);
    if (list.length > 0) return list[0];
    
    // Fallback: get first facility
    const all = await getAllHospitalFacilities();
    return all[0] || null;
  } catch (error) {
    console.error("Error fetching hospital by userId:", error);
    throw error;
  }
}

export async function getHospitalById(hospitalId: number) {
  try {
    const list = await db
      .select()
      .from(hospitalFacilities)
      .where(eq(hospitalFacilities.id, hospitalId))
      .limit(1);
    return list[0] || null;
  } catch (error) {
    console.error("Error fetching hospital by ID:", error);
    throw error;
  }
}

export async function updateHospitalFacility(hospitalId: number, data: any) {
  try {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.type) updateData.type = data.type;
    if (data.address) updateData.address = data.address;
    if (data.district) updateData.district = data.district;
    if (data.pincode) updateData.pincode = data.pincode;
    if (data.phone) updateData.phone = data.phone;
    if (data.emergencyPhone) updateData.emergencyPhone = data.emergencyPhone;
    if (data.lat) updateData.lat = String(data.lat);
    if (data.lng) updateData.lng = String(data.lng);
    if (data.totalBeds !== undefined) updateData.totalBeds = Number(data.totalBeds);
    if (data.occupiedBeds !== undefined) updateData.occupiedBeds = Number(data.occupiedBeds);
    if (data.totalIcu !== undefined) updateData.totalIcu = Number(data.totalIcu);
    if (data.occupiedIcu !== undefined) updateData.occupiedIcu = Number(data.occupiedIcu);
    if (data.totalOxygen !== undefined) updateData.totalOxygen = Number(data.totalOxygen);
    if (data.occupiedOxygen !== undefined) updateData.occupiedOxygen = Number(data.occupiedOxygen);
    if (data.totalMaternity !== undefined) updateData.totalMaternity = Number(data.totalMaternity);
    if (data.occupiedMaternity !== undefined) updateData.occupiedMaternity = Number(data.occupiedMaternity);
    if (data.hasEmergency !== undefined) updateData.hasEmergency = Boolean(data.hasEmergency);
    if (data.hasJanAushadhi !== undefined) updateData.hasJanAushadhi = Boolean(data.hasJanAushadhi);
    if (data.hasTeleconsult !== undefined) updateData.hasTeleconsult = Boolean(data.hasTeleconsult);
    if (data.facilitiesList !== undefined) updateData.facilitiesList = typeof data.facilitiesList === "string" ? data.facilitiesList : JSON.stringify(data.facilitiesList);

    const [updated] = await db
      .update(hospitalFacilities)
      .set(updateData)
      .where(eq(hospitalFacilities.id, hospitalId))
      .returning();
    return updated;
  } catch (error) {
    console.error("Error updating hospital facility:", error);
    throw error;
  }
}

// 10. Doctors belonging to specific hospital
export async function getHospitalDoctors(hospitalId: number) {
  try {
    // Ensure doctors exist for this hospital; if none, seed default hospital-specific doctors
    const existing = await db
      .select()
      .from(doctors)
      .where(eq(doctors.hospitalId, hospitalId))
      .orderBy(desc(doctors.createdAt));

    if (existing.length > 0) {
      return existing;
    }

    // Seed doctors belonging specifically to this hospital
    const seeded = await db
      .insert(doctors)
      .values([
        {
          hospitalId,
          name: "Dr. K. Srinivas Rao, MBBS",
          specialty: "General Physician & Community Health",
          qualification: "MBBS, MD (Community Medicine)",
          licenseNumber: "TS-MCI-48291",
          phone: "+91 94401 23456",
          email: "dr.srinivas@telanganahealth.gov.in",
          experienceYears: 12,
          opdTimings: "Mon-Sat: 09:00 AM - 02:00 PM",
          opdFeeInr: 0,
          status: "available",
          rating: "4.9",
          totalConsultations: 520,
        },
        {
          hospitalId,
          name: "Dr. P. Sujatha, MS",
          specialty: "Gynecologist & Obstetrician",
          qualification: "MBBS, MS (OBG), DGO",
          licenseNumber: "TS-MCI-39102",
          phone: "+91 94402 34567",
          email: "dr.sujatha@telanganahealth.gov.in",
          experienceYears: 14,
          opdTimings: "Mon-Sat: 09:00 AM - 03:00 PM (Emergency 24x7)",
          opdFeeInr: 0,
          status: "available",
          rating: "4.9",
          totalConsultations: 640,
        },
        {
          hospitalId,
          name: "Dr. Rajesh Varma, MD",
          specialty: "Pediatrician (Child Specialist)",
          qualification: "MBBS, DCH, MD (Pediatrics)",
          licenseNumber: "TS-MCI-52119",
          phone: "+91 94403 45678",
          email: "dr.rajesh@telanganahealth.gov.in",
          experienceYears: 10,
          opdTimings: "Mon-Sat: 09:30 AM - 01:30 PM, 05:00 PM - 07:30 PM",
          opdFeeInr: 0,
          status: "available",
          rating: "4.8",
          totalConsultations: 410,
        },
      ])
      .returning();

    return seeded;
  } catch (error) {
    console.error("Error fetching hospital doctors from PostgreSQL:", error);
    throw error;
  }
}

export async function getAllDoctors() {
  try {
    const list = await db.select().from(doctors).orderBy(desc(doctors.createdAt));
    if (list.length > 0) {
      return list;
    }
    // Seed initial list if empty
    const facs = await getAllHospitalFacilities();
    const defaultHospitalId = facs[0]?.id || 1;
    return await getHospitalDoctors(defaultHospitalId);
  } catch (error) {
    console.error("Error fetching all doctors:", error);
    throw error;
  }
}

export async function addDoctorToHospital(hospitalId: number, data: any) {
  try {
    const [inserted] = await db
      .insert(doctors)
      .values({
        hospitalId,
        name: data.name,
        specialty: data.specialty || "General Physician",
        qualification: data.qualification || "MBBS",
        licenseNumber: data.licenseNumber || `TS-MCI-${Math.floor(10000 + Math.random() * 90000)}`,
        phone: data.phone || "+91 98490 00000",
        email: data.email || "doctor@ruralhealth.gov.in",
        experienceYears: data.experienceYears ? Number(data.experienceYears) : 5,
        opdTimings: data.opdTimings || "09:00 AM - 02:00 PM",
        opdFeeInr: data.opdFeeInr !== undefined ? Number(data.opdFeeInr) : 0,
        status: data.status || "available",
        rating: "4.8",
        totalConsultations: 0,
      })
      .returning();
    return inserted;
  } catch (error) {
    console.error("Error adding doctor to hospital in PostgreSQL:", error);
    throw error;
  }
}

export async function deleteDoctorFromHospital(hospitalId: number, doctorId: number) {
  try {
    const [deleted] = await db
      .delete(doctors)
      .where(and(eq(doctors.id, doctorId), eq(doctors.hospitalId, hospitalId)))
      .returning();
    return deleted || { success: true, id: doctorId };
  } catch (error) {
    console.error("Error deleting doctor from hospital:", error);
    throw error;
  }
}

// 11. Doctor OPD Patients by Date
export async function getDoctorPatientsByDate(dateStr?: string, doctorId?: number, hospitalId?: number) {
  try {
    let query = db.select().from(appointments);
    
    // Seed sample patients for today/selected date if none exist
    const todayStr = new Date().toISOString().split("T")[0];
    const targetDate = dateStr || todayStr;

    const existing = await query;
    if (existing.length === 0) {
      // Seed rich OPD patient queue with complete details
      const defaultUser = await getOrCreateDbUser("default_patient_01", "patient@sehatsaathi.gov.in", "Lakshmi Devi", "user");
      await db.insert(appointments).values([
        {
          userId: defaultUser.id,
          doctorId: doctorId || 1,
          hospitalId: hospitalId || 1,
          doctorName: "Dr. K. Srinivas Rao, MBBS",
          specialty: "General Physician",
          facilityName: "Primary Health Centre (PHC), Bhoothpur",
          patientName: "Lakshmi Devi",
          patientAge: 54,
          patientGender: "Female",
          patientPhone: "+91 98480 12345",
          patientVillage: "Bhoothpur Village",
          patientBloodGroup: "B+",
          patientAbha: "91-8472-1049-3821",
          date: targetDate,
          time: "09:30 AM",
          status: "confirmed",
          type: "in-person",
          symptoms: "Morning dizziness, mild headache and hypertension BP check",
          vitalsBp: "142/88 mmHg",
          vitalsPulse: 78,
          vitalsSpo2: 98,
          vitalsTemp: "98.6°F",
          triagePriority: "medium",
          rxDiagnosis: "Essential Stage-1 Hypertension",
          rxMedicines: JSON.stringify([
            { name: "Amlodipine 5mg", dosage: "5mg", frequency: "Once daily morning", duration: "30 days", janAushadhi: true },
            { name: "Paracetamol 500mg", dosage: "500mg", frequency: "SOS as needed", duration: "5 days", janAushadhi: true },
          ]),
          rxAdvice: "Low sodium salt diet. Daily 30 min walk. Check BP weekly at ASHA centre.",
          notes: "Regular NCD follow-up patient.",
        },
        {
          userId: defaultUser.id,
          doctorId: doctorId || 1,
          hospitalId: hospitalId || 1,
          doctorName: "Dr. K. Srinivas Rao, MBBS",
          specialty: "General Physician",
          facilityName: "Primary Health Centre (PHC), Bhoothpur",
          patientName: "Venkatiah Goud",
          patientAge: 62,
          patientGender: "Male",
          patientPhone: "+91 94402 87654",
          patientVillage: "Kothakota Rural",
          patientBloodGroup: "O+",
          patientAbha: "91-3829-5012-9921",
          date: targetDate,
          time: "10:15 AM",
          status: "confirmed",
          type: "in-person",
          symptoms: "Persistent dry cough for 4 days post harvest crop season",
          vitalsBp: "128/82 mmHg",
          vitalsPulse: 84,
          vitalsSpo2: 96,
          vitalsTemp: "99.1°F",
          triagePriority: "high",
          rxDiagnosis: "Allergic Bronchial Irritation / Seasonal Bronchospasm",
          rxMedicines: JSON.stringify([
            { name: "Cetirizine 10mg", dosage: "10mg", frequency: "Once daily at night", duration: "7 days", janAushadhi: true },
            { name: "Ambroxol Syrup", dosage: "10ml", frequency: "Thrice daily", duration: "5 days", janAushadhi: true },
          ]),
          rxAdvice: "Wear mask in fields. Steam inhalation twice daily. Drink warm water.",
          notes: "Dust exposure. No hemoptysis.",
        },
        {
          userId: defaultUser.id,
          doctorId: doctorId || 1,
          hospitalId: hospitalId || 1,
          doctorName: "Dr. K. Srinivas Rao, MBBS",
          specialty: "General Physician",
          facilityName: "Primary Health Centre (PHC), Bhoothpur",
          patientName: "Sunitha & Baby Aarav (8 mo)",
          patientAge: 26,
          patientGender: "Female",
          patientPhone: "+91 99890 34567",
          patientVillage: "Jadcherla Town",
          patientBloodGroup: "A+",
          patientAbha: "91-1029-4821-6677",
          date: targetDate,
          time: "11:00 AM",
          status: "in-consultation",
          type: "in-person",
          symptoms: "Infant has mild fever 100°F and loose motions since yesterday",
          vitalsBp: "Normal",
          vitalsPulse: 110,
          vitalsSpo2: 99,
          vitalsTemp: "100.2°F",
          triagePriority: "high",
          rxDiagnosis: "Mild Acute Pediatric Gastroenteritis",
          rxMedicines: JSON.stringify([
            { name: "Zinc Oral Drops", dosage: "20mg", frequency: "Once daily", duration: "14 days", janAushadhi: true },
            { name: "ORS WHO Sachet", dosage: "1 Sachet", frequency: "Sip after each loose stool", duration: "3 days", janAushadhi: true },
            { name: "Paracetamol Drops", dosage: "100mg/ml", frequency: "0.8ml SOS if temp > 100°F", duration: "3 days", janAushadhi: true },
          ]),
          rxAdvice: "Continue frequent breastfeeds. Ensure boiled-cooled water for ORS.",
          notes: "Baby active and hydrated.",
        },
        {
          userId: defaultUser.id,
          doctorId: doctorId || 1,
          hospitalId: hospitalId || 1,
          doctorName: "Dr. K. Srinivas Rao, MBBS",
          specialty: "General Physician",
          facilityName: "Primary Health Centre (PHC), Bhoothpur",
          patientName: "Rameshwar Reddy",
          patientAge: 48,
          patientGender: "Male",
          patientPhone: "+91 98492 11002",
          patientVillage: "Bhoothpur Ward 3",
          patientBloodGroup: "AB+",
          patientAbha: "91-5821-9901-3321",
          date: targetDate,
          time: "11:45 AM",
          status: "confirmed",
          type: "in-person",
          symptoms: "Fasting Blood Sugar review and knee joint pain",
          vitalsBp: "134/86 mmHg",
          vitalsPulse: 72,
          vitalsSpo2: 98,
          vitalsTemp: "98.4°F",
          triagePriority: "low",
          rxDiagnosis: "T2DM Controlled + Mild Osteoarthritis Knee",
          rxMedicines: JSON.stringify([
            { name: "Metformin 500mg", dosage: "500mg", frequency: "Twice daily after food", duration: "30 days", janAushadhi: true },
            { name: "Calcium + Vit D3", dosage: "500mg", frequency: "Once daily night", duration: "30 days", janAushadhi: true },
          ]),
          rxAdvice: "Avoid squatting on floor. Quadriceps strengthening exercises.",
          notes: "Routine quarterly refill.",
        },
      ]);
    }

    // Filter patients by requested date
    const allAppointments = await db.select().from(appointments).orderBy(appointments.time);
    if (dateStr) {
      const filtered = allAppointments.filter((a) => a.date === dateStr || a.date.includes(dateStr));
      return filtered.length > 0 ? filtered : allAppointments;
    }
    return allAppointments;
  } catch (error) {
    console.error("Error fetching doctor patients by date from PostgreSQL:", error);
    throw error;
  }
}

export async function createDoctorPatientAppointment(data: any) {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const defaultUser = await getOrCreateDbUser(`walkin_${Date.now()}`, "walkin@patient.org", data.patientName || "Walk-In Patient", "user");
    
    const [inserted] = await db
      .insert(appointments)
      .values({
        userId: defaultUser.id,
        doctorId: data.doctorId ? Number(data.doctorId) : 1,
        hospitalId: data.hospitalId ? Number(data.hospitalId) : 1,
        doctorName: data.doctorName || "Dr. K. Srinivas Rao, MBBS",
        specialty: data.specialty || "General Physician",
        facilityName: data.facilityName || "Primary Health Centre (PHC), Bhoothpur",
        patientName: data.patientName,
        patientAge: data.patientAge ? Number(data.patientAge) : 40,
        patientGender: data.patientGender || "Female",
        patientPhone: data.patientPhone || "+91 98480 00000",
        patientVillage: data.patientVillage || "Bhoothpur",
        patientBloodGroup: data.patientBloodGroup || "O+",
        patientAbha: data.patientAbha || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        date: data.date || todayStr,
        time: data.time || "12:00 PM",
        status: data.status || "confirmed",
        type: data.type || "in-person",
        symptoms: data.symptoms || "General OPD consultation",
        vitalsBp: data.vitalsBp || "120/80 mmHg",
        vitalsPulse: data.vitalsPulse ? Number(data.vitalsPulse) : 74,
        vitalsSpo2: data.vitalsSpo2 ? Number(data.vitalsSpo2) : 98,
        vitalsTemp: data.vitalsTemp || "98.6°F",
        triagePriority: data.triagePriority || "medium",
        rxDiagnosis: data.rxDiagnosis || "",
        rxMedicines: data.rxMedicines ? (typeof data.rxMedicines === "string" ? data.rxMedicines : JSON.stringify(data.rxMedicines)) : null,
        rxAdvice: data.rxAdvice || "",
        notes: data.notes || "Walk-in patient added at doctor counter.",
      })
      .returning();

    return inserted;
  } catch (error) {
    console.error("Error creating doctor patient in PostgreSQL:", error);
    throw error;
  }
}

export async function updateAppointmentDetails(appointmentId: number, data: any) {
  try {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.vitalsBp) updateData.vitalsBp = data.vitalsBp;
    if (data.vitalsPulse !== undefined) updateData.vitalsPulse = Number(data.vitalsPulse);
    if (data.vitalsSpo2 !== undefined) updateData.vitalsSpo2 = Number(data.vitalsSpo2);
    if (data.vitalsTemp) updateData.vitalsTemp = data.vitalsTemp;
    if (data.triagePriority) updateData.triagePriority = data.triagePriority;
    if (data.rxDiagnosis) updateData.rxDiagnosis = data.rxDiagnosis;
    if (data.rxMedicines !== undefined) {
      updateData.rxMedicines = typeof data.rxMedicines === "string" ? data.rxMedicines : JSON.stringify(data.rxMedicines);
    }
    if (data.rxAdvice) updateData.rxAdvice = data.rxAdvice;
    if (data.notes) updateData.notes = data.notes;

    const [updated] = await db
      .update(appointments)
      .set(updateData)
      .where(eq(appointments.id, appointmentId))
      .returning();

    return updated;
  } catch (error) {
    console.error("Error updating appointment details in PostgreSQL:", error);
    throw error;
  }
}

// 12. Health Articles Repository
export async function getHealthArticles() {
  try {
    const existing = await db.select().from(healthArticles).orderBy(desc(healthArticles.createdAt));
    if (existing.length > 0) {
      return existing;
    }

    // Seed initial health articles into PostgreSQL
    const seeded = await db
      .insert(healthArticles)
      .values([
        {
          title: "Seasonal Fever and Monsoon Health Safety Guide",
          titleTe: "వర్షాకాలంలో జ్వరాలు మరియు సీజనల్ వ్యాధుల నివారణ మార్గదర్శి",
          titleHi: "बरसात में बुखार और मौसमी बीमारियों से बचाव",
          category: "Seasonal Prevention",
          readTimeMinutes: 3,
          summary: "Essential guidelines to prevent mosquito-borne dengue, malaria and viral flu during monsoons in rural areas.",
          summaryTe: "దోమల ద్వారా వ్యాపించే డెంగ్యూ, మలేరియా వంటి వ్యాధుల నుండి రక్షణ పొందే మార్గాలు.",
          summaryHi: "मच्छरों से फैलने वाले डेंगू और मलेरिया से बचने के आसान उपाय।",
          content: "Monsoon seasons bring stagnant rainwater which breeds Aedes and Anopheles mosquitoes. Empty stored water containers weekly. Use mosquito nets. Drink only boiled and filtered water. If fever persists over 48 hours with severe body pain, visit your nearest PHC for free rapid NS1/Malarial smear tests.",
          contentTe: "నీరు నిల్వ ఉన్న ప్రదేశాలలో దోమలు వృద్ధి చెందుతాయి. కాచి చల్లార్చిన నీటిని మాత్రమే తాగండి. జ్వరం వస్తే వెంటనే సమీప పీహెచ్‌సీని సంప్రదించండి.",
          contentHi: "घर के आसपास पानी जमा न होने दें। उबला पानी पिएं। बुखार होने पर तुरंत नजदीकी सरकारी अस्पताल जाएं।",
          keyTakeaways: JSON.stringify(["Boil drinking water", "Empty stagnant water vessels", "Free checkup at PHC"]),
          tags: "fever,monsoon,phc,telangana",
        },
        {
          title: "Jan Aushadhi Generic Medicines: Same Quality, 80% Lower Price",
          titleTe: "జన్ ఔషధి జెనరిక్ మందులు: నాణ్యమైనవి మరియు 80% వరకు తక్కువ ధర",
          titleHi: "जन औषधि जेनेरिक दवाएं: 80% तक सस्ती और सुरक्षित",
          category: "Medication & Savings",
          readTimeMinutes: 2,
          summary: "Certified generic formulations have the exact same active ingredients, safety, and bioequivalence as branded medications.",
          summaryTe: "జెనరిక్ మందులు బ్రాండెడ్ మందుల లాగే పూర్తి నాణ్యతతో పనిచేస్తాయి.",
          summaryHi: "जेनेरिक दवाएं बिल्कुल सुरक्षित हैं और 50 से 90% तक सस्ती मिलती हैं।",
          content: "Under Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP), high quality unbranded generic drugs are manufactured under WHO-GMP certified standards. Whether for Diabetes (Metformin), Hypertension (Amlodipine, Telmisartan) or common infections, generic medicines provide identical clinical outcomes at a fraction of the cost.",
          contentTe: "డయాబెటిస్ మరియు బీపీ వంటి దీర్ఘకాలిక వ్యాధులకు అవసరమైన నాణ్యమైన జెనరిక్ మందులు జన్ ఔషధి కేంద్రాల్లో అందుబాటులో ఉంటాయి.",
          contentHi: "बीपी और शुगर की दवाएं जन औषधि केंद्र से लें और हर महीने पैसे बचाएं।",
          keyTakeaways: JSON.stringify(["WHO-GMP quality standards", "Identical active molecules", "Huge monthly savings for families"]),
          tags: "generic,pmbjp,savings,pharmacy",
        },
        {
          title: "Emergency 108 Ambulance Protocol & Golden Hour Response",
          titleTe: "అత్యవసర 108 అంబులెన్స్ సేవలు మరియు గోల్డెన్ అవర్ సంరక్షణ",
          titleHi: "108 एम्बुलेंस और आपातकालीन स्थिति में क्या करें",
          category: "Emergency & Safety",
          readTimeMinutes: 2,
          summary: "How to activate 108 emergency ambulance and provide first responder support during heart attacks, strokes, or trauma.",
          summaryTe: "గుండెపోటు లేదా ప్రమాదాలు జరిగినప్పుడు 108 కి కాల్ చేసి తక్షణ ప్రాథమిక చికిత్స ఎలా అందించాలి.",
          summaryHi: "दिल का दौरा या सड़क दुर्घटना में तुरंत 108 पर कॉल करें।",
          content: "In cases of severe crushing chest pain, sudden facial drooping, speech difficulty, or vehicle accidents, every minute counts. Dial 108 immediately. Keep the patient in a comfortable resting position. Do not give solid foods. Paramedic ambulances are equipped with oxygen and defibrillators.",
          contentTe: "తీవ్రమైన గుండెనొప్పి లేదా పక్షవాతం లక్షణాలు కనిపిస్తే ఆలస్యం చేయకుండా 108 కు డయల్ చేయండి.",
          contentHi: "सीने में दर्द या सांस लेने में तकलीफ होने पर तुरंत 108 बुलाएं।",
          keyTakeaways: JSON.stringify(["Toll-free 108 24x7", "Stay calm and give clear village landmark", "Keep patient seated"]),
          tags: "emergency,108,ambulance,firstaid",
        },
      ])
      .returning();

    return seeded;
  } catch (error) {
    console.error("Error fetching health articles from PostgreSQL:", error);
    throw error;
  }
}

