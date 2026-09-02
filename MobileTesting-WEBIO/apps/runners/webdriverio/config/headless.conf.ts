import { createBaseConfig } from './base.conf.js';
import { runnerEnvironment } from '../src/runtime/environment.js';

export const headlessConfig: WebdriverIO.Config = createBaseConfig({
  headless: true,
  maxInstances: runnerEnvironment.MAX_INSTANCES,
  specFileRetries: 0,
});
