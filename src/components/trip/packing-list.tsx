"use client";

import type { GearRequirement } from "@/lib/types";
import { Backpack, CheckCircle2, AlertCircle, CircleDot } from "lucide-react";

function PriorityIcon({ priority }: { priority: string }) {
  if (priority === "essential") return <AlertCircle className="h-4 w-4 text-red-500" />;
  if (priority === "recommended") return <CheckCircle2 className="h-4 w-4 text-teal" />;
  return <CircleDot className="h-4 w-4 text-muted-foreground" />;
}

export function PackingList({ items }: { items: GearRequirement[] }) {
  if (items.length === 0) return null;

  const grouped = {
    essential: items.filter((i) => i.priority === "essential"),
    recommended: items.filter((i) => i.priority === "recommended"),
    optional: items.filter((i) => i.priority === "optional"),
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
        <Backpack className="h-5 w-5 text-teal" />
        Packing List
      </h3>
      {(["essential", "recommended", "optional"] as const).map((priority) => {
        const group = grouped[priority];
        if (group.length === 0) return null;
        return (
          <div key={priority}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              {priority}
            </p>
            <div className="grid gap-1.5">
              {group.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <PriorityIcon priority={item.priority} />
                  <div>
                    <span className="font-medium">{item.item}</span>
                    <span className="text-muted-foreground"> — {item.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
