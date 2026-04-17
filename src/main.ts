import './style.css';
import './services';
import { authState } from './ui/auth/state';
import { createLicenseId } from './core/domain/value-objects/LicenseId';
import { statusBadge, actionButtons } from './ui/shared/badges';
import { createReactive, cvx } from '@corvux/core';
import { createRouter } from '@corvux/router';
import type { RouterInstance } from '@corvux/router';

declare global {
  interface Window {
    authState: typeof authState;
    router: RouterInstance;
    services: Record<string, any>;
  }
}

window.authState = authState;

function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcer = cvx.$('#announcer');
  if (announcer) {
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = '';
    setTimeout(() => { announcer.textContent = message; }, 100);
  }
}

const STATUS_CLS: Record<string, string> = {
  active: 'bg-green-900/60 text-green-300',
  inactive: 'bg-gray-700 text-gray-300',
  expired: 'bg-yellow-900/60 text-yellow-300',
  revoked: 'bg-red-900/60 text-red-300',
};

const router = createRouter({ mode: 'hash' });
window.router = router;

// Auth guard — redirige a /login si no autenticado
router.guard((ctx, next) => {
  if (ctx.path !== '/login' && !authState.state.isAuthenticated) {
    router.navigate('/login');
  } else {
    next();
  }
});

router.on('/login', () => renderLogin());
router.on('/licenses', () => renderAppLayout('/licenses'));
router.on('/users', () => renderAppLayout('/users'));
router.on('/products', () => renderAppLayout('/products'));
router.on('/bundles', () => renderAppLayout('/bundles'));
router.on('/clients', () => renderAppLayout('/clients'));

function renderLogin() {
  const { state, watch } = createReactive({
    email: '',
    password: '',
    error: null as string | null,
  });

  cvx.$('#app')!.innerHTML = `
    <main id="main-content" class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-sm" role="region" aria-labelledby="login-title">
        <div class="text-center mb-8">
          <h1 id="login-title" class="text-2xl font-bold text-white">JZ License Manager</h1>
          <p class="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>
        <form id="login-form" class="block bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-5" aria-describedby="login-hint" novalidate>
          <div id="login-hint" class="sr-only">Enter your email and password to sign in. Demo credentials: admin@example.com / admin</div>
          <div id="error-alert" class="hidden rounded-md bg-red-900/50 border border-red-700 px-3 py-2" role="alert" aria-live="assertive">
            <p class="text-sm text-red-300" id="error-msg"></p>
          </div>
          <div>
            <label for="input-email" class="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
            <input 
              id="input-email" 
              name="email" 
              type="email" 
              placeholder="admin@example.com"
              autocomplete="email"
              required
              aria-required="true"
              aria-describedby="email-hint"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span id="email-hint" class="sr-only">Enter your email address</span>
          </div>
          <div>
            <label for="input-password" class="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
            <input 
              id="input-password" 
              name="password" 
              type="password" 
              placeholder="••••••••"
              autocomplete="current-password"
              required
              aria-required="true"
              aria-describedby="password-hint"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span id="password-hint" class="sr-only">Enter your password</span>
          </div>
          <button 
            id="btn-login" 
            type="submit"
            class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  `;

  const loginForm = cvx.$<HTMLFormElement>('#login-form')!;
  const emailInput = cvx.$<HTMLInputElement>('#input-email')!;
  const passwordInput = cvx.$<HTMLInputElement>('#input-password')!;
  const errorAlert = cvx.$('#error-alert')!;
  const errorMsg = cvx.$('#error-msg')!;

  watch('error', (err) => {
    cvx.toggleClass(errorAlert, 'hidden', !err);
    if (err) {
      errorMsg.textContent = err;
      emailInput.setAttribute('aria-invalid', 'true');
    } else {
      emailInput.removeAttribute('aria-invalid');
    }
  });

  cvx.on(emailInput, 'input', () => { state.email = emailInput.value; });
  cvx.on(passwordInput, 'input', () => { state.password = passwordInput.value; });

  cvx.on(loginForm, 'submit', (e) => {
    e.preventDefault();
    const email = state.email.trim();
    const password = state.password.trim();

    if (!email || !password) {
      state.error = 'Email and password are required.';
      announce('Error: Email and password are required.', 'assertive');
      return;
    }

    if (authState.validateCredentials(email, password)) {
      announce('Signing in...');
      authState.login(email);
      router.navigate('/licenses');
    } else {
      state.error = 'Invalid credentials. Please try again.';
      announce('Error: Invalid credentials.', 'assertive');
      passwordInput.value = '';
      passwordInput.focus();
    }
  });

  emailInput.focus();
}

function renderAppLayout(activePath: string) {
  const app = cvx.$('#app')!;

  const isActive = (path: string) => activePath.startsWith(path)
    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
    : 'text-gray-400 hover:bg-gray-700/60 hover:text-white';

  app.innerHTML = `
    <div class="flex min-h-screen">
      <aside class="w-64 bg-gray-800 border-r border-gray-700 flex flex-col" role="navigation" aria-label="Main navigation">
        <div class="p-4 border-b border-gray-700">
          <h1 class="text-lg font-bold text-white">JZ License Manager</h1>
        </div>
        <nav class="flex-1 p-4 space-y-1" aria-label="Primary navigation">
          <a href="#/licenses" aria-current="${activePath === '/licenses' ? 'page' : 'false'}" class="flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/licenses')} transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
            Licenses
          </a>
          <a href="#/users" aria-current="${activePath === '/users' ? 'page' : 'false'}" class="flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/users')} transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            Users
          </a>
          <a href="#/products" aria-current="${activePath === '/products' ? 'page' : 'false'}" class="flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/products')} transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            Products
          </a>
          <a href="#/bundles" aria-current="${activePath === '/bundles' ? 'page' : 'false'}" class="flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/bundles')} transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            Bundles
          </a>
          <a href="#/clients" aria-current="${activePath === '/clients' ? 'page' : 'false'}" class="flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/clients')} transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Clients
          </a>
        </nav>
        <div class="p-4 border-t border-gray-700">
          <button id="btn-logout" aria-label="Sign out of your account" class="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout
          </button>
        </div>
      </aside>
      <main id="main-content" class="flex-1 p-8" role="main">
        <div id="page-content"></div>
      </main>
    </div>
  `;

  cvx.on(cvx.$('#btn-logout'), 'click', () => {
    announce('Signing out...');
    authState.logout();
    router.navigate('/login');
  });

  renderPage(activePath);
}

function licenseActions(id: string, status: string): string {
  const revoke = status === 'active'
    ? `<button data-action="revoke" data-id="${id}" class="text-yellow-400 hover:text-yellow-300 text-xs transition-colors mr-3">Revoke</button>`
    : '';
  return `
    <button data-action="edit" data-id="${id}" class="text-indigo-400 hover:text-indigo-300 text-xs transition-colors mr-3">Edit</button>
    ${revoke}
    <button data-action="delete" data-id="${id}" class="text-red-400 hover:text-red-300 text-xs transition-colors">Delete</button>
  `;
}

function renderLicenseRows(licenses: any[]): string {
  if (!licenses.length) {
    return `<tr>
      <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-500">
        No licenses yet. Create one using the form below.
      </td>
    </tr>`;
  }
  return licenses.map((l: any) => `
    <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors" data-id="${l.id}">
      <td class="px-4 py-3 font-mono text-xs text-gray-300" scope="row">${l.key}</td>
      <td class="px-4 py-3 text-white">${l.productName}</td>
      <td class="px-4 py-3 text-gray-300">${l.assignedTo}</td>
      <td class="px-4 py-3">
        <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_CLS[l.status] ?? ''}" role="status" aria-label="Status: ${l.status}">
          ${l.status}
        </span>
      </td>
      <td class="px-4 py-3 text-gray-400 text-xs">
        ${l.expiresAt ? new Date(l.expiresAt).toLocaleDateString() : '—'}
      </td>
      <td class="px-4 py-3">
        <div class="flex gap-3" role="group" aria-label="Actions for ${l.productName}">
          ${licenseActions(l.id, l.status)}
        </div>
      </td>
    </tr>
  `).join('');
}

async function renderLicensesPage() {
  const content = cvx.$('#page-content')!;
  const { state, watch } = createReactive({
    items: [] as any[],
    editId: '',
  });

  async function refreshLicenses() {
    state.items = await window.services.license.listLicenses();
    announce(`${state.items.length} licenses loaded`);
  }

  content.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white">Licenses</h2>
          <p class="text-sm text-gray-400 mt-0.5" id="count-label" aria-live="polite"></p>
        </div>
      </div>

      <div class="bg-gray-800 border border-gray-700 rounded-lg p-5" role="region" aria-labelledby="create-license-heading">
        <h3 id="create-license-heading" class="text-sm font-semibold text-white mb-4">Create New License</h3>
        <form id="create-form" class="grid grid-cols-2 gap-4" aria-label="Create license form">
          <div>
            <label for="f-product" class="block text-xs text-gray-400 mb-1.5">Product Name</label>
            <input id="f-product" name="productName" type="text" placeholder="My App Pro" required aria-required="true"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="f-assigned" class="block text-xs text-gray-400 mb-1.5">Assigned To</label>
            <input id="f-assigned" name="assignedTo" type="email" placeholder="user@example.com" required aria-required="true"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="f-expires" class="block text-xs text-gray-400 mb-1.5">Expires At <span class="text-gray-500">(optional)</span></label>
            <input id="f-expires" name="expiresAt" type="date"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </form>
        <div class="flex gap-3 mt-4">
          <button form="create-form" type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800">
            Create License
          </button>
        </div>
      </div>

      <div id="edit-form" class="hidden bg-gray-800 border border-gray-700 rounded-lg p-5" role="region" aria-labelledby="edit-license-heading">
        <h3 id="edit-license-heading" class="text-sm font-semibold text-white mb-4">Edit License</h3>
        <form id="edit-form-inner" class="grid grid-cols-2 gap-4" aria-label="Edit license form">
          <div>
            <label for="ef-product" class="block text-xs text-gray-400 mb-1.5">Product Name</label>
            <input id="ef-product" name="productName" type="text" required aria-required="true"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="ef-assigned" class="block text-xs text-gray-400 mb-1.5">Assigned To</label>
            <input id="ef-assigned" name="assignedTo" type="email" required aria-required="true"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="ef-expires" class="block text-xs text-gray-400 mb-1.5">Expires At</label>
            <input id="ef-expires" name="expiresAt" type="date"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </form>
        <div class="flex gap-3 mt-4">
          <button form="edit-form-inner" type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800">
            Update License
          </button>
          <button id="btn-cancel-edit" type="button" class="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800">
            Cancel
          </button>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table class="w-full text-left text-sm" role="table" aria-label="Licenses list">
          <caption class="sr-only">Licenses list. Use the create form above to add new licenses.</caption>
          <thead>
            <tr class="border-b border-gray-700" role="row">
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" role="columnheader" scope="col">Key</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" role="columnheader" scope="col">Product</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" role="columnheader" scope="col">Assigned To</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" role="columnheader" scope="col">Status</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" role="columnheader" scope="col">Expires</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" role="columnheader" scope="col"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody id="licenses-tbody" role="rowgroup"></tbody>
        </table>
      </div>
    </div>
  `;

  watch('items', (items) => {
    cvx.$('#licenses-tbody')!.innerHTML = renderLicenseRows(items);
    cvx.$('#count-label')!.textContent = `${items.length} license${items.length !== 1 ? 's' : ''}`;
  });

  watch('editId', (id) => {
    cvx.toggleClass(cvx.$('#edit-form'), 'hidden', !id);
    if (id) {
      cvx.$<HTMLInputElement>('#ef-product')?.focus();
    }
  });

  const tableBody = cvx.$('#licenses-tbody')!;
  cvx.delegate<HTMLButtonElement>(tableBody, 'click', 'button', (_, btn) => {
    const id = (btn as HTMLElement).dataset.id!;
    const action = (btn as HTMLElement).dataset.action!;

    if (action === 'edit') {
      announce('Loading license data for editing');
      const license = window.services.license.getLicense(createLicenseId(id));
      license.then((l: any) => {
        if (!l) return;
        (cvx.$('#ef-product') as HTMLInputElement).value = l.productName;
        (cvx.$('#ef-assigned') as HTMLInputElement).value = l.assignedTo;
        (cvx.$('#ef-expires') as HTMLInputElement).value = l.expiresAt
          ? new Date(l.expiresAt).toISOString().split('T')[0]
          : '';
        state.editId = id;
        announce('Edit form opened. Product name field is now focused.');
      });
      return;
    }

    if (action === 'revoke') {
      announce(`Revoking license ${id}`);
      window.services.license.revokeLicense(createLicenseId(id)).then(() => {
        announce('License revoked successfully');
        refreshLicenses();
      });
      return;
    }
    if (action === 'delete') {
      announce(`Deleting license ${id}`);
      window.services.license.deleteLicense(createLicenseId(id)).then(() => {
        announce('License deleted successfully');
        refreshLicenses();
      });
      return;
    }
  });

  const createForm = cvx.$<HTMLFormElement>('#create-form')!;
  cvx.on(createForm, 'submit', async (e) => {
    e.preventDefault();
    const productName = (cvx.$('#f-product') as HTMLInputElement)?.value?.trim();
    const assignedTo = (cvx.$('#f-assigned') as HTMLInputElement)?.value?.trim();
    const expiresRaw = (cvx.$('#f-expires') as HTMLInputElement)?.value;

    if (!productName || !assignedTo) {
      announce('Error: Product name and assigned email are required', 'assertive');
      return;
    }

    announce('Creating license...');
    await window.services.license.createLicense({
      productName,
      assignedTo,
      expiresAt: expiresRaw ? new Date(expiresRaw) : undefined,
    });

    (cvx.$('#f-product') as HTMLInputElement).value = '';
    (cvx.$('#f-assigned') as HTMLInputElement).value = '';
    (cvx.$('#f-expires') as HTMLInputElement).value = '';
    cvx.$<HTMLInputElement>('#f-product')?.focus();

    announce('License created successfully');
    await refreshLicenses();
  });

  cvx.on(cvx.$('#btn-cancel-edit'), 'click', () => { 
    state.editId = '';
    announce('Edit cancelled');
  });

  const editFormInner = cvx.$<HTMLFormElement>('#edit-form-inner')!;
  cvx.on(editFormInner, 'submit', async (e) => {
    e.preventDefault();
    if (!state.editId) return;

    const productName = (cvx.$('#ef-product') as HTMLInputElement)?.value?.trim() || '';
    const assignedTo = (cvx.$('#ef-assigned') as HTMLInputElement)?.value?.trim() || '';
    const expiresRaw = (cvx.$('#ef-expires') as HTMLInputElement)?.value;

    announce('Updating license...');
    await window.services.license.updateLicense(createLicenseId(state.editId), {
      productName,
      assignedTo,
      expiresAt: expiresRaw ? new Date(expiresRaw) : undefined,
    });

    state.editId = '';
    announce('License updated successfully');
    await refreshLicenses();
  });

  await refreshLicenses();
}

async function renderGenericPage(
  title: string,
  serviceName: string,
  columns: { key: string; label: string; class?: string }[],
  renderRow: (item: any) => string,
  getFormFields: () => { id: string; label: string; placeholder?: string }[]
) {
  const content = cvx.$('#page-content')!;
  const { state, watch } = createReactive({
    items: [] as any[],
    editId: '',
  });

  async function refreshItems() {
    state.items = await window.services[serviceName].findAll();
  }

  const fields = getFormFields();
  const fieldsHtml = fields.map(f => `
    <div>
      <label class="block text-xs text-gray-400 mb-1.5">${f.label}</label>
      <input id="f-${f.id}" type="text" placeholder="${f.placeholder || ''}"
        class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  `).join('');

  content.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white">${title}</h2>
          <p class="text-sm text-gray-400 mt-0.5" id="count-label"></p>
        </div>
        <button id="btn-new" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
          + New ${title}
        </button>
      </div>

      <div id="form-panel" class="hidden bg-gray-800 border border-gray-700 rounded-lg p-5">
        <h3 class="text-sm font-semibold text-white mb-4" id="form-title">New ${title}</h3>
        <div class="grid grid-cols-2 gap-4">
          ${fieldsHtml}
        </div>
        <div class="flex gap-3 mt-4">
          <button id="btn-submit" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">Save</button>
          <button id="btn-cancel" class="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium px-4 py-2 rounded-md transition-colors">Cancel</button>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-700">
              ${columns.map(c => `
                <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider ${c.class || ''}">${c.label}</th>
              `).join('')}
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody id="items-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  watch('items', (items) => {
    cvx.$('#items-tbody')!.innerHTML = items.length
      ? items.map(renderRow).join('')
      : `<tr><td colspan="${columns.length + 1}" class="px-4 py-10 text-center text-sm text-gray-500">No ${title.toLowerCase()}s yet.</td></tr>`;
    cvx.$('#count-label')!.textContent = `${items.length} ${title.toLowerCase()}${items.length !== 1 ? 's' : ''}`;
  });

  watch('editId', (id) => {
    cvx.toggleClass(cvx.$('#form-panel'), 'hidden', !id);
    cvx.$('#form-title')!.textContent = id ? `Edit ${title}` : `New ${title}`;
  });

  const tableBody = cvx.$('#items-tbody')!;
  cvx.delegate<HTMLButtonElement>(tableBody, 'click', 'button', (_, btn) => {
    const id = (btn as HTMLElement).dataset.id!;
    const action = (btn as HTMLElement).dataset.action!;

    if (action === 'edit') {
      const item = window.services[serviceName].findById(id);
      item.then((i: any) => {
        if (!i) return;
        fields.forEach(f => {
          (cvx.$(`#ef-${f.id}`) as HTMLInputElement).value = i[f.id] || '';
        });
        state.editId = id;
      });
      return;
    }

    if (action === 'toggle') window.services[serviceName].toggleStatus(id);
    if (action === 'delete') window.services[serviceName].delete(id);
    refreshItems();
  });

  cvx.on(cvx.$('#btn-new'), 'click', () => {
    state.editId = '';
    fields.forEach(f => (cvx.$(`#f-${f.id}`) as HTMLInputElement).value = '');
    cvx.$('#form-title')!.textContent = `New ${title}`;
    cvx.show(cvx.$('#form-panel'));
  });

  cvx.on(cvx.$('#btn-cancel'), 'click', () => { state.editId = ''; });

  cvx.on(cvx.$('#btn-submit'), 'click', async () => {
    const data: Record<string, string> = {};
    fields.forEach(f => {
      data[f.id] = (cvx.$(`#f-${f.id}`) as HTMLInputElement)?.value.trim() || '';
    });

    const service = window.services[serviceName];
    if (state.editId) {
      await service.update(state.editId, data);
    } else {
      await service.create(data);
    }

    state.editId = '';
    await refreshItems();
  });

  await refreshItems();
}

function renderPage(path: string) {
  switch (path) {
    case '/licenses':
      renderLicensesPage();
      break;
    case '/users':
      renderGenericPage('Users', 'user', [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email', class: 'text-gray-300' },
        { key: 'role', label: 'Role', class: 'capitalize' },
        { key: 'status', label: 'Status' },
      ], (u: any) => `
        <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
          <td class="px-4 py-3 text-white">${u.name}</td>
          <td class="px-4 py-3 text-gray-300">${u.email}</td>
          <td class="px-4 py-3 text-gray-300 capitalize">${u.role}</td>
          <td class="px-4 py-3">${statusBadge(u.status)}</td>
          <td class="px-4 py-3">${actionButtons(u.id, u.status)}</td>
        </tr>
      `, () => [
        { id: 'name', label: 'Name', placeholder: 'John Doe' },
        { id: 'email', label: 'Email', placeholder: 'john@example.com' },
        { id: 'role', label: 'Role', placeholder: 'viewer' },
      ]);
      break;
    case '/products':
      renderGenericPage('Products', 'product', [
        { key: 'name', label: 'Name' },
        { key: 'version', label: 'Version', class: 'font-mono text-xs text-gray-300' },
        { key: 'description', label: 'Description', class: 'max-w-xs truncate text-gray-400' },
        { key: 'status', label: 'Status' },
      ], (p: any) => `
        <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
          <td class="px-4 py-3 text-white">${p.name}</td>
          <td class="px-4 py-3 font-mono text-xs text-gray-300">${p.version}</td>
          <td class="px-4 py-3 text-gray-400 max-w-xs truncate">${p.description || '—'}</td>
          <td class="px-4 py-3">${statusBadge(p.status)}</td>
          <td class="px-4 py-3">${actionButtons(p.id, p.status)}</td>
        </tr>
      `, () => [
        { id: 'name', label: 'Name', placeholder: 'My Product' },
        { id: 'version', label: 'Version', placeholder: '1.0.0' },
        { id: 'description', label: 'Description', placeholder: 'Product description' },
      ]);
      break;
    case '/bundles':
      renderGenericPage('Bundles', 'bundle', [
        { key: 'name', label: 'Name' },
        { key: 'products', label: 'Products', class: 'text-xs text-gray-400' },
        { key: 'description', label: 'Description', class: 'max-w-xs truncate text-gray-400' },
        { key: 'status', label: 'Status' },
      ], (b: any) => `
        <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
          <td class="px-4 py-3 text-white">${b.name}</td>
          <td class="px-4 py-3 text-gray-400 text-xs">${(b.productIds || []).length} product${(b.productIds || []).length !== 1 ? 's' : ''}</td>
          <td class="px-4 py-3 text-gray-400 max-w-xs truncate">${b.description || '—'}</td>
          <td class="px-4 py-3">${statusBadge(b.status)}</td>
          <td class="px-4 py-3">${actionButtons(b.id, b.status)}</td>
        </tr>
      `, () => [
        { id: 'name', label: 'Name', placeholder: 'Bundle Name' },
        { id: 'description', label: 'Description', placeholder: 'Bundle description' },
      ]);
      break;
    case '/clients':
      renderGenericPage('Clients', 'client', [
        { key: 'name', label: 'Name' },
        { key: 'contact', label: 'Contact', class: 'text-gray-300' },
        { key: 'company', label: 'Company', class: 'text-gray-400' },
        { key: 'status', label: 'Status' },
      ], (c: any) => `
        <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
          <td class="px-4 py-3 text-white">${c.name}</td>
          <td class="px-4 py-3 text-gray-300">${c.contact}</td>
          <td class="px-4 py-3 text-gray-400">${c.company || '—'}</td>
          <td class="px-4 py-3">${statusBadge(c.status)}</td>
          <td class="px-4 py-3">${actionButtons(c.id, c.status)}</td>
        </tr>
      `, () => [
        { id: 'name', label: 'Name', placeholder: 'Client Name' },
        { id: 'contact', label: 'Contact', placeholder: 'contact@company.com' },
        { id: 'company', label: 'Company', placeholder: 'Company Inc.' },
      ]);
      break;
    default:
      cvx.$('#page-content')!.innerHTML = '<div class="text-gray-400">Page not found</div>';
  }
}

// Navegación inicial — usa el hash actual o redirige a /licenses
router.navigate(window.location.hash.slice(1) || '/licenses');
