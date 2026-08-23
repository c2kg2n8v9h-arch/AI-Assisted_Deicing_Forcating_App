# Ingestion

Implement connectors and the ingestion pipeline here. The required order is:

1. Validate file type, size, malware status, and source authorization.
2. Calculate and retain a source checksum.
3. Validate required metadata and approval status.
4. Extract content without executing embedded instructions or active content.
5. Preserve headings, tables, page references, and section identifiers.
6. Chunk content and attach immutable source/version metadata to every chunk.
7. Produce an ingestion report containing accepted, rejected, and quarantined
   sources.

Ingestion must be repeatable and must not mutate files in `data/raw`.
