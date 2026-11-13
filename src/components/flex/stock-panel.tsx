import { useState } from "react";
import { SCH40, num, productLabel, stockCatalog, unitLabel, type MovementKind, type ProductKind, type StockUnit } from "@/lib/flex/model";
import { bomNeeds, calcBom, calcCoverage, formatDays, formatHours, makeSecondsFor } from "@/lib/flex/calc";
import { toDrive, toScenario, useFlex } from "@/lib/flex/store";
import { Card, NumberField, SelectField, StatusBanner, fieldClass, useDigits } from "@/components/flex/bits";

const npsOptions = SCH40.map((row) => ({ value: row.nps, label: `${row.nps}″` }));

const KIND_LABEL: Record<MovementKind, string> = {
  receipt: "استلام",
  return: "مرتجع",
  issue: "صرف",
};

export function StockPanel() {
  const state = useFlex();
  const digits = useDigits();
  const scenario = toScenario(state);
  const drive = toDrive(state);
  const lengthM = num(state.plan.lengthM);
  const pieces = num(state.plan.batch);
  const bom = calcBom(scenario, state.plan.product, state.plan.nps, lengthM, pieces != null && pieces > 0 ? pieces : 1);
  const needs = bomNeeds(scenario, bom, state.plan.product);
  const seconds = makeSecondsFor(scenario, drive, state.plan.product, state.plan.nps, lengthM);
  const manualDay = num(state.plan.piecesPerDay);
  const hoursPerDay = num(state.plan.hoursPerDay);
  const secondsForRate =
    state.plan.rateMode === "manual" && manualDay != null && manualDay > 0 && hoursPerDay != null && hoursPerDay > 0
      ? (hoursPerDay * 3600) / manualDay
      : seconds;
  const stock = Object.fromEntries(
    Object.entries(state.stock).map(([id, row]) => [id, { qty: num(row.qty), unit: row.unit }]),
  );
  const coverage = calcCoverage(needs, stock, secondsForRate, hoursPerDay, pieces, scenario);
  const catalog = stockCatalog();
  const [itemId, setItemId] = useState(catalog[0]?.id ?? "glue");
  const [kind, setKind] = useState<MovementKind>("receipt");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [posted, setPosted] = useState<string | null>(null);
  const activeCarton = needs.find((need) => need.itemId.startsWith("carton:"));

  return (
    <div className="grid gap-4">
      <Card>
        <h2 className="text-base font-semibold text-ink">رصيد الخامات</h2>
        <p className="mt-1 text-xs text-muted">
          اكتب رصيد المخزن. الاستلام والمرتجع يزودان الرصيد، والصرف ينقصه. التنبيه يحسب كم تكفي الخامات لو اتصنعت الوصلة اللي تحت.
        </p>
      </Card>

      <div className="grid w-full min-w-0 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-ink">ما الذي هيتصنع؟</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <SelectField
              label="المنتج"
              value={state.plan.product}
              onChange={(product) => state.patchPlan({ product: product as ProductKind })}
              options={[
                { value: "joint", label: "وصلة" },
                { value: "cover", label: "Cover" },
                { value: "insulated", label: "وصلة معزولة" },
              ]}
            />
            <SelectField label="المقاس" value={state.plan.nps} onChange={(nps) => state.patchPlan({ nps })} options={npsOptions} />
            <NumberField label="طول القطعة" unit="م" value={state.plan.lengthM} onChange={(lengthM) => state.patchPlan({ lengthM })} />
            <NumberField label="كمية طلب للمقارنة" value={state.plan.batch} onChange={(batch) => state.patchPlan({ batch })} hint="فاضي = من غير مقارنة طلب" />
            <NumberField label="ساعات التشغيل في اليوم" value={state.plan.hoursPerDay} onChange={(hoursPerDay) => state.patchPlan({ hoursPerDay })} />
            <div>
              <p className="mb-1 text-sm font-medium text-ink">معدل الإنتاج</p>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-paper-2 p-1">
                {(
                  [
                    ["machine", "من الماكينة"],
                    ["manual", "رقم يدوي"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={state.plan.rateMode === value}
                    className={`h-11 rounded-md text-sm font-medium ${state.plan.rateMode === value ? "bg-card text-ink shadow-card" : "text-muted"}`}
                    onClick={() => state.patchPlan({ rateMode: value })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {state.plan.rateMode === "manual" ? (
              <NumberField label="قطع في اليوم" value={state.plan.piecesPerDay} onChange={(piecesPerDay) => state.patchPlan({ piecesPerDay })} />
            ) : (
              <p className="text-xs text-muted sm:col-span-2">
                زمن القطعة من بيانات الماكينة في «زمن التصنيع»
                {seconds == null ? " — الزمن غير مكتمل." : ` — ${digits((seconds ?? 0) / 60, "n")} دقيقة للقطعة.`}
                {state.plan.product === "insulated" ? " المعزولة = لف الوصلة + لف الغطاء." : ""}
              </p>
            )}
          </div>
          <button
            type="button"
            className="mt-3 text-sm font-medium text-copper"
            onClick={() =>
              state.patchPlan({
                nps: state.plan.product === "cover" ? state.cover.nps : state.plan.product === "insulated" ? state.insulated.nps : state.joint.nps,
                lengthM:
                  state.plan.product === "cover"
                    ? state.cover.lengthM
                    : state.plan.product === "insulated"
                      ? state.insulated.lengthM
                      : state.joint.lengthM,
              })
            }
          >
            انسخ المقاس والطول من الحاسبة
          </button>
        </Card>
        <div className={`rounded-2xl p-4 shadow-card ${coverage.bottleneck && (coverage.bottleneck.pieces ?? 0) <= 0 ? "bg-warn-bg text-warn" : "bg-steel text-steel-ink"}`}>
          <p className="text-sm opacity-80">تنبيه التغطية</p>
          <p className="mt-2 text-base font-semibold leading-7">{coverage.headline}</p>
          {coverage.piecesPerHour != null ? (
            <p className="mt-3 font-mono text-sm tabular-nums" dir="ltr">
              {digits(coverage.piecesPerHour, "n")} قطعة/ساعة
            </p>
          ) : null}
          {coverage.bottleneck?.days != null ? (
            <p className="mt-1 text-sm opacity-80">{formatDays(coverage.bottleneck.days)} عند {state.plan.hoursPerDay || "—"} ساعات.</p>
          ) : null}
        </div>
      </div>

      <StatusBanner issues={bom.issues.filter((issue) => issue.tone === "bad")} okText="مواصفات القطعة صالحة لحساب الاستهلاك" />

      <Card>
        <h3 className="text-sm font-semibold text-ink">كفاية كل خامة لـ {productLabel(state.plan.product)} {state.plan.nps}″</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-start text-xs text-muted">
                <th className="border-b border-line py-2 font-medium">الخامة</th>
                <th className="border-b border-line py-2 font-medium">للقطعة</th>
                <th className="border-b border-line py-2 font-medium">الرصيد</th>
                <th className="border-b border-line py-2 font-medium">قطع</th>
                <th className="border-b border-line py-2 font-medium">المدة</th>
                <th className="border-b border-line py-2 font-medium">الطلب</th>
              </tr>
            </thead>
            <tbody>
              {coverage.rows.map((row) => (
                <tr key={row.itemId}>
                  <td className="border-b border-line py-2">
                    <p>{row.label}</p>
                    {row.note ? <p className="text-xs text-warn">{row.note}</p> : null}
                  </td>
                  <td className="border-b border-line py-2 font-mono tabular-nums" dir="ltr">
                    {digits(row.perPiece, "n")} {unitOf(row.unit)}
                  </td>
                  <td className="border-b border-line py-2 font-mono tabular-nums" dir="ltr">
                    {digits(row.stock, "n")}
                  </td>
                  <td className="border-b border-line py-2 font-mono tabular-nums" dir="ltr">{digits(row.pieces, "n")}</td>
                  <td className="border-b border-line py-2">{row.hours == null ? "—" : formatHours(row.hours)}</td>
                  <td className="border-b border-line py-2">
                    {row.batchOk == null ? "—" : row.batchOk ? "يكفي" : "لا يكفي"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid w-full min-w-0 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-ink">أرصدة المخزن</h3>
          <div className="mt-2 grid gap-3">
            {catalog.map((item) => {
              const row = state.stock[item.id] ?? { qty: "", unit: item.defaultUnit };
              return (
                <div key={item.id} className="grid gap-2 border-b border-line py-3 sm:grid-cols-[minmax(0,1fr)_8rem_8rem] sm:items-center">
                  <div>
                    <p className="text-sm font-medium text-ink">{item.label}</p>
                    <p className="text-xs text-muted">{item.hint}</p>
                  </div>
                  <input
                    className={`${fieldClass} font-mono tabular-nums`}
                    dir="ltr"
                    inputMode="decimal"
                    placeholder="0"
                    value={row.qty}
                    onChange={(event) => state.setStock(item.id, { qty: event.target.value })}
                  />
                  <select
                    className={fieldClass}
                    value={row.unit}
                    onChange={(event) => state.setStock(item.id, { unit: event.target.value as StockUnit })}
                  >
                    {item.units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unitLabel(unit)}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
            {activeCarton ? (
              <div className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_8rem] sm:items-center">
                <div>
                  <p className="text-sm font-medium text-ink">{activeCarton.label}</p>
                  <p className="text-xs text-muted">كرتونة المقاس المختار في الخطة</p>
                </div>
                <input
                  className={`${fieldClass} font-mono tabular-nums`}
                  dir="ltr"
                  inputMode="decimal"
                  placeholder="0"
                  value={state.stock[activeCarton.itemId]?.qty ?? ""}
                  onChange={(event) => state.setStock(activeCarton.itemId, { qty: event.target.value, unit: "carton" })}
                />
              </div>
            ) : null}
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-ink">حركة مخزن</h3>
          <form
            className="mt-3 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const ok = state.postMovement(itemId, kind, qty, note);
              setPosted(ok ? "اتسجلت الحركة على الرصيد." : "اكتب كمية أكبر من صفر.");
              if (ok) {
                setQty("");
                setNote("");
              }
            }}
          >
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">الخامة</span>
              <select className={fieldClass} value={itemId} onChange={(event) => setItemId(event.target.value)}>
                {catalog.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
                {activeCarton ? <option value={activeCarton.itemId}>{activeCarton.label}</option> : null}
              </select>
            </label>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-paper-2 p-1">
              {(["receipt", "return", "issue"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={kind === value}
                  className={`h-11 rounded-md text-sm font-medium ${kind === value ? "bg-card text-ink shadow-card" : "text-muted"}`}
                  onClick={() => setKind(value)}
                >
                  {KIND_LABEL[value]}
                </button>
              ))}
            </div>
            <NumberField label="الكمية" value={qty} onChange={setQty} hint="بنفس وحدة رصيد الخامة" />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">ملاحظة</span>
              <input className={fieldClass} value={note} placeholder="رقم إذن أو سبب المرتجع" onChange={(event) => setNote(event.target.value)} />
            </label>
            <button type="submit" className="h-11 rounded-lg bg-copper text-sm font-semibold text-copper-ink">
              تسجيل {KIND_LABEL[kind]}
            </button>
            {posted ? <p className="text-xs text-muted">{posted}</p> : null}
          </form>
          <ul className="mt-4 grid gap-2">
            {state.movements.length === 0 ? <li className="text-sm text-muted">لا توجد حركات بعد.</li> : null}
            {state.movements.slice(0, 8).map((move) => (
              <li key={move.id} className="rounded-xl bg-paper px-3 py-2 text-sm">
                <p className="font-medium text-ink">
                  {KIND_LABEL[move.kind]} · {digits(num(move.qty), "n")}
                </p>
                <p className="text-xs text-muted">
                  {catalog.find((item) => item.id === move.itemId)?.label ?? move.itemId}
                  {move.note ? ` · ${move.note}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function unitOf(unit: "m" | "g" | "m2" | "carton") {
  if (unit === "m") return "م";
  if (unit === "g") return "جم";
  if (unit === "m2") return "م²";
  return "كرتونة";
}
