// MCM — Data model, permissions, and Firebase data helpers
// SVL = Student Voice Leader (class representative / CR-style role).
// This file is the single source of truth for platform entities and role permissions.

import { db } from "./firebase-config.js";
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

export const MCM_ROLES = Object.freeze({
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  TEACHER: "teacher",
  SVL: "svl",
  STUDENT: "student"
});

// Core operational hierarchy:
// MCM Platform → University → Class → SVL (class representative) → Students
// Teaching content belongs to the Class/SVL context.
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
    "announcements:create", "announcements:read",
    "slides:read", "quizzes:read", "assignments:read", "attendance:read", "grades:read",
    "reports:read"
  ],
  teacher: [
    "svls:read", "svls:manage_own",
    "slides:create", "slides:read", "slides:update", "slides:delete",
    "quizzes:create", "quizzes:read", "quizzes:update", "quizzes:delete",
    "assignments:create", "assignments:read", "assignments:update", "assignments:delete",
    "attendance:manage_own", "grades:manage_own",
    "students:read_own", "announcements:create", "announcements:read"
  ],
  // SVL = Student Voice Leader / class representative.
  // Limited strictly to one assigned class.
  svl: [
    "class:read_own",
    "students:read_own_class",
    "students:add_to_own_class",
    "students:remove_from_own_class",
    "enrollments:create_own_class",
    "enrollments:remove_own_class",
    "announcements:create_own_class",
    "announcements:read_own_class",
    "slides:read_own_class",
    "quizzes:read_own_class",
    "assignments:read_own_class",
    "attendance:read_own_class",
    "grades:read_own_class"
  ],
  student: [
    "class:read_enrolled",
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
  return Boolean(user?.role && MCM_PERMISSIONS[user.role]?.includes(permission));
}

export function requirePermission(user, permission) {
  if (!hasPermission(user, permission)) throw new Error(`Permission denied: ${permission}`);
  return true;
}

export function getScopeForUser(user = {}) {
  return {
    universityId: user.universityId || null,
    classId: user.classId || null,
    svlId: user.svlId || null,
    uid: user.uid || null
  };
}

export function normaliseEntity(entity = {}) {
  const clean = { ...entity };
  Object.keys(clean).forEach(key => { if (clean[key] === undefined) delete clean[key]; });
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
  await updateDoc(doc(db, collectionName, id), normaliseEntity({ ...data, updatedAt: serverTimestamp(), updatedBy: user.uid || null }));
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
  return addEntity(user, MCM_COLLECTIONS.departments, { ...data, universityId }, "departments:create");
}

export async function createProgram(user, universityId, departmentId, data) {
  return addEntity(user, MCM_COLLECTIONS.programs, { ...data, universityId, departmentId }, "programs:create");
}

export async function createFaculty(user, universityId, data) {
  return addEntity(user, MCM_COLLECTIONS.users, { ...data, universityId, role: MCM_ROLES.TEACHER, isActive: data.isActive ?? true }, "faculty:create");
}

export async function createStudent(user, universityId, data) {
  return addEntity(user, MCM_COLLECTIONS.users, { ...data, universityId, role: MCM_ROLES.STUDENT, enrolledClasses: data.enrolledClasses || [], isActive: data.isActive ?? true }, "students:create");
}

export async function createClass(user, universityId, data) {
  return addEntity(user, MCM_COLLECTIONS.classes, {
    ...data,
    universityId,
    teacherIds: data.teacherIds || [],
    studentIds: data.studentIds || [],
    svlIds: data.svlIds || []
  }, "classes:create");
}

// Creates an SVL / Student Voice Leader record for one class.
export async function createSVL(user, universityId, classId, data) {
  return addEntity(user, MCM_COLLECTIONS.svls, {
    ...data,
    universityId,
    classId,
    role: MCM_ROLES.SVL,
    userId: data.userId || null,
    status: data.status || "active"
  }, "svls:create");
}

// SVL can add an existing student to their own assigned class.
export async function addStudentToSVLClass(user, studentId, classId, universityId) {
  requirePermission(user, "students:add_to_own_class");
  if (user.role === MCM_ROLES.SVL && user.classId !== classId) throw new Error("SVL can only manage their assigned class.");
  return addEntity(user, MCM_COLLECTIONS.enrollments, { studentId, classId, universityId, source: "svl" }, "students:add_to_own_class");
}

export async function removeStudentFromSVLClass(user, enrollmentId, classId) {
  requirePermission(user, "students:remove_from_own_class");
  if (user.role === MCM_ROLES.SVL && user.classId !== classId) throw new Error("SVL can only manage their assigned class.");
  return deleteEntity(user, MCM_COLLECTIONS.enrollments, enrollmentId, "students:remove_from_own_class");
}

export async function enrollStudent(user, enrollment) {
  return addEntity(user, MCM_COLLECTIONS.enrollments, enrollment, "students:update");
}

export async function createSlide(user, data) { return addEntity(user, MCM_COLLECTIONS.slides, data, "slides:create"); }
export async function createQuiz(user, data) { return addEntity(user, MCM_COLLECTIONS.quizzes, data, "quizzes:create"); }
export async function createAssignment(user, data) { return addEntity(user, MCM_COLLECTIONS.assignments, data, "assignments:create"); }

export async function createClassAnnouncement(user, classId, data) {
  const permission = user.role === MCM_ROLES.SVL ? "announcements:create_own_class" : "announcements:create";
  requirePermission(user, permission);
  if (user.role === MCM_ROLES.SVL && user.classId !== classId) throw new Error("SVL can only post to their assigned class.");
  return addEntity(user, MCM_COLLECTIONS.announcements, { ...data, classId }, permission);
}

export async function updateEntityByRole(user, collectionName, id, data) {
  const permissionMap = {
    universities: "universities:update", departments: "departments:update", programs: "programs:update",
    classes: "classes:update", svls: "svls:update", slides: "slides:update",
    quizzes: "quizzes:update", assignments: "assignments:update",
    users: user?.role === MCM_ROLES.ADMIN ? "students:update" : "faculty:update"
  };
  const permission = permissionMap[collectionName];
  if (!permission) throw new Error(`No update policy for ${collectionName}`);
  return updateEntity(user, collectionName, id, data, permission);
}

export async function deleteEntityByRole(user, collectionName, id) {
  const permissionMap = {
    universities: "universities:delete", departments: "departments:delete", programs: "programs:delete",
    classes: "classes:delete", svls: "svls:delete", slides: "slides:delete",
    quizzes: "quizzes:delete", assignments: "assignments:delete"
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
  const q = sortField ? query(collection(db, collectionName), orderBy(sortField, "desc")) : collection(db, collectionName);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function describeRole(role) {
  return {
    superadmin: "Platform owner. Creates universities, university admins, plans and global controls.",
    admin: "University admin. Manages classes, faculty, students, SVLs and university operations.",
    teacher: "Faculty member. Manages assigned teaching content, attendance and grades.",
    svl: "Student Voice Leader / class representative. Manages the student list and communication for one assigned class.",
    student: "Learner. Uses enrolled classes, learning content and personal progress."
  }[role] || "Unknown role";
}

export function getEntityFlow() {
  return [
    "Super Admin → University + University Admin",
    "University Admin → Classes + Faculty + Students + SVL assignment",
    "SVL → Own class students + class announcements",
    "Teacher → Teaching content + attendance + grades",
    "Student → Enrolled learning + personal progress"
  ];
}

if (typeof window !== "undefined") {
  window.MCM = Object.assign(window.MCM || {}, {
    MCM_ROLES, MCM_COLLECTIONS, MCM_PERMISSIONS, hasPermission, requirePermission,
    getScopeForUser, createUniversity, createDepartment, createProgram, createFaculty,
    createStudent, createClass, createSVL, addStudentToSVLClass, removeStudentFromSVLClass,
    enrollStudent, createSlide, createQuiz, createAssignment, createClassAnnouncement,
    updateEntityByRole, deleteEntityByRole, getEntity, listByField, listCollection,
    describeRole, getEntityFlow
  });
}
