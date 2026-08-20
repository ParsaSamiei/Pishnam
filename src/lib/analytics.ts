"use client";

/**
 * Thin wrapper around the Umami tracking script's global `window.umami`.
 * Event plan per docs/09-analytics-i18n.md -- track the moments that map to
 * actual goals (leads, engagement), not vanity events.
 */

type UmamiEventData = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: UmamiEventData) => void;
    };
  }
}

export type AnalyticsEvent =
  | "enroll_form_submit"
  | "class_seat_request"
  | "sponsor_inquiry_submit"
  | "school_inquiry_submit"
  | "job_application_submit"
  | "contact_form_submit"
  | "video_play"
  | "download_click"
  | "language_switch";

export function track(event: AnalyticsEvent, data?: UmamiEventData) {
  if (typeof window === "undefined" || !window.umami) return;
  window.umami.track(event, data);
}
