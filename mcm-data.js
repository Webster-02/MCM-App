import { collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { db } from './firebase-config.js';

export const MCM_COLLECTIONS = {
  universities:'universities', users:'users', classes:'classes', svls:'svls', enrollments:'enrollments',
  subjects:'subjects', slides:'slides', quizzes:'quizzes', assignments:'assignments', announcements:'announcements',
  timetables:'timetables', messages:'messages', notifications:'notifications', auditLogs:'auditLogs', plans:'plans',
  attendance:'attendance', grades:'grades'
};

export const ROLE_PERMISSIONS = {
  admin: [
    'classes:create','classes:read','classes:update','classes:delete',
    'students:create','students:read','students:update','students:delete',
    'svls:create','svls:read','svls:update','svls:delete','enrollments:create','enrollments:delete',
    'faculty:read','subjects:read','slides:read','quizzes:read','assignments:read','announcements:read','timetables:read'
  ],
  svl: [
    'class:read_own','students:read_own_class',
    'subjects:create_own','subjects:read_own','subjects:update_own','subjects:delete_own',
    'slides:create_own','slides:read_own','slides:update_own','slides:delete_own',
    'quizzes:create_own','quizzes:read_own','quizzes:update_own','quizzes:delete_own',
    'assignments:create_own','assignments:read_own','assignments:update_own','assignments:delete_own',
    'announcements:create_own','announcements:read_own','announcements:update_own','announcements:delete_own',
    'timetables:create_own','timetables:read_own','timetables:update_own','timetables:delete_own',
    'messages:create_own_class','messages:read_own_class','attendance:read','grades:read'
  ],
  student: [
    'class:read_enrolled','subjects:read_enrolled','slides:read_enrolled','quizzes:read_enrolled',
    'assignments:read_enrolled','announcements:read_enrolled','timetables:read_enrolled',
    'messages:create_enrolled','messages:read_enrolled'
  ]
};

export const hasPermission = (role, permission) => (ROLE_PERMISSIONS[role] || []).includes(permission);

export const describeRole = role => ({
  admin:'University Admin', svl:'Student Voice Leader', student:'Student'
}[role] || role);

export const getEntityFlow = () => 'University Admin → Class → SVL → Students';

const clean = value => String(value ?? '').trim();
const now = () => serverTimestamp();

export async function createClass(data){ return addDoc(collection(db,MCM_COLLECTIONS.classes), { ...data, createdAt:now(), updatedAt:now() }); }
export async function createStudent(data){ return addDoc(collection(db,MCM_COLLECTIONS.users), { ...data, role:'student', createdAt:now(), updatedAt:now() }); }
export async function createSVL(data){ return addDoc(collection(db,MCM_COLLECTIONS.svls), { ...data, createdAt:now(), updatedAt:now() }); }
export async function createSubject(data){ return addDoc(collection(db,MCM_COLLECTIONS.subjects), { ...data, createdAt:now(), updatedAt:now() }); }
export async function createSlide(data){ return addDoc(collection(db,MCM_COLLECTIONS.slides), { ...data, createdAt:now(), updatedAt:now() }); }
export async function createQuiz(data){ return addDoc(collection(db,MCM_COLLECTIONS.quizzes), { ...data, createdAt:now(), updatedAt:now() }); }
export async function createAssignment(data){ return addDoc(collection(db,MCM_COLLECTIONS.assignments), { ...data, createdAt:now(), updatedAt:now() }); }
export async function createClassAnnouncement(data){ return addDoc(collection(db,MCM_COLLECTIONS.announcements), { ...data, createdAt:now(), updatedAt:now() }); }
export async function createTimetable(data){ return addDoc(collection(db,MCM_COLLECTIONS.timetables), { ...data, createdAt:now(), updatedAt:now() }); }
export async function createClassMessage(data){ return addDoc(collection(db,MCM_COLLECTIONS.messages), { ...data, createdAt:now() }); }

export async function addStudentToClass(data){ return addDoc(collection(db,MCM_COLLECTIONS.enrollments), { ...data, createdAt:now() }); }
export async function removeStudentFromClass(enrollmentId){ return deleteDoc(doc(db,MCM_COLLECTIONS.enrollments,enrollmentId)); }
export async function updateOwnClassContent(collectionName,id,data){ return updateDoc(doc(db,collectionName,id), { ...data, updatedAt:now() }); }
export async function deleteOwnClassContent(collectionName,id){ return deleteDoc(doc(db,collectionName,id)); }

export async function getClass(classId){ const snap = await getDoc(doc(db,MCM_COLLECTIONS.classes,classId)); return snap.exists() ? {id:snap.id,...snap.data()} : null; }
export async function getClassItems(collectionName,classId,extra=[]){
  const constraints = [where('classId','==',classId), ...extra];
  const snap = await getDocs(query(collection(db,collectionName), ...constraints));
  return snap.docs.map(d => ({id:d.id,...d.data()}));
}

export function validateClassPayload(data){
  return { name:clean(data.name), code:clean(data.code), section:clean(data.section), facultyId:clean(data.facultyId) };
}
