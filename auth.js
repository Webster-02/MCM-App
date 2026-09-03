// MCM — Authentication & role management
// TEST_MODE is temporary for product testing. Set to false before production.

import { auth, db } from "./firebase-config.js";
import { describeRole, getEntityFlow } from "./mcm-data.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const TEST_MODE = true;
const USER_SESSION_KEY = "mcm_user";

const ROLE_PAGES = {
  student: "student-dashboard.html",
  teacher: "teacher-dashboard.html",
  admin: "admin-dashboard.html",
  superadmin: "superadmin-dashboard.html",
  svl: "svl-dashboard.html"
};

const TEST_USERS = {
  student: { uid:"testing-student", name:"Ali Raza", email:"student@test.local", role:"student", universityId:"TEST-UNIVERSITY", classId:"TEST-CS-5", svlIds:["TEST-SVL-101"] },
  teacher: { uid:"testing-teacher", name:"Dr. Ahmed Khan", email:"teacher@test.local", role:"teacher", universityId:"TEST-UNIVERSITY", classId:"TEST-CS-5", svlIds:["TEST-SVL-101"] },
  admin: { uid:"testing-admin", name:"University Admin", email:"admin@test.local", role:"admin", universityId:"TEST-UNIVERSITY" },
  superadmin: { uid:"testing-superadmin", name:"System Administrator", email:"superadmin@test.local", role:"superadmin" },
  svl: { uid:"testing-svl", name:"Class Representative", email:"svl@test.local", role:"svl", universityId:"TEST-UNIVERSITY", classId:"TEST-CS-5", className:"BSCS 5A", svlId:"TEST-SVL-101" }
};

function testUserForRoles(allowedRoles = []) {
  // IMPORTANT: every dashboard must receive only its own role.
  // Never fall back to the student user when a page asks for another role.
  const role = allowedRoles.length === 1 ? allowedRoles[0] : (allowedRoles[0] || "student");
  const base = TEST_USERS[role];
  if (!base) throw new Error(`Unknown MCM role: ${role}`);
  return { ...base, role, isActive:true, createdAt:null, permissionsDescription:describeRole(role), entityFlow:getEntityFlow() };
}

function loadThemeSystem() {
  if (window.__mcmThemeLoading || window.MCMTheme) {
    window.MCMTheme?.init?.();
    return;
  }
  window.__mcmThemeLoading = true;
  const script = document.createElement("script");
  script.src = "./mcm-theme.js?v=20260819";
  script.async = false;
  script.onload = () => window.MCMTheme?.init?.();
  script.onerror = () => console.warn("MCM theme system could not be loaded.");
  document.head.appendChild(script);
}

async function registerUser({ email, password, name, role, universityId=null, departmentId=null, classId=null }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db,"users",cred.user.uid), { uid:cred.user.uid,name,email,role,universityId,departmentId,classId,isActive:true,createdAt:serverTimestamp() });
  return cred.user.uid;
}

async function loginUser(email,password) {
  const cred = await signInWithEmailAndPassword(auth,email,password);
  const snap = await getDoc(doc(db,"users",cred.user.uid));
  if (!snap.exists()) throw new Error("User profile not found.");
  const data = snap.data();
  if (!data.isActive) throw new Error("Account disabled. Contact your administrator.");
  const userObj={...data,uid:cred.user.uid};
  sessionStorage.setItem(USER_SESSION_KEY,JSON.stringify(userObj));
  return userObj;
}

async function logoutUser(){ try{await signOut(auth);}finally{sessionStorage.clear();window.location.href="index.html";} }
function getCurrentUser(){ try{return JSON.parse(sessionStorage.getItem(USER_SESSION_KEY)) || (TEST_MODE?testUserForRoles([]):null);}catch{return TEST_MODE?testUserForRoles([]):null;} }
async function fetchUserProfile(fbUser){ const snap=await getDoc(doc(db,"users",fbUser.uid)); if(!snap.exists()) throw new Error("User profile not found."); return {...snap.data(),uid:fbUser.uid}; }
function requireAuth(allowedRoles=[]){
  if(TEST_MODE){
    const u=testUserForRoles(allowedRoles);
    sessionStorage.setItem(USER_SESSION_KEY,JSON.stringify(u));
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",loadThemeSystem,{once:true});
    else loadThemeSystem();
    return Promise.resolve(u);
  }
  return new Promise((resolve,reject)=>{ const unsub=onAuthStateChanged(auth,async fbUser=>{ unsub(); if(!fbUser){window.location.href="index.html";reject(new Error("Not authenticated"));return;} try{const u=await fetchUserProfile(fbUser);if(!u.isActive)throw new Error("Account disabled.");if(allowedRoles.length&&!allowedRoles.includes(u.role)){window.location.href=ROLE_PAGES[u.role]||"index.html";reject(new Error("Unauthorized"));return;}sessionStorage.setItem(USER_SESSION_KEY,JSON.stringify(u));loadThemeSystem();resolve(u);}catch(err){reject(err);} }); });
}
function redirectIfLoggedIn(){ if(TEST_MODE)return; const unsub=onAuthStateChanged(auth,async fbUser=>{unsub();if(!fbUser)return;try{const u=await fetchUserProfile(fbUser);window.location.href=ROLE_PAGES[u.role]||"index.html";}catch(error){console.warn("Login redirect failed",error);}}); }
async function resetPassword(email){await sendPasswordResetEmail(auth,email);}

export {registerUser,loginUser,getCurrentUser,requireAuth,redirectIfLoggedIn,resetPassword,logoutUser,ROLE_PAGES,TEST_MODE};
