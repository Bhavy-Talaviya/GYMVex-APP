// ═══════════════════════════════════════════════════════════════════════
// storage.js — Universal Fail-Safe Storage Adapter (GYMVex)
// ═══════════════════════════════════════════════════════════════════════
// Seamlessly supports Native (AsyncStorage), Web (localStorage), and In-Memory fallback
// to prevent "Native module is null" errors across all platforms and environments.
// ═══════════════════════════════════════════════════════════════════════

import { Platform } from 'react-native';

// In-Memory fallback store
const memoryStore = new Map();

let nativeAsyncStorage = null;
try {
  // Dynamically require to prevent crash if native module is unlinked
  const AsyncStorageModule = require('@react-native-async-storage/async-storage');
  nativeAsyncStorage = AsyncStorageModule.default || AsyncStorageModule;
} catch (e) {
  nativeAsyncStorage = null;
}

export const safeStorage = {
  /**
   * Get an item from persistent storage
   */
  getItem: async (key) => {
    // 1. Web LocalStorage
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      } catch (e) {}
    }

    // 2. React Native AsyncStorage
    if (nativeAsyncStorage && typeof nativeAsyncStorage.getItem === 'function') {
      try {
        const val = await nativeAsyncStorage.getItem(key);
        if (val !== null && val !== undefined) {
          memoryStore.set(key, val);
          return val;
        }
      } catch (err) {
        // Native module null / unlinked error handled gracefully
      }
    }

    // 3. In-Memory fallback
    return memoryStore.has(key) ? memoryStore.get(key) : null;
  },

  /**
   * Set an item in persistent storage
   */
  setItem: async (key, value) => {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    memoryStore.set(key, stringValue);

    // 1. Web LocalStorage
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, stringValue);
      } catch (e) {}
    }

    // 2. React Native AsyncStorage
    if (nativeAsyncStorage && typeof nativeAsyncStorage.setItem === 'function') {
      try {
        await nativeAsyncStorage.setItem(key, stringValue);
      } catch (err) {
        // Native module null / unlinked error handled gracefully
      }
    }
  },

  /**
   * Remove an item from persistent storage
   */
  removeItem: async (key) => {
    memoryStore.delete(key);

    // 1. Web LocalStorage
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {}
    }

    // 2. React Native AsyncStorage
    if (nativeAsyncStorage && typeof nativeAsyncStorage.removeItem === 'function') {
      try {
        await nativeAsyncStorage.removeItem(key);
      } catch (err) {
        // Native module null / unlinked error handled gracefully
      }
    }
  },

  /**
   * Clear all items in memory store
   */
  clear: async () => {
    memoryStore.clear();

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.clear();
      } catch (e) {}
    }

    if (nativeAsyncStorage && typeof nativeAsyncStorage.clear === 'function') {
      try {
        await nativeAsyncStorage.clear();
      } catch (err) {}
    }
  },
};

export default safeStorage;
