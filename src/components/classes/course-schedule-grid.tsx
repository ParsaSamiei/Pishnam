import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassSessionDetails, type ClassSessionTime } from "./class-session-grid";
import { ClassTimesCarousel } from "./class-times-carousel";
import { CourseScheduleCover } from "./course-schedule-cover";
import type { AppLocale } from "@/lib/i18n/routing";

export type CourseClassSchedule = {
  id: string;
  title: string;
  coverImage: string;
  sessions: ClassSessionTime[];
};

/** One cover/title per course; only its time choices move inside the card. */
export function CourseScheduleGrid({
  courses,
  locale,
  emptyMessage,
}: {
  courses: CourseClassSchedule[];
  locale: AppLocale;
  emptyMessage: string;
}) {
  const scheduledCourses = courses.filter((course) => course.sessions.length > 0);
  if (scheduledCourses.length === 0) {
    return <p className="text-text-secondary text-center">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {scheduledCourses.map((course) => (
        <Card
          key={course.id}
          role="article"
          aria-labelledby={`enroll-course-${course.id}`}
          data-course-schedule={course.id}
          className="min-w-0 overflow-hidden p-0"
        >
          <div className="bg-bg-surface-alt relative aspect-[16/10] w-full">
            <CourseScheduleCover key={course.coverImage} src={course.coverImage} />
          </div>
          <CardHeader className="p-5 pb-0">
            <CardTitle id={`enroll-course-${course.id}`}>{course.title}</CardTitle>
            <CardDescription>
              {locale === "fa" ? "روز و ساعت برگزاری" : "Class days and times"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-4">
            {course.sessions.length === 1 ? (
              <ClassSessionDetails session={course.sessions[0]!} locale={locale} />
            ) : (
              <ClassTimesCarousel
                sessions={course.sessions}
                courseTitle={course.title}
                locale={locale}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
