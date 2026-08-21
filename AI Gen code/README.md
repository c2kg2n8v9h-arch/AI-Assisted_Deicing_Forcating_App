# Created by providing prompts to AI tools
# Airport Deicing Operations

A small Python application that predicts aircraft deicing needs, estimates treatment duration, prioritizes flights, assigns available deicing trucks, and reports operational risks.

## Run

From the project root:

```bash
python "Yuva/Deicing.py"
```

The application loads its weather, flight, and truck inputs from [data/operations_data.json](data/operations_data.json).

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

## Start the backend API

Install dependencies and start the local FastAPI server:

```bash
python -m pip install -r requirements.txt
python -m uvicorn Yuva.api:app --reload
```

API endpoints:

- `GET http://127.0.0.1:8000/health`
- `GET http://127.0.0.1:8000/operations`
- `POST http://127.0.0.1:8000/operations/dispatch` (dispatcher or admin)
- `GET http://127.0.0.1:8000/users/me`
- Interactive API documentation: `http://127.0.0.1:8000/docs`

### User permissions

Authentication is disabled for local development unless `DEICING_USERS` is configured. Copy [.env.example](.env.example) to `.env`, replace the example API keys, and load it before starting the server. Send keys as bearer tokens:

```text
Authorization: Bearer your-api-key
```

Roles are `viewer` (read operations), `dispatcher` (read and dispatch), and `admin` (all current permissions).

## Structure

```text
AI Gen code/
├── Yuva/Deicing.py           # Application and domain logic
├── Yuva/__init__.py          # Python package marker
├── data/operations_data.json # Runtime input data
├── Yuva/api.py               # FastAPI backend
├── frontend/                 # Operations dashboard assets
├── docs/                     # Guides and data documentation
├── tests/                    # Unit tests
├── .vscode/                  # Optional VS Code configuration
├── requirements.txt          # Third-party dependency declaration
└── pyproject.toml            # Project metadata
```

The command-line engine uses Python's standard library. The API layer uses FastAPI and Uvicorn.
