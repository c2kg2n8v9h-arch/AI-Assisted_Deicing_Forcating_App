# How to use this build guide

This is a human-prepared reconstruction guide, not a command transcript. It tells
an engineer what to do, why it matters, how to recognize success, and what to check
when the happy path does not match reality.

## Before starting

Open a terminal at the repository root—the directory containing `package.json`
and `pnpm-workspace.yaml`.

- Git 2.40 or newer
- Node.js 24
- pnpm 11.19.0
- Chrome and Edge for browser steps
- Java 17 or newer for Allure HTML reports

```bash
git --version
node --version
pnpm --version
java -version
```

Expected major versions are Node `v24`, pnpm `11.19.0`, and Java `17` or newer.
Browser versions need not match historical examples; WebdriverIO resolves a
compatible driver at runtime.

## How to work through a step

Each step provides prerequisites, copyable commands, expected results,
troubleshooting, and a completion checklist. Run steps in numerical order for a
new framework. For an existing framework, use the checklists to find the first
incomplete step.

Commands marked `bash` work in Bash/Git Bash and most CI shells. Commands marked
`powershell` target PowerShell 7. Run commands one block at a time. If a command
fails, stop, read the first meaningful error, use that step's troubleshooting
section, and rerun it.

`pnpm validate` is the standard non-browser quality gate. Exit code `0` means
success. Generated output belongs under `artifacts/` and is ignored by Git.
Timestamps, UUIDs, browser versions, session IDs, and file counts vary by run.

Never copy real credentials into examples, reports, screenshots, prompts, or test
data while reproducing this guide.
