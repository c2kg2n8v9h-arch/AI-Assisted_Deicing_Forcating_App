import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

const { describe, it, after, beforeEach } = globalThis;
const output = fileURLToPath(
  new URL(`../../artifacts/amazon/${process.env.AUTOMATION_RUN_ID}/`, import.meta.url),
);
const report = { steps: [], controls: [] };

async function evidence(name) {
  await mkdir(output, { recursive: true });
  await globalThis.browser.saveScreenshot(path.join(output, `${name}.png`));
  await writeFile(path.join(output, `${name}.html`), await globalThis.browser.getPageSource());
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

async function visibleElements(elements) {
  const visible = [];
  for (const element of elements) {
    if (await element.isDisplayed()) visible.push(element);
  }
  return visible;
}

describe('Amazon Bose shopping flow', function () {
  this.timeout(600000);

  beforeEach(async function () {
    if (this.currentTest.title.startsWith('searches')) return;
    if (!report.productUrl) this.skip();
    await globalThis.browser.url(report.productUrl);
    await globalThis.$('#productTitle').waitForDisplayed({ timeout: 30000 });
  });

  after(async () => {
    await mkdir(output, { recursive: true });
    await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  });

  it('searches Bose and inspects the first non-sponsored product', async () => {
    const { browser, $ } = globalThis;
    await step('01-homepage', async () => {
      await browser.url('https://www.amazon.com');
      await $('#twotabsearchtextbox').waitForDisplayed({ timeout: 30000 });
      assert.match(new URL(await browser.getUrl()).hostname, /(^|\.)amazon\.com$/);
    });
    await step('02-search', async () => {
      await $('#twotabsearchtextbox').setValue('Bose');
      await $('#nav-search-submit-button').click();
      await $('[data-component-type="s-search-result"]').waitForDisplayed({ timeout: 30000 });
      assert.equal(new URL(await browser.getUrl()).searchParams.get('k'), 'Bose');
    });
    await step('03-first-organic-product', async () => {
      const results = await browser.$$('[data-component-type="s-search-result"][data-asin]');
      let selected;
      for (const result of results) {
        if (!(await result.isDisplayed())) continue;
        if (/\bSponsored\b/i.test(await result.getText())) continue;
        const heading = result.$('a:has(h2)');
        if (!(await heading.isExisting())) continue;
        const title = await heading.getText();
        assert.match(
          await result.getText(),
          /Bose/i,
          'First organic result must be relevant to Bose',
        );
        selected = { title, asin: await result.getAttribute('data-asin') };
        await heading.click();
        break;
      }
      assert.ok(selected, 'No non-sponsored product was found');
      report.product = selected;
      await $('#productTitle').waitForDisplayed({ timeout: 30000 });
      assert.match(await $('#productTitle').getText(), /Bose/i);
      assert.ok(
        (await browser.getUrl()).includes(selected.asin),
        'Opened ASIN must match selected result',
      );
      await $('#landingImage').waitForDisplayed();
      report.productUrl = await browser.getUrl();
      report.controls = await browser.execute(() =>
        Array.from(
          globalThis.document.querySelectorAll(
            '#dp a,#dp button,#dp input:not([type="hidden"]),#dp select,#dp summary',
          ),
        )
          .filter((element) => element.getClientRects().length)
          .map((element) => ({
            tag: element.tagName,
            id: element.id,
            text: (
              element.innerText ||
              element.getAttribute('aria-label') ||
              element.getAttribute('value') ||
              ''
            )
              .trim()
              .slice(0, 180),
            href: element.getAttribute('href'),
          })),
      );
    });
  });

  it('checks all image thumbnails and product details expanders', async () => {
    const { browser, $ } = globalThis;
    await step('04-image-gallery', async () => {
      const thumbnails = await browser.$$('#altImages .imageThumbnail');
      assert.ok(thumbnails.length > 1, 'Product image gallery is present');
      report.galleryImages = thumbnails.length;
      let lastSelectedImage = await $('#landingImage').getAttribute('src');
      for (let index = 0; index < thumbnails.length; index++) {
        const thumbnail = thumbnails[index];
        await thumbnail.click();
        await browser.pause(600);
        const selectedImage = await $('#landingImage').getAttribute('src');
        assert.ok(selectedImage, `Image ${index + 1} displayed after thumbnail click`);
        lastSelectedImage = selectedImage || lastSelectedImage;
      }
      assert.ok(lastSelectedImage, 'Gallery displayed at least one selected image');
    });
    await step('05-product-details', async () => {
      await $('#seeMoreDetailsLink').click();
      const details = $('#productDetails_feature_div');
      await details.waitForDisplayed();
      assert.match(await details.getText(), /Product information|Item details/i);
      const expanders = await details.$$('[aria-expanded="false"]');
      report.detailsExpanders = expanders.length;
      for (const expander of expanders) {
        if (!(await expander.isDisplayed())) continue;
        await expander.click();
        await browser.waitUntil(
          async () => (await expander.getAttribute('aria-expanded')) === 'true',
          { timeout: 5000 },
        );
      }
    });
  });

  it('checks all available color buttons and quantity options', async () => {
    const { browser, $ } = globalThis;
    await step('06-color-options', async () => {
      const selector = '#inline-twister-expander-content-color_name input[type="submit"]';
      const options = await visibleElements(await browser.$$(selector));
      report.colorOptions = [];
      for (let index = 0; index < options.length; index++) {
        await browser.url(report.productUrl);
        await $('#productTitle').waitForDisplayed({ timeout: 30000 });
        const currentOptions = await visibleElements(await browser.$$(selector));
        const option = currentOptions[index];
        if (!option || !(await option.isEnabled())) continue;
        const optionName = (await option.getAttribute('aria-label')) || `option-${index + 1}`;
        await option.click();
        await browser.waitUntil(
          async () =>
            (await $('#productTitle')
              .isDisplayed()
              .catch(() => false)) ||
            /currently unavailable|see all buying options/i.test(await $('body').getText()),
          { timeout: 30000 },
        );
        assert.match(await $('body').getText(), /Bose/i);
        report.colorOptions.push(optionName);
      }
      assert.ok(report.colorOptions.length, 'Color option buttons were exercised');
      await browser.url(report.productUrl);
      await $('#productTitle').waitForDisplayed();
    });
    await step('07-quantity-options', async () => {
      const quantity = $('#quantity');
      const values = await quantity.$$('option').map((option) => option.getAttribute('value'));
      for (const value of values) {
        await quantity.selectByAttribute('value', value);
        assert.equal(await quantity.getValue(), value);
      }
      await quantity.selectByAttribute('value', '1');
    });
  });

  it('checks product section links and review navigation', async () => {
    const { browser, $ } = globalThis;
    await step('08-section-links', async () => {
      const targets = [
        '#featurebullets_feature_div',
        '#productDetails_feature_div',
        '#productDescription_feature_div',
        '#customer-reviews_feature_div',
      ];
      for (const target of targets) {
        await browser.execute((selector) => {
          const link = globalThis.document.querySelector(`a[href="${selector}"]`);
          if (link) link.click();
          globalThis.document.querySelector(selector)?.scrollIntoView({ block: 'center' });
        }, target);
        await $(target).waitForDisplayed();
        assert.ok((await $(target).getText()).trim().length, `${target} has content`);
      }
    });
    await step('09-reviews', async () => {
      const reviews = $('#customer-reviews_feature_div');
      await reviews.scrollIntoView();
      assert.match(await reviews.getText(), /customer reviews/i);
      assert.ok(await reviews.$('[data-hook="review"]').isExisting(), 'Individual reviews exist');
      const expanders = await reviews.$$(
        '[data-action="a-expander-toggle"][aria-expanded="false"]',
      );
      for (const expander of expanders) {
        if (!(await expander.isDisplayed())) continue;
        await expander.click();
        assert.equal(await expander.getAttribute('aria-expanded'), 'true');
      }
      await $('#cm_cr_top_reviews_to_arp_button').click();
      await browser.waitUntil(
        async () => /customer-reviews|product-reviews|signin/.test(await browser.getUrl()),
        { timeout: 15000 },
      );
      if (/signin/.test(await browser.getUrl())) {
        report.reviewNavigation = 'More reviews requires sign-in for this anonymous session';
        return;
      }
      assert.match(await $('body').getText(), /review/i);
    });
  });

  it('checks recommended product links', async () => {
    const { browser, $ } = globalThis;
    await step('10-recommendations', async () => {
      const sectionSelector =
        '#DetailPage_sims-container_desktop-dp-sims_1_container,#similarities_feature_div,#sp_detail_thematic-hercules_hybrid_deals_T1,#desktop-dp-sims_session-similarities-sims-feature';
      const section = $(sectionSelector);
      await section.scrollIntoView();
      await section.waitForDisplayed();
      const products = await browser.execute((selector) => {
        const seen = new Set();
        return Array.from(globalThis.document.querySelector(selector).querySelectorAll('a[href]'))
          .map((link) => {
            const href = link.href;
            const asin = href.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/)?.[1];
            return asin && !seen.has(asin) && link.getClientRects().length
              ? (seen.add(asin), { href, asin })
              : null;
          })
          .filter(Boolean)
          .slice(0, 3);
      }, sectionSelector);
      assert.ok(products.length, 'Recommendation section contains visible products');
      report.recommendations = [];
      for (const product of products) {
        await browser.url(report.productUrl);
        await browser.url(product.href);
        await $('#productTitle').waitForDisplayed({ timeout: 30000 });
        assert.ok((await browser.getUrl()).includes(product.asin));
        report.recommendations.push({
          asin: product.asin,
          title: await $('#productTitle').getText(),
        });
      }
    });
  });

  it('adds one selected product to cart and verifies its ASIN', async () => {
    const { browser, $ } = globalThis;
    await step('11-add-to-cart', async () => {
      const addToCart = $('#add-to-cart-button');
      await addToCart.scrollIntoView();
      await addToCart.waitForClickable();
      await addToCart.click();
      await browser.waitUntil(
        async () => {
          const noCoverageInput = $('#attachSiNoCoverage input');
          if (await noCoverageInput.isDisplayed().catch(() => false)) {
            await noCoverageInput.click();
          }
          await browser.execute(() => {
            const candidates = Array.from(
              globalThis.document.querySelectorAll(
                'button,input[type="submit"],span.a-button-text',
              ),
            );
            const noThanks = candidates.find((element) =>
              /^No thanks$/i.test(
                (
                  element.textContent ||
                  element.getAttribute('aria-label') ||
                  element.getAttribute('value') ||
                  ''
                ).trim(),
              ),
            );
            noThanks?.click();
          });
          const body = await $('body').getText();
          const cartCount = (
            await $('#nav-cart-count')
              .getText()
              .catch(() => '')
          ).trim();
          return /Added to (?:your )?cart|Proceed to checkout/i.test(body) || cartCount === '1';
        },
        { timeout: 30000, timeoutMsg: 'Add to Cart confirmation did not appear' },
      );
    });
    await step('12-cart-verification', async () => {
      await $('#nav-cart').click();
      const item = $(`[data-asin="${report.product.asin}"]`);
      await item.waitForDisplayed({ timeout: 15000 });
      assert.match(await item.getText(), /Bose/i);
      assert.equal((await $('#nav-cart-count').getText()).trim(), '1');
      report.cart = { asin: report.product.asin, count: 1, url: await browser.getUrl() };
    });
  });
});
