import {config} from '../config.js';

import type {PWDCrawler} from './pwd-crawler.js';


export async function login(browser: PWDCrawler): Promise<void> {
  if (config.account.cookie != null) {
    await browser.loginWithCookie(config.account.cookie);
  }
  else if (config.account.id != null && config.account.password != null) {
    await browser.loginWithUsername({
      id: config.account.id,
      password: config.account.password,
    });
  }
  else {
    throw new Error('login_failed', {cause: {
      id: config.account.id,
      password: config.account.password,
      cookie: config.account.cookie,
    }});
  }
}
