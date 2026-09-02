import { ciConfig } from './config/ci.conf.js';
import { headlessConfig } from './config/headless.conf.js';
import { localConfig } from './config/local.conf.js';
import { runnerEnvironment } from './src/runtime/environment.js';

function selectConfig(): WebdriverIO.Config {
  switch (runnerEnvironment.RUN_MODE) {
    case 'ci':
      return ciConfig;
    case 'headless':
      return headlessConfig;
    case 'local':
      return localConfig;
  }
}

export const config: WebdriverIO.Config = selectConfig();
