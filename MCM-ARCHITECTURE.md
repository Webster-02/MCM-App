# MCM Architecture

## Ownership model

MCM uses a strict top-down ownership model. A user can only manage data inside the scope assigned to their role.

### 1. Super Admin — platform owner

Owns the entire MCM platform.

Can create and manage:

- Universities
- University Admin accounts
- Plans and billing configuration
- Global platform settings
- Global analytics and audit logs

The Super Admin does **not** create ordinary students or teachers one by one. Those belong to a university and are managed by that university's Admin.

### 2. University Admin — university owner

Owns one university only.

Flow:

`University → Departments → Programmes → Faculty → Students → Classes → SVLs`

The University Admin can create and manage:

- Departments
- Programmes
- Faculty / teachers
- Students
- Classes
- SVLs
- University announcements
- University reports

The University Admin is restricted to `universityId`.

### 3. Faculty / Teacher

A teacher never creates a new university or changes university structure.

A teacher manages the SVLs/classes assigned to them.

Inside an assigned SVL, the teacher can manage:

- Slides
- Quizzes
- Assignments
- Attendance
- Grades
- Class discussion / communication

Teacher access is restricted by `teacherId`, assigned `svlIds`, and university scope.

### 4. Student

A student cannot create or administer academic structure.

A student only consumes resources belonging to enrolled SVLs/classes.

Student access includes:

- Enrolled SVLs
- Slides
- Quizzes
- Assignments
- Personal attendance
- Personal grades
- Personal progress

## Entity relationships

```text
MCM Platform
│
├── Universities
│   └── University Admin
│       │
│       ├── Departments
│       │   └── Programmes
│       │
│       ├── Faculty
│       │   └── Assigned SVLs
│       │       ├── Slides
│       │       ├── Quizzes
│       │       ├── Assignments
│       │       ├── Attendance
│       │       └── Grades
│       │
│       ├── Students
│       │   └── Enrolments
│       │       └── SVLs
│       │
│       └── Classes
│           └── SVLs
```

## Recommended operational workflow

### Creating a university

`Super Admin → Universities → Add University → Create University Admin`

The university gets a unique `universityId`. The admin account is linked to that ID.

### Setting up the university

`University Admin → Departments → Add Department`

`University Admin → Programmes → Add Programme`

`University Admin → Faculty → Add Faculty`

`University Admin → Students → Add Student`

### Creating a class

`University Admin → Classes → Create Class`

The class receives:

- `universityId`
- `departmentId`
- `programmeId`
- `teacherIds[]`
- `studentIds[]`

### Creating an SVL

`University Admin → SVLs → Create SVL`

An SVL belongs to a class and has a teacher owner/assignment.

Recommended fields:

- `universityId`
- `classId`
- `teacherId`
- `title`
- `subject`
- `status`
- `term`
- `schedule`

### Teaching workflow

`Teacher → My SVLs → Select SVL → Manage Learning`

Within the selected SVL:

`Slides / Quizzes / Assignments / Attendance / Grades / Discussion`

### Student workflow

`Student → My SVLs → Select SVL → Learn`

The student sees only content from their enrolled SVLs.

## Firestore collection model

Current MCM data helpers use these collections:

- `universities`
- `departments`
- `programmes`
- `users`
- `classes`
- `svls`
- `enrollments`
- `slides`
- `quizzes`
- `assignments`
- `attendance`
- `grades`
- `announcements`
- `notifications`
- `auditLogs`
- `plans`

## Role permissions

### Super Admin

`universities:create/read/update/delete`

`admins:create/read/update/delete`

`plans:manage`

`platform:analytics`

`platform:audit`

### University Admin

`departments:*`

`programs:*`

`faculty:*`

`students:*`

`classes:*`

`svls:*`

`announcements:create`

`reports:read`

### Teacher

Own SVLs plus:

`slides:*`

`quizzes:*`

`assignments:*`

`attendance:manage_own`

`grades:manage_own`

`students:read_own`

### Student

Read-only access to enrolled SVLs/content plus personal records.

## Important production rule

The JavaScript permission layer improves UX and prevents accidental actions, but it is **not a security boundary**. Before production, Firebase Authentication claims and Firestore Security Rules must enforce the same ownership model on the server side.

The current project remains in `TEST_MODE` while the UI and workflows are being rebuilt.
