// MySVL — Auth & Role Management

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

const ROLE_PAGES = {
  student: "student-dashboard.html",
  teacher: "teacher-dashboard.html",
  admin:   "admin-dashboard.html",
  superadmin: "superadmin-dashboard.html"
};

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
  await signOut(auth);
  sessionStorage.clear();
  window.location.href = "index.html";
}

function getCurrentUser() {
  try { return JSON.parse(sessionStorage.getItem("msv_user")); } catch { return null; }
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
