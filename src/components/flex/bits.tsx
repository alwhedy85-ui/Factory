import type { ReactNode } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import type { Issue } from "@/lib/flex/calc";
import { fmt } from "@/lib/flex/model";
import { useFlex } from "@/lib/flex/store";

export const fieldClass =
  "h-11 w-full rounded-lg border border-line bg-card px-3 text-sm text-ink shadow-card outline-none transition-[border-color] duration-150 focus:border-copper";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl bg-card p-4 shadow-card ${className}`}>{children}</section>;
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="mb-1 block text-sm font-medium text-ink">{children}</span>;
}

export function Hint({ children }: { children: ReactNode }) {
  return <span className="mt-1 block text-xs leading-5 text-muted">{children}</span>;
}

export function NumberField({
  label,
  value,
  onChange,
  unit,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <span className="flex items-center gap-2">
        <input
          className={`${fieldClass} font-mono tabular-nums`}
          dir="ltr"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {unit ? <span className="shrink-0 text-xs text-muted">{unit}</span> : null}
      </span>
      {hint ? <Hint>{hint}</Hint> : null}
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`block ${disabled ? "opacity-50" : ""}`}>
      <FieldLabel>{label}</FieldLabel>
      <select
        className={fieldClass}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <Hint>{hint}</Hint> : null}
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        className={fieldClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <Hint>{hint}</Hint> : null}
    </label>
  );
}

export function Readout({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <p className="flex h-11 items-center rounded-lg bg-paper-2 px-3 font-mono text-sm tabular-nums text-ink" dir="ltr">
        {value}
      </p>
      {hint ? <Hint>{hint}</Hint> : null}
    </div>
  );
}

export function StatusBanner({ issues, okText }: { issues: Issue[]; okText: string }) {
  const bad = issues.filter((issue) => issue.tone === "bad");
  const warnings = issues.filter((issue) => issue.tone === "warn");
  if (bad.length === 0 && warnings.length === 0) {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-ok-bg px-3 py-2 text-sm font-medium text-ok">
        <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
        {okText}
      </p>
    );
  }
  const list = bad.length > 0 ? bad : warnings;
  return (
    <div className="rounded-xl bg-warn-bg px-3 py-2 text-sm text-warn">
      <p className="flex items-center gap-2 font-medium">
        <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
        {bad.length > 0 ? "راجع المدخلات" : "تنبيه"}
      </p>
      <ul className="mt-1 space-y-1 ps-6">
        {list.map((issue) => (
          <li key={issue.text}>{issue.text}</li>
        ))}
      </ul>
    </div>
  );
}

export function HeroStat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl bg-paper px-3 py-3 shadow-card">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-ink" dir="ltr">
        {value}
        <span className="ms-1 text-xs font-medium text-muted">{unit}</span>
      </p>
    </div>
  );
}

export function DetailRow({
  label,
  value,
  unit,
  note,
}: {
  label: string;
  value: string;
  unit?: string;
  note?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line py-2 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm text-ink">{label}</p>
        {note ? <p className="text-xs text-muted">{note}</p> : null}
      </div>
      <p className="shrink-0 font-mono text-sm font-medium tabular-nums text-ink" dir="ltr">
        {value}
        {unit ? <span className="ms-1 text-xs font-normal text-muted">{unit}</span> : null}
      </p>
    </div>
  );
}

export function WeightBar({
  parts,
}: {
  parts: { label: string; grams: number | null; tone: "steel" | "copper" | "ink" | "ok" }[];
}) {
  const total = parts.reduce((sum, part) => sum + (part.grams != null && part.grams > 0 ? part.grams : 0), 0);
  if (total <= 0) return null;
  const toneClass = {
    steel: "bg-steel",
    copper: "bg-copper",
    ink: "bg-ink",
    ok: "bg-ok",
  };
  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-paper-2">
        {parts.map((part) =>
          part.grams != null && part.grams > 0 ? (
            <div
              key={part.label}
              className={toneClass[part.tone]}
              style={{ width: `${(part.grams / total) * 100}%` }}
            />
          ) : null,
        )}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {parts.map((part) => (
          <li key={part.label} className="flex items-center gap-1 text-xs text-muted">
            <span className={`size-2 rounded-full ${toneClass[part.tone]}`} />
            {part.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function useDigits() {
  const precision = useFlex((state) => state.precision);
  return (value: number | null | undefined, kind: "len" | "g" | "mm" | "money" | "n" = "n") => {
    if (value == null || !Number.isFinite(value)) return "—";
    if (precision) return fmt(value, 6, 0);
    if (kind === "money") return fmt(value, 2, 2);
    if (kind === "g") return fmt(value, 2, 2);
    if (kind === "len") return fmt(value, 3, 3);
    if (kind === "mm") return fmt(value, 2, 0);
    return fmt(value, 3, 0);
  };
}

export function moneyText(value: number | null, currency: string, digits: (n: number | null, kind: "money") => string) {
  if (value == null) return "غير مكتمل";
  return `${digits(value, "money")} ${currency}`;
}
