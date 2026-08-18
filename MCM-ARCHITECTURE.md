# MCM Simple Architecture

MCM should stay simple. **SVL means Student Voice Leader**, similar to a class representative (CR). It is not a teaching subject or learning space.

```text
Super Admin
   ↓
University
   ↓
University Admin
   ↓
Class
   ├── Faculty
   ├── Students
   └── SVL (Student Voice Leader / CR)
         ↓
      Own class portal

Faculty → manages teaching content
Students → consume learning content
SVL → manages class student list + class communication
```

## 1. Super Admin

Platform owner.

Main responsibilities:

- Add and manage universities
- Create and manage University Admin accounts
- Manage plans, billing and global settings
- View platform analytics and audit logs

Super Admin does not manage everyday class rosters.

## 2. University Admin

Runs one university and controls the university setup.

### Core workflow

`Admin → Classes → Add Class`

Example:

`BSCS Semester 5 A`

`BSCS Semester 5 B`

Then inside the class:

`Class → Faculty → Add/Assign Faculty`

`Class → Students → Add/Manage Students`

`Class → SVL → Assign Student Voice Leader`

The Admin can replace the SVL whenever needed.

The Admin also manages/oversees:

- Slides
- Quizzes
- Assignments
- Attendance
- Grades
- Announcements
- Schedules
- Basic reports

## 3. SVL — Student Voice Leader

SVL is a **class representative / CR-style role**.

An SVL belongs to **one class only** and receives a small, focused portal.

### SVL can

- View their assigned class
- View the current student roster
- Add an existing student to their class
- Remove a student from their class, subject to university policy
- View class announcements
- Post class-level announcements/messages
- View class slides, quizzes and assignments
- View class attendance/grade summaries when allowed
- Raise or communicate class issues to faculty/admin

### SVL cannot

- Create universities
- Create classes
- Create or edit faculty accounts
- Change grades
- Mark attendance
- Upload official teaching slides as the teacher
- Create official quizzes/assignments
- Access another class
- Access university-wide admin controls

### SVL portal

```text
MCM

My Class
Students
Announcements
Learning Resources
Class Updates
Profile
```

The most important SVL action is:

`My Class → Students → Add Student`

When an SVL adds a student, the system creates an enrollment for **that SVL's own class only**. The SVL cannot choose another class.

## 4. Faculty

Faculty members manage teaching.

```text
Faculty
  ↓
My Classes / Assigned Teaching
  ↓
Select Class
  ↓
Manage Learning
```

Faculty can:

- Upload slides
- Create quizzes
- Create assignments
- Publish official announcements
- Take attendance
- Enter grades
- View enrolled students
- Manage class discussion

Faculty cannot change university-level structure.

## 5. Student

Students see only their own enrolled classes and learning resources.

```text
Student
  ↓
My Classes
  ↓
Learn
```

Student features:

- View slides
- Complete quizzes
- Complete assignments
- View announcements
- View attendance
- View grades
- Track progress
- Participate in Community

## Ownership rules

| Area | Super Admin | University Admin | Faculty | SVL | Student |
|---|---|---|---|---|---|
| University | Full | Own | View | No | No |
| Class | Global view | Create/manage | Assigned | Own only | Enrolled only |
| Faculty | Manage | Create/manage | Self | View | View assigned |
| Students | Global view | Create/manage | View assigned | Add/remove in own class | Self |
| SVL assignment | Global view | Assign/replace | View | Self | View |
| Slides | Global view | Manage/oversee | Create/manage | View | View |
| Quizzes | Global view | Manage/oversee | Create/manage | View | Attempt |
| Assignments | Global view | Manage/oversee | Create/manage | View | Submit |
| Attendance | View | Manage/oversee | Record | View summary | View own |
| Grades | View | Manage/oversee | Enter | View summary | View own |
| Announcements | Global | University/class | Official class | Class communication | Read |

## Recommended Admin screen

Keep the University Admin navigation simple:

1. **Classes**
2. **Students**
3. **Faculty**
4. **SVLs**
5. **Content**
6. **Announcements**
7. **Reports**
8. **Settings**

The Admin should primarily work from the Class page:

```text
Classes
  ↓
Select Class
  ↓
┌─────────────────────────────────┐
│ Class Overview                  │
│ Students | Faculty | SVL        │
│                                 │
│ Learning                        │
│ Slides | Quizzes | Assignments  │
│                                 │
│ Operations                      │
│ Attendance | Grades | Announce  │
└─────────────────────────────────┘
```

## Recommended class setup

```text
1. Add Class
      ↓
2. Add/Assign Faculty
      ↓
3. Add Students
      ↓
4. Assign SVL (CR)
      ↓
5. Finish
```

SVL assignment happens **after the class exists**. The SVL is simply one student from that class who gets additional class-management permissions.

## Firestore collections

Core collections:

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

Departments and programmes remain optional metadata and should not block the core workflow.

## Important production rule

JavaScript permissions are UX only. Before production, Firebase Authentication claims and Firestore Security Rules must enforce university and class ownership on the server side.

The project remains in TEST_MODE while the interface and workflows are being rebuilt.
