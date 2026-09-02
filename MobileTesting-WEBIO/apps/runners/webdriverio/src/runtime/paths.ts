import { fileURLToPath } from 'node:url';
import path from 'node:path';

const runnerRoot = fileURLToPath(new URL('../..', import.meta.url));
const workspaceRoot = fileURLToPath(new URL('../../../../..', import.meta.url));

export const runnerPaths = Object.freeze({
  runnerRoot,
  workspaceRoot,
  envFile: path.join(workspaceRoot, '.env'),
  projectsRoot: path.join(workspaceRoot, 'projects'),
  artifactsRoot: path.join(workspaceRoot, 'artifacts'),
  executionsRoot: path.join(workspaceRoot, 'artifacts', 'executions'),
  legacyAllureResults: path.join(workspaceRoot, 'artifacts', 'reports', 'allure-results'),
  legacyAllureReport: path.join(workspaceRoot, 'artifacts', 'reports', 'allure-report'),
  driverCache: path.join(workspaceRoot, 'artifacts', 'drivers'),
});

export function executionPaths(runId: string) {
  const executionRoot = path.join(runnerPaths.executionsRoot, runId);
  return Object.freeze({
    executionRoot,
    allureResults: path.join(executionRoot, 'allure-results'),
    allureReport: path.join(executionRoot, 'allure-report'),
    browserLogs: path.join(executionRoot, 'logs', 'browser'),
    frameworkLogs: path.join(executionRoot, 'logs', 'framework'),
    diagnostics: path.join(executionRoot, 'diagnostics'),
    screenshots: path.join(executionRoot, 'screenshots'),
  });
}
