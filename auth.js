// MySVL — Auth & Role Management
// NOTE: Authentication is temporarily bypassed for application testing.

import { auth, db } from "./firebase-config.js";
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

// Testing mode: dashboard pages can be opened directly without Firebase login.
// Set to false later to restore normal authentication guards.
const TEST_MODE = true;

const ROLE_PAGES = {
  student: "student-dashboard.html",
  teacher: "teacher-dashboard.html",
  admin:   "admin-dashboard.html",
  superadmin: "superadmin-dashboard.html"
};

function testUserForRoles(allowedRoles = []) {
  const role = allowedRoles[0] || "student";
  const names = {
    student: "Ali Raza",
    teacher: "Dr. Ahmed Khan",
    admin: "University Admin",
    superadmin: "System Administrator"
  };
  const emails = {
    student: "student@test.local",
    teacher: "teacher@test.local",
    admin: "admin@test.local",
    superadmin: "superadmin@test.local"
  };

  return {
    uid: `testing-${role}`,
    name: names[role] || "Test User",
    email: emails[role] || "test@test.local",
    role,
    isActive: true,
    universityId: "TEST-UNIVERSITY",
    departmentId: "TEST-DEPARTMENT",
    classId: "TEST-CLASS"
  };
}

async function registerUser({ email, password, name, role, universityId = null, departmentId = null, classId = null }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid  = cred.user.uid;
  const base = {
    uid, name, email, role,
    universityId, departmentId, classId,
    profilePic: null, bio: "",
    isActive: true,
    createdAt: serverTimestamp()
  };
  const extra = role === "student"
    ? { semester: 1, program: "", enrolledClasses: [], studyStreak: 0, xp: 0, badges: [] }
    : role === "teacher"
    ? { subjects: [], classes: [], department: "" }
    : {};
  try {
    await setDoc(doc(db, "users", uid), { ...base, ...extra });
  } catch (error) {
    console.warn("Firestore write blocked — continuing with auth-only user for testing.", error);
  }
  return uid;
}

async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  let data = null;
  try {
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (snap.exists()) {
      data = snap.data();
      if (!data.isActive) throw new Error("Account disabled. Contact admin.");
      try {
        await updateDoc(doc(db, "users", cred.user.uid), { lastLogin: serverTimestamp() });
      } catch (updateError) {
        console.warn("Firestore update blocked — continuing with auth-only user.", updateError);
      }
    }
  } catch (readError) {
    console.warn("Firestore read blocked — using auth fallback user for testing.", readError);
  }

  if (!data) {
    data = {
      name: cred.user.displayName || email.split('@')[0],
      email,
      role: 'student',
      isActive: true
    };
  }

  const userObj = { ...data, uid: cred.user.uid };
  sessionStorage.setItem("msv_user", JSON.stringify(userObj));
  return userObj;
}

async function logoutUser() {
  try {
    await signOut(auth);
  } finally {
    sessionStorage.clear();
    window.location.href = "index.html";
  }
}

function getCurrentUser() {
  try {
    const existing = JSON.parse(sessionStorage.getItem("msv_user"));
    if (existing) return existing;
  } catch {}

  return TEST_MODE ? testUserForRoles([]) : null;
}

async function fetchUserProfile(fbUser) {
  let u = getCurrentUser();
  if (u && u.uid === fbUser.uid) return u;

  let snap = null;
  try {
    snap = await getDoc(doc(db, "users", fbUser.uid));
  } catch (readError) {
    console.warn("Firestore read blocked — using auth fallback user for testing.", readError);
  }

  if (snap && snap.exists()) {
    u = { ...snap.data(), uid: fbUser.uid };
  } else {
    u = {
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
      email: fbUser.email || '',
      role: 'student',
      isActive: true,
      uid: fbUser.uid
    };
  }

  u.role = u.role || 'student';
  sessionStorage.setItem("msv_user", JSON.stringify(u));
  return u;
}

function requireAuth(allowedRoles = []) {
  // TEST MODE: never redirect to index.html. Give each dashboard a matching
  // local test user based on the role(s) requested by the page.
  if (TEST_MODE) {
    const u = testUserForRoles(allowedRoles);
    sessionStorage.setItem("msv_user", JSON.stringify(u));
    return Promise.resolve(u);
  }

  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      unsub();
      if (!fbUser) {
        window.location.href = "index.html";
        reject(new Error("Not authenticated"));
        return;
      }

      try {
        const u = await fetchUserProfile(fbUser);
        if (!u.isActive) throw new Error("Account disabled. Contact admin.");

        if (allowedRoles.length && !allowedRoles.includes(u.role)) {
          window.location.href = ROLE_PAGES[u.role] || "index.html";
          reject(new Error("Unauthorized"));
          return;
        }
        resolve(u);
      } catch (err) {
        reject(err);
      }
    });
  });
}

function redirectIfLoggedIn() {
  // Login is bypassed while testing, so this intentionally does nothing.
  if (TEST_MODE) return;

  const unsub = onAuthStateChanged(auth, async (fbUser) => {
    unsub();
    if (!fbUser) return;

    try {
      const u = await fetchUserProfile(fbUser);
      window.location.href = ROLE_PAGES[u.role] || "index.html";
    } catch (readError) {
      console.warn("Firestore read blocked — redirecting using auth fallback role.", readError);
      window.location.href = ROLE_PAGES.student;
    }
  });
}

async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export { registerUser, loginUser, logoutUser, getCurrentUser, requireAuth, redirectIfLoggedIn, resetPassword, ROLE_PAGES };
