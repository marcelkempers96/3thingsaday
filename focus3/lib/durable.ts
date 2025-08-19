// Minimal IndexedDB helpers to persist larger JSON blobs across Safari reloads

const DB_NAME = 'focus3_db';
const STORE = 'kv';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('indexedDB unavailable'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('idb open error'));
  });
}

export async function idbGet(key: string): Promise<string | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const r = store.get(key);
      r.onsuccess = () => resolve((r.result as string) ?? null);
      r.onerror = () => reject(r.error || new Error('idb get error'));
    });
  } catch {
    return null;
  }
}

export async function idbSet(key: string, value: string): Promise<boolean> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const r = store.put(value, key);
      r.onsuccess = () => resolve(true);
      r.onerror = () => reject(r.error || new Error('idb set error'));
    });
  } catch {
    return false;
  }
}

export async function getJSON<T = unknown>(key: string): Promise<T | null> {
  const raw = await idbGet(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export async function setJSON(key: string, value: unknown): Promise<boolean> {
  try { return await idbSet(key, JSON.stringify(value)); } catch { return false; }
}

