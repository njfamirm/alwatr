import {createLogger} from '@alwatr/logger';

export const config = {
  name: process.env.NAME ?? 'PWDCrawler',
  puppeteer: {
    headless: process.env.HEADLESS === '1' ? true : false,
    devtools: process.env.DEV_TOOL === '1' ? true : false,
  },
  account: {
    id: process.env.ACCOUNT_ID,
    password: process.env.ACCOUNT_PASSWORD,
    cookie: process.env.ACCOUNT_COOKIE,
  },
};

export const logger = createLogger(config.name);

logger.logProperty?.('config', config.puppeteer);
