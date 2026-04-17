// ─────────────────────────────────────────
// @corvux/core — reactive.ts
// Proxy-based reactivity system
// Supports deep watching and per-key subscribers
// ─────────────────────────────────────────

import type {
  ReactiveState,
  ReactiveObject,
  ReactiveOptions,
  WatcherCallback,
} from './types';

export function createReactive<T extends ReactiveState>(
  initialState: T,
  options: ReactiveOptions = {}
): ReactiveObject<T> {
  const { deep = false } = options;

  // Per-key watcher registry
  const watchers = new Map<string, Set<WatcherCallback<unknown>>>();

  function getOrCreate(key: string): Set<WatcherCallback<unknown>> {
    if (!watchers.has(key)) {
      watchers.set(key, new Set());
    }
    return watchers.get(key)!;
  }

  function notify(key: string, newValue: unknown, oldValue: unknown): void {
    watchers.get(key)?.forEach((cb) => cb(newValue, oldValue, key));
    // Wildcard — notifica a quienes escuchan todos los cambios
    watchers.get('*')?.forEach((cb) => cb(newValue, oldValue, key));
  }

  function makeArrayProxy<O extends object>(arr: O, path: string): O {
    const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'copyWithin'];
    
    return new Proxy(arr, {
      get(target, prop: string) {
        const value = Reflect.get(target, prop);
        
        if (typeof value === 'function' && arrayMethods.includes(prop)) {
          return function(...args: unknown[]) {
            const result = value.apply(target, args);
            notify(path, target, target);
            return result;
          };
        }
        
        return value;
      },
      set(target, prop: string, value: unknown) {
        const oldValue = Reflect.get(target, prop);
        Reflect.set(target, prop, value);
        
        if (!Object.is(oldValue, value)) {
          notify(path, target, target);
        }
        return true;
      }
    });
  }

  function makeProxy<O extends ReactiveState>(obj: O, path = ''): O {
    return new Proxy(obj, {
      get(target, prop: string) {
        const value = target[prop];

        if (Array.isArray(value)) {
          return makeArrayProxy(value, path ? `${path}.${prop}` : prop);
        }

        if (
          deep &&
          value !== null &&
          typeof value === 'object'
        ) {
          return makeProxy(
            value as ReactiveState,
            path ? `${path}.${prop}` : prop
          );
        }

        return value;
      },

      set(target, prop: string, value: unknown) {
        const oldValue = target[prop];

        if (Object.is(oldValue, value)) return true;

        (target as ReactiveState)[prop] = value;

        const fullKey = path ? `${path}.${prop}` : prop;
        notify(fullKey, value, oldValue);

        return true;
      },

      deleteProperty(target, prop: string) {
        const oldValue = target[prop];
        const result = delete (target as ReactiveState)[prop];

        if (result) {
          const fullKey = path ? `${path}.${prop}` : prop;
          notify(fullKey, undefined, oldValue);
        }

        return result;
      },
    });
  }

  // Internal mutable copy — never exposed directly
  const raw: T = { ...initialState };
  const state = makeProxy(raw);

  function watch<K extends keyof T>(
    key: K,
    callback: WatcherCallback<T[K]>
  ): () => void {
    const handlers = getOrCreate(key as string);
    handlers.add(callback as WatcherCallback<unknown>);

    // Returns unsubscribe
    return () => {
      handlers.delete(callback as WatcherCallback<unknown>);
    };
  }

  function unwatch(key: string): void {
    watchers.delete(key);
  }

  function dispose(): void {
    watchers.clear();
  }

  return { state, watch, unwatch, dispose };
}