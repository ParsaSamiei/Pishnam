import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import EnrollPage from "./page";
import { TIER_LABELS } from "@/lib/tier-labels";

const mocks = vi.hoisted(() => ({
  findCourses: vi.fn(),
  getGuidelines: vi.fn(),
  guidelinesActive: vi.fn(),
  scheduleGrid: vi.fn().mockReturnValue(null),
  leadForm: vi.fn().mockReturnValue(null),
  application: vi.fn().mockReturnValue(null),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { course: { findMany: mocks.findCourses } } }));
vi.mock("next-intl/server", () => ({ setRequestLocale: vi.fn() }));
vi.mock("@/components/layout/page-header", () => ({ PageHeader: () => null }));
vi.mock("@/components/classes/course-schedule-grid", () => ({
  CourseScheduleGrid: mocks.scheduleGrid,
}));
vi.mock("@/components/forms/lead-capture-form", () => ({ LeadCaptureForm: mocks.leadForm }));
vi.mock("@/components/forms/enrollment-application", () => ({
  EnrollmentApplication: mocks.application,
}));
vi.mock("@/lib/enrollment-guidelines", () => ({
  getEnrollmentGuidelines: mocks.getGuidelines,
  isEnrollmentGuidelinesGateActive: mocks.guidelinesActive,
}));

const session = {
  id: "class-1",
  weekday: 0,
  startTime: "16:00",
  endTime: "18:00",
  location: "Resalat branch",
  capacityNote: "Limited seats",
};
const courses = [
  {
    id: "course-1",
    slug: "robotics",
    coverImage: "/robotics.webp",
    translations: [{ title: "Robotics" }],
    classSessions: [session, { ...session, id: "class-2", weekday: 2, startTime: "17:00" }],
  },
  {
    id: "course-2",
    slug: "electronics",
    coverImage: "/electronics.webp",
    translations: [{ title: "Electronics" }],
    classSessions: [{ ...session, id: "class-3", startTime: "10:00" }],
  },
  {
    id: "course-3",
    slug: "ai",
    coverImage: "/ai.webp",
    translations: [{ title: "AI" }],
    classSessions: [],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.findCourses.mockResolvedValue(courses);
  mocks.getGuidelines.mockResolvedValue(null);
  mocks.guidelinesActive.mockReturnValue(false);
});
afterEach(cleanup);

async function renderPage(searchParams: { course?: string; tier?: string } = {}, locale = "en") {
  return render(
    await EnrollPage({
      params: Promise.resolve({ locale }),
      searchParams: Promise.resolve(searchParams),
    }),
  );
}

describe("enrollment course schedules", () => {
  it("groups active class times by course and fetches them in weekday/time order", async () => {
    await renderPage();
    expect(mocks.findCourses).toHaveBeenCalledWith({
      where: { active: true },
      orderBy: { order: "asc" },
      include: {
        translations: { where: { locale: "en" } },
        classSessions: {
          where: { active: true },
          orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
        },
      },
    });
    const props = mocks.scheduleGrid.mock.calls[0]![0];
    expect(props.courses).toHaveLength(2);
    expect(props.courses[0]).toEqual({
      id: "course-1",
      title: "Robotics",
      coverImage: "/robotics.webp",
      sessions: courses[0]!.classSessions,
    });
    expect(props.courses[1].sessions).toHaveLength(1);
    expect(props.courses.some((course: { id: string }) => course.id === "course-3")).toBe(false);
  });

  it("keeps unscheduled courses and the existing course/tier deep links in the enrollment form", async () => {
    const tier = Object.keys(TIER_LABELS.en)[0]!;
    await renderPage({ course: "ai", tier });
    const props = mocks.leadForm.mock.calls[0]![0];
    expect(props.leadType).toBe("ENROLL");
    expect(props.extraFields[0].defaultValue).toBe("ai");
    expect(props.extraFields[0].options).toContainEqual({ value: "ai", label: "AI" });
    expect(props.extraFields[1].defaultValue).toBe(tier);
    expect(props.extraFields.map((field: { name: string }) => field.name)).toEqual([
      "courseSlug",
      "tier",
    ]);
  });

  it("keeps the schedule empty message when no courses have active class times", async () => {
    mocks.findCourses.mockResolvedValue(
      courses.map((course) => ({ ...course, classSessions: [] })),
    );
    await renderPage();
    expect(mocks.scheduleGrid.mock.calls[0]![0].courses).toEqual([]);
    expect(mocks.scheduleGrid.mock.calls[0]![0].emptyMessage).toBe(
      "The class schedule will be announced soon.",
    );
    expect(mocks.leadForm).toHaveBeenCalled();
  });

  it("uses the course slug when a course has no translation for this locale", async () => {
    mocks.findCourses.mockResolvedValue([{ ...courses[0]!, translations: [] }]);
    await renderPage();
    expect(mocks.scheduleGrid.mock.calls[0]![0].courses[0].title).toBe("robotics");
  });

  it("preserves the existing enrollment-guidelines gate", async () => {
    const guidelines = { id: "default" };
    mocks.getGuidelines.mockResolvedValue(guidelines);
    mocks.guidelinesActive.mockReturnValue(true);
    await renderPage({}, "fa");
    expect(mocks.application.mock.calls[0]![0]).toMatchObject({
      locale: "fa",
      guidelines,
      leadType: "ENROLL",
    });
    expect(mocks.leadForm).not.toHaveBeenCalled();
    expect(mocks.scheduleGrid.mock.calls[0]![0].locale).toBe("fa");
  });
});
