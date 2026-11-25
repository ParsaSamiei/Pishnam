import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AdminListHeaderProps {
  title: string;
  newHref?: string;
  newLabel?: string;
}

export function AdminListHeader({ title, newHref, newLabel = "افزودن" }: AdminListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-text-primary text-2xl font-bold">{title}</h1>
      {newHref && (
        <Button asChild size="sm">
          <Link href={newHref}>
            <Plus className="size-4" aria-hidden="true" />
            {newLabel}
          </Link>
        </Button>
      )}
    </div>
  );
}
