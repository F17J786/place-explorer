/**
 * @format
 */
import '@formatjs/intl-getcanonicallocales/polyfill';
import '@formatjs/intl-locale/polyfill';

import '@formatjs/intl-pluralrules/polyfill-force';
import '@formatjs/intl-pluralrules/locale-data/vi';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/zh';
import '@formatjs/intl-pluralrules/locale-data/ja';
import '@formatjs/intl-pluralrules/locale-data/ko';

import '@formatjs/intl-relativetimeformat/polyfill-force';
import '@formatjs/intl-relativetimeformat/locale-data/vi';
import '@formatjs/intl-relativetimeformat/locale-data/en';
import '@formatjs/intl-relativetimeformat/locale-data/zh';
import '@formatjs/intl-relativetimeformat/locale-data/ja';
import '@formatjs/intl-relativetimeformat/locale-data/ko';

import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import BackgroundFetch from 'react-native-background-fetch';
import { syncQueue } from '@/services/offlineQueue';
import { runPostSyncSideEffects } from '@/services/postSync';
import { fileLog } from '@/services/fileLog';

const BackgroundFetchHeadlessTask = async event => {
  const taskId = event.taskId;
  await fileLog(`headless started | taskId=${taskId}`);
  try {
    const result = await syncQueue();
    if (result) {
      await fileLog(
        `headless syncQueue done | synced=${result.synced.length} failed=${result.failed.length}`,
      );
      await runPostSyncSideEffects(result);
      await fileLog(`headless postSync done | taskId=${taskId}`);
    } else {
      await fileLog(`headless: queue rỗng`);
    }
  } catch (e) {
    await fileLog(`headless error | ${e}`);
  }
  BackgroundFetch.finish(taskId);
};

AppRegistry.registerComponent(appName, () => App);
BackgroundFetch.registerHeadlessTask(BackgroundFetchHeadlessTask);
