// Compatibility module for dashboards that import auth from /js/.
export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  requireAuth,
  redirectIfLoggedIn,
  resetPassword,
  ROLE_PAGES
} from "../auth.js";
