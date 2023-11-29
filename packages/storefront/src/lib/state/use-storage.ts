import { reactive } from 'vue';
import { watchDebounced } from '@vueuse/core';

const useStorage = <T extends {}>(
  key: string,
  initialValue: T,
  storage = globalThis.localStorage,
) => {
  if (!storage) {
    return reactive<T>(initialValue);
  }
  let persistedValue: T | undefined | null;
  const sessionJson = storage.getItem(key);
  if (sessionJson) {
    try {
      persistedValue = JSON.parse(sessionJson);
    } catch (e) {
      persistedValue = null;
      storage.removeItem(key);
    }
  }
  const state = reactive<T>(persistedValue || initialValue);
  watchDebounced(state, () => {
    storage.setItem(key, JSON.stringify(state));
  }, {
    debounce: 50,
  });
  return state;
};

export default useStorage;
