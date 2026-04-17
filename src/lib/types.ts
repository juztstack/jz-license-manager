// ─────────────────────────────────────────
// @corvux/core — types.ts
// Base types and interfaces for the entire Corvux ecosystem
// ─────────────────────────────────────────

// ─── Reactive ────────────────────────────

export type Primitive = string | number | boolean | null | undefined;

export type ReactiveState = Record<string, unknown>;

export type WatcherCallback<T = unknown> = (
  newValue: T,
  oldValue: T,
  key: string
) => void;

export interface ReactiveOptions {
  deep?: boolean;
}

export interface ReactiveObject<T extends ReactiveState> {
  readonly state: T;
  watch<K extends keyof T>(key: K, callback: WatcherCallback<T[K]>): () => void;
  unwatch(key: string): void;
  dispose(): void;
}

// ─── EventBus ────────────────────────────

export type EventHandler<T = unknown> = (payload: T) => void;

export interface EventBusInstance {
  on<T = unknown>(event: string, handler: EventHandler<T>): () => void;
  off(event: string, handler?: EventHandler): void;
  emit<T = unknown>(event: string, payload?: T): void;
  once<T = unknown>(event: string, handler: EventHandler<T>): void;
  clear(event?: string): void;
}

// ─── Directives ──────────────────────────

export type DirectiveHandler = (
  el: HTMLElement,
  value: string,
  state: ReactiveState,
  event?: Event
) => void;

export type DirectiveMap = Map<string, DirectiveHandler>;

// ─── Mount ───────────────────────────────

export interface MountOptions<T extends ReactiveState> {
  el: string | HTMLElement;
  state: T;
  directives?: Record<string, DirectiveHandler>;
  deep?: boolean;
}

export interface CorvuxInstance<T extends ReactiveState> {
  readonly state: T;
  readonly root: HTMLElement;
  watch<K extends keyof T>(key: K, callback: WatcherCallback<T[K]>): () => void;
  dispose(): void;
}

// ─── Plugin ──────────────────────────────

export interface CorvuxPlugin<O = unknown> {
  name: string;
  install(instance: CorvuxInstance<ReactiveState>, options?: O): void;
}