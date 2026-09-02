import { createBaseConfig } from './base.conf.js';
import { runnerEnvironment } from '../src/runtime/environment.js';

export const localConfig: WebdriverIO.Config = createBaseConfig({
  headless: runnerEnvironment.HEADLESS,
  maxInstances: runnerEnvironment.MAX_INSTANCES,
  specFileRetries: 0,
});
