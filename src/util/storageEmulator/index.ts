import { Load } from 'feature/list/types';
import { Save } from 'feature/registration/types';

interface Storage {
  save: Save;
  load: Load;
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
}

const storageFactory: (cacheKey: string) => Storage = (cacheKey) =>
  new LocalStorage(cacheKey);

export default storageFactory;
