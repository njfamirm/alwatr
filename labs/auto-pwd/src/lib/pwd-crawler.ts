import {delay} from '@alwatr/util';

import {Browser} from './browser.js';

import type {PptrPage, UserInfo, PuppeteerOption, SessionInfo} from './type.js';
import type {KeyInput, Target} from 'puppeteer';

export class PWDCrawler extends Browser {
  protected _userInfo?: UserInfo;

  isLogin = false;
  sessionInfo?: SessionInfo;

  constructor(config: PuppeteerOption) {
    super(config);
    this._$targetCreatedHandler = this._$targetCreatedHandler.bind(this);
    this._$enterSingleLineCommand = this._$enterSingleLineCommand.bind(this);

    this.readyStatePromise.then(() => {
      this.browser?.on('targetcreated', this._$targetCreatedHandler);
    });
  }

  protected override async _init(): Promise<void> {
    await super._init();
    await this.openPage('pwd', 'https://labs.play-with-docker.com/');
  }

  async loginWithCookie(id: string): Promise<void> {
    if (this.isLogin) {
      this._logger.incident?.('loginWithCookie', 'USER_LOGIN_BEFORE', 'User login before.');
      return;
    }
    this._logger.logMethod?.('loginWithCookie');
    await this.pages.pwd.setCookie({name: 'id', value: id});
    await this.pages.pwd.reload();
  }

  async loginWithUsername(userinfo: UserInfo): Promise<void> {
    if (this.isLogin) {
      this._logger.incident?.('loginWithUsername', 'USER_LOGIN_BEFORE', 'User login before.');
      return;
    }
    this._logger.logMethod?.('loginWithUsername');
    this._userInfo = userinfo;
    await this._openLoginPage();
  }

  async checkLoginStatus(): Promise<boolean> {
    this._logger.logMethod?.('checkLoginStatus');

    try {
      await this.pages.pwd.waitForSelector('a.btn-success', {visible: true});
      this.isLogin = true;
    }
    catch {
      this.isLogin = false;
    }
    this._logger.logProperty?.('isLogin', this.isLogin);
    return this.isLogin;
  }

  async startSession(): Promise<void> {
    this._logger.logMethod?.('startSession');

    await this.pages.pwd.$eval('a.btn-success', async (button) => {
      (button as HTMLButtonElement)?.click();
    });

    let retry = 10;
    for (;;) {
      if (this.pages.pwd.url().startsWith('https://labs.play-with-docker.com/p/')) {
        break;
      }
      else if (this.pages.pwd.url().startsWith('https://labs.play-with-docker.com/ooc')) {
        this._logger.error('startSession', 'OCC', 'OCC page returned.');
        this.browser?.close();
      }
      await delay(1000);
      retry--;
      if (retry === 0) {
        this._logger.error('startSession', 'start_session_timeout', 'start session timeout.');
        this.browser?.close();
      }
    }

    this._logger.logProperty?.('sessionUrl', this.pages.pwd.url());
    this.pages.session = this.pages.pwd;
    delete this.pages.pwd;
    this.sessionInfo = {
      sessionUrl: this.pages.session.url(),
      instanceDomainList: [],
    };
  }

  async addNewInstance(): Promise<void> {
    this._logger.logMethod?.('addNewInstance');
    await this.pages.session.waitForSelector('button.md-primary.md-button.md-ink-ripple');
    await this.pages.session.$eval('button.md-primary.md-button.md-ink-ripple', async (button) => {
      (button as HTMLButtonElement)?.click();
    });

    await this._$copyServerDomain();

    this._logger.logProperty?.('sessionInfo', this.sessionInfo);
  }

  private async _$enterSingleLineCommand(command: string): Promise<void> {
    for (const char of command) {
      const chatList =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[|]{};:\'",./<>?`~ ';
      if (chatList.includes(char)) {
        await this.pages.session.keyboard.press(char as KeyInput);
      }
    }
    await this.pages.session.keyboard.press('Enter');
  }

  async enterCommand(command: string): Promise<void> {
    this._logger.logMethodArgs?.('enterCommand', {command: command});

    // Split command on each line
    for (const singleLineCommand of command.split('\n')) {
      await this._$enterSingleLineCommand(singleLineCommand);
    }
  }

  private async _$copyServerDomain(): Promise<void> {
    this._logger.logMethod?.('__copyServerDomain');
    await this.pages.session.waitForSelector('input#input_3.md-input');
    const instanceDomain = (
      await this.pages.session.$eval('input#input_3.md-input', (input) => (input as HTMLInputElement).value)
    ).replace('ssh ', '');
    this.sessionInfo?.instanceDomainList?.push(instanceDomain);
    // this.sessionInfo?.instanceDomainList?.push(instanceDomain);
    this._logger.logProperty?.('instanceIP', this.sessionInfo);
  }

  private async _openLoginPage(): Promise<void> {
    this._logger.logMethod?.('__openLoginPage');
    if (this._readyState === false) throw new Error('not_ready');

    await this.pages.pwd.waitForSelector('#btnGroupDrop1');
    await this.pages.pwd.$eval('#btnGroupDrop1', async (button) => {
      (button as HTMLButtonElement)?.click();
    });
    await this.pages.pwd.waitForSelector('a.dropdown-item.ng-binding.ng-scope', {visible: true});
    await this.pages.pwd.$eval('a.dropdown-item.ng-binding.ng-scope', async (button) => {
      (button as HTMLButtonElement)?.click();
    });
  }

  private async _$targetCreatedHandler(target: Target): Promise<void> {
    this._logger.logMethod?.('__targetCreatedHandler');
    if (target.type() === 'page') {
      const page = (await target.page()) as PptrPage;
      const pageUrl = page?.url();
      if (pageUrl.startsWith('https://login.docker.com/')) {
        this.pages['login'] = page;
        await this._$login();
      }
    }
  }

  private async _$login(): Promise<void> {
    this._logger.logMethod?.('__login');
    await this._$loginUser();

    delete this.pages.login;
  }

  private async _$loginUser(): Promise<void> {
    this._logger.logMethod?.('__typeUserInfoAtLogin');

    // Enter id
    await this.pages.login.waitForSelector('#username');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await this.pages.login.type('#username', this._userInfo!.id);

    await this.pages.login.waitForSelector('button._button-login-id');
    await this.pages.login.$eval('button._button-login-id', async (button) => {
      (button as HTMLButtonElement)?.click();
    });

    // Enter Password
    await this.pages.login.waitForSelector('#password');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await this.pages.login.type('#password', this._userInfo!.password);

    await this.pages.login.waitForSelector('button._button-login-password');
    await this.pages.login.$eval('button._button-login-password', async (button) => {
      (button as HTMLButtonElement)?.click();
    });
  }
}
