# Airport Deicing Operations

## Overview

This project predicts deicing requirements, estimates treatment duration, assigns available deicing trucks, and reports operational risks.

The product requirements and implementation roadmap are documented in [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md).

This release is mock-data only. It has no live weather, flight, airport, GPS, or external database integration.

## Run the application

From the project root, run:

```bash
python "Yuva/Deicing.py"
```

The program prints truck dispatch recommendations, operational alerts, and shift summary KPIs.

## Backend API

Install the API dependencies and start the local server:

```bash
python -m pip install -r requirements.txt
python -m uvicorn Yuva.api:app --reload
```

The API provides `/health` and `/operations`. FastAPI's interactive documentation is available at `/docs`.

The dashboard includes an all-station mock weather overview, snow/precipitation details, estimated spray completion times, and next-flight countdowns.

## User roles

API routes use bearer API-key authentication when `DEICING_USERS` is configured. Without credentials, the application fails closed. Local development can explicitly use read-only mode with `DEICING_LOCAL_MODE=true`.

- `viewer`: read operations and user profile
- `dispatcher`: viewer permissions plus dispatch operations
- `admin`: dispatcher permissions plus administrative permissions

Use [.env.example](../.env.example) as the configuration template. Keep the real `.env` file out of source control.

## Project layout

```text
AI Gen code/
├── Yuva/Deicing.py          # Domain logic and command-line application
├── Yuva/api.py              # FastAPI backend
├── data/operations_data.json # Sample operational data
├── docs/                    # Project documentation
├── tests/                   # Test files
├── .vscode/                 # VS Code settings and tasks
└── requirements.txt         # Python dependency declaration
```

## Current behavior

The executable currently creates its weather, flight, and truck data in `Deicing.py`. The JSON file in `data/` documents equivalent sample input but is not loaded automatically yet.
