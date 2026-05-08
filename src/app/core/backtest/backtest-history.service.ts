import { Injectable } from '@angular/core';
import type { HistoryRecord } from './backtest-history.model';

const DB_NAME    = 'axiom_backtest';
const DB_VERSION = 1;
const STORE      = 'runs';

@Injectable({ providedIn: 'root' })
export class BacktestHistoryService {
  private readonly db: Promise<IDBDatabase>;

  constructor() {
    this.db = new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = e => resolve((e.target as IDBOpenDBRequest).result);
      req.onerror   = () => reject(req.error);
    });
  }

  async saveRun(record: HistoryRecord): Promise<void> {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  }

  async getAllRuns(): Promise<HistoryRecord[]> {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () =>
        resolve((req.result as HistoryRecord[]).sort((a, b) => b.runAt - a.runAt));
      req.onerror = () => reject(req.error);
    });
  }

  async deleteRun(id: string): Promise<void> {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  }

  async clearAll(): Promise<void> {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  }
}
