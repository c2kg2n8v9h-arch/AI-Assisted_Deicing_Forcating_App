import { createBaseConfig } from './base.conf.js';
import { runnerEnvironment } from '../src/runtime/environment.js';

export const ciConfig: WebdriverIO.Config = createBaseConfig({
  headless: true,
  maxInstances: runnerEnvironment.MAX_INSTANCES,
  specFileRetries: 1,
});
