import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyMessage: string;
}

/**
 * Config-driven table shared across every admin list view, per
 * docs/06-admin-panel.md ("consistent CRUD pattern reused across every
 * content type"). Each content-type page defines its own `columns` (what to
 * show, how to render each cell) and passes its Prisma rows straight
 * through.
 */
export function DataTable<T>({ columns, rows, getRowKey, emptyMessage }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <p className="text-text-secondary p-6 text-center text-sm">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-border bg-bg-surface-alt text-text-secondary border-b">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                className={cn("px-4 py-2.5 text-start font-medium", column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-border hover:bg-bg-surface-alt/50 border-b last:border-0"
            >
              {columns.map((column) => (
                <td
                  key={column.header}
                  className={cn("text-text-primary px-4 py-3", column.className)}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
