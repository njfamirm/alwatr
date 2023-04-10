import {AlwatrBaseElement, css, customElement, html} from '@alwatr/element';
import '@alwatr/icon';

declare global {
  interface HTMLElementTagNameMap {
    'alwatr-test': AlwatrButton;
  }
}

@customElement('alwatr-test')
export class AlwatrButton extends AlwatrBaseElement {
  static override styles = [
    css`
      :host {
        display: block;
        position: fixed;
        background-color: hsl(var(--sys-color-tertiary-hsl));
        color: hsl(var(--sys-color-tertiary-container-hsl));
        box-shadow: var(--sys-surface-elevation-1);
      }
      :host(.large) {
        padding: calc(3.75*var(--sys-spacing-track));
        right: calc(2*var(--sys-spacing-track));
        bottom: calc(2*var(--sys-spacing-track));
        font-size: calc(4.5*var(--sys-spacing-track));
        border-radius: calc(3.5*var(--sys-spacing-track));
      }
      :host(.medium) {
        padding: calc(2*var(--sys-spacing-track));
        right: calc(17*var(--sys-spacing-track));
        bottom: calc(2*var(--sys-spacing-track));
        font-size: calc(3*var(--sys-spacing-track));
        border-radius: calc(2*var(--sys-spacing-track));
      }
      :host(.small) {
        padding: var(--sys-spacing-track);
        right: calc(27*var(--sys-spacing-track));
        bottom: calc(2*var(--sys-spacing-track));
        font-size: calc(3*var(--sys-spacing-track));
        border-radius: calc(1.5*var(--sys-spacing-track));
      }
    `,
  ];

  override render(): unknown {
    return html`<alwatr-icon name="menu"></alwatr-icon>`;
  }
}
