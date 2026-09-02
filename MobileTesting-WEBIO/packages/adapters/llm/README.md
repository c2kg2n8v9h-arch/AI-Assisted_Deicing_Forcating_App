# LLM provider adapters

Implement `LanguageModelPort` here, one package per approved provider. SDK types,
models, authentication, retries, rate limits, and cost controls must not leak into
projects or `ai-core`. No provider is installed in this foundation step.
