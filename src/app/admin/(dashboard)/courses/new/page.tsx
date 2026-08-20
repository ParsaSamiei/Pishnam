import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CourseForm } from "@/components/admin/course-form";
import { createCourse } from "../actions";

export default function NewCoursePage() {
  return (
    <div>
      <Link
        href="/admin/courses"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به دوره‌ها
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن دوره جدید</h1>
      <div className="mt-6">
        <CourseForm action={createCourse} submitLabel="ثبت دوره" />
      </div>
    </div>
  );
}
