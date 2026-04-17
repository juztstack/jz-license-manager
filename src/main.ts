import './style.css';
import './services';
import { authState } from './ui/auth/state';
import { createLicenseId } from './core/domain/value-objects/LicenseId';
import { statusBadge, actionButtons } from './ui/shared/badges';

// ─── Global declarations ───
declare global {
  interface Window {
    authState: typeof authState;
    router: {
      navigate(path: string): void;
    };
    services: Record<string, any>;
  }
}

window.authState = authState;

// ─── Simple Hash Router ───
const router = {
  navigate(path: string) {
    window.location.hash = path;
    handleRoute();
  },
};

window.router = router;

// ─── License Status Styles ───
const STATUS_CLS: Record<string, string> = {
  active: 'bg-green-900/60 text-green-300',
  inactive: 'bg-gray-700 text-gray-300',
  expired: 'bg-yellow-900/60 text-yellow-300',
  revoked: 'bg-red-900/60 text-red-300',
};

// ─── Route Handler ───
function handleRoute() {
  const path = window.location.hash.slice(1) || '/';
  const app = document.getElementById('app')!;
  
  if (path !== '/login' && !authState.isAuthenticated()) {
    router.navigate('/login');
    return;
  }

  if (path === '/login') {
    renderLogin(app);
  } else {
    renderAppLayout(app, path);
  }
}

// ─── Login Page ───
function renderLogin(container: HTMLElement) {
  const state = {
    email: '',
    password: '',
    errorVisible: false,
    errorMsg: '',
  };
  
  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-white">JZ License Manager</h1>
          <p class="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>
        <div class="block bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-5" id="login-form">
          <div id="error-alert" class="rounded-md bg-red-900/50 border border-red-700 px-3 py-2 ${state.errorVisible ? '' : 'hidden'}">
            <p class="text-sm text-red-300" id="error-msg">${state.errorMsg}</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
            <input id="input-email" type="email" placeholder="admin@example.com"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
            <input id="input-password" type="password" placeholder="••••••••"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button id="btn-login" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 rounded-md transition-colors">
            Sign in
          </button>
        </div>
      </div>
    </div>
  `;
  
  const emailInput = document.getElementById('input-email') as HTMLInputElement;
  const passwordInput = document.getElementById('input-password') as HTMLInputElement;
  const loginBtn = document.getElementById('btn-login') as HTMLButtonElement;
  const errorAlert = document.getElementById('error-alert') as HTMLElement;
  const errorMsg = document.getElementById('error-msg') as HTMLElement;
  
  emailInput?.addEventListener('input', () => {
    state.email = emailInput.value;
  });
  
  passwordInput?.addEventListener('input', () => {
    state.password = passwordInput.value;
  });
  
  passwordInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginBtn?.click();
  });
  
  loginBtn?.addEventListener('click', () => {
    const email = state.email.trim();
    const password = state.password.trim();
    
    if (!email || !password) {
      state.errorMsg = 'Email and password are required.';
      state.errorVisible = true;
      errorAlert.classList.remove('hidden');
      errorMsg.textContent = state.errorMsg;
      return;
    }
    
    if (email === 'admin@example.com' && password === 'admin') {
      authState.login();
      router.navigate('/licenses');
    } else {
      state.errorMsg = 'Invalid credentials.';
      state.errorVisible = true;
      errorAlert.classList.remove('hidden');
      errorMsg.textContent = state.errorMsg;
    }
  });
}

// ─── App Layout ───
function renderAppLayout(container: HTMLElement, activePath: string) {
  const isActive = (path: string) => activePath.startsWith(path) 
    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' 
    : 'text-gray-400 hover:bg-gray-700/60 hover:text-white';

  container.innerHTML = `
    <div class="flex min-h-screen">
      <aside class="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div class="p-4 border-b border-gray-700">
          <h1 class="text-lg font-bold text-white">JZ License Manager</h1>
        </div>
        <nav class="flex-1 p-4 space-y-1">
          <a href="#/licenses" class="nav-link flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/licenses')} transition-colors">
            Licenses
          </a>
          <a href="#/users" class="nav-link flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/users')} transition-colors">
            Users
          </a>
          <a href="#/products" class="nav-link flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/products')} transition-colors">
            Products
          </a>
          <a href="#/bundles" class="nav-link flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/bundles')} transition-colors">
            Bundles
          </a>
          <a href="#/clients" class="nav-link flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/clients')} transition-colors">
            Clients
          </a>
        </nav>
        <div class="p-4 border-t border-gray-700">
          <button id="btn-logout" class="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700/60 hover:text-white transition-colors">
            Logout
          </button>
        </div>
      </aside>
      <main class="flex-1 p-8">
        <div id="page-content"></div>
      </main>
    </div>
  `;
  
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    authState.logout();
    router.navigate('/login');
  });

  renderPage(activePath);
}

// ─── License Actions ───
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

// ─── Render Rows ───
function renderLicenseRows(licenses: any[]): string {
  if (!licenses.length) {
    return `<tr>
      <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-500">
        No licenses yet. Create one using the form below.
      </td>
    </tr>`;
  }
  return licenses.map((l: any) => `
    <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
      <td class="px-4 py-3 font-mono text-xs text-gray-300">${l.key}</td>
      <td class="px-4 py-3 text-white">${l.productName}</td>
      <td class="px-4 py-3 text-gray-300">${l.assignedTo}</td>
      <td class="px-4 py-3">
        <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_CLS[l.status] ?? ''}">
          ${l.status}
        </span>
      </td>
      <td class="px-4 py-3 text-gray-400 text-xs">
        ${l.expiresAt ? new Date(l.expiresAt).toLocaleDateString() : '—'}
      </td>
      <td class="px-4 py-3">${licenseActions(l.id, l.status)}</td>
    </tr>
  `).join('');
}

// ─── Licenses Page ───
async function renderLicensesPage(container: HTMLElement) {
  const licenses = await window.services.license.listLicenses();
  
  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white">Licenses</h2>
          <p class="text-sm text-gray-400 mt-0.5" id="count-label">${licenses.length} license${licenses.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <!-- Create form -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-5">
        <h3 class="text-sm font-semibold text-white mb-4">Create New License</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-400 mb-1.5">Product Name</label>
            <input id="f-product" type="text" placeholder="My App Pro"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1.5">Assigned To</label>
            <input id="f-assigned" type="text" placeholder="user@example.com"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1.5">Expires At <span class="text-gray-500">(optional)</span></label>
            <input id="f-expires" type="date"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div class="flex gap-3 mt-4">
          <button id="btn-create" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">Create</button>
        </div>
      </div>

      <!-- Edit form (hidden by default) -->
      <div id="edit-form" class="bg-gray-800 border border-gray-700 rounded-lg p-5 hidden">
        <h3 class="text-sm font-semibold text-white mb-4">Edit License</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-400 mb-1.5">Product Name</label>
            <input id="ef-product" type="text"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1.5">Assigned To</label>
            <input id="ef-assigned" type="text"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1.5">Expires At</label>
            <input id="ef-expires" type="date"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div class="flex gap-3 mt-4">
          <button id="btn-update" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">Update</button>
          <button id="btn-cancel-edit" class="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium px-4 py-2 rounded-md transition-colors">Cancel</button>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-700">
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Key</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Assigned To</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Expires</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody id="licenses-tbody">
            ${renderLicenseRows(licenses)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  let editId = '';

  document.getElementById('btn-create')?.addEventListener('click', async () => {
    const productName = (document.getElementById('f-product') as HTMLInputElement)?.value?.trim();
    const assignedTo = (document.getElementById('f-assigned') as HTMLInputElement)?.value?.trim();
    const expiresRaw = (document.getElementById('f-expires') as HTMLInputElement)?.value;

    if (!productName || !assignedTo) return;

    await window.services.license.createLicense({
      productName,
      assignedTo,
      expiresAt: expiresRaw ? new Date(expiresRaw) : undefined,
    });

    await refreshLicenses();
  });

  function bindActions() {
    document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id!;
        const action = btn.dataset.action!;
        
        if (action === 'edit') {
          const license = await window.services.license.getLicense(createLicenseId(id));
          if (!license) return;
          (document.getElementById('ef-product') as HTMLInputElement).value = license.productName;
          (document.getElementById('ef-assigned') as HTMLInputElement).value = license.assignedTo;
          (document.getElementById('ef-expires') as HTMLInputElement).value = license.expiresAt
            ? new Date(license.expiresAt).toISOString().split('T')[0]
            : '';
          editId = id;
          document.getElementById('edit-form')?.classList.remove('hidden');
          return;
        }
        
        if (action === 'revoke') await window.services.license.revokeLicense(createLicenseId(id));
        if (action === 'delete') await window.services.license.deleteLicense(createLicenseId(id));
        await refreshLicenses();
      });
    });
  }

  document.getElementById('btn-cancel-edit')?.addEventListener('click', () => {
    editId = '';
    document.getElementById('edit-form')?.classList.add('hidden');
  });

  document.getElementById('btn-update')?.addEventListener('click', async () => {
    if (!editId) return;
    const productName = (document.getElementById('ef-product') as HTMLInputElement)?.value?.trim();
    const assignedTo = (document.getElementById('ef-assigned') as HTMLInputElement)?.value?.trim();
    const expiresRaw = (document.getElementById('ef-expires') as HTMLInputElement)?.value;

    await window.services.license.updateLicense(createLicenseId(editId), {
      productName,
      assignedTo,
      expiresAt: expiresRaw ? new Date(expiresRaw) : undefined,
    });

    editId = '';
    document.getElementById('edit-form')?.classList.add('hidden');
    await refreshLicenses();
  });

  async function refreshLicenses() {
    const all = await window.services.license.listLicenses();
    document.getElementById('licenses-tbody')!.innerHTML = renderLicenseRows(all);
    document.getElementById('count-label')!.textContent = `${all.length} license${all.length !== 1 ? 's' : ''}`;
    bindActions();
  }

  bindActions();
}

// ─── Generic Table Page Template ───
async function renderGenericPage(
  container: HTMLElement,
  title: string,
  serviceName: string,
  columns: { key: string; label: string; class?: string }[],
  renderRow: (item: any) => string,
  getFormFields: () => { id: string; label: string; placeholder?: string }[]
) {
  const items = await window.services[serviceName].findAll();
  
  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white">${title}</h2>
          <p class="text-sm text-gray-400 mt-0.5" id="count-label">${items.length} ${title.toLowerCase()}${items.length !== 1 ? 's' : ''}</p>
        </div>
        <button id="btn-new" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
          + New ${title}
        </button>
      </div>

      <!-- Create/Edit form -->
      <div id="form-panel" class="bg-gray-800 border border-gray-700 rounded-lg p-5 hidden">
        <h3 class="text-sm font-semibold text-white mb-4" id="form-title">New ${title}</h3>
        <div class="grid grid-cols-2 gap-4">
          ${getFormFields().map(f => `
            <div>
              <label class="block text-xs text-gray-400 mb-1.5">${f.label}</label>
              <input id="f-${f.id}" type="text" placeholder="${f.placeholder || ''}"
                class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          `).join('')}
        </div>
        <div class="flex gap-3 mt-4">
          <button id="btn-submit" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">Save</button>
          <button id="btn-cancel" class="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium px-4 py-2 rounded-md transition-colors">Cancel</button>
        </div>
      </div>

      <!-- Table -->
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
          <tbody id="items-tbody">
            ${items.length ? items.map(renderRow).join('') : `<tr><td colspan="${columns.length + 1}" class="px-4 py-10 text-center text-sm text-gray-500">No ${title.toLowerCase()}s yet.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;

  let editId = '';
  const fields = getFormFields();

  document.getElementById('btn-new')?.addEventListener('click', () => {
    editId = '';
    fields.forEach(f => (document.getElementById(`f-${f.id}`) as HTMLInputElement).value = '');
    document.getElementById('form-title')!.textContent = `New ${title}`;
    document.getElementById('form-panel')?.classList.remove('hidden');
  });

  document.getElementById('btn-cancel')?.addEventListener('click', () => {
    editId = '';
    document.getElementById('form-panel')?.classList.add('hidden');
  });

  document.getElementById('btn-submit')?.addEventListener('click', async () => {
    const data: Record<string, string> = {};
    fields.forEach(f => {
      data[f.id] = (document.getElementById(`f-${f.id}`) as HTMLInputElement).value.trim();
    });

    const service = window.services[serviceName];
    if (editId) {
      await service.update(editId, data);
    } else {
      await service.create(data);
    }

    editId = '';
    document.getElementById('form-panel')?.classList.add('hidden');
    await refreshItems();
  });

  function bindActions() {
    document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id!;
        const action = btn.dataset.action!;
        
        if (action === 'edit') {
          const item = await window.services[serviceName].findById(id);
          if (!item) return;
          fields.forEach(f => {
            (document.getElementById(`f-${f.id}`) as HTMLInputElement).value = item[f.id] || '';
          });
          editId = id;
          document.getElementById('form-title')!.textContent = `Edit ${title}`;
          document.getElementById('form-panel')?.classList.remove('hidden');
          return;
        }
        
        if (action === 'toggle') await window.services[serviceName].toggleStatus(id);
        if (action === 'delete') await window.services[serviceName].delete(id);
        await refreshItems();
      });
    });
  }

  async function refreshItems() {
    const all = await window.services[serviceName].findAll();
    document.getElementById('items-tbody')!.innerHTML = all.length 
      ? all.map(renderRow).join('')
      : `<tr><td colspan="${columns.length + 1}" class="px-4 py-10 text-center text-sm text-gray-500">No ${title.toLowerCase()}s yet.</td></tr>`;
    document.getElementById('count-label')!.textContent = `${all.length} ${title.toLowerCase()}${all.length !== 1 ? 's' : ''}`;
    bindActions();
  }

  bindActions();
}

// ─── Users Page ───
async function renderUsersPage(container: HTMLElement) {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email', class: 'text-gray-300' },
    { key: 'role', label: 'Role', class: 'capitalize' },
    { key: 'status', label: 'Status' },
  ];

  await renderGenericPage(
    container,
    'Users',
    'user',
    columns,
    (u: any) => `
      <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
        <td class="px-4 py-3 text-white">${u.name}</td>
        <td class="px-4 py-3 text-gray-300">${u.email}</td>
        <td class="px-4 py-3 text-gray-300 capitalize">${u.role}</td>
        <td class="px-4 py-3">${statusBadge(u.status)}</td>
        <td class="px-4 py-3">${actionButtons(u.id, u.status)}</td>
      </tr>
    `,
    () => [
      { id: 'name', label: 'Name', placeholder: 'John Doe' },
      { id: 'email', label: 'Email', placeholder: 'john@example.com' },
      { id: 'role', label: 'Role', placeholder: 'viewer' },
    ]
  );
}

// ─── Products Page ───
async function renderProductsPage(container: HTMLElement) {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'version', label: 'Version', class: 'font-mono text-xs text-gray-300' },
    { key: 'description', label: 'Description', class: 'max-w-xs truncate text-gray-400' },
    { key: 'status', label: 'Status' },
  ];

  await renderGenericPage(
    container,
    'Products',
    'product',
    columns,
    (p: any) => `
      <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
        <td class="px-4 py-3 text-white">${p.name}</td>
        <td class="px-4 py-3 font-mono text-xs text-gray-300">${p.version}</td>
        <td class="px-4 py-3 text-gray-400 max-w-xs truncate">${p.description || '—'}</td>
        <td class="px-4 py-3">${statusBadge(p.status)}</td>
        <td class="px-4 py-3">${actionButtons(p.id, p.status)}</td>
      </tr>
    `,
    () => [
      { id: 'name', label: 'Name', placeholder: 'My Product' },
      { id: 'version', label: 'Version', placeholder: '1.0.0' },
      { id: 'description', label: 'Description', placeholder: 'Product description' },
    ]
  );
}

// ─── Bundles Page ───
async function renderBundlesPage(container: HTMLElement) {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'products', label: 'Products', class: 'text-xs text-gray-400' },
    { key: 'description', label: 'Description', class: 'max-w-xs truncate text-gray-400' },
    { key: 'status', label: 'Status' },
  ];

  await renderGenericPage(
    container,
    'Bundles',
    'bundle',
    columns,
    (b: any) => `
      <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
        <td class="px-4 py-3 text-white">${b.name}</td>
        <td class="px-4 py-3 text-gray-400 text-xs">${(b.productIds || []).length} product${(b.productIds || []).length !== 1 ? 's' : ''}</td>
        <td class="px-4 py-3 text-gray-400 max-w-xs truncate">${b.description || '—'}</td>
        <td class="px-4 py-3">${statusBadge(b.status)}</td>
        <td class="px-4 py-3">${actionButtons(b.id, b.status)}</td>
      </tr>
    `,
    () => [
      { id: 'name', label: 'Name', placeholder: 'Bundle Name' },
      { id: 'description', label: 'Description', placeholder: 'Bundle description' },
    ]
  );
}

// ─── Clients Page ───
async function renderClientsPage(container: HTMLElement) {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'contact', label: 'Contact', class: 'text-gray-300' },
    { key: 'company', label: 'Company', class: 'text-gray-400' },
    { key: 'status', label: 'Status' },
  ];

  await renderGenericPage(
    container,
    'Clients',
    'client',
    columns,
    (c: any) => `
      <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
        <td class="px-4 py-3 text-white">${c.name}</td>
        <td class="px-4 py-3 text-gray-300">${c.contact}</td>
        <td class="px-4 py-3 text-gray-400">${c.company || '—'}</td>
        <td class="px-4 py-3">${statusBadge(c.status)}</td>
        <td class="px-4 py-3">${actionButtons(c.id, c.status)}</td>
      </tr>
    `,
    () => [
      { id: 'name', label: 'Name', placeholder: 'Client Name' },
      { id: 'contact', label: 'Contact', placeholder: 'contact@company.com' },
      { id: 'company', label: 'Company', placeholder: 'Company Inc.' },
    ]
  );
}

// ─── Render Page ───
async function renderPage(path: string) {
  const content = document.getElementById('page-content')!;
  
  switch (path) {
    case '/licenses':
      await renderLicensesPage(content);
      break;
    case '/users':
      await renderUsersPage(content);
      break;
    case '/products':
      await renderProductsPage(content);
      break;
    case '/bundles':
      await renderBundlesPage(content);
      break;
    case '/clients':
      await renderClientsPage(content);
      break;
    default:
      content.innerHTML = '<div class="text-gray-400">Page not found</div>';
  }
}

// ─── Boot ───
window.addEventListener('hashchange', handleRoute);
handleRoute();
