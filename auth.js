import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { describeRole, getEntityFlow } from './mcm-data.js';

export const TEST_MODE = true;
export const SESSION_KEY = 'mcm_test_user';

export const ROLE_PAGES = Object.freeze({ student: 'student-dashboard.html', admin: 'class-management.html', svl: 'svl-dashboard.html' });
export const TEST_USERS = Object.freeze({
  student: { uid: 'TEST-STUDENT-001', role: 'student', name: 'Ali Raza', email: 'student@test.local', classId: 'TEST-CS-5', className: 'BSCS 5A' },
  admin: { uid: 'TEST-ADMIN-001', role: 'admin', name: 'University Admin', email: 'admin@test.local', universityId: 'TEST-UNI-001', universityName: 'MCM University' },
  svl: { uid: 'TEST-SVL-101', role: 'svl', name: 'Class Representative', email: 'svl@test.local', classId: 'TEST-CS-5', className: 'BSCS 5A', svlId: 'TEST-SVL-101' }
});

export function getStoredUser() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { clearStoredUser(); return null; } }
export function setStoredUser(user) { if (user && typeof user === 'object') localStorage.setItem(SESSION_KEY, JSON.stringify(user)); return user; }
export function clearStoredUser() { localStorage.removeItem(SESSION_KEY); }
export function getCurrentUser() { return getStoredUser(); }
export function redirectForRole(role) { const page = ROLE_PAGES[String(role || '').toLowerCase().trim()]; if (page && !window.location.pathname.endsWith(page)) window.location.assign(page); }
export function redirectIfLoggedIn() { const user = getCurrentUser(); if (user?.role) redirectForRole(user.role); return user; }
function normalizeProfile(uid, data = {}) { return { uid, ...data, role: String(data.role || '').toLowerCase().trim() }; }
async function firebaseProfile(user) { const snapshot = await getDoc(doc(db, 'users', user.uid)); return snapshot.exists() ? normalizeProfile(user.uid, snapshot.data()) : null; }

export async function requireAuth(allowedRoles = []) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (TEST_MODE) {
    const stored = getStoredUser();
    if (stored?.role && roles.length && !roles.includes(stored.role)) {
      redirectForRole(stored.role);
      return null;
    }
    const role = stored?.role || roles[0];
    if (!role || !TEST_USERS[role]) throw new Error('No test role configured for this page.');
    return setStoredUser({ ...TEST_USERS[role] });
  }
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) { window.location.assign('login.html'); return null; }
  const profile = await firebaseProfile(firebaseUser);
  if (!profile) throw new Error('User profile not found.');
  if (roles.length && !roles.includes(profile.role)) { redirectForRole(profile.role); return null; }
  return setStoredUser(profile);
}

export async function loginUser(email, password, role = '') {
  if (TEST_MODE) { const selected = TEST_USERS[role] || Object.values(TEST_USERS).find(user => user.email === String(email || '').trim()); if (!selected) throw new Error('Select a valid demo role.'); return setStoredUser({ ...selected }); }
  const credential = await signInWithEmailAndPassword(auth, String(email).trim(), password);
  const profile = await firebaseProfile(credential.user);
  if (!profile) throw new Error('User profile not found.');
  return setStoredUser(profile);
}

export async function registerUser(email, password, profile = {}) {
  if (TEST_MODE) throw new Error('Registration is disabled in demo mode.');
  const credential = await createUserWithEmailAndPassword(auth, String(email).trim(), password);
  const newProfile = normalizeProfile(credential.user.uid, { ...profile, email: credential.user.email });
  await setDoc(doc(db, 'users', credential.user.uid), newProfile);
  return setStoredUser(newProfile);
}
export async function resetPassword(email) { if (TEST_MODE) return true; return sendPasswordResetEmail(auth, String(email).trim()); }
export async function logoutUser() { return signOut(); }
export async function signOut() { clearStoredUser(); if (!TEST_MODE && auth.currentUser) await auth.signOut(); window.location.assign('index.html'); }
export { describeRole, getEntityFlow };
