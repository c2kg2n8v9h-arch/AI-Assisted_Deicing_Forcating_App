import { config } from '../wdio.conf.js';
import { runnerEnvironment } from '../src/runtime/environment.js';

const configuredCapabilities: unknown = config.capabilities;

if (!Array.isArray(configuredCapabilities) || configuredCapabilities.length === 0) {
  throw new Error('WebdriverIO config must define at least one browser capability.');
}

if (!config.specs || config.specs.length === 0) {
  throw new Error('WebdriverIO config must define a project spec pattern.');
}

const summary = {
  baseUrl: config.baseUrl,
  browser: runnerEnvironment.BROWSER,
  headless: runnerEnvironment.RUN_MODE !== 'local' || runnerEnvironment.HEADLESS,
  maxInstances: config.maxInstances,
  profile: runnerEnvironment.RUN_MODE,
  project: runnerEnvironment.PROJECT_ID ?? 'unconfigured',
  specPattern: config.specs[0],
  suite: runnerEnvironment.SUITE,
  targetEnvironment: runnerEnvironment.TARGET_ENV,
};

process.stdout.write(`WebdriverIO configuration is valid.\n${JSON.stringify(summary, null, 2)}\n`);
