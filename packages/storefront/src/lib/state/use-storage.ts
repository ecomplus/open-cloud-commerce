import { reactive } from 'vue';
import { useDebounceFn, watchDebounced } from '@vueuse/core';

const useStorage = <T extends {}>(
  key: string,
  initialValue: T,
  storage = globalThis.localStorage,
  isWithBroadcast = true,
) => {
  if (!storage) {
    return reactive<T>(initialValue);
  }
  // eslint-disable-next-line consistent-return
  const getStorageItem = () => {
    const sessionJson = storage.getItem(key);
    if (sessionJson) {
      try {
        return JSON.parse(sessionJson) as T;
      } catch {
        storage.removeItem(key);
        return null;
      }
    }
  };
  const persistedValue = getStorageItem();
  const state = reactive<T>(persistedValue || initialValue);
  let bc: BroadcastChannel | undefined;
  let isFromBc = false;
  if (isWithBroadcast && !import.meta.env.SSR && globalThis.BroadcastChannel) {
    const syncState = useDebounceFn(() => {
      Object.assign(state, getStorageItem());
      isFromBc = true;
    }, 100);
    bc = new BroadcastChannel(key);
    bc.onmessage = (event) => {
      if (event.data === 'set') syncState();
    };
  }
  watchDebounced(state, () => {
    storage.setItem(key, JSON.stringify(state));
    if (bc) {
      if (isFromBc) isFromBc = false;
      else bc.postMessage('set');
    }
  }, {
    debounce: 50,
  });
  return state;
};

export default useStorage;
