# Airport Deicing Operations

## Overview

This project predicts deicing requirements, estimates treatment duration, assigns available deicing trucks, and reports operational risks.

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
