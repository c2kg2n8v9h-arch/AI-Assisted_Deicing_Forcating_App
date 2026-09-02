import type { RunnerEnvironment } from './environment.js';
import { runnerPaths } from './paths.js';

const commonChromiumArguments = ['--window-size=1920,1080'];
const headlessArguments = ['--headless=new', '--disable-gpu'];

function browserArguments(headless: boolean): string[] {
  return headless ? [...commonChromiumArguments, ...headlessArguments] : commonChromiumArguments;
}

export function createBrowserCapability(
  environment: RunnerEnvironment,
  headless: boolean,
): WebdriverIO.Capabilities {
  if (environment.BROWSER === 'edge') {
    return {
      browserName: 'msedge',
      'ms:edgeOptions': {
        args: browserArguments(headless),
        ...(environment.EDGE_BINARY ? { binary: environment.EDGE_BINARY } : {}),
      },
      'wdio:edgedriverOptions': {
        cacheDir: runnerPaths.driverCache,
        ...(environment.EDGEDRIVER_PATH ? { binary: environment.EDGEDRIVER_PATH } : {}),
      },
    };
  }

  return {
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: browserArguments(headless),
      ...(environment.CHROME_BINARY ? { binary: environment.CHROME_BINARY } : {}),
    },
    'wdio:chromedriverOptions': {
      cacheDir: runnerPaths.driverCache,
      ...(environment.CHROMEDRIVER_PATH ? { binary: environment.CHROMEDRIVER_PATH } : {}),
    },
  };
}
