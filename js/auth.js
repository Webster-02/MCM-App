// MCM — Compatibility bridge
// Dashboard pages can import authentication from /js/auth.js while the
// implementation remains centralized in the root auth.js module.
import * as Auth from '../auth.js';

Object.assign(window, Auth);

export const registerUser = Auth.registerUser;
export const loginUser = Auth.loginUser;
export const logoutUser = Auth.logoutUser;
export const signOut = Auth.signOut;
export const getCurrentUser = Auth.getCurrentUser;
export const getStoredUser = Auth.getStoredUser;
export const setStoredUser = Auth.setStoredUser;
export const clearStoredUser = Auth.clearStoredUser;
export const requireAuth = Auth.requireAuth;
export const redirectIfLoggedIn = Auth.redirectIfLoggedIn;
export const redirectForRole = Auth.redirectForRole;
export const resetPassword = Auth.resetPassword;
export const ROLE_PAGES = Auth.ROLE_PAGES;
export const TEST_USERS = Auth.TEST_USERS;
export const TEST_MODE = Auth.TEST_MODE;
