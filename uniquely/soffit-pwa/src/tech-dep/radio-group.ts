import {customElement, css, html, map, AlwatrDummyElement, property, nothing} from '@alwatr/element';

declare global {
  interface HTMLElementTagNameMap {
    'alwatr-radio-group': AlwatrFieldSet;
  }
}

export type RadioOption = {label: string; value?: string}

export type RadioGroupOptions = {
  form: string;
  name: string;
  title: string;
  radioGroup: Array<RadioOption>;
};

/**
 * Alwatr fieldset element
 *
 * @attr {String} name
 */
@customElement('alwatr-radio-group')
export class AlwatrFieldSet extends AlwatrDummyElement {
  static override styles = css`
    :host {
      display: block;
      transition: opacity var(--sys-motion-duration-small) var(--sys-motion-easing-normal);
    }
    fieldset {
      display: block;
      padding: var(--sys-spacing-track) calc(2 * var(--sys-spacing-track));
      font-family: var(--sys-typescale-body-large-font-family-name);
      font-weight: var(--sys-typescale-body-large-font-weight);
      font-size: var(--sys-typescale-body-large-font-size);
      letter-spacing: var(--sys-typescale-body-large-letter-spacing);
      line-height: var(--sys-typescale-body-large-line-height);
      border: 1px solid var(--sys-color-outline);
      border-radius: var(--sys-radius-small);
      background-color: transparent;
      margin: var(--sys-spacing-track) 0 0;
    }

    fieldset:active,
    fieldset:focus,
    fieldset:focus-within {
      border-color: var(--sys-color-primary);
    }

    fieldset legend {
      padding: 0 var(--sys-spacing-track);
    }

    fieldset div {
      margin-top: var(--sys-spacing-track);
    }
    fieldset div:first-of-type {
      margin-top: 0;
    }

    fieldset label,
    input[type='radio'] {
      display: inline-block;
      vertical-align: middle;
      margin: 0;
    }

    input[type='radio'] {
      width: 20px;
      height: 20px;
      accent-color: var(--sys-color-primary);
    }
  `;

  @property({type: Object})
    options?: RadioGroupOptions;

  @property({type: String})
    name?: string;

  get value(): string {
    for (const inputElement of this.renderRoot.querySelectorAll('input')) {
      if (inputElement.checked) return inputElement.value;
    }
    return '';
  }

  override render(): unknown {
    super.render();
    return html`
      <fieldset>
        <legend>${this.options?.title}</legend>
        ${this._optionsTemplate()}
      </fieldset>
    `;
  }

  protected _optionsTemplate(): unknown {
    const options = this.options;
    const name = this.name;
    if (options == null || name == null) return nothing;
    return map(options.radioGroup, (radioItem, index) => {
      const id: string = 'radioInput' + index;
      return html`<div>
        <input type="radio" id=${id} name=${name} value="${radioItem.value ?? radioItem.label}" />
        <label for=${id}>${radioItem.label}</label>
      </div>`;
    });
  }
}
