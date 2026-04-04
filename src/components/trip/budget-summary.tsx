"use client";

import type { BudgetSummary } from "@/lib/types";
import { DollarSign } from "lucide-react";

export function BudgetCard({ budget, userBudget }: { budget: BudgetSummary; userBudget?: number }) {
  const categories = [
    { label: "Flights (round trip)", amount: budget.flights, color: "bg-primary" },
    { label: "Hotels", amount: budget.hotels, color: "bg-teal" },
    { label: "Activities", amount: budget.activities, color: "bg-amber-500" },
    { label: "Food & Dining", amount: budget.food, color: "bg-rose-400" },
    { label: "Local Transport", amount: budget.transport, color: "bg-blue-400" },
    { label: "Miscellaneous", amount: budget.misc, color: "bg-gray-400" },
  ];

  const withinBudget = userBudget ? budget.total <= userBudget : null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-teal" />
        Budget Estimate
      </h3>
      <div className="p-4 rounded-xl bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold">${budget.total.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Estimated total</p>
          </div>
          {withinBudget !== null && (
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full ${
                withinBudget
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {withinBudget ? "Within Budget" : "Over Budget"}
            </span>
          )}
        </div>

        {/* Budget bar */}
        <div className="flex rounded-full h-3 overflow-hidden mb-4">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className={`${cat.color} transition-all`}
              style={{ width: `${(cat.amount / budget.total) * 100}%` }}
              title={`${cat.label}: $${cat.amount}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                <span className="text-muted-foreground">{cat.label}</span>
              </span>
              <span className="font-medium">${cat.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
