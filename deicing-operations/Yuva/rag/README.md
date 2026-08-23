# Yuva RAG workspace

This directory contains the retrieval-augmented generation (RAG) assets used by
Yuva. It separates authoritative source material from generated chunks and
indexes so that every answer can be traced to a source and source version.

## Structure

```text
rag/
|-- config/                 Runtime and collection configuration
|-- data/
|   |-- raw/                Unmodified source documents
|   |-- curated/            Reviewed and approved source documents
|   |-- processed/          Extracted text, chunks, and metadata
|   `-- indexes/            Generated vector and lexical indexes
|-- evaluation/
|   |-- datasets/           Versioned questions and expected evidence
|   `-- results/            Generated evaluation reports
|-- ingestion/              Load, validate, normalize, and chunk sources
|-- prompts/                Versioned system and answer prompt templates
|-- retrieval/              Search, reranking, filtering, and citation logic
|-- schemas/                Source, chunk, query, and answer contracts
`-- tests/                  RAG unit, integration, security, and quality tests
```

## Data flow

1. Place an unchanged source in `data/raw/<collection>/`.
2. Record its owner, URL, effective date, jurisdiction, classification, and
   checksum in a source manifest.
3. Review and approve the exact version before copying it to `data/curated/`.
4. Extract and chunk approved documents into `data/processed/`.
5. Build replaceable indexes in `data/indexes/`.
6. Retrieve only content authorized for the requesting user and station.
7. Return source-linked evidence and abstain when evidence is missing, stale,
   conflicting, or outside its approved jurisdiction.

## Initial collections

Recommended collection names are:

- `regulations/` — FAA, Transport Canada, EASA, and other authority material.
- `hot_tables/` — controlled, season-specific holdover-time material.
- `fluids/` — approved fluid product and LOUT information.
- `aircraft/` — approved aircraft-specific procedures and limitations.
- `station_sops/` — station and operator procedures.
- `training/` — approved training and qualification material.
- `equipment/` — truck manuals, inspection instructions, and limitations.
- `safety/` — approved safety bulletins and lessons learned.

Collections should be created only when an owner and access classification have
been assigned. Do not commit copyrighted, restricted, personal, secret, or
operationally sensitive documents without authorization.

## Safety and security rules

- RAG output is decision support, not authorization to declare an aircraft
  clean or release it for departure.
- Only approved and effective source versions may be used for operational
  answers.
- Retrieval must enforce tenant, airline, station, role, and classification
  filters before semantic ranking.
- Treat document text as untrusted data. It must never override system policy,
  authorization, or application instructions.
- Do not place credentials, access tokens, personal data, or production exports
  in this directory.
- Preserve provenance from answer to chunk to source and source checksum.
- Log document version and chunk identifiers used for consequential answers.
- Generated indexes and evaluation results are reproducible artifacts and are
  excluded from source control by default.

## Suggested module responsibilities

- `ingestion`: connectors, file parsing, malware/type validation, metadata
  validation, deduplication, chunking, and embedding preparation.
- `retrieval`: authorization filters, hybrid search, reranking, freshness and
  jurisdiction filtering, citations, and abstention.
- `evaluation`: retrieval recall, citation correctness, groundedness, stale-data
  rejection, cross-tenant isolation, prompt-injection resistance, and latency.

The example configuration and schemas in this scaffold are technology-neutral;
the vector database and model provider can be selected later.
