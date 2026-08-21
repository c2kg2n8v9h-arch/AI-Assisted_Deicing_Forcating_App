import re
from playwright.sync_api import expect
def test_google_search (page):
  page.goto("https://www.google.com/ncr")
  try:
    page.get_by_role("button", name="Accept All").click(timeout =3000)
  except: 
    print ("no popup to accept")
    page.get_by_role("combobox", name="Search").fill("Playwright python")
    page.keyboard.press("Enter")
    expect(page).to_have_title(re.compile("Playwright",re.IGNORECASE))
                                          