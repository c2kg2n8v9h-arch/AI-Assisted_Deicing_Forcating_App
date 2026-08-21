import os
import re
import socket
import subprocess
import sys
import time
from collections.abc import Iterator
from urllib.request import urlopen

import pytest
from playwright.sync_api import Page, expect, sync_playwright


@pytest.fixture(scope="session")
def application_url() -> Iterator[str]:
    port = _free_port()
    environment = os.environ.copy()
    environment.pop("DEICING_USERS", None)
    environment["PYTHONUNBUFFERED"] = "1"
    command = [
        sys.executable,
        "-m",
        "uvicorn",
        "Yuva.api:app",
        "--host",
        "127.0.0.1",
        "--port",
        str(port),
    ]
    server = subprocess.Popen(
        command,
        cwd=os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        env=environment,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    url = f"http://127.0.0.1:{port}"
    try:
        _wait_for_server(f"{url}/health")
        yield url
    finally:
        server.terminate()
        server.wait(timeout=10)


def _free_port() -> int:
    with socket.socket() as connection:
        connection.bind(("127.0.0.1", 0))
        return connection.getsockname()[1]


def _wait_for_server(url: str) -> None:
    for _ in range(50):
        try:
            with urlopen(url, timeout=1) as response:
                if response.status == 200:
                    return
        except OSError:
            time.sleep(0.1)
    raise RuntimeError(f"Application did not start at {url}")


@pytest.fixture
def page() -> Iterator[Page]:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        dashboard_page = browser.new_page()
        yield dashboard_page
        browser.close()


def test_dashboard_renders_operations_data(page: Page, application_url: str):
    page.goto(application_url)

    expect(page).to_have_title("Deicing Operations Control")
    expect(page.locator("h1")).to_have_text("Deicing control")
    expect(page.locator("#flight-count")).to_have_text("8")
    expect(page.locator("#deicing-count")).to_have_text("8")
    expect(page.locator("#flight-rows tr")).to_have_count(8)
    expect(page.locator("#flight-rows")).to_contain_text("MOCK-FLT-001")
    expect(page.locator("#truck-list")).to_contain_text("MOCK-TRUCK-04")
    expect(page.locator("#alert-list")).to_contain_text("CRITICAL RISK")


def test_refresh_button_updates_dashboard(page: Page, application_url: str):
    page.goto(application_url)

    page.get_by_role("button", name="Refresh data").click()

    expect(page.locator("#toast")).to_have_text("Operations data refreshed")
    expect(page.locator("#toast")).to_have_class(re.compile(r"\bvisible\b"))
    expect(page.locator("#queue-status")).to_contain_text("units assigned")
