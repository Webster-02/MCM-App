# MCM Simple Architecture

MCM should stay simple. The core product flow is:

```text
Super Admin
   ↓
University
   ↓
University Admin
   ↓
Classes
   ↓
SVLs
   ↓
Students + Faculty
   ↓
Slides / Quizzes / Assignments / Attendance / Grades / Announcements
```

## 1. Super Admin

The Super Admin is the platform owner.

Main job:

- Add and manage universities
- Create and manage University Admin accounts
- Manage platform plans, billing and global settings
- View platform level analytics and audit logs

The Super Admin does not need to manage everyday classes, SVLs or students.

## 2. University Admin

The University Admin runs one university.

This is the main management role inside the university.

The Admin workflow is deliberately simple:

### Step A — Create classes

`Admin → Classes → Add Class`

Example:

`BSCS Semester 5 A`

`BSCS Semester 5 B`

Each class belongs to one university.

### Step B — Add faculty to a class or SVL

`Admin → Class → Faculty → Add Faculty`

The Admin can create/select a teacher and assign them to the relevant SVL.

### Step C — Add students to the class

`Admin → Class → Students → Add Student`

Students become members of that class.

### Step D — Create SVLs

`Admin → Class → SVLs → Add SVL`

Example:

`Data Structures`

`Database Systems`

`Operating Systems`

Each SVL belongs to one class and has an assigned faculty member.

### Step E — Add students to an SVL

`Admin → SVL → Students → Add Students`

Only selected students from the class can be enrolled in that SVL.

This makes the relationship easy to understand:

```text
Class
├── Students
├── Faculty
└── SVLs
    ├── Students
    └── Faculty
```

### Step F — Manage academic data

The Admin can manage or oversee:

- Announcements
- Slides
- Quizzes
- Assignments
- Attendance
- Grades
- Class/SVL schedules
- Basic reports

For normal teaching content, the assigned Faculty member can also manage the content inside their SVL.

## 3. Faculty

Faculty should not manage university structure.

They only work inside their assigned SVLs.

```text
Faculty
   ↓
My SVLs
   ↓
Select SVL
   ↓
Manage Learning
```

Inside an SVL they can:

- Upload slides
- Create quizzes
- Create assignments
- Post announcements
- Take attendance
- Enter grades
- Manage class discussion
- View enrolled students

## 4. Student

Students only see what they are enrolled in.

```text
Student
   ↓
My SVLs
   ↓
Select SVL
   ↓
Learn
```

Student features:

- View slides
- Watch/read learning material
- Complete quizzes
- Complete assignments
- View announcements
- View attendance
- View grades
- Track progress
- Participate in Community

## Simple ownership rules

| Area | Super Admin | University Admin | Faculty | Student |
|---|---|---|---|---|
| University | Full | Own university | View | No |
| Classes | View | Create/manage | View assigned | View enrolled |
| SVLs | View | Create/manage | Manage assigned | View enrolled |
| Faculty | Manage admins | Create/manage | Self | View assigned |
| Students | View | Create/manage | View assigned | Self |
| Slides | Global view | Manage/oversee | Create/manage own | View |
| Quizzes | Global view | Manage/oversee | Create/manage own | Attempt |
| Assignments | Global view | Manage/oversee | Create/manage own | Submit |
| Attendance | View | Manage/oversee | Record own SVLs | View own |
| Grades | View | Manage/oversee | Enter own SVL grades | View own |
| Announcements | Global | University/class | SVL/class | Read |

## Recommended admin screen

The University Admin dashboard should focus on these six primary actions:

1. **Classes** — create/manage classes
2. **Students** — add and manage students
3. **Faculty** — add and manage teachers
4. **SVLs** — create SVLs and assign faculty/students
5. **Content** — slides, quizzes and assignments
6. **Announcements** — publish updates

Everything else should be secondary under Reports, Settings or System.

## Recommended class setup wizard

When an Admin clicks **Add Class**, use a simple guided flow:

```text
1. Class details
      ↓
2. Add/select Faculty
      ↓
3. Add Students
      ↓
4. Create SVLs
      ↓
5. Assign Faculty to SVLs
      ↓
6. Assign Students to SVLs
      ↓
7. Finish
```

After setup, the Admin should see one class card with:

- Number of students
- Number of faculty
- Number of SVLs
- Upcoming announcements
- Quick actions

## Firestore collections

Keep the backend simple around these core collections:

- `universities`
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

Departments and programmes can remain optional metadata later. They should not block the core Class → SVL → Student workflow.

## Important production rule

The JavaScript permission layer is for UX only. Before production, Firebase Authentication claims and Firestore Security Rules must enforce the same ownership and access rules on the server side.

The project remains in TEST_MODE while the interface and workflows are being rebuilt.
