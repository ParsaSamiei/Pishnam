import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { LeadStatusBadge, LeadTypeLabel } from "@/components/admin/lead-status-badge";
import { formatDate } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [newCount, recentLeads] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-text-primary text-2xl font-bold">داشبورد</h1>
      </div>

      {/* No email notifications exist for new leads (docs/06-admin-panel.md) --
          this count is the primary "you have something new" signal. */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-text-secondary text-sm">درخواست‌های جدید</p>
            <p className="text-pishnam-gold-600 mt-1 text-3xl font-bold">{newCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-text-primary text-lg font-bold">آخرین درخواست‌ها</h2>
          <Link
            href="/admin/leads"
            className="text-pishnam-steel-600 text-sm font-medium hover:underline"
          >
            مشاهده همه
          </Link>
        </div>

        <Card className="mt-4 overflow-hidden p-0">
          {recentLeads.length === 0 ? (
            <p className="text-text-secondary p-6 text-sm">هنوز درخواستی ثبت نشده است.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-border bg-bg-surface-alt text-text-secondary border-b text-start">
                <tr>
                  <th className="px-4 py-2.5 text-start font-medium">نوع</th>
                  <th className="px-4 py-2.5 text-start font-medium">نام</th>
                  <th className="px-4 py-2.5 text-start font-medium">تاریخ</th>
                  <th className="px-4 py-2.5 text-start font-medium">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-border border-b last:border-0">
                    <td className="text-text-primary px-4 py-3">
                      <LeadTypeLabel type={lead.type} />
                    </td>
                    <td className="text-text-primary px-4 py-3">{lead.name}</td>
                    <td className="text-text-secondary px-4 py-3">
                      {formatDate(lead.createdAt, "fa")}
                    </td>
                    <td className="px-4 py-3">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
