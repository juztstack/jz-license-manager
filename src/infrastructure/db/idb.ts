const DB_NAME = 'jz-license-manager'
const DB_VERSION = 1
const STORES = ['licenses', 'users', 'products', 'bundles', 'clients'] as const

let dbInstance: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance)

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      for (const store of STORES) {
        if (!req.result.objectStoreNames.contains(store)) {
          req.result.createObjectStore(store, { keyPath: 'id' })
        }
      }
    }

    req.onsuccess = () => {
      dbInstance = req.result
      resolve(dbInstance)
    }

    req.onerror = () => reject(req.error)
  })
}

function wrap<R>(req: IDBRequest<R>): Promise<R> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export class IDBRepository<T extends { id: string }> {
  private readonly storeName: string

  constructor(storeName: string) {
    this.storeName = storeName
  }

  private async store(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await openDB()
    return db.transaction(this.storeName, mode).objectStore(this.storeName)
  }

  async findAll(): Promise<T[]> {
    return wrap((await this.store('readonly')).getAll())
  }

  async findById(id: string): Promise<T | null> {
    const result = await wrap((await this.store('readonly')).get(id))
    return (result as T) ?? null
  }

  async save(item: T): Promise<void> {
    await wrap((await this.store('readwrite')).put(item))
  }

  async delete(id: string): Promise<void> {
    await wrap((await this.store('readwrite')).delete(id))
  }
}
