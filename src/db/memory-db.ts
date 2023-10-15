export type Serialize<T> = (obj: T) => string;
export type Deserialize<T> = (data: string) => T;
export type PrimaryKey<T> = (obj: T) => string;

export interface MemoryDbOptions<T> {
  serialize?: Serialize<T>;
  deserialize?: Deserialize<T>;
  secondaryKeys?: string[];
};

function defaultSerialize<T>(obj: T) {
  return JSON.stringify(obj);
}

function defaultDeserialize<T>(data: string) {
  return JSON.parse(data) as T;
}

export class MemoryDb<T extends { id: string;[key: string]: any; }> {
  private serialize: Serialize<T>;
  private deserialize: Deserialize<T>;
  private secondaryKeys: string[];
  private db: Map<string, string>;
  private indexDb: Map<string, Map<string, Set<string>>>;

  constructor(options: MemoryDbOptions<T>) {
    this.serialize = options.serialize || defaultSerialize;
    this.deserialize = options.deserialize || defaultDeserialize;
    this.secondaryKeys = options.secondaryKeys || [];
    this.db = new Map();
    this.indexDb = new Map();
    for (const index of this.secondaryKeys) {
      this.indexDb.set(index, new Map());
    }
  }

  async get(id: string): Promise<T | undefined> {
    const data = this.db.get(id);
    if (!data) {
      return undefined;
    }

    return this.deserialize(data);
  }

  async findBy(key: string, value: string): Promise<T[] | undefined> {
    const index = this.indexDb.get(key);
    if (!index) {
      throw new Error(`unknown index: ${key}`);
    }

    const ids = index.get(value);
    if (!ids) {
      return undefined;
    }

    const result = [];
    for (const id of ids) {
      const value = await this.get(id);
      if (value !== undefined) result.push(value);
    }
    return result;
  }

  async save(obj: T): Promise<void> {
    const data = this.serialize(obj);

    if (!obj.id) {
      throw new Error(`id must not be empty: ${obj}`);
    }
    this.db.set(obj.id, this.serialize(obj));

    for (const key of this.secondaryKeys) {
      const index = this.indexDb.get(key);
      if (!index) {
        throw new Error(`index DB is not created: ${key}`);
      }
      const indexedKey = obj[key];
      if (typeof indexedKey !== 'string') continue;
      const indexedValues = index.get(indexedKey);
      if (indexedValues) {
        indexedValues.add(obj.id);
      } else {
        index.set(indexedKey, new Set([obj.id]));
      }
    }
  }

  async delete(obj: T): Promise<boolean> {
    if (!obj.id) {
      throw new Error(`id must not be empty: ${obj}`);
    }

    for (const key of this.secondaryKeys) {
      const index = this.indexDb.get(key);
      if (!index) {
        throw new Error(`index DB is not created: ${key}`);
      }
      const indexedKey = obj[key];
      if (typeof indexedKey !== 'string') continue;
      const indexedValues = index.get(indexedKey);
      if (indexedValues) {
        indexedValues.delete(obj.id);
      }
    }

    return this.db.delete(obj.id);
  }
}
