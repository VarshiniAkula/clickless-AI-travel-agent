"use client";

import type { CulturalNorm } from "@/lib/types";
import { Globe, AlertTriangle, Info, Lightbulb } from "lucide-react";

function ImportanceIcon({ importance }: { importance: string }) {
  if (importance === "high") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  if (importance === "medium") return <Info className="h-4 w-4 text-teal" />;
  return <Lightbulb className="h-4 w-4 text-muted-foreground" />;
}

export function CulturalTips({ tips }: { tips: CulturalNorm[] }) {
  if (tips.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
        <Globe className="h-5 w-5 text-teal" />
        Cultural Tips
      </h3>
      <div className="grid gap-2">
        {tips.map((t, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card">
            <ImportanceIcon importance={t.importance} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.category}</p>
              <p className="text-sm mt-0.5">{t.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
