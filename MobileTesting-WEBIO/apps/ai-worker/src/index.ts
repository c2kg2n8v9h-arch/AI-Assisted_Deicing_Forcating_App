import {
  createDisabledAiRuntime,
  type AiAnalysisResult,
  type AiRuntime,
  type SanitizedEvidence,
} from '@automation-platform/ai-core';

export interface AiWorker {
  readonly runtime: AiRuntime;
  analyze(evidence: SanitizedEvidence): Promise<AiAnalysisResult>;
}

export function createAiWorker(runtime: AiRuntime = createDisabledAiRuntime()): AiWorker {
  return {
    runtime,
    analyze: (evidence) => runtime.analyze(evidence),
  };
}
