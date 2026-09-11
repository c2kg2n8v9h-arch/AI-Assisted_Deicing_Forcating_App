import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

const { describe, it, after } = globalThis;
const today = { month: 'Sep', day: '5', year: '2026' };
const output = fileURLToPath(
  new URL(`../../artifacts/timeanddate/${process.env.AUTOMATION_RUN_ID}/`, import.meta.url),
);
const report = { steps: [], dropdowns: [], headers: [], calculation: {} };

async function evidence(name) {
  await mkdir(output, { recursive: true });
  try {
    await globalThis.browser.saveScreenshot(path.join(output, `${name}.png`));
    await writeFile(path.join(output, `${name}.html`), await globalThis.browser.getPageSource());
  } catch (error) {
    await writeFile(path.join(output, `${name}.evidence-error.txt`), String(error));
  }
}

async function step(name, action) {
  try {
    await action();
    report.steps.push({ name, status: 'passed' });
    await evidence(name);
  } catch (error) {
    report.steps.push({ name, status: 'failed', error: String(error) });
    await evidence(`${name}-failed`);
    throw error;
  }
}

async function getVisibleText(selector) {
  const element = globalThis.$(selector);
  await element.waitForDisplayed({ timeout: 20000 });
  return (await element.getText()).trim();
}

async function fillDate(prefix, date) {
  const { $ } = globalThis;
  await $(`#m${prefix}`).setValue(date.month);
  await $(`#d${prefix}`).setValue(date.day);
  await $(`#y${prefix}`).setValue(date.year);
}

describe('Timeanddate duration flow', function () {
  this.timeout(300000);

  after(async () => {
    await mkdir(output, { recursive: true });
    await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  });

  it('verifies page elements, dropdowns, tabs, and Count Days duration', async () => {
    const { browser, $ } = globalThis;

    await step('01-open-duration-page', async () => {
      await browser.url('https://www.timeanddate.com/date/duration.html');
      await $('h1').waitForDisplayed({ timeout: 30000 });
      assert.equal(new URL(await browser.getUrl()).hostname, 'www.timeanddate.com');
      assert.match(await getVisibleText('h1'), /Days Calculator|Date to Date/i);
    });

    await step('02-verify-page-elements', async () => {
      const requiredSelectors = [
        '#m1',
        '#d1',
        '#y1',
        '#m2',
        '#d2',
        '#y2',
        '#ti',
        'input[type="submit"],button[type="submit"]',
      ];
      for (const selector of requiredSelectors) {
        assert.ok(await $(selector).isExisting(), `${selector} exists`);
      }
      const labels = await browser.execute(() =>
        Array.from(globalThis.document.querySelectorAll('label,th,legend,h1,h2,h3'))
          .map((element) => element.textContent.trim())
          .filter(Boolean),
      );
      assert.ok(
        labels.some((text) => /Start date/i.test(text)),
        'Start date label exists',
      );
      assert.ok(
        labels.some((text) => /End date/i.test(text)),
        'End date label exists',
      );
      assert.ok(
        labels.some((text) => /Include end date/i.test(text)),
        'Include end date label exists',
      );
    });

    await step('03-capture-and-test-dropdowns', async () => {
      report.dropdowns = await browser.execute(() =>
        Array.from(globalThis.document.querySelectorAll('select')).map((select) => ({
          id: select.id,
          name: select.name,
          label:
            globalThis.document.querySelector(`label[for="${select.id}"]`)?.textContent.trim() ||
            select.closest('tr')?.textContent.trim().replace(/\s+/g, ' ').slice(0, 120) ||
            '',
          options: Array.from(select.options).map((option) => ({
            text: option.text.trim(),
            value: option.value,
          })),
        })),
      );

      for (const dropdown of report.dropdowns) {
        assert.ok(dropdown.options.length > 0, `${dropdown.id || dropdown.name} has options`);
        const selector = dropdown.id ? `#${dropdown.id}` : `select[name="${dropdown.name}"]`;
        const element = $(selector);
        await element.waitForDisplayed({ timeout: 10000 });
        const sampleOptions = [
          dropdown.options[0],
          dropdown.options[Math.floor(dropdown.options.length / 2)],
          dropdown.options[dropdown.options.length - 1],
        ].filter(Boolean);
        for (const option of sampleOptions) {
          await element.selectByAttribute('value', option.value);
          assert.equal(await element.getValue(), option.value);
        }
      }
    });

    await step('04-verify-tab-headers', async () => {
      const tabs = await browser.execute(() =>
        Array.from(globalThis.document.querySelectorAll('.nav-tabs a[id^="datetabs_"]')).map(
          (link) => ({ text: link.textContent.trim(), href: link.href }),
        ),
      );
      const seen = new Set();
      for (const tab of tabs) {
        if (!tab.href || seen.has(tab.href)) continue;
        seen.add(tab.href);
        await browser.url(tab.href);
        const header = await getVisibleText('h1');
        report.headers.push({ tab: tab.text || tab.href, url: await browser.getUrl(), header });
        assert.ok(header.length > 0, `Header exists for ${tab.text || tab.href}`);
      }
      assert.ok(
        report.headers.some((entry) => /duration|date to date|days calculator/i.test(entry.header)),
        'Count Days or duration header was verified',
      );
    });

    await step('05-count-days-calculation', async () => {
      await browser.url('/date/duration.html');
      await $('#m1').waitForDisplayed({ timeout: 30000 });
      await fillDate('1', { month: 'Sep', day: '4', year: '2006' });
      await fillDate('2', today);
      const includeEndDate = $('#ti');
      if (!(await includeEndDate.isSelected())) await includeEndDate.click();
      await $('input[type="submit"],button[type="submit"]').click();
      await browser.waitUntil(async () => /result|duration|days/i.test(await $('body').getText()), {
        timeout: 30000,
        timeoutMsg: 'Calculation result did not appear',
      });
      const body = await $('body').getText();
      assert.match(body, /7,?307|7307/, 'Duration includes 7,307 days when end date is included');
      assert.match(body, /September 4, 2006|Sep/i);
      assert.match(body, /September 5, 2026|Sep/i);
      report.calculation = {
        startDate: 'September 4, 2006',
        endDate: 'September 5, 2026',
        includeEndDate: true,
        expectedDays: 7307,
        url: await browser.getUrl(),
      };
    });
  });
});
