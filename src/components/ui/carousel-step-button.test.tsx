import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ChevronLeft } from "lucide-react";
import { CarouselStepButton } from "./carousel-step-button";

afterEach(cleanup);

describe("shared carousel arrows", () => {
  it.each(["default", "small"] as const)(
    "preserves the existing %s control style and events",
    (size) => {
      const onClick = vi.fn();
      const onKeyDown = vi.fn();
      render(
        <CarouselStepButton
          label="Previous class"
          icon={ChevronLeft}
          onClick={onClick}
          onKeyDown={onKeyDown}
          size={size}
          className="start-0"
        />,
      );
      const button = screen.getByRole("button", { name: "Previous class" });
      expect(button.classList.contains(size === "small" ? "size-9" : "size-11")).toBe(true);
      if (size === "small") expect(button.classList.contains("sm:size-10")).toBe(true);
      expect(button.classList.contains("focus-visible:outline-2")).toBe(true);
      expect(button.querySelector("svg")!.classList.contains("rtl:-scale-x-100")).toBe(true);
      fireEvent.click(button);
      fireEvent.keyDown(button, { key: "ArrowLeft" });
      expect(onClick).toHaveBeenCalledOnce();
      expect(onKeyDown).toHaveBeenCalledOnce();
    },
  );
});
