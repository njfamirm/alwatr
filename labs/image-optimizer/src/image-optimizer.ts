import {banner} from './lib/banner.js';
import {pageHome} from './pages/page-home.js';
import {pageOptimizer} from './pages/page-optimizer.js';
import {pageRemoveExtra} from './pages/page-remove-extra.js';

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
  }

  if (x === 3) {
    await $`clear`;
    break;
  }
}
