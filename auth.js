import { auth, db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { describeRole, getEntityFlow } from './mcm-data.js';

// Keep demo mode enabled until Firebase login is connected in the UI.
export const TEST_MODE = true;
export const SESSION_KEY = 'mcm_test_user';

export const ROLE_PAGES = Object.freeze({
  student: 'student-dashboard.html',
  admin: 'class-management.html',
  svl: 'svl-dashboard.html'
});

export const TEST_USERS = Object.freeze({
  student: { uid: 'TEST-STUDENT-001', role: 'student', name: 'Ali Raza', email: 'student@test.local', classId: 'TEST-CS-5', className: 'BSCS 5A' },
  admin: { uid: 'TEST-ADMIN-001', role: 'admin', name: 'University Admin', email: 'admin@test.local', universityId: 'TEST-UNI-001', universityName: 'MCM University' },
  svl: { uid: 'TEST-SVL-101', role: 'svl', name: 'Class Representative', email: 'svl@test.local', classId: 'TEST-CS-5', className: 'BSCS 5A', svlId: 'TEST-SVL-101' }
});

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    clearStoredUser();
    return null;
  }
}

export function setStoredUser(user) {
  if (!user || typeof user !== 'object') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  return getStoredUser();
}

export function redirectForRole(role) {
  const page = ROLE_PAGES[role];
  if (page && window.location.pathname.endsWith(page) === false) {
    window.location.assign(page);
  }
}

function normalizeProfile(uid, data = {}) {
  return { uid, ...data, role: String(data.role || '').toLowerCase().trim() };
}

export async function requireAuth(allowedRoles = []) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (TEST_MODE) {
    const role = roles[0];
    if (!role || !TEST_USERS[role]) throw new Error('No test role configured for this page.');
    const user = { ...TEST_USERS[role] };
    setStoredUser(user);
    return user;
  }

  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    window.location.assign('login.html');
    return null;
  }

  const profileSnapshot = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (!profileSnapshot.exists()) throw new Error('User profile not found.');

  const profile = normalizeProfile(firebaseUser.uid, profileSnapshot.data());
  if (roles.length && !roles.includes(profile.role)) {
    redirectForRole(profile.role);
    return null;
  }

  setStoredUser(profile);
  return profile;
}

export async function signOut() {
  clearStoredUser();
  if (!TEST_MODE && auth.currentUser) await auth.signOut();
  window.location.assign('index.html');
}

export { describeRole, getEntityFlow };
