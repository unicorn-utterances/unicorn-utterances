# vercel.json

This documents our settings used in the [vercel.json configuration](https://vercel.com/docs/projects/project-configuration) and the reasoning behind them.

## Headers

Most headers are based on [express helmet](https://github.com/helmetjs/helmet) defaults and are adapted for UU.

See also: Google's [Content Security Policy explainer](https://csp.withgoogle.com/docs/index.html).

- **Access-Control-Allow-Origin:** Prevents cross-origin requests to site content. This has no effect on same-origin requests, so its value does not break preview builds.

- **Content-Security-Policy:** Helps prevent XSS/injection attacks.
  * `default-src 'self'` - only allows resources from the current origin by default, unless otherwise specified:
  * `base-uri 'self'` - restricts the use of the `<base>` element in the page
  * `form-action 'self' https://unicorn-utterances.com/ https://app.convertkit.com/` - restricts URLs that can be used as the target of form submissions
    * `https://app.convertkit.com/` is used for newsletter signups
	* `https://unicorn-utterances.com/` is needed on preview builds because ConvertKit redirects the form submission back to UU
  * `frame-ancestors 'none'` - prevents embedding the document in any iframe
  * `frame-src https:` - allows any https URL to be used as an iframe source in the page
  * `img-src 'self' https: data:` - allows any https or data image sources
  * `object-src 'none'` - prevents use of the `<object>` and `<embed>` elements, which are considered legacy HTML
  * `script-src 'self' https://vercel.live/` - restricts the sources that can be used by `<script>` elements or attributes
    * `https://vercel.live/` is used for Vercel's comments widget on preview builds
  * `connect-src 'self' https://vercel.live/` - restricts the usage of `fetch()` calls and other script APIs
  * `style-src 'self' 'unsafe-inline'` - restricts the usage of `<style>` elements and attributes
    * `unsafe-inline` is needed for Vercel's comments widget, the [medium-zoom](https://github.com/francoischalifour/medium-zoom) script, and other elements that use `style=` attributes

- **Cross-Origin-Opener-Policy:** Ensures the document does not share its global object if opened in a popup from another website.
  * Uses `same-origin-allow-popups` for compatibility with Vercel's preview comments.

- **Cross-Origin-Resource-Policy:** blocks no-cors cross-origin/cross-site requests.

- **Permissions-Policy:** Allows/denies the use of browser features in the document and any `<iframe>` elements within it.

- **Referrer-Policy:** Controls how much referrer information should be included with requests. `no-referrer` provides no information. This is equivalent to setting `rel="noreferrer"` on every link.

- **X-Content-Type-Options:** `nosniff` mitigates [MIME type sniffing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#mime_sniffing) which can cause security issues.

- **X-Download-Options:** `noopen` is specific to Internet Explorer 8.

- **X-Frame-Options:** `DENY`

- **X-Permitted-Cross-Domain-Policies:** `none` tells some clients (mostly Adobe products) not to load cross-domain content.

- **X-XSS-Protection:** `0` turns off XSS protection in older browsers, which can create XSS vulnerabilities in otherwise safe websites.
