// Simple localStorage-backed admin service: clinics + activity log
import { clinics as clinicsSeed } from '../data/clinics';

const CLINICS_KEY = 'clinics_v1';
const ACTIVITIES_KEY = 'admin_activities_v1';

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export const adminService = {
  getClinics() {
    let list = read(CLINICS_KEY);
    if (!list) {
      // seed with dataset from src/data/clinics.js
      list = (Array.isArray(clinicsSeed) ? clinicsSeed : []).map((c, i) => ({ ...c, id: c.id ?? `seed-${i}` }));
      write(CLINICS_KEY, list);
    }
    return list;
  },

  saveClinics(list) {
    write(CLINICS_KEY, list);
    return list;
  },

  addClinic(attrs) {
    const list = this.getClinics();
    const id = 'c_' + Date.now();
    const newClinic = { id, ...attrs };
    list.unshift(newClinic);
    this.saveClinics(list);
    return newClinic;
  },

  updateClinic(updated) {
    const list = this.getClinics().map((c) => (c.id === updated.id ? { ...c, ...updated } : c));
    this.saveClinics(list);
    return updated;
  },

  deleteClinic(id) {
    const list = this.getClinics().filter((c) => c.id !== id);
    this.saveClinics(list);
    return list;
  },

  logActivity(action, details = {}) {
    const activities = read(ACTIVITIES_KEY) || [];
    const entry = { action, details, timestamp: Date.now() };
    activities.unshift(entry);
    write(ACTIVITIES_KEY, activities);
    return entry;
  },

  getActivities() {
    return read(ACTIVITIES_KEY) || [];
  },
};