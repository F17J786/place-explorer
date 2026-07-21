import BackgroundFetch from 'react-native-background-fetch';
import { syncQueue } from '@/services/offlineQueue';
import { runPostSyncSideEffects } from '@/services/postSync';
import { fileLog } from '@/services/fileLog';

const TASK_ID = 'com.placeexplorer.sync';

export const initBackgroundFetch = async () => {
  await BackgroundFetch.configure(
    {
      minimumFetchInterval: 1,
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
      forceAlarmManager: true,
    },
    async taskId => {
      await fileLog(`fetch started | taskId=${taskId}`);
      try {
        const result = await syncQueue();
        if (result) {
          await fileLog(
            `fetch syncQueue done | synced=${result.synced.length} failed=${result.failed.length}`,
          );
          await runPostSyncSideEffects(result);
          await fileLog(`fetch postSync done | taskId=${taskId}`);
        } else {
          await fileLog(`fetch: queue rỗng, không có gì để sync`);
        }
      } catch (e) {
        await fileLog(`fetch error | ${e}`);
      }
      BackgroundFetch.finish(taskId);
    },
    async taskId => {
      await fileLog(`fetch TIMEOUT | taskId=${taskId}`);
      BackgroundFetch.finish(taskId);
    },
  );
};
