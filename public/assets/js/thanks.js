// Show the message that matches ?kind=project|mockup. Anything else keeps the generic text.
(function () {
  var MSG = {
    project: "Thanks \u2014 we've received your project details. We'll reply within 1\u20132 business days.",
    mockup: "Thanks \u2014 your free mockup request is in. We'll be in touch about your homepage concept soon."
  };
  var kind = new URLSearchParams(location.search).get('kind');
  var el = document.getElementById('thanks-msg');
  if (el && Object.prototype.hasOwnProperty.call(MSG, kind)) el.textContent = MSG[kind];
})();
