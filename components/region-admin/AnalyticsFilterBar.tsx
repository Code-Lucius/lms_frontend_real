"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export interface FilterField {
  key: string;
  label: string;
  allLabel?: string; // omit for fields that always need a value (term)
  options: { value: string; label: string }[];
}

const selectStyle = { margin: 0, width: "auto", padding: "9px 12px" } as const;

export function AnalyticsFilterBar({
  baseHref,
  fields,
  values,
}: {
  baseHref: string;
  fields: FilterField[];
  values: Record<string, string | null | undefined>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function change(key: string, value: string) {
    const qs = new URLSearchParams();
    Object.entries(values).forEach(([k, v]) => {
      if (v && k !== "page") qs.set(k, v);
    });
    if (value) qs.set(key, value);
    else qs.delete(key);
    const query = qs.toString();
    startTransition(() => router.push(query ? `${baseHref}?${query}` : baseHref));
  }

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", opacity: isPending ? 0.6 : 1 }}>
      {fields.map((f) => (
        <select
          key={f.key}
          className="field"
          style={selectStyle}
          aria-label={f.label}
          value={values[f.key] ?? ""}
          onChange={(e) => change(f.key, e.target.value)}
        >
          {f.allLabel !== undefined && <option value="">{f.allLabel}</option>}
          {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ))}
    </div>
  );
}