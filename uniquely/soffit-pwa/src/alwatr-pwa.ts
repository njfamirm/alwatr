import {html, customElement} from '@alwatr/element';
import '@alwatr/font/vazirmatn.css';
import {AlwatrPwaElement} from '@alwatr/pwa-helper/pwa-element.js';
import '@alwatr/ui-kit/style/mobile-only.css';
import '@alwatr/ui-kit/style/theme/color.css';
import '@alwatr/ui-kit/style/theme/palette-270.css';

import './director/index.js';

import type {RoutesConfig} from '@alwatr/router';

declare global {
  interface HTMLElementTagNameMap {
    'alwatr-pwa': AlwatrPwa;
  }
}

/**
 * Alwatr PWA Root Element
 */
@customElement('alwatr-pwa')
class AlwatrPwa extends AlwatrPwaElement {
  protected override _routesConfig: RoutesConfig = {
    routeId: this._routesConfig.routeId,
    templates: {
      home: () => {
        import('./page-home.js');
        return html`<alwatr-page-home>...</alwatr-page-home>`;
      },
      product: () => {
        import('./page-product.js');
        return html`<alwatr-page-product>...</alwatr-page-product>`;
      },
      _404: (routeContext) => this._routesConfig.templates.home(routeContext),
    },
  };
}
