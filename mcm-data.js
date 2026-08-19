// MCM — Data model, permissions, and Firebase data helpers
// SVL = Student Voice Leader (class representative / CR-style role).
// In MCM, the assigned SVL is the operational publisher for class content.

import { db } from "./firebase-config.js";
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

export const MCM_ROLES = Object.freeze({
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  TEACHER: "teacher",
  SVL: "svl",
  STUDENT: "student"
});

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
    "announcements:read", "slides:read", "quizzes:read", "assignments:read",
    "attendance:read", "grades:read", "reports:read"
  ],
  teacher: [
    "svls:read", "svls:manage_own",
    "slides:read_own_class", "quizzes:read_own_class", "assignments:read_own_class",
    "attendance:manage_own", "grades:manage_own", "students:read_own", "announcements:read"
  ],
  svl: [
    "class:read_own",
    "students:read_own_class",
    "students:add_to_own_class",
    "students:remove_from_own_class",
    "enrollments:create_own_class",
    "enrollments:remove_own_class",
    "announcements:create_own_class",
    "announcements:read_own_class",
    "slides:create_own_class",
    "slides:read_own_class",
    "slides:update_own_class",
    "slides:delete_own_class",
    "quizzes:create_own_class",
    "quizzes:read_own_class",
    "quizzes:update_own_class",
    "quizzes:delete_own_class",
    "assignments:create_own_class",
    "assignments:read_own_class",
    "assignments:update_own_class",
    "assignments:delete_own_class",
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

export async function createUniversity(user, data) { return addEntity(user, MCM_COLLECTIONS.universities, data, "universities:create"); }
export async function createDepartment(user, universityId, data) { return addEntity(user, MCM_COLLECTIONS.departments, { ...data, universityId }, "departments:create"); }
export async function createProgram(user, universityId, departmentId, data) { return addEntity(user, MCM_COLLECTIONS.programs, { ...data, universityId, departmentId }, "programs:create"); }
export async function createFaculty(user, universityId, data) { return addEntity(user, MCM_COLLECTIONS.users, { ...data, universityId, role: MCM_ROLES.TEACHER, isActive: data.isActive ?? true }, "faculty:create"); }
export async function createStudent(user, universityId, data) { return addEntity(user, MCM_COLLECTIONS.users, { ...data, universityId, role: MCM_ROLES.STUDENT, enrolledClasses: data.enrolledClasses || [], isActive: data.isActive ?? true }, "students:create"); }
export async function createClass(user, universityId, data) { return addEntity(user, MCM_COLLECTIONS.classes, { ...data, universityId, teacherIds: data.teacherIds || [], studentIds: data.studentIds || [], svlIds: data.svlIds || [] }, "classes:create"); }

export async function createSVL(user, universityId, classId, data) {
  return addEntity(user, MCM_COLLECTIONS.svls, { ...data, universityId, classId, role: MCM_ROLES.SVL, userId: data.userId || null, status: data.status || "active" }, "svls:create");
}

export async function addStudentToSVLClass(user, studentId, classId, universityId) {
  requirePermission(user, "students:add_to_own_class");
  if (user.role === MCM_ROLES.SVL && user.classId !== classId) throw new Error("SVL can only manage the assigned class.");
  return addEntity(user, MCM_COLLECTIONS.enrollments, { studentId, classId, universityId, source: "svl" }, "students:add_to_own_class");
}

export async function removeStudentFromSVLClass(user, enrollmentId, classId) {
  requirePermission(user, "students:remove_from_own_class");
  if (user.role === MCM_ROLES.SVL && user.classId !== classId) throw new Error("SVL can only manage the assigned class.");
  return deleteEntity(user, MCM_COLLECTIONS.enrollments, enrollmentId, "students:remove_from_own_class");
}

export async function createClassAnnouncement(user, classId, data) {
  requirePermission(user, "announcements:create_own_class");
  if (user.role === MCM_ROLES.SVL && user.classId !== classId) throw new Error("SVL can only post to the assigned class.");
  return addEntity(user, MCM_COLLECTIONS.announcements, { ...data, classId }, "announcements:create_own_class");
}

export async function createSlide(user, classId, data) {
  requirePermission(user, "slides:create_own_class");
  if (user.classId !== classId) throw new Error("SVL can only publish slides to the assigned class.");
  return addEntity(user, MCM_COLLECTIONS.slides, { ...data, classId, publisherRole: MCM_ROLES.SVL }, "slides:create_own_class");
}

export async function createQuiz(user, classId, data) {
  requirePermission(user, "quizzes:create_own_class");
  if (user.classId !== classId) throw new Error("SVL can only publish quizzes to the assigned class.");
  return addEntity(user, MCM_COLLECTIONS.quizzes, { ...data, classId, publisherRole: MCM_ROLES.SVL }, "quizzes:create_own_class");
}

export async function createAssignment(user, classId, data) {
  requirePermission(user, "assignments:create_own_class");
  if (user.classId !== classId) throw new Error("SVL can only publish assignments to the assigned class.");
  return addEntity(user, MCM_COLLECTIONS.assignments, { ...data, classId, publisherRole: MCM_ROLES.SVL }, "assignments:create_own_class");
}

export async function updateOwnClassContent(user, type, id, classId, data) {
  const permissions = { slide: "slides:update_own_class", quiz: "quizzes:update_own_class", assignment: "assignments:update_own_class" };
  const permission = permissions[type];
  if (!permission) throw new Error("Unsupported content type.");
  if (user.classId !== classId) throw new Error("SVL can only manage the assigned class.");
  return updateEntity(user, MCM_COLLECTIONS[type === "slide" ? "slides" : type === "quiz" ? "quizzes" : "assignments"], id, data, permission);
}

export async function deleteOwnClassContent(user, type, id, classId) {
  const permissions = { slide: "slides:delete_own_class", quiz: "quizzes:delete_own_class", assignment: "assignments:delete_own_class" };
  const permission = permissions[type];
  if (!permission) throw new Error("Unsupported content type.");
  if (user.classId !== classId) throw new Error("SVL can only manage the assigned class.");
  const collections = { slide: MCM_COLLECTIONS.slides, quiz: MCM_COLLECTIONS.quizzes, assignment: MCM_COLLECTIONS.assignments };
  return deleteEntity(user, collections[type], id, permission);
}

export function describeRole(role) {
  return {
    superadmin: "Platform owner. Creates universities, university admins, plans and global controls.",
    admin: "University admin. Manages classes, faculty, students and SVL assignments.",
    teacher: "Faculty member. Manages attendance and grades and views class content.",
    svl: "Student Voice Leader. Manages one class, its students, announcements and class learning content.",
    student: "Learner. Uses enrolled classes, learning content and personal progress."
  }[role] || "Unknown role";
}

export function getEntityFlow() {
  return [
    "Super Admin → University + University Admin",
    "University Admin → Classes + Faculty + Students + SVL",
    "SVL → Own class students + slides + quizzes + assignments + announcements",
    "Teacher → Attendance + Grades + class content viewing",
    "Student → Enrolled learning + personal progress"
  ];
}

if (typeof window !== "undefined") {
  window.MCM = Object.assign(window.MCM || {}, {
    MCM_ROLES, MCM_COLLECTIONS, MCM_PERMISSIONS, hasPermission, requirePermission,
    getScopeForUser, createUniversity, createDepartment, createProgram, createFaculty,
    createStudent, createClass, createSVL, addStudentToSVLClass, removeStudentFromSVLClass,
    createClassAnnouncement, createSlide, createQuiz, createAssignment, updateOwnClassContent,
    deleteOwnClassContent, describeRole, getEntityFlow
  });
}
