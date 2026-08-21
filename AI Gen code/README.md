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

## Structure

```text
AI Gen code/
├── Yuva/Deicing.py           # Application and domain logic
├── Yuva/__init__.py          # Python package marker
├── data/operations_data.json # Runtime input data
├── docs/                     # Guides and data documentation
├── tests/                    # Unit tests
├── .vscode/                  # Optional VS Code configuration
├── requirements.txt          # Third-party dependency declaration
└── pyproject.toml            # Project metadata
```

This project currently uses only Python's standard library.
