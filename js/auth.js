// MCM — Compatibility bridge
// The dashboard pages use /js/auth.js. Keep this file as a thin bridge so there is
// only one real authentication implementation in the project.

import * as Auth from "../auth.js";

Object.assign(window, Auth);

export const registerUser = Auth.registerUser;
export const loginUser = Auth.loginUser;
export const logoutUser = Auth.logoutUser;
export const getCurrentUser = Auth.getCurrentUser;
export const requireAuth = Auth.requireAuth;
export const redirectIfLoggedIn = Auth.redirectIfLoggedIn;
export const resetPassword = Auth.resetPassword;
export const ROLE_PAGES = Auth.ROLE_PAGES;
export const TEST_MODE = Auth.TEST_MODE;
