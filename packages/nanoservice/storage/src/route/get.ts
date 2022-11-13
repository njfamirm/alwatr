import {config, logger} from '../lib/config.js';
import {nanoServer} from '../lib/nano-server.js';
import {storageProvider} from '../lib/storage-provider.js';

import type {AlwatrConnection} from '@alwatr/nano-server';

nanoServer.route('GET', '/', getDocument);

async function getDocument(connection: AlwatrConnection): Promise<void> {
  logger.logMethod('getDocument');

  const token = connection.requireToken(config.token);
  if (token == null) return;

  const params = connection.requireQueryParams({storage: String, id: Number});
  if (params == null) return;

  const storage = storageProvider.get({name: params.storage});

  const document = storage.get(params.id, true);

  if (document == null) {
    return connection.reply({
      ok: false,
      statusCode: 404,
      errorCode: 'document_not_found',
    });
  }

  connection.reply({
    ok: true,
    data: document,
  });
}
