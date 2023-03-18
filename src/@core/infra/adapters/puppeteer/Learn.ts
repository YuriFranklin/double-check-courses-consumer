import Puppeteer from './PuppeteerAdapter';
import { Page, Protocol } from 'puppeteer';
import 'dotenv/config';

export default class Learn extends Puppeteer {
    private cookie: Protocol.Network.Cookie[];

    constructor() {
        super();
    }

    public async openPage(): Promise<Page> {
        try {
            if (this.cookie?.length) {
                const page = await this.openTab(this.cookie);

                const isValid = await this.isCookieValid({
                    page,
                    cookie: this.cookie,
                });

                if (isValid) return page;
            }
            const page = await this.openTab();
            return this.signIn({
                page,
                login: process.env.LEARN_USER_NAME || '',
                password: process.env.LEARN_PASSWORD || '',
            });
        } catch (error) {
            throw error;
        }
    }

    public async closePage(page: Page) {
        try {
            await this.closeTab(page);
        } catch (error) {
            throw error;
        }
    }

    private async signIn(input: {
        page: Page;
        login: string;
        password: string;
    }): Promise<Page> {
        const { page, login, password } = input;
        try {
            await page.goto(`${process.env.LEARN_BASE_URL}/`);

            const vars = { login, password };
            const val = (c: typeof vars) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                cookieConsent.agree('/webapps/login/?action=logout');

                const userName = document.getElementById('user_id');
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                userName.value = c.login;

                const password = document.getElementById('password');
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                password.value = c.password;

                document.querySelectorAll('form')[1].submit();
            };

            await page.evaluate(
                '(' + val.toString() + `)(${JSON.stringify(vars)});`,
                vars,
            );

            let cookie: Protocol.Network.Cookie[];

            await page
                .waitForNavigation({ waitUntil: 'networkidle0' })
                .then(async () => {
                    cookie = await page.cookies();
                });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (!cookie)
                throw Error(
                    'Ocorreu um erro durante o login, tente novamente.',
                );
            this.cookie = cookie;
            return page;
        } catch (error) {
            throw error;
        }
    }

    private async isCookieValid(params: {
        page: Page;
        cookie: Protocol.Network.CookieParam[];
    }): Promise<boolean> {
        const { page, cookie } = params;
        if (!cookie) return false;

        try {
            await page.goto(
                `${process.env.LEARN_BASE_URL}/webapps/blackboard/execute/courseManager?sourceType=COURSES`,
                {
                    waitUntil: 'networkidle0',
                },
            );

            // BRAZILIAN WAY TO SOLVE PROBLEM, USUALLY NAMED "GAMBIARRA".
            const user: { userName?: string } =
                (await page.evaluate(`(async () => fetch(
        '${process.env.LEARN_BASE_URL}/learn/api/v1/users/me'
      ).then((response) => response.json()))()`)) as { userName?: string };

            if (!user.userName) return false;

            return true;
        } catch (err) {
            throw err;
        }
    }
}
