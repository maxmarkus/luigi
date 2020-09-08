// import { auth } from './auth';
import { navigation } from './navigation';
import { routing } from './routing';
import { settings } from './settings';
import { lifecycleHooks } from './lifecycle-hooks';
import { searchProvider } from './searchProvider';

Luigi.setConfig({
  // auth,
  navigation,
  routing,
  settings,
  globalSearch: {
    disableInputHandlers: true,
    searchProvider
  },
  lifecycleHooks
});
