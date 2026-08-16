// MySVL — Temporary TEST MODE auth shim
// Authentication is intentionally bypassed while the app is being tested.

const ROLE_PAGES = {
  student: "student-dashboard.html",
  teacher: "teacher-dashboard.html",
  admin: "admin-dashboard.html",
  superadmin: "superadmin-dashboard.html"
};

const TEST_USERS = {
  student: {
    uid: "test-student",
    name: "Ali Raza",
    email: "student@test.local",
    role: "student",
    isActive: true
  },
  teacher: {
    uid: "test-teacher",
    name: "Dr. Ahmed Khan",
    email: "teacher@test.local",
    role: "teacher",
    isActive: true
  },
  admin: {
    uid: "test-admin",
    name: "University Admin",
    email: "admin@test.local",
    role: "admin",
    isActive: true
  },
  superadmin: {
    uid: "test-superadmin",
    name: "Super Admin",
    email: "superadmin@test.local",
    role: "superadmin",
    isActive: true
  }
};

function detectRole() {
  const path = (window.location.pathname || "").toLowerCase();
  if (path.includes("superadmin-dashboard")) return "superadmin";
  if (path.includes("admin-dashboard")) return "admin";
  if (path.includes("teacher-dashboard")) return "teacher";
  return "student";
}

function getTestUser(role = detectRole()) {
  const user = TEST_USERS[role] || TEST_USERS.student;
  const copy = { ...user };
  sessionStorage.setItem("msv_user", JSON.stringify(copy));
  return copy;
}

async function requireAuth(allowedRoles = []) {
  const user = getTestUser();
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    // In testing mode, do not redirect. Use a compatible test user for the page.
    const pageRole = allowedRoles[0];
    return getTestUser(pageRole);
  }
  return user;
}

function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem("msv_user")) || getTestUser();
  } catch {
    return getTestUser();
  }
}

async function fetchUserProfile() {
  return getCurrentUser();
}

async function loginUser() {
  const role = detectRole();
  return getTestUser(role);
}

async function registerUser({ name = "Test User", email = "test@test.local", role = "student" } = {}) {
  return getTestUser(role);
}

async function logoutUser() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

function redirectIfLoggedIn() {
  // Intentionally disabled in testing mode.
}

async function resetPassword() {
  return true;
}

// Expose globals for dashboard code that uses non-module access.
Object.assign(window, {
  requireAuth,
  getCurrentUser,
  fetchUserProfile,
  loginUser,
  registerUser,
  logoutUser,
  redirectIfLoggedIn,
  resetPassword,
  ROLE_PAGES
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  requireAuth,
  redirectIfLoggedIn,
  resetPassword,
  fetchUserProfile,
  ROLE_PAGES
};
