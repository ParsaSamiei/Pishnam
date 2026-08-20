interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="border-border bg-pishnam-navy-900 text-pishnam-off-white border-b">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {subtitle && <p className="text-pishnam-off-white/75 mt-2 max-w-2xl">{subtitle}</p>}
      </div>
    </div>
  );
}
