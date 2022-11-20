import type {DocumentObject} from '@alwatr/storage-engine';

export type AlwatrStorageClientConfig = {
  /**
   * Storage name (like database name).
   */
  name: string;

  /**
   * Storage server host name (URL).
   */
  host: string;

  /**
   * Storage server token (like database password).
   */
  token: string;

  /**
   * A timeout in ms for the fetch request.
   *
   * Use with cation, you will have memory leak issue in nodejs.
   *
   * @default 0 disabled
   */
  timeout?: number;

  /**
   * Debug output logs
   *
   * @default undefined Auto detect base on `NODE_ENV`
   */
  debug?: boolean;
};

type ServerResponseFailed = {
  ok: false;
  statusCode: number;
  errorCode: string;
  data?: Record<string, unknown>;
};

type ServerResponseSuccess<DataType> = {
  ok: true;
  statusCode?: number;
  data: DataType;
};

export type ServerResponse<DataType extends Record<string, unknown> = DocumentObject> =
  | ServerResponseSuccess<DataType>
  | ServerResponseFailed;
