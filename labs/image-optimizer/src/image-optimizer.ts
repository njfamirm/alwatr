import {banner} from './lib/banner.js';
import {pageHome} from './pages/page-home.js';
import {pageOptimizer} from './pages/page-optimizer.js';
import {pageRemoveExtra} from './pages/page-remove-extra.js';
import {pageThumbnail} from './pages/page-thumbnail.js';

// eslint-disable-next-line no-constant-condition
while (1) {
  await banner();
  const x = await pageHome();

  switch (x) {
    case 1:
      await banner();
      await pageOptimizer();
      break;

    case 2:
      await banner();
      await pageRemoveExtra();
      break;

    case 3:
      await banner();
      await pageThumbnail();
      break;
  }

  if (x === 4) {
    await $`clear`;
    break;
  }
}
