// MCM — Data model, permissions, and Firebase data helpers
// This is the single place that defines how platform entities relate.

import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

export const MCM_ROLES = Object.freeze({
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student"
});

// Business hierarchy:
// Platform → University → Department → Program → Class → SVL → Content/Activity
// Users are attached to the appropriate scope through universityId, departmentId,
// and (when relevant) classId / svlIds.
export const MCM_COLLECTIONS = Object.freeze({
  universities: "universities",
  departments: "departments",
  programs: "programs",
  users: "users",
  classes: "classes",
  svls: "svls",
  enrollments: "enrollments",
  slides: "slides",
  quizzes: "quizzes",
  assignments: "assignments",
  attendance: "attendance",
  grades: "grades",
  announcements: "announcements",
  notifications: "notifications",
  auditLogs: "auditLogs",
  plans: "plans"
});

export const MCM_PERMISSIONS = Object.freeze({
  superadmin: [
    "universities:create", "universities:read", "universities:update", "universities:delete",
    "admins:create", "admins:read", "admins:update", "admins:delete",
    "plans:manage", "platform:analytics", "platform:audit"
  ],
  admin: [
    "departments:create", "departments:read", "departments:update", "departments:delete",
    "programs:create", "programs:read", "programs:update", "programs:delete",
    "faculty:create", "faculty:read", "faculty:update", "faculty:delete",
    "students:create", "students:read", "students:update", "students:delete",
    "classes:create", "classes:read", "classes:update", "classes:delete",
    "svls:create", "svls:read", "svls:update", "svls:delete",
    "announcements:create", "reports:read"
  ],
  teacher: [
    "svls:read", "svls:manage_own",
    "slides:create", "slides:read", "slides:update", "slides:delete",
    "quizzes:create", "quizzes:read", "quizzes:update", "quizzes:delete",
    "assignments:create", "assignments:read", "assignments:update", "assignments:delete",
    "attendance:manage_own", "grades:manage_own",
    "students:read_own", "announcements:create"
  ],
  student: [
    "svls:read_enrolled",
    "slides:read_enrolled",
    "quizzes:read_enrolled",
    "assignments:read_enrolled",
    "attendance:read_own",
    "grades:read_own",
    "announcements:read"
  ]
});

export function hasPermission(user, permission) {
  if (!user?.role) return false;
  return Boolean(MCM_PERMISSIONS[user.role]?.includes(permission));
}

export function requirePermission(user, permission) {
  if (!hasPermission(user, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
  return true;
}

export function getScopeForUser(user = {}) {
  return {
    universityId: user.universityId || null,
    departmentId: user.departmentId || null,
    classId: user.classId || null,
    uid: user.uid || null
  };
}

export function normaliseEntity(entity = {}) {
  const clean = { ...entity };
  Object.keys(clean).forEach(key => {
    if (clean[key] === undefined) delete clean[key];
  });
  return clean;
}

async function addEntity(user, collectionName, data, permission) {
  requirePermission(user, permission);
  const payload = normaliseEntity({
    ...data,
    createdAt: serverTimestamp(),
    createdBy: user.uid || null,
    universityId: data.universityId ?? user.universityId ?? null
  });
  const ref = await addDoc(collection(db, collectionName), payload);
  return ref.id;
}

async function updateEntity(user, collectionName, id, data, permission) {
  requirePermission(user, permission);
  await updateDoc(doc(db, collectionName, id), normaliseEntity({
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: user.uid || null
  }));
  return id;
}

async function deleteEntity(user, collectionName, id, permission) {
  requirePermission(user, permission);
  await deleteDoc(doc(db, collectionName, id));
  return id;
}

export async function createUniversity(user, data) {
  return addEntity(user, MCM_COLLECTIONS.universities, data, "universities:create");
}

export async function createDepartment(user, universityId, data) {
  requirePermission(user, "departments:create");
  return addEntity(user, MCM_COLLECTIONS.departments, { ...data, universityId }, "departments:create");
}

export async function createProgram(user, universityId, departmentId, data) {
  requirePermission(user, "programs:create");
  return addEntity(user, MCM_COLLECTIONS.programs, { ...data, universityId, departmentId }, "programs:create");
}

export async function createFaculty(user, universityId, departmentId, data) {
  requirePermission(user, "faculty:create");
  return addEntity(user, MCM_COLLECTIONS.users, {
    ...data,
    universityId,
    departmentId,
    role: MCM_ROLES.TEACHER,
    isActive: data.isActive ?? true
  }, "faculty:create");
}

export async function createStudent(user, universityId, departmentId, data) {
  requirePermission(user, "students:create");
  return addEntity(user, MCM_COLLECTIONS.users, {
    ...data,
    universityId,
    departmentId,
    role: MCM_ROLES.STUDENT,
    enrolledClasses: data.enrolledClasses || [],
    isActive: data.isActive ?? true
  }, "students:create");
}

export async function createClass(user, universityId, departmentId, data) {
  requirePermission(user, "classes:create");
  return addEntity(user, MCM_COLLECTIONS.classes, {
    ...data,
    universityId,
    departmentId,
    teacherIds: data.teacherIds || [],
    studentIds: data.studentIds || []
  }, "classes:create");
}

export async function createSVL(user, universityId, classId, data) {
  requirePermission(user, "svls:create");
  return addEntity(user, MCM_COLLECTIONS.svls, {
    ...data,
    universityId,
    classId,
    teacherId: data.teacherId || user.uid,
    status: data.status || "active"
  }, "svls:create");
}

export async function enrollStudent(user, enrollment) {
  requirePermission(user, "students:update");
  return addEntity(user, MCM_COLLECTIONS.enrollments, enrollment, "students:update");
}

export async function createSlide(user, data) {
  return addEntity(user, MCM_COLLECTIONS.slides, data, "slides:create");
}

export async function createQuiz(user, data) {
  return addEntity(user, MCM_COLLECTIONS.quizzes, data, "quizzes:create");
}

export async function createAssignment(user, data) {
  return addEntity(user, MCM_COLLECTIONS.assignments, data, "assignments:create");
}

export async function updateEntityByRole(user, collectionName, id, data) {
  const permissionMap = {
    universities: "universities:update",
    departments: "departments:update",
    programs: "programs:update",
    classes: "classes:update",
    svls: "svls:update",
    slides: "slides:update",
    quizzes: "quizzes:update",
    assignments: "assignments:update",
    users: user?.role === MCM_ROLES.ADMIN ? "students:update" : "faculty:update"
  };
  const permission = permissionMap[collectionName];
  if (!permission) throw new Error(`No update policy for ${collectionName}`);
  return updateEntity(user, collectionName, id, data, permission);
}

export async function deleteEntityByRole(user, collectionName, id) {
  const permissionMap = {
    universities: "universities:delete",
    departments: "departments:delete",
    programs: "programs:delete",
    classes: "classes:delete",
    svls: "svls:delete",
    slides: "slides:delete",
    quizzes: "quizzes:delete",
    assignments: "assignments:delete"
  };
  const permission = permissionMap[collectionName];
  if (!permission) throw new Error(`No delete policy for ${collectionName}`);
  return deleteEntity(user, collectionName, id, permission);
}

export async function getEntity(id, collectionName) {
  const snap = await getDoc(doc(db, collectionName, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listByField(collectionName, field, value, sortField = "createdAt") {
  const clauses = [where(field, "==", value)];
  if (sortField) clauses.push(orderBy(sortField, "desc"));
  const snap = await getDocs(query(collection(db, collectionName), ...clauses));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function listCollection(collectionName, sortField = "createdAt") {
  const q = sortField
    ? query(collection(db, collectionName), orderBy(sortField, "desc"))
    : collection(db, collectionName);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function describeRole(role) {
  return {
    superadmin: "Creates and controls universities, platform admins, plans and global platform operations.",
    admin: "Runs one university: departments, programmes, faculty, students, classes, SVLs and university operations.",
    teacher: "Runs assigned SVLs: slides, quizzes, assignments, attendance, grades and class communication.",
    student: "Uses enrolled SVLs, studies content, completes quizzes/assignments and views personal progress."
  }[role] || "Unknown role";
}

export function getEntityFlow() {
  return [
    "Super Admin → University",
    "University Admin → Departments + Programmes + Faculty + Students + Classes + SVLs",
    "Teacher → Assigned SVLs + Slides + Quizzes + Assignments + Attendance + Grades",
    "Student → Enrolled SVLs + Learning Content + Assessments + Personal Progress"
  ];
}

if (typeof window !== "undefined") {
  window.MCM = Object.assign(window.MCM || {}, {
    MCM_ROLES,
    MCM_COLLECTIONS,
    MCM_PERMISSIONS,
    hasPermission,
    requirePermission,
    getScopeForUser,
    createUniversity,
    createDepartment,
    createProgram,
    createFaculty,
    createStudent,
    createClass,
    createSVL,
    enrollStudent,
    createSlide,
    createQuiz,
    createAssignment,
    updateEntityByRole,
    deleteEntityByRole,
    getEntity,
    listByField,
    listCollection,
    describeRole,
    getEntityFlow
  });
}
