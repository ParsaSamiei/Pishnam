"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type FaqListItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqListGroup = {
  category: string;
  items: FaqListItem[];
};

function idFromHash(): string | undefined {
  const match = window.location.hash.match(/^#faq-(.+)$/);
  return match?.[1];
}

export function FaqList({ groups }: { groups: FaqListGroup[] }) {
  const [openId, setOpenId] = useState<string>();

  useEffect(() => {
    function applyHash() {
      const id = idFromHash();
      if (!id) return;
      setOpenId(id);
      requestAnimationFrame(() => {
        document.getElementById(`faq-${id}`)?.scrollIntoView({ block: "start" });
      });
    }

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => {
        const values = new Set(group.items.map((item) => item.id));
        const value = openId && values.has(openId) ? openId : undefined;
        return (
          <div key={group.category}>
            <h2 className="text-text-primary mb-2 text-lg font-bold">{group.category}</h2>
            <Accordion
              type="single"
              collapsible
              value={value ?? ""}
              onValueChange={(next) => setOpenId(next || undefined)}
            >
              {group.items.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  id={`faq-${faq.id}`}
                  className="scroll-mt-24"
                >
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent className="reading-copy leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        );
      })}
    </div>
  );
}
