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

  function dispatchEvent(target, name) {
    let ev = document.createEvent('Event');
    ev.initEvent(name, /* bubbles */ true, /* cancelable */ false);
    target.dispatchEvent(ev);
  }

  let xe = class XhrElement extends HTMLElement {

    constructor() {
      this._timeout = null;
      this._result = undefined;
    }

    get url() {
      return this.getAttribute('url');
    }

    set url(v) {
      if (this.url != v) {
        this.setAttribute('url', v);
        this.performRequest();
      }
    }

    get result() {
      return this._result;
    }

    _setResult(result) {
      this._result = result;
      dispatchEvent(this, 'result-change');
    }

    performRequest() {
      // TODO: create new Promise
      if (!this.url) {
        this._setResult(undefined);
        return;
      }

      window.clearTimeout(this._timeout);
      this._timeout = window.setTimeout(_ => {
        console.debug('doing fetch for', this.url);
        window.fetch(this.url).then(out => {
          this._setResult(out);
        });
      }, xhrTimeout);
    }

    createdCallback() {
      this.performRequest();
    }

    attributeChangedCallback(attr, oldVal, newVal) {
      switch(attr) {
        case 'url':
          this.performRequest();
          break;
      }
    }

  };
  return xe;

}());

document.registerElement('my-xhr', XhrElement);