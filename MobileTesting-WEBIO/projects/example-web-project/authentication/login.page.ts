import type { ChainablePromiseElement } from 'webdriverio';

import { FlashMessageComponent } from '../shared/components/flash-message.component.js';
import { BasePage } from '../shared/pages/base.page.js';
import type { LoginCredentials } from './login.data.js';

class LoginPage extends BasePage {
  readonly flashMessage = new FlashMessageComponent();

  get usernameInput(): ChainablePromiseElement {
    return $('#username');
  }

  get passwordInput(): ChainablePromiseElement {
    return $('#password');
  }

  get submitButton(): ChainablePromiseElement {
    return $('button[type="submit"]');
  }

  get secureAreaHeading(): ChainablePromiseElement {
    return $('h2');
  }

  async open(): Promise<void> {
    await this.openPath('/login');
  }

  async login(credentials: LoginCredentials): Promise<void> {
    await this.usernameInput.setValue(credentials.username);
    await this.passwordInput.setValue(credentials.password);
    await this.submitButton.click();
  }
}

export const loginPage = new LoginPage();
