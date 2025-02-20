import {serverContextConsumer} from '@alwatr/context';

import {config} from '../../config.js';

import type {AlwatrDocumentStorage, User} from '@alwatr/type';
import type {Order} from '@alwatr/type/customer-order-management.js';

export const orderStorageContextConsumer = serverContextConsumer<AlwatrDocumentStorage<Order>>(
    'order_storage_context',
    {
      ...config.fetchContextOptions,
      url: config.api + '/order-list/',
    },
);

orderStorageContextConsumer.fsm.defineSignals([
  {
    signalId: 'user_context',
    callback: (user: User): void => {
      orderStorageContextConsumer.request({
        queryParameters: {
          userId: user.id,
        },
      });
    },
    receivePrevious: 'NextCycle',
  },
  {
    signalId: 'reload_order_storage',
    transition: 'REQUEST',
  },
]);
