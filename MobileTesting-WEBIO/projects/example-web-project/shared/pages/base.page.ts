export abstract class BasePage {
  protected async openPath(path: string): Promise<void> {
    await browser.url(path);
  }
}
