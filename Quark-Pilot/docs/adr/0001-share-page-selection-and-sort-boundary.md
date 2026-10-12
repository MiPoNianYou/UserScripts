---
status: accepted
---

# Keep the XHR Boundary for Share Pages

Quark Share Pages load directory data through an XHR `sharepage/detail` request, while their Default Selection is recreated during asynchronous rendering and Share Directory navigation. Keep the XHR sort rewrite, remove the redundant fetch rewrite and DOM observer, and use the continuous short poller with route resets to enforce the desired Share Sort Order and Selection State across all `pan.quark.cn/s/*` pages.

## Considered Options

- Removing the XHR rewrite: rejected because the tested pages retain Quark's default file-name sort.
- Keeping both XHR and fetch rewrites: rejected because the tested page uses XHR for `sharepage/detail` and the extra interception adds an unowned path.
- Keeping the DOM observer: rejected because the continuous poller covers initial loading, Share Directory navigation, and reloads in the tested pages.

## Consequences

- The XHR interception remains a required integration boundary.
- The poller remains active for the page lifetime so later Share Directory renders are covered.
- Evidence currently covers the two specified Share Pages and the current Quark web version; a Quark API or page-version change requires browser revalidation.
