import { Phone } from "lucide-react";
import { toLatinDigits } from "@/lib/phone";
import { cn } from "@/lib/utils";

type BranchPhoneNumbersProps = {
  phones: string[];
  isFa: boolean;
  compact?: boolean;
};

/** Keeps branch phones together with their address in all three public views. */
export function BranchPhoneNumbers({ phones, isFa, compact = false }: BranchPhoneNumbersProps) {
  if (phones.length === 0) return null;

  return (
    <div className={cn("flex items-start", compact ? "mt-2 gap-1.5" : "gap-3")}>
      <Phone
        aria-hidden="true"
        className={cn(
          "shrink-0",
          compact ? "mt-0.5 size-3.5 opacity-70" : "text-pishnam-steel-600 mt-0.5 size-5",
        )}
      />
      <div className="min-w-0">
        <p
          className={cn(
            "font-semibold",
            compact ? "text-pishnam-off-white/80 text-xs" : "text-text-primary text-sm",
          )}
        >
          {isFa ? "تلفن شعبه" : "Branch phone"}
        </p>
        <ul className="mt-1 flex flex-col gap-1">
          {phones.map((phone, index) => (
            <li key={`${phone}-${index}`}>
              <a
                href={`tel:${toLatinDigits(phone).replace(/[^\d+]/g, "")}`}
                className={cn(
                  "inline-flex min-h-11 cursor-pointer items-center rounded-sm text-sm transition-colors duration-200",
                  "focus-visible:ring-pishnam-gold-500 focus-visible:ring-2 focus-visible:outline-none",
                  compact
                    ? "text-pishnam-off-white/60 hover:text-pishnam-gold-500"
                    : "text-text-secondary hover:text-pishnam-gold-600",
                )}
              >
                <span dir="ltr">
                  {isFa
                    ? phone.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit)
                    : phone}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
