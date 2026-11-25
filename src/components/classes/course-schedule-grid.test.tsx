import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import enMessages from "@/messages/en.json";
import faMessages from "@/messages/fa.json";
import { CourseScheduleGrid, type CourseClassSchedule } from "./course-schedule-grid";
import { ClassSessionGrid } from "./class-session-grid";

const preferences = vi.hoisted(() => ({ reduceMotion: false, apiAvailable: true }));

vi.mock("@/components/motion/use-reduced-motion-safe", () => ({
  useReducedMotionSafe: () => preferences.reduceMotion,
}));

vi.mock("embla-carousel-react", async () => {
  const { useMemo } = await import("react");
  type Listener = (api: MockApi) => void;
  type MockApi = {
    selectedScrollSnap: () => number;
    scrollPrev: () => void;
    scrollNext: () => void;
    scrollTo: (index: number) => void;
    on: (event: string, listener: Listener) => MockApi;
    off: (event: string, listener: Listener) => MockApi;
  };

  return {
    default: vi.fn(function useMockEmblaCarousel() {
      const carousel = useMemo(() => {
        let selected = 0;
        let count = 1;
        const listeners = new Map<string, Set<Listener>>();
        const select = (index: number) => {
          selected = (index + count) % count;
          listeners.get("select")?.forEach((listener) => listener(api));
        };
        const api: MockApi = {
          selectedScrollSnap: () => selected,
          scrollPrev: () => select(selected - 1),
          scrollNext: () => select(selected + 1),
          scrollTo: select,
          on: (event, listener) => {
            if (!listeners.has(event)) listeners.set(event, new Set());
            listeners.get(event)!.add(listener);
            return api;
          },
          off: (event, listener) => {
            listeners.get(event)?.delete(listener);
            return api;
          },
        };
        return {
          api,
          ref: (node: HTMLDivElement | null) => {
            if (node) count = node.querySelectorAll("[data-course-schedule-slide]").length;
          },
        };
      }, []);
      return [carousel.ref, preferences.apiAvailable ? carousel.api : undefined];
    }),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  preferences.reduceMotion = false;
  preferences.apiAvailable = true;
});
afterEach(cleanup);

const courses: CourseClassSchedule[] = [
  {
    id: "robotics",
    title: "Robotics",
    coverImage: "/robotics.webp",
    sessions: [
      {
        id: "r1",
        weekday: 0,
        startTime: "16:00",
        endTime: "18:00",
        location: "Resalat branch",
        capacityNote: "Limited seats",
      },
      {
        id: "r2",
        weekday: 2,
        startTime: "17:00",
        endTime: "19:00",
        location: "Science branch",
        capacityNote: null,
      },
      {
        id: "r3",
        weekday: 4,
        startTime: "18:00",
        endTime: "20:00",
        location: "Resalat branch",
        capacityNote: null,
      },
    ],
  },
  {
    id: "electronics",
    title: "Electronics",
    coverImage: "/electronics.webp",
    sessions: [
      {
        id: "e1",
        weekday: 1,
        startTime: "10:00",
        endTime: "12:00",
        location: "Science branch",
        capacityNote: null,
      },
      {
        id: "e2",
        weekday: 3,
        startTime: "11:00",
        endTime: "13:00",
        location: "Resalat branch",
        capacityNote: null,
      },
    ],
  },
];

function renderCourses(items = courses, locale: "en" | "fa" = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "fa" ? faMessages : enMessages}>
      <CourseScheduleGrid courses={items} locale={locale} emptyMessage="Schedule coming soon" />
    </NextIntlClientProvider>,
  );
}

function activeSlide(article: HTMLElement) {
  return article.querySelector('[data-course-schedule-slide][aria-hidden="false"]')!;
}

describe("CourseScheduleGrid", () => {
  it("renders one card and one image per course, with that course's class times inside", () => {
    renderCourses();
    expect(screen.getAllByRole("article")).toHaveLength(2);
    const robotics = screen.getByRole("article", { name: "Robotics" });
    const electronics = screen.getByRole("article", { name: "Electronics" });
    expect(robotics.querySelectorAll("img")).toHaveLength(1);
    expect(electronics.querySelectorAll("img")).toHaveLength(1);
    expect(screen.getAllByRole("heading", { name: "Robotics" })).toHaveLength(1);
    expect(robotics.querySelectorAll("[data-course-schedule-slide]")).toHaveLength(3);
    expect(electronics.querySelectorAll("[data-course-schedule-slide]")).toHaveLength(2);
    expect(activeSlide(robotics).textContent).toContain("16:00 – 18:00");
    expect(activeSlide(robotics).textContent).toContain("Limited seats");
    expect(activeSlide(electronics).textContent).toContain("10:00 – 12:00");
  });

  it("navigates each course independently with the shared arrow controls and dots", () => {
    renderCourses();
    const robotics = screen.getByRole("article", { name: "Robotics" });
    const electronics = screen.getByRole("article", { name: "Electronics" });
    fireEvent.click(within(robotics).getByRole("button", { name: "Next class time for Robotics" }));
    expect(activeSlide(robotics).textContent).toContain("17:00 – 19:00");
    expect(activeSlide(electronics).textContent).toContain("10:00 – 12:00");
    fireEvent.click(
      within(robotics).getByRole("button", { name: "Previous class time for Robotics" }),
    );
    expect(activeSlide(robotics).textContent).toContain("16:00 – 18:00");
    fireEvent.click(
      within(robotics).getByRole("button", { name: "Show class time 3 for Robotics" }),
    );
    expect(activeSlide(robotics).textContent).toContain("18:00 – 20:00");
    expect(
      within(robotics)
        .getByRole("button", { name: "Show class time 3 for Robotics" })
        .getAttribute("aria-current"),
    ).toBe("true");
  });

  it("uses the normal placeholder for unavailable covers without changing the selected class time", () => {
    const { rerender } = renderCourses([courses[0]!]);
    const robotics = screen.getByRole("article", { name: "Robotics" });
    fireEvent.click(within(robotics).getByRole("button", { name: "Next class time for Robotics" }));
    fireEvent.error(robotics.querySelector("img")!);
    expect(robotics.querySelector("img")).toBeNull();
    expect(robotics.firstElementChild!.querySelector("svg")).toBeTruthy();
    expect(activeSlide(robotics).textContent).toContain("17:00 – 19:00");
    rerender(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <CourseScheduleGrid
          courses={[{ ...courses[0]!, coverImage: "/updated-cover.webp" }]}
          locale="en"
          emptyMessage="Schedule coming soon"
        />
      </NextIntlClientProvider>,
    );
    expect(robotics.querySelectorAll("img")).toHaveLength(1);
    expect(activeSlide(robotics).textContent).toContain("17:00 – 19:00");
  });

  it.each(["en", "fa"] as const)("supports direction-aware keyboard navigation in %s", (locale) => {
    renderCourses([courses[0]!], locale);
    const robotics = screen.getByRole("article", { name: "Robotics" });
    const nextLabel = locale === "fa" ? "زمان بعدی کلاس Robotics" : "Next class time for Robotics";
    const next = within(robotics).getByRole("button", { name: nextLabel });
    fireEvent.keyDown(next, { key: locale === "fa" ? "ArrowLeft" : "ArrowRight" });
    expect(activeSlide(robotics).textContent).toContain("17:00 – 19:00");
    fireEvent.keyDown(next, { key: "End" });
    expect(activeSlide(robotics).textContent).toContain("18:00 – 20:00");
    fireEvent.keyDown(next, { key: "Home" });
    expect(activeSlide(robotics).textContent).toContain("16:00 – 18:00");
    expect(vi.mocked(useEmblaCarousel).mock.calls[0]?.[0]).toMatchObject({
      direction: locale === "fa" ? "rtl" : "ltr",
    });
  });

  it("uses the existing Embla setup without an autoplay plugin and respects reduced motion", () => {
    preferences.reduceMotion = true;
    renderCourses([courses[0]!]);
    expect(vi.mocked(useEmblaCarousel).mock.calls[0]).toHaveLength(1);
    expect(vi.mocked(useEmblaCarousel).mock.calls[0]?.[0]).toMatchObject({
      loop: true,
      duration: 1,
    });
  });

  it("shows a single class statically without unnecessary slider controls", () => {
    renderCourses([{ ...courses[0]!, sessions: [courses[0]!.sessions[0]!] }]);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("16:00 – 18:00")).toBeTruthy();
    expect(vi.mocked(useEmblaCarousel)).not.toHaveBeenCalled();
  });

  it("hides courses without scheduled classes and keeps the empty state", () => {
    renderCourses([{ ...courses[0]!, sessions: [] }]);
    expect(screen.queryByRole("article")).toBeNull();
    expect(screen.getByText("Schedule coming soon")).toBeTruthy();
  });

  it("keeps all time slides accessible before Embla is ready for the no-JS fallback", () => {
    preferences.apiAvailable = false;
    const { container } = renderCourses([courses[0]!]);
    const slides = container.querySelectorAll("[data-course-schedule-slide]");
    expect(slides).toHaveLength(3);
    slides.forEach((slide) => expect(slide.getAttribute("aria-hidden")).toBeNull());
    expect(
      container.querySelector("[data-course-schedule-carousel]")!.getAttribute("tabindex"),
    ).toBe("0");
  });

  it("only displays schedules and does not add form-selection controls", () => {
    const { container } = renderCourses();
    expect(container.querySelector("form, input, select")).toBeNull();
    screen
      .getAllByRole("button")
      .forEach((button) => expect(button.getAttribute("type")).toBe("button"));
  });

  it("preserves the existing per-class card layout for the separate classes page", () => {
    const { container } = render(
      <ClassSessionGrid
        sessions={courses[0]!.sessions.map((session) => ({
          ...session,
          courseTitle: "Robotics",
          coverImage: "/robotics.webp",
        }))}
        locale="en"
        emptyMessage="No classes"
      />,
    );
    expect(container.querySelectorAll("img")).toHaveLength(3);
    expect(screen.getAllByText("Robotics")).toHaveLength(3);
    expect(screen.getByText("16:00 – 18:00")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
