export type OutboxItem = {
  id: string
  url: string
  method: string
  headers?: Record<string, string>
  body?: string
  createdAt: number
}

const DB_NAME = 'epop'
const STORE = 'outbox'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function putOutbox(item: OutboxItem): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE).put(item)
  })
}

export async function getAllOutbox(): Promise<OutboxItem[]> {
  const db = await openDb()
  return await new Promise<OutboxItem[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result as OutboxItem[])
    req.onerror = () => reject(req.error)
  })
}

export async function deleteOutbox(id: string): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE).delete(id)
  })
}

export async function queueRequest(url: string, init: RequestInit & { id?: string } = {}): Promise<string> {
  const id = init.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const headers: Record<string, string> = {}
  if (init.headers) {
    const h = init.headers as Record<string, string>
    Object.keys(h).forEach((k) => (headers[k] = h[k]))
  }
  const body = typeof init.body === 'string' ? init.body : (init.body ? JSON.stringify(init.body) : undefined)
  await putOutbox({ id, url, method: init.method || 'POST', headers, body, createdAt: Date.now() })
  try {
    const reg = await navigator.serviceWorker.ready
    if ('sync' in reg) {
      // @ts-ignore
      await reg.sync.register('outbox-sync')
    } else if (navigator.onLine) {
      navigator.serviceWorker.controller?.postMessage({ type: 'TRIGGER_OUTBOX' })
    }
  } catch {
    if (navigator.onLine) {
      navigator.serviceWorker.controller?.postMessage({ type: 'TRIGGER_OUTBOX' })
    }
  }
  return id
}
