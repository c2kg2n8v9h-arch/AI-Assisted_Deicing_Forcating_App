# Created by providing prompts to AI tools
# Airport Deicing Operations

A small Python application that predicts aircraft deicing needs, estimates treatment duration, prioritizes flights, assigns available deicing trucks, and reports operational risks.

## Run

From the project root:

```bash
python "Yuva/Deicing.py"
```

The application loads its weather, flight, and truck inputs from [data/operations_data.json](data/operations_data.json).

## Prototype data boundary

This is a mock-data prototype. It does not connect to live weather services, airline systems, airport operations feeds, GPS/telematics, or external databases. All operational values come from the local JSON files under `data/`, and the dashboard makes same-origin requests only. Do not use its recommendations for real operational decisions.

## Test

Run the standard-library unit tests with:

```bash
python -m unittest discover -s tests -p "test_*.py" -v
```

Run browser automation tests after installing Playwright's Chromium browser:

```bash
python -m pip install -r requirements.txt
python -m playwright install chromium
pytest tests/playwright -v
```

Playwright tests open a visible Chromium browser by default. For headless execution in CI, use:

```bash
set PLAYWRIGHT_HEADLESS=true
pytest tests/playwright -v
```

The browser stays open for 5 seconds after each test by default. To keep it open longer:

```bash
set PLAYWRIGHT_WAIT_SECONDS=15
pytest tests/playwright -v
```

## Start the backend API

Install dependencies and start the local FastAPI server:

```bash
python -m pip install -r requirements.txt
python -m uvicorn Yuva.api:app --reload
```

API endpoints:

- `GET http://127.0.0.1:8000/health`
- `GET http://127.0.0.1:8000/operations`
- `GET http://127.0.0.1:8000/operations?station=DEN`
- `GET http://127.0.0.1:8000/stations`
- `POST http://127.0.0.1:8000/operations/dispatch` (dispatcher or admin)
- `GET http://127.0.0.1:8000/users/me`
- Interactive API documentation: `http://127.0.0.1:8000/docs`

### User permissions

Authentication is required by default. For local read-only dashboard development, explicitly set `DEICING_LOCAL_MODE=true`. Production deployments must configure `DEICING_USERS` through a secret manager or private environment; never commit credentials. Send configured keys as bearer tokens:

```text
Authorization: Bearer your-api-key
```

Roles are `viewer` (read operations), `dispatcher` (read and dispatch), and `admin` (all current permissions). Local mode only provides `viewer` access.

The dashboard station selector supports `DEN`, `BZN`, and `ORD`. Station profiles are stored in [data/stations.json](data/stations.json); the current release uses shared mock flight and truck operations data with station-specific weather and airport context.

## Structure

```text
AI Gen code/
├── Yuva/Deicing.py           # Application and domain logic
├── Yuva/__init__.py          # Python package marker
├── data/operations_data.json # Runtime input data
├── data/stations.json        # Supported station profiles
├── Yuva/api.py               # FastAPI backend
├── frontend/                 # Operations dashboard assets
├── docs/                     # Guides and data documentation
├── tests/                    # Unit tests
├── .vscode/                  # Optional VS Code configuration
├── requirements.txt          # Third-party dependency declaration
└── pyproject.toml            # Project metadata
```

The command-line engine uses Python's standard library. The API layer uses FastAPI and Uvicorn.
