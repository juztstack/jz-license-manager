import { createStore } from '@corvux/store';

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

const authStore = createStore({
  state: {
    isAuthenticated: !!storedToken,
    token: storedToken as string | null,
    user: storedToken ? { email: 'admin@example.com', role: 'admin' } : null as { email: string; role: string } | null,
  },
  actions: {
    login({ state }: { state: { isAuthenticated: boolean; token: string | null; user: { email: string; role: string } | null } }, payload?: unknown) {
      const { email, role = 'admin' } = payload as { email: string; role?: string };
      const token = btoa(`${email}:${Date.now()}`);
      setCookie(COOKIE_NAME, token, COOKIE_EXPIRY_DAYS);
      state.isAuthenticated = true;
      state.token = token;
      state.user = { email, role };
    },
    logout({ state }: { state: { isAuthenticated: boolean; token: string | null; user: { email: string; role: string } | null } }) {
      deleteCookie(COOKIE_NAME);
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
  },
});

export const authState = {
  get state() {
    return authStore.state;
  },
  login(email: string, role: string = 'admin') {
    authStore.dispatch('login', { email, role });
  },
  logout() {
    authStore.dispatch('logout');
  },
  validateCredentials(email: string, password: string): boolean {
    return email === 'admin@example.com' && password === 'admin';
  },
};

export default authState;
