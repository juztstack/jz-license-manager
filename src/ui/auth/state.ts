import { createReactive } from '@corvux/core';

const COOKIE_NAME = 'jz_auth';
const COOKIE_EXPIRY_DAYS = 7;

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function setCookie(name: string, value: string, days: number): void {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Strict`;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

const storedToken = getCookie(COOKIE_NAME);
const initialState = {
  isAuthenticated: !!storedToken,
  token: storedToken,
  user: storedToken ? { email: 'admin@example.com', role: 'admin' } : null,
};

const authBase = createReactive(initialState);

export const authState = {
  ...authBase,
  get state() {
    return authBase.state;
  },
  login(email: string, role: string = 'admin') {
    const token = btoa(`${email}:${Date.now()}`);
    setCookie(COOKIE_NAME, token, COOKIE_EXPIRY_DAYS);
    authBase.state.isAuthenticated = true;
    authBase.state.token = token;
    authBase.state.user = { email, role };
  },
  logout() {
    deleteCookie(COOKIE_NAME);
    authBase.state.isAuthenticated = false;
    authBase.state.token = null;
    authBase.state.user = null;
  },
  validateCredentials(email: string, password: string): boolean {
    return email === 'admin@example.com' && password === 'admin';
  },
};

export default authState;
