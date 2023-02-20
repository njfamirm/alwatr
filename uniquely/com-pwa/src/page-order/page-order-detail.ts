import {customElement, css, html, LocalizeMixin, AlwatrBaseElement, SignalMixin, property} from '@alwatr/element';
import {message} from '@alwatr/i18n';
import '@alwatr/ui-kit/button/button.js';
import '@alwatr/ui-kit/card/surface.js';
import '@alwatr/ui-kit/radio-group/radio-group.js';
import '@alwatr/ui-kit/text-field/text-field.js';

import {topAppBarContextProvider} from '../context.js';

import type {Order, OrderDraft} from '@alwatr/type/customer-order-management.js';

declare global {
  interface HTMLElementTagNameMap {
    'alwatr-page-order-detail': AlwatrPageOrderDetail;
  }
}

/**
 * Alwatr Customer Order Management Order Form Page
 */
@customElement('alwatr-page-order-detail')
export class AlwatrPageOrderDetail extends LocalizeMixin(SignalMixin(AlwatrBaseElement)) {
  static formId = 'order';

  static override styles = css`
    :host {
      display: block;
      padding: calc(2 * var(--sys-spacing-track));
      box-sizing: border-box;
      min-height: 100%;
    }
  `;

  @property({attribute: false})
    order?: Order | OrderDraft | null;

  override connectedCallback(): void {
    super.connectedCallback();

    topAppBarContextProvider.setValue({
      type: 'small',
      headline: message('page_order_detail_headline'),
      startIcon: {icon: 'arrow-back-outline', flipRtl: true, clickSignalId: 'back-click-event'},
      tinted: 2,
    });
  }

  override render(): unknown {
    this._logger.logMethod('render');
    return html`${JSON.stringify(this.order)}`;
  }
}
