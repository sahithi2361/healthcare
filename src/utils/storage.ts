import {
  UserProfile,
  HealthcareFacility,
  HealthArticle,
  Medication,
  Appointment,
  HealthDocument,
  Caregiver,
  HealthAccessScoreData,
  CommunityHealthRegion,
  NotificationItem,
  MedicationLog,
  AuthAccount,
  Doctor,
} from "../types";
import {
  INITIAL_USER_PROFILE,
  INITIAL_FACILITIES,
  INITIAL_HEALTH_ARTICLES,
  INITIAL_MEDICATIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_DOCUMENTS,
  INITIAL_CAREGIVERS,
  INITIAL_HEALTH_ACCESS_SCORE,
  INITIAL_COMMUNITY_REGIONS,
  INITIAL_NOTIFICATIONS,
  PRESET_ACCOUNTS,
} from "../data/initialData";

const STORAGE_KEYS = {
  PROFILE: "sehat_saathi_profile_v1",
  FACILITIES: "sehat_saathi_facilities_v1",
  ARTICLES: "sehat_saathi_articles_v1",
  MEDICATIONS: "sehat_saathi_medications_v1",
  MED_LOGS: "sehat_saathi_med_logs_v1",
  APPOINTMENTS: "sehat_saathi_appointments_v1",
  DOCUMENTS: "sehat_saathi_documents_v1",
  CAREGIVERS: "sehat_saathi_caregivers_v1",
  ACCESS_SCORE: "sehat_saathi_access_score_v1",
  COMMUNITY_DATA: "sehat_saathi_community_v1",
  NOTIFICATIONS: "sehat_saathi_notifications_v1",
  DOCTORS: "sehat_saathi_doctors_v1",
  OFFLINE_SIMULATION: "sehat_saathi_offline_sim_v1",
  LAST_SYNC: "sehat_saathi_last_sync_v1",
  CURRENT_ACCOUNT: "sehat_saathi_account_v1",
  ALL_ACCOUNTS: "sehat_saathi_all_accounts_v1",
  IS_LOGGED_IN: "sehat_saathi_is_logged_in_v1",
};

export const StorageManager = {
  // Initialize and seed data if not present
  initialize: () => {
    if (typeof window === "undefined") return;

    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_USER_PROFILE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FACILITIES)) {
      localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(INITIAL_FACILITIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ARTICLES)) {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(INITIAL_HEALTH_ARTICLES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(INITIAL_MEDICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CAREGIVERS)) {
      localStorage.setItem(STORAGE_KEYS.CAREGIVERS, JSON.stringify(INITIAL_CAREGIVERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACCESS_SCORE)) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_SCORE, JSON.stringify(INITIAL_HEALTH_ACCESS_SCORE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMUNITY_DATA)) {
      localStorage.setItem(STORAGE_KEYS.COMMUNITY_DATA, JSON.stringify(INITIAL_COMMUNITY_REGIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LAST_SYNC)) {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    }
  },

  // Reset to default sample data
  resetAll: () => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_USER_PROFILE));
    localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(INITIAL_FACILITIES));
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(INITIAL_HEALTH_ARTICLES));
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(INITIAL_MEDICATIONS));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
    localStorage.setItem(STORAGE_KEYS.CAREGIVERS, JSON.stringify(INITIAL_CAREGIVERS));
    localStorage.setItem(STORAGE_KEYS.ACCESS_SCORE, JSON.stringify(INITIAL_HEALTH_ACCESS_SCORE));
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_DATA, JSON.stringify(INITIAL_COMMUNITY_REGIONS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    localStorage.removeItem(STORAGE_KEYS.MED_LOGS);
  },

  // Profile
  getProfile: (): UserProfile => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return raw ? JSON.parse(raw) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  },
  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  // Medications
  getMedications: (): Medication[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
      return raw ? JSON.parse(raw) : INITIAL_MEDICATIONS;
    } catch {
      return INITIAL_MEDICATIONS;
    }
  },
  saveMedications: (meds: Medication[]) => {
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(meds));
  },
  addMedication: (med: Medication) => {
    const list = StorageManager.getMedications();
    list.unshift(med);
    StorageManager.saveMedications(list);
    return list;
  },

  // Medication Logs
  getMedLogs: (): MedicationLog[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MED_LOGS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  recordMedLog: (log: MedicationLog) => {
    const logs = StorageManager.getMedLogs();
    logs.unshift(log);
    localStorage.setItem(STORAGE_KEYS.MED_LOGS, JSON.stringify(logs));
    return logs;
  },

  // Appointments
  getAppointments: (): Appointment[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return raw ? JSON.parse(raw) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  },
  saveAppointments: (apts: Appointment[]) => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(apts));
  },
  addAppointment: (apt: Appointment) => {
    const list = StorageManager.getAppointments();
    list.unshift(apt);
    StorageManager.saveAppointments(list);
    return list;
  },

  // Documents
  getDocuments: (): HealthDocument[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return raw ? JSON.parse(raw) : INITIAL_DOCUMENTS;
    } catch {
      return INITIAL_DOCUMENTS;
    }
  },
  saveDocuments: (docs: HealthDocument[]) => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  },
  addDocument: (doc: HealthDocument) => {
    const list = StorageManager.getDocuments();
    list.unshift(doc);
    StorageManager.saveDocuments(list);
    return list;
  },

  // Facilities
  getFacilities: (): HealthcareFacility[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FACILITIES);
      return raw ? JSON.parse(raw) : INITIAL_FACILITIES;
    } catch {
      return INITIAL_FACILITIES;
    }
  },
  saveFacilities: (facilities: HealthcareFacility[]) => {
    localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(facilities));
  },

  // Articles
  getArticles: (): HealthArticle[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      return raw ? JSON.parse(raw) : INITIAL_HEALTH_ARTICLES;
    } catch {
      return INITIAL_HEALTH_ARTICLES;
    }
  },

  // Caregivers
  getCaregivers: (): Caregiver[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CAREGIVERS);
      return raw ? JSON.parse(raw) : INITIAL_CAREGIVERS;
    } catch {
      return INITIAL_CAREGIVERS;
    }
  },
  saveCaregivers: (caregivers: Caregiver[]) => {
    localStorage.setItem(STORAGE_KEYS.CAREGIVERS, JSON.stringify(caregivers));
  },
  addCaregiver: (caregiver: Caregiver) => {
    const list = StorageManager.getCaregivers();
    list.unshift(caregiver);
    StorageManager.saveCaregivers(list);
    return list;
  },

  // Access Score
  getAccessScore: (): HealthAccessScoreData => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACCESS_SCORE);
      return raw ? JSON.parse(raw) : INITIAL_HEALTH_ACCESS_SCORE;
    } catch {
      return INITIAL_HEALTH_ACCESS_SCORE;
    }
  },
  saveAccessScore: (data: HealthAccessScoreData) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_SCORE, JSON.stringify(data));
  },

  // Community Health Data
  getCommunityRegions: (): CommunityHealthRegion[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.COMMUNITY_DATA);
      return raw ? JSON.parse(raw) : INITIAL_COMMUNITY_REGIONS;
    } catch {
      return INITIAL_COMMUNITY_REGIONS;
    }
  },

  // Doctors
  getDoctors: (): Doctor[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DOCTORS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  saveDoctors: (doctors: Doctor[]) => {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
  },

  // Notifications
  getNotifications: (): NotificationItem[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },
  addNotification: (item: NotificationItem) => {
    const list = StorageManager.getNotifications();
    list.unshift(item);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    return list;
  },
  markNotificationRead: (id: string) => {
    const list = StorageManager.getNotifications().map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    return list;
  },

  // Offline Simulation State
  isSimulatedOffline: (): boolean => {
    try {
      return localStorage.getItem(STORAGE_KEYS.OFFLINE_SIMULATION) === "true";
    } catch {
      return false;
    }
  },
  setSimulatedOffline: (val: boolean) => {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_SIMULATION, val ? "true" : "false");
  },

  // Last Sync Timestamp
  getLastSyncTime: (): string => {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || new Date().toISOString();
  },
  touchSync: () => {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  },

  // Auth Accounts
  getAccount: (): AuthAccount => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_ACCOUNT);
      return raw ? JSON.parse(raw) : PRESET_ACCOUNTS[0];
    } catch {
      return PRESET_ACCOUNTS[0];
    }
  },
  saveAccount: (account: AuthAccount) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ACCOUNT, JSON.stringify(account));
  },
  getAllAccounts: (): AuthAccount[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ALL_ACCOUNTS);
      return raw ? JSON.parse(raw) : PRESET_ACCOUNTS;
    } catch {
      return PRESET_ACCOUNTS;
    }
  },
  saveAllAccounts: (accounts: AuthAccount[]) => {
    localStorage.setItem(STORAGE_KEYS.ALL_ACCOUNTS, JSON.stringify(accounts));
  },
  registerOrUpdateAccount: (acc: AuthAccount) => {
    const all = StorageManager.getAllAccounts();
    const idx = all.findIndex((a) => a.id === acc.id || a.email === acc.email || a.phone === acc.phone);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...acc };
    } else {
      all.push(acc);
    }
    StorageManager.saveAllAccounts(all);
    StorageManager.saveAccount(acc);
    return acc;
  },
  isAuthenticated: (): boolean => {
    try {
      return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === "true";
    } catch {
      return false;
    }
  },
  setAuthenticated: (status: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, status ? "true" : "false");
    } catch {
      // ignore
    }
  },
  logout: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    } catch {
      // ignore
    }
  },
};
