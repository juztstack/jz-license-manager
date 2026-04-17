// ─────────────────────────────────────────
// @corvux/core — cvx.ts
// Utility helpers: selectors, events, template
// ─────────────────────────────────────────

// ─── Type definitions ───────────────────

type CvxSelector = string | Element | null;
type CvxElement = Element | Window | Document;
type CvxEventHandler = (event: Event, ...args: unknown[]) => void;

// ─── cvx: Main utility object ─────────────

export const cvx = {
  // ── Selectors ──────────────────────────

  /**
   * Select first matching element
   * cvx('div'), cvx('.class'), cvx('#id'), cvx(el)
   */
  select<T extends Element = Element>(selector: CvxSelector): T | null {
    if (!selector) return null;
    if (typeof selector === 'object' && 'querySelector' in selector) {
      return selector as T;
    }
    if (typeof selector === 'string') {
      if (selector.startsWith('#') && !selector.includes(' ')) {
        return document.getElementById(selector.slice(1)) as T | null;
      }
      return document.querySelector(selector) as T | null;
    }
    return null;
  },

  /**
   * Alias for cvx.select
   */
  $: function<T extends Element = Element>(selector: CvxSelector): T | null {
    return cvx.select<T>(selector);
  },

  /**
   * Select all matching elements (returns Array)
   * cvxx('li'), cvxx('.item')
   */
  selectAll<T extends Element = Element>(selector: string): T[] {
    if (typeof selector !== 'string') return [];
    return Array.from(document.querySelectorAll(selector)) as T[];
  },

  /**
   * Alias for cvx.selectAll
   */
  $$: function<T extends Element = Element>(selector: string): T[] {
    return cvx.selectAll<T>(selector);
  },

  // ── Events ─────────────────────────────

  /**
   * Add event listener
   * cvx.on(el, 'click', handler)
   */
  on(el: CvxElement | null, event: string, handler: CvxEventHandler, options?: AddEventListenerOptions): () => void {
    if (!el) return () => {};
    const fn = handler as EventListener;
    el.addEventListener(event, fn, options);
    return () => {
      el.removeEventListener(event, fn, options);
    };
  },

  /**
   * Remove event listener
   * cvx.off(el, 'click', handler)
   */
  off(el: CvxElement | null, event: string, handler: CvxEventHandler): void {
    if (!el) return;
    el.removeEventListener(event, handler as EventListener);
  },

  /**
   * Add one-time event listener
   * cvx.once(el, 'click', handler)
   */
  once(el: CvxElement | null, event: string, handler: CvxEventHandler): void {
    if (!el) return;
    const wrappedHandler: EventListener = (e: Event) => {
      handler(e);
      el.removeEventListener(event, wrappedHandler);
    };
    el.addEventListener(event, wrappedHandler);
  },

  /**
   * Dispatch custom event
   * cvx.emit(el, 'my-event', { data: 123 })
   */
  emit(el: CvxElement | null, event: string, detail?: unknown): void {
    if (!el) return;
    el.dispatchEvent(new CustomEvent(event, { detail, bubbles: true }));
  },

  /**
   * Delegate event to children matching selector
   * cvx.delegate(el, 'click', 'button', handler)
   */
  delegate<T extends Element = Element>(
    el: CvxElement | null,
    event: string,
    selector: string,
    handler: (event: Event, target: T) => void
  ): () => void {
    if (!el) return () => {};
    const fn = (e: Event) => {
      const target = (e.target as Element).closest(selector) as T | null;
      if (target) handler(e, target);
    };
    el.addEventListener(event, fn);
    return () => el.removeEventListener(event, fn);
  },

  // ── Template Engine ────────────────────

  /**
   * Compile template with data
   * cvx.template('<p>{{name}}</p>', { name: 'Ana' })
   * Supports {{text}} and {{{html}}} for raw HTML
   */
  template(html: string, data: Record<string, unknown> = {}): string {
    return html
      .replace(/\{\{\{(.+?)\}\}\}/g, (_, key) => {
        const value = getNestedValue(data, key.trim());
        return value == null ? '' : String(value);
      })
      .replace(/\{\{(.+?)\}\}/g, (_, key) => {
        const value = getNestedValue(data, key.trim());
        return value == null ? '' : escapeHtml(String(value));
      });
  },

  /**
   * Compile template from element content
   * cvx.compile(el, data) - modifies element innerHTML
   */
  compile(el: Element | null, data: Record<string, unknown> = {}): Element | null {
    if (!el) return null;
    const html = el.innerHTML;
    el.innerHTML = cvx.template(html, data);
    return el;
  },

  /**
   * Create template element
   * cvx.create('<div>...</div>')
   */
  create(html: string): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild as HTMLElement;
  },

  // ── DOM Utilities ──────────────────────

  /**
   * Toggle class
   * cvx.toggleClass(el, 'active')
   * cvx.toggleClass(el, 'active', true) // force add
   */
  toggleClass(el: Element | null, className: string, force?: boolean): void {
    if (!el) return;
    el.classList.toggle(className, force);
  },

  /**
   * Add class(es)
   * cvx.addClass(el, 'active', 'bold')
   */
  addClass(el: Element | null, ...classes: string[]): void {
    if (!el) return;
    el.classList.add(...classes);
  },

  /**
   * Remove class(es)
   * cvx.removeClass(el, 'active', 'bold')
   */
  removeClass(el: Element | null, ...classes: string[]): void {
    if (!el) return;
    el.classList.remove(...classes);
  },

  /**
   * Show element
   * cvx.show(el)
   * cvx.show(el, 'flex')
   */
  show(el: Element | null, display: string = 'block'): void {
    if (!el) return;
    el.removeAttribute('hidden');
    (el as HTMLElement).style.display = display;
  },

  /**
   * Hide element
   * cvx.hide(el)
   */
  hide(el: Element | null): void {
    if (!el) return;
    el.setAttribute('hidden', '');
    (el as HTMLElement).style.display = 'none';
  },

  /**
   * Toggle visibility
   * cvx.toggle(el)
   */
  toggle(el: Element | null): void {
    if (!el) return;
    const isHidden = el.hasAttribute('hidden') || (el as HTMLElement).style.display === 'none';
    isHidden ? cvx.show(el) : cvx.hide(el);
  },

  /**
   * Set/get data attributes
   * cvx.data(el, 'name', 'value') // set
   * cvx.data(el, 'name') // get
   */
  data<T = unknown>(el: Element | null, key: string, value?: T): T | void {
    if (!el) return;
    if (value === undefined) {
      return (el as HTMLElement).dataset[key] as T;
    }
    (el as HTMLElement).dataset[key] = String(value);
  },

  /**
   * Empty element content
   * cvx.empty(el)
   */
  empty(el: Element | null): void {
    if (!el) return;
    el.innerHTML = '';
  },

  /**
   * Remove element from DOM
   * cvx.remove(el)
   */
  remove(el: Element | null): void {
    if (!el) return;
    el.remove();
  },

  /**
   * Append child
   * cvx.append(parent, '<div>...</div>')
   */
  append(parent: Element | null, child: string | Element): Element | null {
    if (!parent) return null;
    if (typeof child === 'string') {
      parent.insertAdjacentHTML('beforeend', child);
    } else {
      parent.appendChild(child);
    }
    return parent.lastElementChild;
  },

  /**
   * Prepend child
   * cvx.prepend(parent, '<div>...</div>')
   */
  prepend(parent: Element | null, child: string | Element): Element | null {
    if (!parent) return null;
    if (typeof child === 'string') {
      parent.insertAdjacentHTML('afterbegin', child);
    } else {
      parent.insertBefore(child, parent.firstChild);
    }
    return parent.firstElementChild;
  },

  /**
   * Replace element content
   * cvx.html(el, '<p>new</p>')
   */
  html(el: Element | null, content?: string): string {
    if (!el) return '';
    if (content === undefined) return el.innerHTML;
    el.innerHTML = content;
    return content;
  },

  /**
   * Get/set text content
   * cvx.text(el, 'hello')
   */
  text(el: Element | null, content?: string): string {
    if (!el) return '';
    if (content === undefined) return el.textContent ?? '';
    el.textContent = content;
    return content;
  },

  /**
   * Get/set attribute
   * cvx.attr(el, 'disabled')
   * cvx.attr(el, 'disabled', true)
   */
  attr(el: Element | null, name: string, value?: string | boolean): string | void {
    if (!el) return;
    if (value === undefined) return el.getAttribute(name) ?? '';
    if (value === false) {
      el.removeAttribute(name);
    } else {
      el.setAttribute(name, String(value));
    }
  },

  /**
   * Check if element matches selector
   * cvx.is(el, '.active')
   */
  is(el: Element | null, selector: string): boolean {
    if (!el) return false;
    return el.matches(selector);
  },

  /**
   * Find closest parent matching selector
   * cvx.closest(el, '.parent')
   */
  closest<T extends Element = Element>(el: Element | null, selector: string): T | null {
    if (!el) return null;
    return el.closest(selector) as T | null;
  },

  // ── Debounce / Throttle ────────────────

  /**
   * Debounce function
   * const debounced = cvx.debounce(fn, 300)
   */
  debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  },

  /**
   * Throttle function
   * const throttled = cvx.throttle(fn, 300)
   */
  throttle<T extends (...args: unknown[]) => unknown>(fn: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle = false;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => { inThrottle = false; }, limit);
      }
    };
  },

  // ── HTTP Client ────────────────────────

  http: {
    baseUrl: '',

    async get<T = unknown>(url: string, options?: RequestInit): Promise<T> {
      return httpRequest<T>(url, { ...options, method: 'GET' });
    },

    async post<T = unknown>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
      return httpRequest<T>(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json', ...options?.headers },
      });
    },

    async put<T = unknown>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
      return httpRequest<T>(url, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json', ...options?.headers },
      });
    },

    async patch<T = unknown>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
      return httpRequest<T>(url, {
        ...options,
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json', ...options?.headers },
      });
    },

    async delete<T = unknown>(url: string, options?: RequestInit): Promise<T> {
      return httpRequest<T>(url, { ...options, method: 'DELETE' });
    },
  },
};

// ─── Private helpers ─────────────────────

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function httpRequest<T>(url: string, options: RequestInit): Promise<T> {
  const fullUrl = cvx.http.baseUrl ? cvx.http.baseUrl + url : url;
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new HttpError(response.status, response.statusText, await response.text());
  }

  const text = await response.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

class HttpError extends Error {
  status: number;
  statusText: string;
  body?: string;

  constructor(status: number, statusText: string, body?: string) {
    super(`HTTP ${status}: ${statusText}`);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export default cvx;
