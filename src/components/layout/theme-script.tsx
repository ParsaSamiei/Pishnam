// Resolution logic per docs/03-design-system.md:
//   1. Check prefers-color-scheme.
//   2. If it resolves, use that.
//   3. If unsupported/indeterminate, default to dark.
//   4. An explicit user override (stored in localStorage) always wins.
// Runs as a synchronous inline script in <head>, before first paint, to
// avoid a flash of the wrong theme.
const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("pishnam-theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
      return;
    }
    var mql = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    var theme = mql && typeof mql.matches === "boolean" ? (mql.matches ? "dark" : "light") : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
