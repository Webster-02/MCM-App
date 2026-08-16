// MCM — Authentication & role management
// TEST_MODE is temporary for product testing. Set to false before production.

import { auth, db } from "./firebase-config.js";
import { MCM_ROLES, describeRole, getEntityFlow } from "./mcm-data.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import {
  doc, setDoc, getDoc, serverTimestamp, updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const TEST_MODE = true;
const USER_SESSION_KEY = "mcm_user";

const ROLE_PAGES = {
  [MCM_ROLES.STUDENT]: "student-dashboard.html",
  [MCM_ROLES.TEACHER]: "teacher-dashboard.html",
  [MCM_ROLES.ADMIN]: "admin-dashboard.html",
  [MCM_ROLES.SUPERADMIN]: "superadmin-dashboard.html"
};

const TEST_USERS = {
  [MCM_ROLES.STUDENT]: {
    uid: "testing-student",
    name: "Ali Raza",
    email: "student@test.local",
    universityId: "TEST-UNIVERSITY",
    departmentId: "TEST-COMPUTER-SCIENCE",
    classId: "TEST-CS-5",
    svlIds: ["TEST-SVL-101"]
  },
  [MCM_ROLES.TEACHER]: {
    uid: "testing-teacher",
    name: "Dr. Ahmed Khan",
    email: "teacher@test.local",
    universityId: "TEST-UNIVERSITY",
    departmentId: "TEST-COMPUTER-SCIENCE",
    classId: "TEST-CS-5",
    svlIds: ["TEST-SVL-101"]
  },
  [MCM_ROLES.ADMIN]: {
    uid: "testing-admin",
    name: "University Admin",
    email: "admin@test.local",
    universityId: "TEST-UNIVERSITY",
    departmentId: null,
    classId: null,
    svlIds: []
  },
  [MCM_ROLES.SUPERADMIN]: {
    uid: "testing-superadmin",
    name: "System Administrator",
    email: "superadmin@test.local",
    universityId: null,
    departmentId: null,
    classId: null,
    svlIds: []
  }
};

function testUserForRoles(allowedRoles = []) {
  const role = allowedRoles[0] || MCM_ROLES.STUDENT;
  const base = TEST_USERS[role] || TEST_USERS[MCM_ROLES.STUDENT];
  return {
    ...base,
    role,
    isActive: true,
    createdAt: null,
    permissionsDescription: describeRole(role),
    entityFlow: getEntityFlow()
  };
}

async function registerUser({ email, password, name, role, universityId = null, departmentId = null, classId = null }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  const base = {
    uid, name, email, role,
    universityId, departmentId, classId,
    profilePic: null, bio: "",
    isActive: true,
    createdAt: serverTimestamp()
  };
  const extra = role === MCM_ROLES.STUDENT
    ? { semester: 1, program: "", enrolledClasses: [], svlIds: [], studyStreak: 0, xp: 0, badges: [] }
    : role === MCM_ROLES.TEACHER
    ? { subjects: [], classes: [], svlIds: [], department: "" }
    : {};
  await setDoc(doc(db, "users", uid), { ...base, ...extra });
  return uid;
}

async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", cred.user.uid));
  if (!snap.exists()) throw new Error("User profile not found.");
  const data = snap.data();
  if (!data.isActive) throw new Error("Account disabled. Contact your administrator.");
  const userObj = { ...data, uid: cred.user.uid };
  sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(userObj));
  return userObj;
}

async function logoutUser() {
  try { await signOut(auth); } finally {
    sessionStorage.clear();
    window.location.href = "index.html";
  }
}

function getCurrentUser() {
  try {
    const existing = JSON.parse(sessionStorage.getItem(USER_SESSION_KEY));
    if (existing) return existing;
  } catch {}
  return TEST_MODE ? testUserForRoles([]) : null;
}

async function fetchUserProfile(fbUser) {
  const snap = await getDoc(doc(db, "users", fbUser.uid));
  if (!snap.exists()) throw new Error("User profile not found.");
  return { ...snap.data(), uid: fbUser.uid };
}

function requireAuth(allowedRoles = []) {
  if (TEST_MODE) {
    const u = testUserForRoles(allowedRoles);
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(u));
    return Promise.resolve(u);
  }

  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async fbUser => {
      unsub();
      if (!fbUser) {
        window.location.href = "index.html";
        reject(new Error("Not authenticated"));
        return;
      }
      try {
        const u = await fetchUserProfile(fbUser);
        if (!u.isActive) throw new Error("Account disabled.");
        if (allowedRoles.length && !allowedRoles.includes(u.role)) {
          window.location.href = ROLE_PAGES[u.role] || "index.html";
          reject(new Error("Unauthorized"));
          return;
        }
        sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(u));
        resolve(u);
      } catch (err) { reject(err); }
    });
  });
}

function redirectIfLoggedIn() {
  if (TEST_MODE) return;
  const unsub = onAuthStateChanged(auth, async fbUser => {
    unsub();
    if (!fbUser) return;
    try {
      const u = await fetchUserProfile(fbUser);
      window.location.href = ROLE_PAGES[u.role] || "index.html";
    } catch (error) { console.warn("Login redirect failed", error); }
  });
}

async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  requireAuth,
  redirectIfLoggedIn,
  resetPassword,
  ROLE_PAGES,
  TEST_MODE
};
