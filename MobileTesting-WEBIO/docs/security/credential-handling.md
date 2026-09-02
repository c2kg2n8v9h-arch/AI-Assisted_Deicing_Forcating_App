# Credential and sensitive-data handling

## Rules

1. Never commit real passwords, access tokens, API keys, cookies, or private
   certificates.
2. Store only variable names and empty examples in `.env.example`.
3. Supply secrets through local `.env` files or an approved CI secret store.
4. Keep `.env` and environment-specific secret files excluded from Git.
5. Never include production credentials in test data, screenshots, reports,
   prompts, retrieved knowledge, or AI evaluation datasets.
6. Redact evidence before sending it to reporting, retrieval, LLM, MCP, or other
   external integrations.
7. Treat session cookies and authorization headers as credentials.
8. Rotate a credential immediately if it appears in source control or an artifact.

## Redaction package

`@automation-platform/security` currently redacts:

- Password, secret, token, API-key, authorization, and cookie object fields
- Bearer-token values in text
- Common secret key/value assignments in logs
- Circular object references

Redaction is defense in depth, not permission to collect unnecessary sensitive
data. The safest evidence is evidence that never contained the secret.

## Report and log controls

The WebdriverIO adapter disables low-level command-step attachments because input
commands can contain passwords. After a run, it keeps browser `.log` files only,
redacts configured sensitive values from them, and removes transient browser
profiles and caches. Failure diagnostics are sanitized before they are written or
attached to Allure.

Run `pnpm report:verify` after report generation. The verifier performs a raw-byte
scan of every retained file in the latest execution directory. Supply known test
secrets through secret-named environment variables or a comma-separated
`SENSITIVE_SCAN_VALUES` value. This is an additional detection control, not a
replacement for avoiding sensitive evidence.

## Production execution

Selecting `TARGET_ENV=production` fails before browser startup unless
`ALLOW_PRODUCTION=true` is explicitly supplied. This flag confirms intent; it does
not replace authorization, safe test data, or non-destructive test design.
