import {delay} from '@alwatr/util';

import {config, logger} from './config.js';
import {login} from './lib/login.js';
import {PWDCrawler} from './lib/pwd-crawler.js';

logger.logOther?.('..:: Alwatr Auto PWD ::..');

const pwdBrowser = new PWDCrawler({
  name: config.name,
  headless: config.puppeteer.headless,
  devtools: config.puppeteer.devtools,
  product: 'chrome',
  // chromium path on macos
  executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
  // args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

await pwdBrowser.readyStatePromise;

await login(pwdBrowser);
while (!(await pwdBrowser.checkLoginStatus())) await delay(3000);
await pwdBrowser.startSession();
await pwdBrowser.addNewInstance();

logger.logOther?.('Run dotfiles installer script');
await pwdBrowser.enterCommand(`curl -fsSL https://raw.githubusercontent.com/njfamirm/dotfiles/main/install.sh | bash`);
// await pwdBrowser.close();

logger.logOther?.('Done!');
