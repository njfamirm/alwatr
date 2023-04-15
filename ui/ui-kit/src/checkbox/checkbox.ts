import {AlwatrBaseElement, css, customElement, html, property} from '@alwatr/element';
import {eventTrigger} from '@alwatr/signal';

import type {StringifyableRecord, Stringifyable} from '@alwatr/type';

declare global {
  interface HTMLElementTagNameMap {
    'alwatr-checkbox': AlwatrCheckbox;
  }
}

export type CheckboxSignalDetail<T extends Stringifyable = Stringifyable> = Stringifyable & {
  name: string;
  value: boolean;
  detail: T;
}

export interface CheckboxContent extends StringifyableRecord {
  name: string;
  label: string;
  value?: boolean;
  disabled: boolean;
  clickSignalId?: string;
  clickDetail?: Stringifyable;
}

/**
 * Alwatr standard icon button element.
 */
@customElement('alwatr-checkbox')
export class AlwatrCheckbox extends AlwatrBaseElement {
  static override styles = [
    css`
      :host {
        display: inline-flex;
        user-select: none;
        vertical-align: middle;
      }

      input {
        display: block;
        width: 18px;
        height: 18px;
        padding: var(--sys-spacing-track);
        outline: 2px solid var(--sys-color-on-surface);
        cursor: pointer;
      }

      input:checked {
        outline: none;
        background-color: var(--sys-color-primary);
      }
    `,
  ];

  @property({type: Object})
    content?: CheckboxContent;

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this._click);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this._click);
  }

  override render(): unknown {
    this._logger.logMethod?.('render');
    const content = this.content;
    const id = `checkbox-${content?.name}`;

    return html`
      <input type="checkbox" name=${content?.name} id=${id}>
      <label for=${id}>${this.content?.label}</label>
    `;
  }

  protected _click(): void {
    const content = this.content;
    if (content == null ) return;
    this._logger.logMethodArgs?.('click', {content});

    content.value = !content?.value;
    if (content.clickSignalId) {
      eventTrigger.dispatch<CheckboxSignalDetail>(content.clickSignalId, {
        name: content.name,
        value: content?.value,
        detail: content?.clickDetail,
      });
    }
  }
}
