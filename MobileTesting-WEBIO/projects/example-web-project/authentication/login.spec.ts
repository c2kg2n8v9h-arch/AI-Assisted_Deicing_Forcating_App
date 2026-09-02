import { expect } from '@wdio/globals';

import { loginData } from './login.data.js';
import { loginPage } from './login.page.js';

describe('[authentication] Login', () => {
  it('[smoke] allows a valid user to enter the secure area', async () => {
    await loginPage.open();
    await loginPage.login(loginData.validUser);

    await expect(loginPage.secureAreaHeading).toHaveText('Secure Area');
    await expect(loginPage.flashMessage.root).toHaveText(
      expect.stringContaining('You logged into a secure area!'),
    );
  });

  it('[regression] rejects an invalid password with a useful message', async () => {
    await loginPage.open();
    await loginPage.login(loginData.invalidUser);

    await expect(loginPage.flashMessage.root).toHaveText(
      expect.stringContaining('Your password is invalid!'),
    );
  });
});
