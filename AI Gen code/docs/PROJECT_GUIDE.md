# Airport Deicing Operations

## Overview

This project predicts deicing requirements, estimates treatment duration, assigns available deicing trucks, and reports operational risks.

## Run the application

From the project root, run:

```bash
python "Yuva/Deicing.py"
```

The program prints truck dispatch recommendations, operational alerts, and shift summary KPIs.

## Project layout

```text
AI Gen code/
├── Yuva/Deicing.py          # Main Python application
├── data/operations_data.json # Sample operational data
├── docs/                    # Project documentation
├── tests/                   # Test files
├── .vscode/                 # VS Code settings and tasks
└── requirements.txt         # Python dependency declaration
```

## Current behavior

The executable currently creates its weather, flight, and truck data in `Deicing.py`. The JSON file in `data/` documents equivalent sample input but is not loaded automatically yet.
