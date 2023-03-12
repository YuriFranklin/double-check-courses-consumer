import puppeteer, {
    Browser,
    BrowserConnectOptions,
    BrowserLaunchArgumentOptions,
    LaunchOptions,
    Page,
    Protocol,
} from 'puppeteer';

export default class PuppeteerAdapter {
    private static browser: Browser | undefined;
    public static readonly limitTabs = 5;
    private static openedTabs = 0;

    protected async openTab(
        cookie?: Protocol.Network.CookieParam[],
    ): Promise<Page> {
        const eventLoopQueue = () => {
            return new Promise<void>((resolve) =>
                setImmediate(() => {
                    resolve();
                }),
            );
        };

        try {
            if (!PuppeteerAdapter.browser) await this.openBrowser();

            if (!PuppeteerAdapter.browser) throw 'Browser not opened';

            if (PuppeteerAdapter.openedTabs > PuppeteerAdapter.limitTabs) {
                await eventLoopQueue();
                return this.openTab();
            }
            PuppeteerAdapter.openedTabs++;
            const tab = await PuppeteerAdapter.browser?.newPage();
            await this.configureTab(tab, cookie);
            return tab;
        } catch (error) {
            throw error;
        }
    }

    protected async configureTab(
        tab: Page,
        cookie?: Protocol.Network.CookieParam[],
    ) {
        await tab.setDefaultNavigationTimeout(0);
        await tab.setRequestInterception(true);

        if (cookie) await tab.setCookie(...cookie);

        tab.on('request', (req) => {
            if (
                req.resourceType() === 'stylesheet' ||
                req.resourceType() === 'font' ||
                req.resourceType() === 'image'
            ) {
                req.abort();
            } else {
                req.continue();
            }
        });
    }

    protected async closeTab(page: Page): Promise<void> {
        try {
            await page.close();
            PuppeteerAdapter.openedTabs--;
        } catch (e) {
            throw e;
        }
    }

    protected async openBrowser(): Promise<Browser> {
        if (PuppeteerAdapter.browser) {
            return PuppeteerAdapter.browser;
        }

        const props: LaunchOptions &
            BrowserLaunchArgumentOptions &
            BrowserConnectOptions = {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            headless: false,
            defaultViewport: null,
            args: [
                '--start-maximized',
                '--hide-scrollbars',
                '--ignore-gpu-blacklist',
                '--ipc-connection-timeout=100000',
                '--unlimited-storage',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--mute-audio',
                '--max_old_space_size=512',
                '--max_semi_space_size=512',
            ],
        };

        try {
            PuppeteerAdapter.browser = await puppeteer.launch(props);
            return PuppeteerAdapter.browser;
        } catch (error) {
            throw error;
        }
    }

    public async closeBrowser(): Promise<void> {
        try {
            if (!PuppeteerAdapter.browser) {
                return;
            }

            await PuppeteerAdapter.browser.close();
            PuppeteerAdapter.browser = undefined;
        } catch (error) {
            throw error;
        }
    }
}
