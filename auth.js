import { auth, db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { describeRole, getEntityFlow } from './mcm-data.js';

export const TEST_MODE = true;

export const ROLE_PAGES = {
  student: 'student-dashboard.html',
  admin: 'class-management.html',
  svl: 'svl-dashboard.html'
};

export const TEST_USERS = {
  student: { uid:'TEST-STUDENT-001', role:'student', name:'Ali Raza', email:'student@test.local', classId:'TEST-CS-5', className:'BSCS 5A' },
  admin: { uid:'TEST-ADMIN-001', role:'admin', name:'University Admin', email:'admin@test.local', universityId:'TEST-UNI-001', universityName:'MCM University' },
  svl: { uid:'TEST-SVL-101', role:'svl', name:'Class Representative', email:'svl@test.local', classId:'TEST-CS-5', className:'BSCS 5A', svlId:'TEST-SVL-101' }
};

const SESSION_KEY = 'mcm_test_user';

export function getStoredUser(){
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}

export function setStoredUser(user){ localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }

export function clearStoredUser(){ localStorage.removeItem(SESSION_KEY); }

export function redirectForRole(role){
  const page = ROLE_PAGES[role];
  if(page) window.location.href = page;
}

export async function requireAuth(allowedRoles = []){
  if(TEST_MODE){
    const role = allowedRoles[0];
    if(!role || !TEST_USERS[role]) throw new Error('No test role configured for this page.');
    const user = TEST_USERS[role];
    setStoredUser(user);
    return user;
  }

  const firebaseUser = auth.currentUser;
  if(!firebaseUser){ window.location.href = 'login.html'; return null; }
  const snap = await getDoc(doc(db,'users',firebaseUser.uid));
  if(!snap.exists()) throw new Error('User profile not found.');
  const profile = { uid:firebaseUser.uid, ...snap.data() };
  if(allowedRoles.length && !allowedRoles.includes(profile.role)){
    redirectForRole(profile.role);
    return null;
  }
  setStoredUser(profile);
  return profile;
}

export async function signOut(){
  clearStoredUser();
  if(!TEST_MODE) await auth.signOut();
  window.location.href = 'index.html';
}

export { describeRole, getEntityFlow };
