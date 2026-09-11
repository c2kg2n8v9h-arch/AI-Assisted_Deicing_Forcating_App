import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const workspaceRoot = process.cwd();

function fail(message) {
  throw new Error(message);
}

function readJson(relativePath) {
  const absolutePath = path.join(workspaceRoot, relativePath);
  if (!existsSync(absolutePath)) fail(`Missing required file: ${relativePath}`);

  try {
    return JSON.parse(readFileSync(absolutePath, 'utf8'));
  } catch (error) {
    fail(
      `Invalid JSON in ${relativePath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function requireText(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail(`${label} must be a non-empty string`);
  }
}

function validateManifest(project, manifest) {
  requireText(manifest.projectId, `${project.id} manifest.projectId`);
  if (manifest.projectId !== project.id) {
    fail(`${project.id} manifest.projectId must match registry id`);
  }
  requireText(manifest.owner, `${project.id} manifest.owner`);
  requireText(manifest.classification, `${project.id} manifest.classification`);
  requireText(manifest.reviewedAt, `${project.id} manifest.reviewedAt`);
  if (!Array.isArray(manifest.documents)) fail(`${project.id} manifest.documents must be an array`);

  for (const document of manifest.documents) {
    requireText(document.documentId, `${project.id} document.documentId`);
    requireText(document.sourceUri, `${project.id} ${document.documentId}.sourceUri`);
    requireText(document.version, `${project.id} ${document.documentId}.version`);
    requireText(document.owner, `${project.id} ${document.documentId}.owner`);
    requireText(document.classification, `${project.id} ${document.documentId}.classification`);
    requireText(document.reviewedAt, `${project.id} ${document.documentId}.reviewedAt`);
  }
}

function validatePolicy(project, relativePath, expectedKind) {
  const policy = readJson(relativePath);
  if (policy.projectId !== project.id) fail(`${relativePath} projectId must be ${project.id}`);
  if (policy.kind !== expectedKind) fail(`${relativePath} kind must be ${expectedKind}`);
  return policy;
}

const registry = readJson('rag-registry.json');
if (!Array.isArray(registry.projects)) fail('rag-registry.json projects must be an array');

const readyProjects = [];
const blockedProjects = [];

for (const project of registry.projects) {
  requireText(project.id, 'project.id');
  requireText(project.status, `${project.id}.status`);
  requireText(project.knowledgePath, `${project.id}.knowledgePath`);

  const manifest = readJson(`${project.knowledgePath}/manifest.json`);
  validateManifest(project, manifest);

  validatePolicy(project, project.retrievalPolicy, 'retrieval-policy');
  validatePolicy(project, project.citationPolicy, 'citation-policy');
  validatePolicy(project, project.accessPolicy, 'access-policy');
  validatePolicy(project, project.chunkingPolicy, 'chunking-policy');
  const evaluationSet = validatePolicy(project, project.evaluationSet, 'evaluation-set');
  if (!Array.isArray(evaluationSet.cases) || evaluationSet.cases.length === 0) {
    fail(`${project.evaluationSet} must include at least one evaluation case`);
  }

  if (project.projectConfig) readJson(project.projectConfig);
  if (project.status === 'rag-ready') readyProjects.push(project.id);
  if (project.status === 'blocked') blockedProjects.push(project.id);
}

process.stdout.write(
  [
    'RAG readiness validation passed.',
    `Ready projects: ${readyProjects.join(', ') || 'none'}`,
    `Blocked projects: ${blockedProjects.join(', ') || 'none'}`,
  ].join('\n') + '\n',
);
