import Script from "next/script";

/**
 * Self-hosted Umami, per docs/09-analytics-i18n.md. Only renders when the
 * env vars are configured, so local dev without an analytics stack running
 * doesn't throw 404s for the script.
 */
export function AnalyticsScript() {
  const src = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  if (!src || !websiteId) return null;

  return <Script src={src} data-website-id={websiteId} strategy="afterInteractive" defer />;
}
