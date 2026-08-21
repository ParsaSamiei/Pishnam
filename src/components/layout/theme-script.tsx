// Resolution logic per docs/03-design-system.md:
//   1. Check prefers-color-scheme.
//   2. If it resolves, use that.
//   3. If unsupported/indeterminate, default to dark.
//   4. An explicit user override (stored in localStorage) always wins.
// Runs as a synchronous inline script in <head>, before first paint, to
// avoid a flash of the wrong theme.
//
// It also owns the attribute for the rest of the document's life -- see the
// MutationObserver below. Keep `resolve` in step with `resolveTheme()` in
// lib/use-theme.ts: a blocking <head> script cannot import a module, so the
// two copies are the price of having no flash.
const THEME_SCRIPT = `
(function () {
  var root = document.documentElement;

  function resolve() {
    try {
      var stored = localStorage.getItem("pishnam-theme");
      if (stored === "light" || stored === "dark") return stored;
    } catch (e) {
      // Storage can throw outright (Safari private browsing) -- fall through
      // to the media query rather than losing the theme entirely.
    }
    var mql = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    return mql && typeof mql.matches === "boolean" ? (mql.matches ? "dark" : "light") : "dark";
  }

  function apply() {
    root.setAttribute("data-theme", resolve());
  }

  apply();

  // React 19 treats <html> as a singleton host component. A client-side locale
  // change remounts the root layout, React re-acquires the existing <html>
  // node, and attributes that are not in its props get stripped -- including
  // this one, which is set imperatively here and so never appears in any RSC
  // payload. Losing it drops the page to the no-attribute defaults in
  // globals.css (:root, i.e. light) while localStorage still says otherwise,
  // which is how switching language used to leave a light page wearing the
  // dark-mode toggle icon.
  //
  // Re-asserting from an observer keeps the fix where the invariant lives --
  // on the document, not in whichever component happens to be mounted -- and
  // the callback is a microtask, so it lands in the same frame as the removal
  // and never paints the wrong theme. Guarded because React may re-execute
  // this script when it re-inserts the element.
  if (!window.__pishnamThemeGuard) {
    window.__pishnamThemeGuard = true;
    new MutationObserver(function () {
      if (!root.getAttribute("data-theme")) apply();
    }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  }
})();
`;

export function ThemeScript() {
  // `text/javascript` on the server, so the browser runs this during HTML
  // parsing as it must; `text/plain` on the client, which is what silences
  // React's "encountered a script tag while rendering" warning -- it only
  // objects to renders that produce an *executable* script, since one inserted
  // via a DOM update never runs. `suppressHydrationWarning` covers the
  // resulting `type` mismatch between the two.
  //
  // Nothing is lost by the client copy being inert: it never executed there
  // anyway. The re-insertion case that matters -- React remounting the root
  // layout on a locale change and stripping `data-theme` off <html> -- is held
  // by the MutationObserver above, which survives on `window` from the initial
  // parse-time run rather than depending on this element re-executing.
  //
  // Pattern per node_modules/next/dist/docs/01-app/02-guides/
  // preventing-flash-before-hydration.md ("Extracting a reusable component").
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
    />
  );
}
