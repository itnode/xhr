/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

window.XhrElement = (function() {
  const xhrTimeout = 15;
  const jsonType = 'application/json';

  /**
   * Helper to safely dispatch events (i.e., for IE9-10).
   * @param {!EventTarget} target to dispatch event on
   * @param {string} name of event
   */
  function dispatchEvent(target, name) {
    let ev = document.createEvent('Event');
    ev.initEvent(name, /* bubbles */ true, /* cancelable */ false);
    target.dispatchEvent(ev);
  }

  const xe = class XhrElement extends HTMLElement {
    createdCallback() {
      this._timeout = null;
      this._result = undefined;
      this._xhr = new XMLHttpRequest();

      this.performRequest();
    }

    /**
     * @param {string} attr
     * @param {string} oldVal
     * @param {string} newVal
     */
    attributeChangedCallback(attr, oldVal, newVal) {
      switch(attr) {
        case 'url':
        case 'credentials':
          this.performRequest();
          break;
      }
    }

    /**
     * @return {string} URL to fetch
     */
    get url() {
      return this.getAttribute('url');
    }

    /**
     * @param {string} url to fetch
     */
    set url(url) {
      this.setAttribute('url', url);
    }

    /**
     * @return {boolean} whether to pass credentials on cross-site requests
     */
    get credentials() {
      return this.hasAttribute('credentials');
    }

    /**
     * @param {boolean} v whether to pass credentials on cross-site requests
     */
    set credentials(v) {
      if (v) {
        this.setAttribute('credentials', '');
      } else {
        this.removeAttribute('credentials');
      }
    }

    get response() {
      return this._response;
    }

    _setResponse(response) {
      this._response = response;
      this.innerHTML = response;
      dispatchEvent(this, 'response-change');
    }

    /**
     * Requests that this element perform the request, even if the result is already up-to-date.
     */
    performRequest() {
      this._xhr.abort();  // always abort for safety

      // TODO: move all this into a helper class
      if (!this.url) {
        this._setResult(undefined);
        return;
      }

      window.clearTimeout(this._timeout);
      this._timeout = window.setTimeout(_ => {
        let x = new XMLHttpRequest();
        this._xhr = x;

        // Check for this._xhr != x below, to see whether we've been superceded by some other
        // request.

        x.open('GET', this.url);
        x.onload = () => {
          if (this._xhr != x) { return; }

          const ct = x.getResponseHeader('Content-Type');

          let response = x.response;

          // look for 'type' or 'type;...'
          if (ct == jsonType || ct.substr(0, jsonType.length + 1) == jsonType + ';') {
            response = JSON.parse(response);
          }

          this._setResponse(response);
        };
        x.onerror = () => {
          if (this._xhr != x) { return; }
          this._setResponse(new Error(x.statusText ? x.statusText : '' + x.status));
        };
        x.send();

      }, xhrTimeout);
    }

  };

  return xe;
}());

window.customElements.define('my-xhr', XhrElement);
