import { createClient } from 'redis';

import { KvAdapter } from '../types';

export class GcpMemorystoreAdapter implements KvAdapter {
  private client;

  constructor() {
    // Initialize the Redis client. Ensure to replace 'REDIS_HOST' and 'REDIS_PORT'
    // with your Memorystore instance's connection details.
    this.client = createClient({
      "host": process.env.REDIS_IP
    });

    this.client.on('error', (err) => console.log('Redis Client Error', err));

    // Connect to the Redis server
    this.client.connect();
  }

  async get<Data>(key: string): Promise<Data | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) as Data : null;
    } catch (err) {
      console.error('Failed to get value from Memorystore', err);
      return null;
    }
  }

  async mget<Data>(...keys: string[]): Promise<(Data | null)[]> {
    try {
      const values = await this.client.mGet(keys);
      return values.map(value => value ? JSON.parse(value) as Data : null);
    } catch (err) {
      console.error('Failed to get values from Memorystore', err);
      return [];
    }
  }

  async set<Data>(key: string, value: Data): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value));
    } catch (err) {
      console.error('Failed to set value in Memorystore', err);
    }
  }
}