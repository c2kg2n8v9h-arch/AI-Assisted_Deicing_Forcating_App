# Approved knowledge

Only reviewed, non-secret documents may be made available to retrieval workflows.
Every ingested document must have ownership, classification, version, and source
metadata. Generated vector indexes do not belong in source control.

Use `manifest.example.json` as the minimum provenance record. Ingestion must reject
missing ownership, classification, version, review date, or source URI.
