This is a simple web component that performs AJAX requests for content.

```html
<my-xhr url="https://ron-swanson-quotes.herokuapp.com/v2/quotes"></my-xhr>
```

(Thanks to [jamesseanwright](https://github.com/jamesseanwright/ron-swanson-quotes) for the mostly unoffensive quote server.)

When added to your pages, this element will go and fetch the content of the specified URL.
If the URL changes, it will make a new request.
If you specify the `credentials` attribute/property, then the then AJAX request will be made [with credentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials).

The result will be availalabe in the `response` property, and this will emit a `response-change` event when updated (hint: this matches [Polymer's event binding](https://www.polymer-project.org/1.0/docs/devguide/data-binding#property-notification)).
For example-

```js
var x = document.querySelector('my-xhr');
x.addEventListener('response-change', function() {
  console.info('got response-change, new response', this.response);

  // and e.g., if the response is application/json, containing an array...
  this.response.forEach(function(response) {
    // do something
  });
});
```
