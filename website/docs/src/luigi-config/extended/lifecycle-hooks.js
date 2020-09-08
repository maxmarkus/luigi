import { searchProvider } from './searchProvider';

class LifecycleHooks {
  async luigiAfterInit() {
    console.log('initDS')
    searchProvider.initDocSearch();
  }
}

export const lifecycleHooks = new LifecycleHooks();
