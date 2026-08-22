import { describe, expect, it } from "vitest";
import { feedbackFormSchema } from "./feedback";

describe("feedbackFormSchema", () => {
  it("accepts a message with no name", () => {
    const parsed = feedbackFormSchema.parse({
      name: "",
      message: "پیشنهاد می‌کنم کلاس‌ها عصر برگزار شوند.",
    });
    expect(parsed.name).toBeNull();
    expect(parsed.message).toContain("پیشنهاد");
  });

  it("keeps a provided name", () => {
    const parsed = feedbackFormSchema.parse({
      name: "  سارا  ",
      message: "Please add more beginner electronics sessions.",
    });
    expect(parsed.name).toBe("سارا");
  });

  it("rejects a one-letter name", () => {
    const parsed = feedbackFormSchema.safeParse({
      name: "ا",
      message: "This is a long enough suggestion.",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects a too-short message", () => {
    const parsed = feedbackFormSchema.safeParse({
      name: "",
      message: "کوتاه",
    });
    expect(parsed.success).toBe(false);
  });
});
