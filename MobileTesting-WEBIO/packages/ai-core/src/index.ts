import type { ExecutionSummary } from '@automation-platform/contracts';

export type JsonPrimitive = boolean | number | string | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { readonly [key: string]: JsonValue };

export type DataClassification = 'public' | 'internal' | 'confidential';
export type AiCapability =
  'agent' | 'embedding' | 'evaluation' | 'guardrail' | 'llm' | 'mcp' | 'retrieval' | 'vector-store';

export interface SanitizedEvidence {
  readonly classification: DataClassification;
  readonly content: JsonValue;
  readonly execution: ExecutionSummary;
  readonly redacted: true;
}

export interface ModelRequest {
  readonly instructions: string;
  readonly input: JsonValue;
  readonly modelHint?: string;
  readonly responseSchemaName: string;
}

export interface ModelResponse {
  readonly model: string;
  readonly output: JsonValue;
  readonly provider: string;
  readonly requestId?: string;
}

export interface LanguageModelPort {
  readonly name: string;
  generate(request: ModelRequest): Promise<ModelResponse>;
}

export interface EmbeddingPort {
  readonly dimensions: number;
  readonly name: string;
  embed(values: readonly string[]): Promise<readonly (readonly number[])[]>;
}

export interface VectorDocument {
  readonly classification: DataClassification;
  readonly content: string;
  readonly id: string;
  readonly metadata: Readonly<Record<string, JsonPrimitive>>;
  readonly vector: readonly number[];
}

export interface VectorMatch {
  readonly document: VectorDocument;
  readonly score: number;
}

export interface VectorStorePort {
  readonly name: string;
  search(vector: readonly number[], limit: number): Promise<readonly VectorMatch[]>;
  upsert(documents: readonly VectorDocument[]): Promise<void>;
}

export interface RetrievalQuery {
  readonly classificationCeiling: DataClassification;
  readonly limit: number;
  readonly text: string;
}

export interface RetrievalResult {
  readonly citations: readonly string[];
  readonly context: readonly JsonValue[];
}

export interface RetrieverPort {
  retrieve(query: RetrievalQuery): Promise<RetrievalResult>;
}

export type ToolEffect = 'read' | 'write';

export interface AgentToolContext {
  readonly approved: boolean;
  readonly correlationId: string;
}

export interface AgentToolPort {
  readonly effect: ToolEffect;
  readonly name: string;
  readonly requiresApproval: boolean;
  invoke(input: JsonValue, context: AgentToolContext): Promise<JsonValue>;
}

export async function invokeAgentTool(
  tool: AgentToolPort,
  input: JsonValue,
  context: AgentToolContext,
): Promise<JsonValue> {
  if (tool.effect === 'write' && tool.requiresApproval && !context.approved) {
    throw new Error('Tool "' + tool.name + '" requires explicit approval before a write action.');
  }

  return tool.invoke(input, context);
}

export type GuardrailStage = 'input' | 'output' | 'tool';

export interface GuardrailDecision {
  readonly allowed: boolean;
  readonly reasons: readonly string[];
  readonly sanitizedValue: JsonValue;
}

export interface GuardrailPort {
  readonly name: string;
  evaluate(stage: GuardrailStage, value: JsonValue): Promise<GuardrailDecision>;
}

export interface AgentPlan {
  readonly objective: string;
  readonly steps: readonly {
    readonly tool?: string;
    readonly description: string;
  }[];
}

export interface AdvisoryAnalysis {
  readonly citations: readonly string[];
  readonly confidence: number;
  readonly findings: readonly string[];
  readonly kind: 'advisory-analysis';
  readonly limitations: readonly string[];
}

export interface EvaluationCase {
  readonly expected: JsonValue;
  readonly id: string;
  readonly input: JsonValue;
  readonly tags: readonly string[];
}

export interface EvaluationScore {
  readonly caseId: string;
  readonly passed: boolean;
  readonly score: number;
  readonly threshold: number;
}

export type AiAnalysisResult =
  | {
      readonly reason: string;
      readonly status: 'skipped';
    }
  | {
      readonly analysis: AdvisoryAnalysis;
      readonly status: 'completed';
    };

export interface AiRuntime {
  readonly capabilities: readonly AiCapability[];
  readonly enabled: boolean;
  analyze(evidence: SanitizedEvidence): Promise<AiAnalysisResult>;
}

export function createDisabledAiRuntime(): AiRuntime {
  return {
    capabilities: [],
    enabled: false,
    analyze: () =>
      Promise.resolve({
        reason: 'AI capabilities are disabled; the deterministic result is unchanged.',
        status: 'skipped',
      }),
  };
}
