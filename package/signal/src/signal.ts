import {
  logger,
  _getSignalObject,
  _callListeners,
  _removeSignalListener,
} from './core';

import type {
  ListenerOptions,
  DispatchOptions,
  ListenerCallback,
  ListenerObject,
  SignalProvider,
  SignalProviderOptions,
} from './type';

/**
 * Add new listener to specific signal.
 *
 * @example
 * const listener = addSignalListener('content-change', (content) => console.log(content));
 */
export function addSignalListener<SignalName extends keyof VatrSignals>(
    signalName: SignalName,
    signalCallback: ListenerCallback<SignalName>,
    options?: ListenerOptions,
): symbol {
  logger.logMethodArgs('addSignalListener', {signalName, options});

  const signal = _getSignalObject(signalName);
  const listener: ListenerObject<SignalName> = {
    id: Symbol('Vatr signal listener for ' + signalName),
    once: options?.once ?? false,
    disabled: options?.disabled ?? false,
    callback: signalCallback,
  };

  let callbackCalled = false;

  // Run callback for old dispatch signal
  if (signal.value !== undefined) {
    if (options?.receivePrevious === 'Immediate') {
      logger.incident('addSignalListener', 'call_signal_callback', 'run callback with previous signal value!',
          {signalName, mode: 'Immediate'});
      try {
        signalCallback(signal.value);
      } catch (err) {
        logger.error('addSignalListener', 'call_signal_callback_failed', (err as Error).stack || err, {signalName});
      }
      callbackCalled = true;
    } else if (options?.receivePrevious === true) {
      requestAnimationFrame(() => {
        if (signal.value !== undefined) {
          logger.incident('addSignalListener', 'call_signal_callback', 'run callback with previous signal value!',
              {signalName, mode: 'Delay'});
          signalCallback(signal.value);
        }
      });
      callbackCalled = true; // must be outside of requestAnimationFrame.
    }
  }

  // if once then must remove listener after fist callback called! then why push it to listenerList?!
  if (!(options?.once && callbackCalled)) {
    if (options?.priority) {
      signal.listenerList.unshift(listener);
    } else {
      signal.listenerList.push(listener);
    }
  }

  return listener.id;
}

/**
 * Remove listener from specific signal.
 *
 * @example
 * const listener = addSignalListener('content-change', ...);
 * removeSignalListener('content-change', listener);
 */
export function removeSignalListener<SignalName extends keyof VatrSignals>(
    signalName: SignalName,
    listenerId: symbol,
): void {
  logger.logMethodArgs('removeSignalListener', signalName);

  const signal = _getSignalObject(signalName);
  _removeSignalListener(signal, listenerId);
}

/**
 * Dispatch signal to all listeners.
 *
 * @example
 * dispatchSignal('content-change', content);
 */
export function dispatchSignal<SignalName extends keyof VatrSignals>(
    signalName: SignalName,
    value: VatrSignals[SignalName],
    options?: DispatchOptions,
): void {
  logger.logMethodArgs('dispatchSignal', {signalName, value, options});

  const signal = _getSignalObject(signalName);
  // set value before check signal.debounced for act like throttle (call listeners with last dispatch value).
  signal.value = value;

  if (signal.disabled) return; // signal is disabled.
  if (options?.debounce && signal.debounced) return; // last dispatch in progress.

  if (!options?.debounce) {
    // call listeners immediately.
    _callListeners(signal);
    return;
  }
  // else: call listeners in next frame.
  signal.debounced = true;
  requestAnimationFrame(() => {
    _callListeners(signal);
    signal.debounced = false;
  });
}

/**
 * Resolved with signal value when signal is ready base on requested options.
 * By default, dispatch request signal and wait for answer (wait new signal dispatched).
 *
 * @example
 * // dispatch request signal and wait for answer (wait for NEW signal).
 * const newContent = await requestSignal('content-change', {foo: 'bar'});
 */
export function requestSignal<SignalName extends keyof VatrRequestSignals>(
    signalName: SignalName,
    requestParam: VatrRequestSignals[SignalName],
): Promise<VatrSignals[SignalName]> {
  logger.logMethodArgs('requestSignal', {signalName, requestParam});

  dispatchSignal(
      `request-${signalName}` as unknown as SignalName,
      requestParam as unknown as VatrSignals[SignalName], // mastmalize to avoid type error
  );
  return waitForSignal(signalName);
}

/**
 * Define signal provider, which will be called when signal requested (addRequestSignalListener).
 *
 * @example
 * setSignalProvider('content-change', async (requestParam) => {
 *   const content = await fetchNewContent(requestParam);
 *   if (content != null) {
 *     return content; // dispatchSignal('content-change', content);
 *   }
 *   else {
 *     dispatchSignal('content-not-found');
 *   }
 * }
 */
export function setSignalProvider<SignalName extends keyof VatrRequestSignals>(
    signalName: SignalName,
    signalProvider: SignalProvider<SignalName>,
    options?: SignalProviderOptions,
): symbol {
  logger.logMethodArgs('setSignalProvider', {signalName, options});

  // @TODO: refactor with removeSignalProvider
  const signal = _getSignalObject(`request-${signalName}` as unknown as SignalName);
  if (signal.listenerList.length > 0) {
    logger.accident('setSignalProvider', 'signal_provider_already_set', 'another provider defined and will removed'
        , {signalName});
    signal.listenerList = [];
  }

  const _callback = async (requestParam: VatrRequestSignals[SignalName]): Promise<void> => {
    const signalValue = await signalProvider(requestParam);
    if (signalValue !== undefined) { // null can be a valid value.
      dispatchSignal(signalName, signalValue, {debounce: options?.debounce ?? true});
    }
  };

  return addSignalListener(
    `request-${signalName}` as unknown as SignalName,
    _callback as unknown as ListenerCallback<SignalName>,
    {receivePrevious: options?.receivePrevious ?? true},
  );
}

// @TODO: removeSignalProvider(signalName): void

/**
 * Resolved with signal value when signal is ready base on requested options.
 * By default, wait new signal received.
 *
 * @param receivePrevious If true, get signal value from last dispatched signal (if any) or wait new signal received.
 *
 * @example
 * // Wait for NEW signal received.
 * const newContent = await waitForSignal('content-change');
 * // get signal value from last dispatched signal (if any) or wait new signal received.
 * const route = await waitForSignal('route-change', true);
 */
export async function waitForSignal<SignalName extends keyof VatrSignals>(
    signalName: SignalName,
    receivePrevious?: boolean,
): Promise<VatrSignals[SignalName]> {
  logger.logMethodArgs('waitForSignal', {signalName, receivePrevious});

  return new Promise((resolve) => {
    addSignalListener(signalName, resolve, {
      once: true,
      priority: true,
      receivePrevious: receivePrevious ?? false,
    });
  });
}

/**
 * Check signal dispatched before or not!
 *
 * @example
 * if(hasSignalDispatchedBefore('content-change')) { ... }
 */
export function hasSignalDispatchedBefore<SignalName extends keyof VatrSignals>(signalName: SignalName): boolean {
  const dispatched = 'value' in _getSignalObject(signalName);
  logger.logMethodFull('hasSignalDispatchedBefore', signalName, dispatched);
  return dispatched;
}

/**
 * Expire the signal by clear last dispatched value.
 * hasSignalDispatchedBefore and receivePrevious etc not work until new signal.
 *
 * @example
 * hasSignalDispatchedBefore('content-change'); // true
 * expireSignal('content-change');
 * hasSignalDispatchedBefore('content-change'); // false
 */
export function expireSignal<SignalName extends keyof VatrSignals>(signalName: SignalName): void {
  logger.logMethodArgs('expireSignal', signalName);
  delete _getSignalObject(signalName).value;
}

// @TODO: getSignalOptions(signalName);
// @TODO: getListenerOptions(listenerId);
// @TODO: setSignalOptions(signalName, {...});
// @TODO: setListenerOptions(listenerId, {...});
