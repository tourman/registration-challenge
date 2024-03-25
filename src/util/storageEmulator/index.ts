import type { Load } from 'feature/list';
import type { Save } from 'feature/registration';
import type { Delete } from 'feature/delete';
import invariant from 'invariant';

interface Storage {
  save: Save;
  load: Load;
  delete: Delete;
}

async function emulateNetwork() {
  await new Promise<void>((resolve) => setTimeout(resolve, 1000));
  emulateError();
}

function emulateError() {
  if (Math.random() < 1 / 3) {
    throw new Error('Emulated network error');
  }
}

function generateId(): string {
  return Date.now().toString(16).padStart(12, '0');
}

class LocalStorage implements Storage {
  constructor(protected cacheKey: string) {}
  save: Save = async (entity) => {
    await emulateNetwork();
    const list = await this.#load();
    list.push({ ...entity, id: generateId() });
    localStorage.setItem(this.cacheKey, JSON.stringify(list));
  };
  async #load(): ReturnType<Load> {
    return JSON.parse(localStorage.getItem(this.cacheKey) ?? '[]');
  }
  load: Load = async () => {
    await emulateNetwork();
    return this.#load();
  };
  delete: Delete = async (id) => {
    await emulateNetwork();
    const list = await this.#load();
    // todo: make searching the ID async
    const index = list.findIndex((item) => item.id === id);
    invariant(index !== -1, 'Unable to find saved ID: ' + id);
    list.splice(index, 1);
    localStorage.setItem(this.cacheKey, JSON.stringify(list));
    return list;
  };
}

const storageFactory: (cacheKey: string) => Storage = (cacheKey) =>
  new LocalStorage(cacheKey);

export default storageFactory;
