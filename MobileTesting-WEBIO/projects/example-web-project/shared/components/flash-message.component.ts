import type { ChainablePromiseElement } from 'webdriverio';

export class FlashMessageComponent {
  get root(): ChainablePromiseElement {
    return $('#flash');
  }
}
