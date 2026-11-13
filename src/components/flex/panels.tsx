import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  CARTON_SIZES,
  MATERIALS,
  SCH40,
  WIRES,
  approvedId,
  autoCartonMm,
  cartonKey,
  geometricId,
  materialById,
  num,
  priceKeyMat,
  priceKeyWire,
  productLabel,
  schByNps,
  wireByKey,
  type PriceUnit,
  type ProductKind,
} from "@/lib/flex/model";
import { calcCost, calcCover, calcInsulated, calcJoint, type CostResult, type CoverResult, type InsulatedResult, type JointResult } from "@/lib/flex/calc";
import { toScenario, useFlex, type FlexState } from "@/lib/flex/store";
import {
  Card,
  DetailRow,
  HeroStat,
  NumberField,
  Readout,
  SelectField,
  StatusBanner,
  TextField,
  WeightBar,
  fieldClass,
  moneyText,
  useDigits,
} from "@/components/flex/bits";

export function usePack() {
  const state = useFlex();
  const scenario = toScenario(state);
  const joint = calcJoint(scenario, scenario.jointLengthM, scenario.jointNps);
  const cover = calcCover(scenario);
  const insulated = calcInsulated(scenario);
  const cost = calcCost(scenario, joint, cover, insulated);
  return { state, scenario, joint, cover, insulated, cost };
}

const npsOptions = SCH40.map((row) => ({ value: row.nps, label: `${row.nps}″` }));
const wireOptions = WIRES.map((wire) => ({ value: wire.key, label: wire.label }));
const matOptions = MATERIALS.map((mat) => ({ value: mat.id, label: mat.name }));

function recipeLine(state: FlexState) {
  const wire = wireByKey(state.joint.wireKey);
  const mat = materialById(state.joint.material1);
  const kind = state.joint.layerType === "double" ? "Double layer" : "Single layer";
  return `${kind} · ${wire?.label ?? "سلك"} · خطوة ${state.joint.pitchMm} مم · ${mat?.name ?? ""}`;
}

export function JointPanel() {
  const { state, joint, scenario } = usePack();
  const digits = useDigits();
  const per = (value: number | null) => {
    const len = scenario.jointLengthM;
    if (value == null || len == null || len <= 0) return null;
    return value / len;
  };
  return (
    <div className="grid w-full min-w-0 gap-4">
      <Card>
        <h2 className="text-base font-semibold text-ink">مدخلات الوصلة</h2>
        <p className="mt-1 text-xs text-muted">عدّل الطول والمقاس والسلك والخامة. التداخل والقطر يتحسبان وحدهم.</p>
        <div className="mt-4 grid gap-3">
          <NumberField
            label="طول الوصلة"
            unit="م"
            value={state.joint.lengthM}
            onChange={(lengthM) => state.patchJoint({ lengthM })}
            hint="طول الوصلة النهائية بالمتر"
          />
          <SelectField
            label="مقاس الماسورة الاسمي NPS"
            value={state.joint.nps}
            onChange={(nps) => state.patchJoint({ nps })}
            options={npsOptions}
            hint={joint.idMm == null ? "من جدول Sch 40" : `القطر الداخلي المعتمد ${digits(joint.idMm, "mm")} مم`}
          />
          <div>
            <p className="mb-1 text-sm font-medium text-ink">نوع الوصلة</p>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-paper-2 p-1">
              {(
                [
                  ["single", "طبقة واحدة"],
                  ["double", "طبقتان"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={state.joint.layerType === value}
                  className={`h-11 rounded-md text-sm font-medium ${
                    state.joint.layerType === value ? "bg-card text-ink shadow-card" : "text-muted"
                  }`}
                  onClick={() => state.patchJoint({ layerType: value })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <SelectField
            label="قطر السلك"
            value={state.joint.wireKey}
            onChange={(wireKey) => state.patchJoint({ wireKey })}
            options={wireOptions}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="خطوة السلك"
              unit="مم"
              value={state.joint.pitchMm}
              onChange={(pitchMm) => state.patchJoint({ pitchMm })}
            />
            <NumberField
              label="عرض الشريط"
              unit="مم"
              value={state.joint.stripWidthMm}
              onChange={(stripWidthMm) => state.patchJoint({ stripWidthMm })}
            />
          </div>
          <Readout
            label="التداخل"
            value={joint.overlapMm == null ? "—" : `${digits(joint.overlapMm, "mm")} مم`}
            hint="عرض الشريط − الخطوة، ويُلصق بالغراء"
          />
          <SelectField
            label="خامة الطبقة الأولى"
            value={state.joint.material1}
            onChange={(material1) => state.patchJoint({ material1 })}
            options={matOptions}
          />
          <SelectField
            label="خامة الطبقة الثانية"
            value={state.joint.material2}
            disabled={state.joint.layerType !== "double"}
            onChange={(material2) => state.patchJoint({ material2 })}
            options={matOptions}
            hint={state.joint.layerType === "double" ? "تُحسب بنفس طول الشريط" : "تُستخدم فقط في Double layer"}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="غراء مرجعي"
              unit="جم/م"
              value={state.joint.glueGPerM}
              onChange={(glueGPerM) => state.patchJoint({ glueGPerM })}
            />
            <NumberField
              label="تداخل الغراء"
              unit="مم"
              value={state.joint.glueRefOverlapMm}
              onChange={(glueRefOverlapMm) => state.patchJoint({ glueRefOverlapMm })}
            />
          </div>
        </div>
      </Card>
      <div className="grid content-start gap-4">
        <StatusBanner issues={joint.issues} okText="المدخلات سليمة" />
        <div className="grid grid-cols-2 gap-2">
          <HeroStat label="طول السلك" value={digits(joint.wire?.lengthM ?? null, "len")} unit="م" />
          <HeroStat label="طول الخامة / طبقة" value={digits(joint.strip?.lengthM ?? null, "len")} unit="م" />
          <HeroStat label="وزن الوصلة" value={digits(joint.totalG, "g")} unit="جم" />
          <HeroStat label="وزن المتر" value={digits(joint.perMeterG, "g")} unit="جم/م" />
        </div>
        <Card>
          <h3 className="text-sm font-semibold text-ink">توزيع الوزن</h3>
          <div className="mt-3">
            <WeightBar
              parts={[
                { label: "السلك", grams: joint.wireWeightG, tone: "steel" },
                { label: "الطبقة الأولى", grams: joint.layer1G, tone: "copper" },
                { label: "الطبقة الثانية", grams: joint.layer2G, tone: "ink" },
                { label: "الغراء", grams: joint.glueG, tone: "ok" },
              ]}
            />
          </div>
          <div className="mt-2">
            <DetailRow label="عدد اللفات" value={digits(joint.turns, "n")} unit="لفة" note="طول الوصلة ÷ الخطوة" />
            <DetailRow label="طول السلك" value={digits(joint.wire?.lengthM ?? null, "len")} unit="م" note="لفّة حلزونية على القطر الداخلي + تخانة السلك" />
            <DetailRow label="طول الخامة لكل طبقة" value={digits(joint.strip?.lengthM ?? null, "len")} unit="م" note="نفس الخطوة، فوق السلك بقطر أكبر" />
            <DetailRow label="عدد الطبقات" value={String(joint.layers)} unit="طبقة" />
            <DetailRow label="إجمالي طول الخامة" value={digits(joint.totalStripM, "len")} unit="م" />
            <DetailRow label="وزن السلك" value={digits(joint.wireWeightG, "g")} unit="جم" />
            <DetailRow label="وزن الطبقة الأولى" value={digits(joint.layer1G, "g")} unit="جم" note={materialById(state.joint.material1)?.name} />
            <DetailRow
              label="وزن الطبقة الثانية"
              value={digits(joint.layer2G, "g")}
              unit="جم"
              note={joint.layers === 2 ? materialById(state.joint.material2)?.name : "صفر في Single layer"}
            />
            <DetailRow label="الغراء لكل متر شريط" value={digits(joint.gluePerM, "n")} unit="جم/م" />
            <DetailRow label="وزن الغراء" value={digits(joint.glueG, "g")} unit="جم" />
            <DetailRow label="إجمالي الوزن" value={digits(joint.totalKg, "n")} unit="كجم" />
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-ink">استهلاك كل متر وصلة</h3>
          <div className="mt-2">
            <DetailRow label="السلك" value={digits(per(joint.wire?.lengthM ?? null), "len")} unit="م/م" />
            <DetailRow label="الخامة لكل طبقة" value={digits(per(joint.strip?.lengthM ?? null), "len")} unit="م/م" />
            <DetailRow label="الغراء" value={digits(per(joint.glueG), "g")} unit="جم/م" />
            <DetailRow label="الوزن" value={digits(joint.perMeterG, "g")} unit="جم/م" />
          </div>
        </Card>
      </div>
    </div>
  );
}

export function CoverPanel() {
  const { state, cover } = usePack();
  const digits = useDigits();
  return (
    <div className="grid w-full min-w-0 gap-4">
      <Card>
        <h2 className="text-base font-semibold text-ink">مدخلات الـ Cover</h2>
        <p className="mt-1 text-xs text-muted">لفّ حلزوني بالخامة والغراء بدون سلك. عرض الشريط من مدخلات الوصلة ({state.joint.stripWidthMm} مم).</p>
        <div className="mt-4 grid gap-3">
          <NumberField label="طول الـ Cover" unit="م" value={state.cover.lengthM} onChange={(lengthM) => state.patchCover({ lengthM })} />
          <SelectField
            label="مقاس الـ Cover الاسمي NPS"
            value={state.cover.nps}
            onChange={(nps) => state.patchCover({ nps })}
            options={npsOptions}
            hint={cover.idMm == null ? undefined : `القطر الداخلي ${digits(cover.idMm, "mm")} مم`}
          />
          <SelectField
            label="خامة الـ Cover"
            value={state.cover.material}
            onChange={(material) => state.patchCover({ material })}
            options={matOptions}
            hint="تُستخدم أيضًا في الوصلة المعزولة"
          />
          <NumberField
            label="التداخل"
            unit="مم"
            value={state.cover.overlapMm}
            onChange={(overlapMm) => state.patchCover({ overlapMm })}
            hint="يُستخدم أيضًا في الوصلة المعزولة"
          />
          <Readout
            label="خطوة لفّ الخامة"
            value={cover.pitchMm == null ? "—" : `${digits(cover.pitchMm, "mm")} مم`}
            hint="عرض الشريط − التداخل"
          />
        </div>
      </Card>
      <div className="grid content-start gap-4">
        <StatusBanner issues={cover.issues} okText="مدخلات الـ Cover سليمة" />
        <div className="grid grid-cols-2 gap-2">
          <HeroStat label="طول الخامة" value={digits(cover.stripM, "len")} unit="م" />
          <HeroStat label="وزن الخامة" value={digits(cover.matWeightG, "g")} unit="جم" />
          <HeroStat label="وزن الغراء" value={digits(cover.glueG, "g")} unit="جم" />
          <HeroStat label="إجمالي الـ Cover" value={digits(cover.totalG, "g")} unit="جم" />
        </div>
        <Card>
          <DetailRow label="عدد اللفات" value={digits(cover.turns, "n")} unit="لفة" />
          <DetailRow label="طول الخامة" value={digits(cover.stripM, "len")} unit="م" note={materialById(state.cover.material)?.name} />
          <DetailRow label="الغراء لكل متر" value={digits(cover.gluePerM, "n")} unit="جم/م" />
          <DetailRow label="وزن المتر" value={digits(cover.perMeterG, "g")} unit="جم/م" />
          <DetailRow label="الإجمالي" value={digits(cover.totalKg, "n")} unit="كجم" />
        </Card>
      </div>
    </div>
  );
}

export function InsulatedPanel() {
  const { state, insulated } = usePack();
  const digits = useDigits();
  const setSection = useFlex((s) => s.setSection);
  return (
    <div className="grid w-full min-w-0 gap-4">
      <Card>
        <h2 className="text-base font-semibold text-ink">الوصلة المعزولة</h2>
        <p className="mt-1 text-xs text-muted">من الداخل: وصلة بسلك وخامة، ثم صوف زجاجي، ثم Cover أكبر بدرجة.</p>
        <div className="mt-4 grid gap-3">
          <NumberField
            label="طول الوصلة المراد عزلها"
            unit="م"
            value={state.insulated.lengthM}
            onChange={(lengthM) => state.patchInsulated({ lengthM })}
          />
          <SelectField
            label="مقاس الوصلة NPS"
            value={state.insulated.nps}
            onChange={(nps) => state.patchInsulated({ nps })}
            options={npsOptions}
            hint={
              insulated.coverNps
                ? `الـ Cover المناسب ${insulated.coverNps}″ — قطر ${digits(insulated.coverIdMm, "mm")} مم`
                : "مقاس الـ Cover ناقص في جدول Sch 40"
            }
          />
          <div className="rounded-xl bg-paper px-3 py-3 text-sm">
            <p className="font-medium text-ink">تركيب الوصلة الداخلية</p>
            <p className="mt-1 text-muted">{recipeLine(state)}</p>
            <button type="button" className="mt-2 text-sm font-medium text-copper" onClick={() => setSection("joint")}>
              تعديل من تبويب الوصلة
            </button>
          </div>
          <div className="rounded-xl bg-paper px-3 py-3 text-sm">
            <p className="font-medium text-ink">خامة الغطاء وتداخله</p>
            <p className="mt-1 text-muted">
              {materialById(state.cover.material)?.name} · تداخل {state.cover.overlapMm} مم
            </p>
            <button type="button" className="mt-2 text-sm font-medium text-copper" onClick={() => setSection("cover")}>
              تعديل من تبويب الغطاء
            </button>
          </div>
        </div>
      </Card>
      <div className="grid content-start gap-4">
        <StatusBanner issues={insulated.issues} okText="الأبعاد سليمة" />
        <div className="grid grid-cols-2 gap-2">
          <HeroStat label="سمك العزل" value={digits(insulated.insulationMm, "mm")} unit="مم" />
          <HeroStat label="وزن الصوف" value={digits(insulated.woolG, "g")} unit="جم" />
          <HeroStat label="وزن الغطاء" value={digits(insulated.coverTotalG, "g")} unit="جم" />
          <HeroStat label="الإجمالي" value={digits(insulated.totalG, "g")} unit="جم" />
        </div>
        <Card>
          <h3 className="text-sm font-semibold text-ink">من الداخل للخارج</h3>
          <DetailRow label="قطر الوصلة الداخلي" value={digits(insulated.idMm, "mm")} unit="مم" />
          <DetailRow label="القطر الخارجي للوصلة" value={digits(insulated.outerMm, "mm")} unit="مم" note="ID + 2 × قطر السلك" />
          <DetailRow label="قطر الـ Cover" value={digits(insulated.coverIdMm, "mm")} unit="مم" note={insulated.coverNps ? `NPS ${insulated.coverNps}` : undefined} />
          <DetailRow label="سمك العزل الناتج" value={digits(insulated.insulationMm, "mm")} unit="مم" />
          <DetailRow label="وزن الوصلة الداخلية" value={digits(insulated.inner?.totalG ?? null, "g")} unit="جم" />
          <DetailRow label="وزن الصوف للمتر المربع" value={digits(insulated.woolGPerM2, "g")} unit="جم/م²" note="السمك × الكثافة" />
          <DetailRow label="عرض الصوف (الانفراد)" value={digits(insulated.woolWidthMm, "mm")} unit="مم" note="محيط الـ Cover" />
          <DetailRow label="مساحة الصوف" value={digits(insulated.woolAreaM2, "n")} unit="م²" />
          <DetailRow label="طول خامة الـ Cover" value={digits(insulated.coverStripM, "len")} unit="م" />
          <DetailRow label="وزن غراء الـ Cover" value={digits(insulated.coverGlueG, "g")} unit="جم" />
          <DetailRow label="وزن المتر المعزول" value={digits(insulated.perMeterG, "g")} unit="جم/م" />
          <DetailRow label="الإجمالي" value={digits(insulated.totalKg, "n")} unit="كجم" />
        </Card>
      </div>
    </div>
  );
}

function PriceEditor({
  priceKey,
  label,
  note,
  allow,
  basisG,
}: {
  priceKey: string;
  label: string;
  note?: string;
  allow: PriceUnit[];
  basisG?: number | null;
}) {
  const price = useFlex((state) => state.prices[priceKey] ?? { price: "", unit: "kg" as PriceUnit });
  const setPrice = useFlex((state) => state.setPrice);
  const currency = useFlex((state) => state.currency);
  const unitLabel: Record<PriceUnit, string> = {
    kg: `${currency}/كجم`,
    m: `${currency}/متر`,
    m2: `${currency}/م²`,
  };
  const entered = num(price.price);
  const perMeter =
    entered == null
      ? null
      : price.unit === "m"
        ? entered
        : price.unit === "kg" && basisG != null && basisG > 0
          ? (entered * basisG) / 1000
          : null;
  return (
    <div className="grid gap-2 border-b border-line py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_8rem_9rem] sm:items-center">
      <div>
        <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink">
          {label}
          {entered == null ? (
            <span className="rounded-full bg-warn-bg px-2 py-0.5 text-xs font-medium text-warn">بانتظار السعر</span>
          ) : null}
        </p>
        {note ? <p className="text-xs text-muted">{note}</p> : null}
        {perMeter != null ? (
          <p className="text-xs text-muted" dir="ltr">
            {perMeter.toFixed(4)} {currency}/m
          </p>
        ) : null}
      </div>
      <input
        className={`${fieldClass} font-mono tabular-nums`}
        dir="ltr"
        inputMode="decimal"
        placeholder="السعر"
        value={price.price}
        onChange={(event) => setPrice(priceKey, { price: event.target.value })}
      />
      {allow.length > 1 ? (
        <select
          className={fieldClass}
          value={price.unit}
          onChange={(event) => setPrice(priceKey, { unit: event.target.value as PriceUnit })}
        >
          {allow.map((unit) => (
            <option key={unit} value={unit}>
              {unitLabel[unit]}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-xs text-muted">{unitLabel[allow[0] ?? "kg"]}</p>
      )}
    </div>
  );
}

function CostLines({
  lines,
  currency,
}: {
  lines: CostResult["jointLines"];
  currency: string;
}) {
  const digits = useDigits();
  return (
    <div>
      {lines.map((line) => (
        <DetailRow
          key={line.id}
          label={line.label}
          value={line.cost == null ? "غير مكتمل" : digits(line.cost, "money")}
          unit={line.cost == null ? undefined : currency}
          note={`${line.chosen}${line.qty != null ? ` · ${digits(line.qty, "n")} ${line.unit}` : ""}`}
        />
      ))}
    </div>
  );
}

export function CostPanel() {
  const { state, cost } = usePack();
  const digits = useDigits();
  const currency = state.currency || "جنيه";
  const focusMissing =
    state.costFocus === "cover" ? cost.coverMissing : state.costFocus === "insulated" ? cost.insMissing : cost.jointMissing;
  const focusMaterial =
    state.costFocus === "cover" ? cost.coverTotal : state.costFocus === "insulated" ? cost.insTotal : cost.jointMaterial;
  const focusName = state.costFocus === "cover" ? "الـ Cover" : state.costFocus === "insulated" ? "الوصلة المعزولة" : "الوصلة";
  const missing = focusMissing.length;
  return (
    <div className="grid gap-4">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">أسعار الخامات</h2>
            <p className="mt-1 text-xs text-muted">
              أسعار الشيت معبّأة حيث وُجدت. الخانة الفاضية تبقى بانتظار سعرك، وتقدر تعدّل أي سعر. البنود الأخرى الفاضية لا تدخل في الإجمالي.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="h-11 rounded-lg bg-copper px-3 text-sm font-semibold text-copper-ink" onClick={() => state.restoreSheetPrices()}>
              استعادة أسعار الشيت
            </button>
            <button type="button" className="h-11 rounded-lg bg-paper px-3 text-sm font-medium text-ink shadow-card" onClick={() => state.clearPrices()}>
              مسح الأسعار
            </button>
          </div>
        </div>
        <div className="mt-3 max-w-xs">
          <TextField label="العملة" value={state.currency} onChange={state.setCurrency} />
        </div>
        <div className="mt-2">
          {WIRES.map((wire) => (
            <PriceEditor
              key={wire.key}
              priceKey={priceKeyWire(wire.key)}
              label={wire.label}
              note={state.wireG[wire.key] ? `${state.wireG[wire.key]} جم/م` : "وزن المتر ناقص — أدخله في الجداول"}
              allow={["kg", "m"]}
              basisG={num(state.wireG[wire.key])}
            />
          ))}
          {MATERIALS.map((mat) => (
            <PriceEditor
              key={mat.id}
              priceKey={priceKeyMat(mat.id)}
              label={mat.name}
              note={`${state.matG[mat.id] || "—"} جم/م · عرض 5 سم`}
              allow={["kg", "m"]}
              basisG={num(state.matG[mat.id])}
            />
          ))}
          <PriceEditor priceKey="glue" label="الغراء (Water base acrylic)" note="السعر لكل كيلوجرام، والتكلفة تُحسب بالجرام" allow={["kg"]} />
          <PriceEditor
            priceKey="wool"
            label="الصوف الزجاجي"
            note="السعر للكيلو أو للمتر المربع. لو فاضي، تكلفة الوصلة المعزولة تظل غير مكتملة لحد ما تدخله."
            allow={["kg", "m2"]}
          />
        </div>
      </Card>

      <div className="grid gap-2 sm:grid-cols-3">
        {(
          [
            ["joint", "الوصلة", cost.jointMaterial],
            ["cover", "الـ Cover", cost.coverTotal],
            ["insulated", "الوصلة المعزولة", cost.insTotal],
          ] as const
        ).map(([id, label, material]) => {
          const active = state.costFocus === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              className={`rounded-2xl px-3 py-3 text-start shadow-card ${active ? "bg-steel text-steel-ink" : "bg-card text-ink"}`}
              onClick={() => state.setCostFocus(id)}
            >
              <p className={`text-xs ${active ? "text-steel-ink/75" : "text-muted"}`}>تكاليف كاملة لـ</p>
              <p className="mt-1 text-sm font-semibold">{label}</p>
              <p className="mt-2 font-mono text-lg font-semibold tabular-nums" dir="ltr">
                {material == null ? "خامات ناقصة" : digits(material, "money")}
              </p>
              <p className={`text-xs ${active ? "text-steel-ink/70" : "text-muted"}`}>خامات فقط · اضغط لاختيار الربح والتكاليف الأخرى</p>
            </button>
          );
        })}
      </div>

      <div className="grid w-full min-w-0 gap-4">
        <Card>
          <h2 className="text-base font-semibold text-ink">خامات الوصلة الحالية</h2>
          <p className="mt-1 text-xs text-muted">
            {wireByKey(state.joint.wireKey)?.label} · {materialById(state.joint.material1)?.name}
            {state.joint.layerType === "double" ? ` + ${materialById(state.joint.material2)?.name}` : " · Single layer"}
          </p>
          <CostLines lines={cost.jointLines} currency={currency} />
          <DetailRow
            label="إجمالي تكلفة الخامات"
            value={cost.jointMaterial == null ? "غير مكتمل" : digits(cost.jointMaterial, "money")}
            unit={cost.jointMaterial == null ? undefined : currency}
            note={missing > 0 ? `ينقص سعر ${missing} من الخامات المستخدمة` : "مكتمل"}
          />
        </Card>
        <div className="rounded-2xl bg-steel p-4 text-steel-ink shadow-card">
          <p className="text-sm text-steel-ink/80">سعر بيع {focusName}</p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums" dir="ltr">
            {cost.sell == null ? "—" : digits(cost.sell, "money")}
          </p>
          <p className="text-sm text-steel-ink/80">{currency}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-steel-ink/75">تكلفة الخامات</dt>
              <dd className="font-mono tabular-nums" dir="ltr">{moneyText(focusMaterial, currency, digits)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-steel-ink/75">الكرتونة</dt>
              <dd className="font-mono tabular-nums" dir="ltr">
                {cost.carton?.missingPrice ? "بانتظار السعر" : moneyText(cost.carton?.costPerPiece ?? null, currency, digits)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-steel-ink/75">تكاليف أخرى</dt>
              <dd className="font-mono tabular-nums" dir="ltr">{moneyText(cost.extrasTotal, currency, digits)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-steel-ink/75">إجمالي التكلفة</dt>
              <dd className="font-mono tabular-nums" dir="ltr">{moneyText(cost.total, currency, digits)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-steel-ink/75">الربح</dt>
              <dd className="font-mono tabular-nums" dir="ltr">{moneyText(cost.profit, currency, digits)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-steel-ink/75">تكلفة المتر</dt>
              <dd className="font-mono tabular-nums" dir="ltr">{cost.costPerM == null ? "—" : `${digits(cost.costPerM, "money")} /م`}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-steel-ink/75">سعر بيع المتر</dt>
              <dd className="font-mono tabular-nums" dir="ltr">{cost.sellPerM == null ? "—" : `${digits(cost.sellPerM, "money")} /م`}</dd>
            </div>
          </dl>
          {cost.carton ? (
            <p className="mt-3 text-xs text-steel-ink/70">
              الكرتونة {cost.carton.lengthMm == null ? "—" : `${Math.round(cost.carton.lengthMm)}×${Math.round(cost.carton.widthMm ?? 0)}×${Math.round(cost.carton.heightMm ?? 0)} مم`}
              {cost.carton.missingPrice ? " — سعر المقاس غير مُدخل ولا يدخل في الإجمالي." : " · السعر داخل التكلفة."}
            </p>
          ) : null}
          <label className="mt-4 block">
            <span className="mb-1 block text-xs text-steel-ink/75">نسبة الربح على التكلفة %</span>
            <input
              className="h-11 w-full rounded-lg bg-card px-3 font-mono text-sm text-ink tabular-nums outline-none"
              dir="ltr"
              inputMode="decimal"
              placeholder="20"
              value={state.marginPct}
              onChange={(event) => state.setMargin(event.target.value)}
            />
          </label>
          <p className="mt-2 text-xs text-steel-ink/70">
            {missing > 0
              ? `ينقص سعر ${missing} من خامات ${focusName} — الإجمالي غير مكتمل.`
              : `خامات ${focusName} مكتملة.`}
            {cost.extrasSkipped > 0 ? ` ${cost.extrasSkipped} بند تكاليف أخرى فاضي ولا يدخل.` : ""}
          </p>
        </div>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-ink">تكاليف أخرى</h2>
        <p className="mt-1 text-xs text-muted">البند الفاضي لا يُحسب. النسبة تُحسب من تكلفة خامات المنتج المختار فوق.</p>
        <div className="mt-3 grid gap-3">
          {state.extras.map((extra) => (
            <div key={extra.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_11rem_auto] sm:items-center">
              <input
                className={fieldClass}
                value={extra.label}
                onChange={(event) => state.setExtra(extra.id, { label: event.target.value })}
              />
              <input
                className={`${fieldClass} font-mono tabular-nums`}
                dir="ltr"
                inputMode="decimal"
                placeholder="القيمة"
                value={extra.value}
                onChange={(event) => state.setExtra(extra.id, { value: event.target.value })}
              />
              <select
                className={fieldClass}
                value={extra.basis}
                onChange={(event) =>
                  state.setExtra(extra.id, { basis: event.target.value as typeof extra.basis })
                }
              >
                <option value="pct">% من الخامات</option>
                <option value="per_m">{currency}/متر</option>
                <option value="per_piece">{currency}/قطعة</option>
              </select>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-1 rounded-lg px-3 text-sm text-warn"
                onClick={() => state.removeExtra(extra.id)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                حذف
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 inline-flex h-11 items-center gap-2 text-sm font-medium text-copper"
          onClick={() => state.addExtra()}
        >
          <Plus className="size-4" aria-hidden="true" />
          بند جديد
        </button>
        <DetailRow
          label="إجمالي التكاليف الأخرى"
          value={cost.extrasTotal == null ? "غير مكتمل" : digits(cost.extrasTotal, "money")}
          unit={cost.extrasTotal == null ? undefined : currency}
        />
      </Card>

      <div className="grid w-full min-w-0 gap-4">
        <Card>
          <h2 className="text-base font-semibold text-ink">تكلفة الـ Cover المستقل</h2>
          <p className="mt-1 text-xs text-muted">خامات فقط. اختر الـ Cover من الأزرار فوق لتدخل التكاليف الأخرى والربح والكرتونة.</p>
          <CostLines lines={cost.coverLines} currency={currency} />
          <DetailRow
            label="الإجمالي"
            value={cost.coverTotal == null ? "غير مكتمل" : digits(cost.coverTotal, "money")}
            unit={cost.coverTotal == null ? undefined : currency}
            note={cost.coverMissing.length > 0 ? `ناقص ${cost.coverMissing.length}` : undefined}
          />
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-ink">تكلفة خامات الوصلة المعزولة</h2>
          <p className="mt-1 text-xs text-muted">
            خامات فقط. سعر الصوف إن كان فاضيًا يوقف الإجمالي. اختر الوصلة المعزولة فوق لحساب الربح والتكاليف الأخرى.
          </p>
          <CostLines lines={cost.insLines} currency={currency} />
          <DetailRow
            label="إجمالي الخامات"
            value={cost.insTotal == null ? "غير مكتمل" : digits(cost.insTotal, "money")}
            unit={cost.insTotal == null ? undefined : currency}
          />
          <DetailRow
            label="تكلفة المتر المعزول"
            value={cost.insPerM == null ? "—" : digits(cost.insPerM, "money")}
            unit={cost.insPerM == null ? undefined : `${currency}/م`}
          />
        </Card>
      </div>
    </div>
  );
}

export function TablesPanel() {
  const state = useFlex();
  const digits = useDigits();
  const woolThk = Number(state.wool.thicknessMm);
  const woolDen = Number(state.wool.density);
  const woolGsm = Number.isFinite(woolThk) && Number.isFinite(woolDen) ? woolThk * woolDen : null;
  return (
    <div className="grid gap-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">جدول Sch 40</h2>
            <p className="mt-1 max-w-2xl text-xs text-muted">
              القطر المعتمد = ID التصنيع إن وُجد، وإلا OD − 2 × سمك الجدار. مقاس 5 بوصة ناقص Cover في الإكسيل — اكتبه هنا.
            </p>
          </div>
          <button type="button" className="h-11 rounded-lg bg-paper px-3 text-sm font-medium text-ink shadow-card" onClick={() => state.resetTables()}>
            استعادة الجدول
          </button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-start text-xs text-muted">
                <th className="border-b border-line px-2 py-2 font-medium">NPS</th>
                <th className="border-b border-line px-2 py-2 font-medium">OD مم</th>
                <th className="border-b border-line px-2 py-2 font-medium">الجدار</th>
                <th className="border-b border-line px-2 py-2 font-medium">ID محسوب</th>
                <th className="border-b border-line px-2 py-2 font-medium">ID تصنيع</th>
                <th className="border-b border-line px-2 py-2 font-medium">Cover</th>
              </tr>
            </thead>
            <tbody>
              {SCH40.map((spec) => {
                const draft = state.sch.find((row) => row.nps === spec.nps);
                const actual = draft?.actualId ?? "";
                const adopted = approvedId(spec.nps, actual);
                return (
                  <tr key={spec.nps}>
                    <td className="border-b border-line px-2 py-1.5 font-medium">{spec.nps}″</td>
                    <td className="border-b border-line px-2 py-1.5 font-mono tabular-nums" dir="ltr">{spec.od}</td>
                    <td className="border-b border-line px-2 py-1.5 font-mono tabular-nums" dir="ltr">{spec.wall}</td>
                    <td className="border-b border-line px-2 py-1.5 font-mono tabular-nums" dir="ltr">{digits(geometricId(spec), "mm")}</td>
                    <td className="border-b border-line px-2 py-1.5">
                      <input
                        className="h-10 w-24 rounded-lg border border-line bg-card px-2 font-mono text-sm tabular-nums"
                        dir="ltr"
                        inputMode="decimal"
                        placeholder={adopted == null ? "" : String(geometricId(spec))}
                        value={actual}
                        onChange={(event) => state.setSchField(spec.nps, "actualId", event.target.value)}
                      />
                    </td>
                    <td className="border-b border-line px-2 py-1.5">
                      <select
                        className="h-10 rounded-lg border border-line bg-card px-2 text-sm"
                        value={draft?.coverNps ?? ""}
                        onChange={(event) => state.setSchField(spec.nps, "coverNps", event.target.value)}
                      >
                        <option value="">—</option>
                        {SCH40.map((option) => (
                          <option key={option.nps} value={option.nps}>
                            {option.nps}″
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid w-full min-w-0 gap-4">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-ink">وزن السلك</h2>
              <p className="mt-1 text-xs text-muted">0.9 و 1.2 و 1.4 فاضيين في الإكسيل. التقدير من مربع القطر على أقرب وزن مُقاس.</p>
            </div>
            <button type="button" className="h-11 shrink-0 rounded-lg bg-copper px-3 text-sm font-semibold text-copper-ink" onClick={() => state.estimateWires()}>
              تقدير الناقص
            </button>
          </div>
          <div className="mt-3 grid gap-3">
            {WIRES.map((wire) => (
              <NumberField
                key={wire.key}
                label={wire.label}
                unit="جم/م"
                value={state.wireG[wire.key] ?? ""}
                onChange={(value) => state.setWireG(wire.key, value)}
                hint={wire.gPerM == null ? "غير مُدخل في الإكسيل" : "قيمة الإكسيل"}
              />
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-ink">وزن الخامات والصوف</h2>
          <p className="mt-1 text-xs text-muted">كل الأشرطة عرضها 5 سم.</p>
          <div className="mt-3 grid gap-3">
            {MATERIALS.map((mat) => (
              <NumberField
                key={mat.id}
                label={mat.name}
                unit="جم/م"
                value={state.matG[mat.id] ?? ""}
                onChange={(value) => state.setMatG(mat.id, value)}
              />
            ))}
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="سمك الصوف" unit="مم" value={state.wool.thicknessMm} onChange={(thicknessMm) => state.patchWool({ thicknessMm })} />
              <NumberField label="الكثافة" unit="كجم/م³" value={state.wool.density} onChange={(density) => state.patchWool({ density })} />
            </div>
            <Readout label="وزن المتر المربع" value={woolGsm == null ? "—" : `${digits(woolGsm, "g")} جم/م²`} hint="السمك بالمم × الكثافة" />
          </div>
        </Card>
      </div>

      <Card>
        <CartonTable />
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-ink">افتراضات الإكسيل</h2>
        <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-muted">
          <li>في الطبقتين يُحسب نفس طول الشريط، وسمك الرقائق مُهمل.</li>
          <li>الغراء 0.22 جم لكل متر شريط عند تداخل 15 مم، ويتناسب مع التداخل، ويُحسب لكل طبقة.</li>
          <li>الوصلة المعزولة لها طولها ومقاسها، وتركيبها الداخلي من مدخلات الوصلة.</li>
          <li>الصوف الافتراضي 25 مم وكثافة 16 كجم/م³، أي 400 جم/م². انفراد الصوف = محيط الـ Cover.</li>
          <li>سلك الوصلة يُلف على ID + تخانة السلك، والشريط على ID + ضعف التخانة، والغطاء على قطره بلا سلك.</li>
          <li>لا يُحسب الهالك إلا إذا كُتبت نسبته في التكاليف، والبنود الفاضية لا تدخل في الإجمالي.</li>
          <li>الكرتونة: الطول والعرض = قطر المنتج + 50 مم، والارتفاع 400 مم للوصلة والـ Cover و1000 مم للوصلة المعزولة. سعر الكرتونة اختياري.</li>
          <li>زمن التصنيع من سرعة الماتور والتردد ونسبة الجيربوكس وقطر الطنبورة، بعد خصم فريز الـ Head.</li>
        </ul>
        <p className="mt-3 text-xs text-muted">
          مقاس {schByNps("5")?.nps}″ غطاؤه غير مكتوب في الملف الأصلي. راجع أبعاد المورد قبل الشراء.
        </p>
      </Card>
    </div>
  );
}

function CartonTable() {
  const state = useFlex();
  const [product, setProduct] = useState<ProductKind>("joint");
  const rows = CARTON_SIZES.filter((row) => row.product === product);
  return (
    <div>
      <h2 className="text-base font-semibold text-ink">كراتين التغليف</h2>
      <p className="mt-1 max-w-2xl text-xs text-muted">
        الطول والعرض = القطر + 5 سم، والارتفاع 40 سم. الوصلة المعزولة ارتفاعها متر. اكتب السعر لما يتوفر، واترك البعد فاضيًا لو عايز الحساب التلقائي.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-paper-2 p-1">
        {(["joint", "cover", "insulated"] as const).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={product === id}
            className={`h-11 rounded-md text-sm font-medium ${product === id ? "bg-card text-ink shadow-card" : "text-muted"}`}
            onClick={() => setProduct(id)}
          >
            {productLabel(id)}
          </button>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-start text-xs text-muted">
              <th className="border-b border-line px-2 py-2 font-medium">المقاس</th>
              <th className="border-b border-line px-2 py-2 font-medium">الطول مم</th>
              <th className="border-b border-line px-2 py-2 font-medium">العرض مم</th>
              <th className="border-b border-line px-2 py-2 font-medium">الارتفاع مم</th>
              <th className="border-b border-line px-2 py-2 font-medium">قطع/كرتونة</th>
              <th className="border-b border-line px-2 py-2 font-medium">سعر الكرتونة</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const key = cartonKey(row.product, row.nps);
              const draft = state.cartons[key];
              const diameter = cartonDiameter(state.sch, row.product, row.nps);
              const auto = diameter == null ? null : autoCartonMm(row.product, diameter);
              return (
                <tr key={key}>
                  <td className="border-b border-line px-2 py-1.5 font-medium">{row.nps}″</td>
                  {(["lengthMm", "widthMm", "heightMm"] as const).map((field) => (
                    <td key={field} className="border-b border-line px-2 py-1.5">
                      <input
                        className="h-10 w-24 rounded-lg border border-line bg-card px-2 font-mono text-sm tabular-nums"
                        dir="ltr"
                        inputMode="decimal"
                        placeholder={auto == null ? "—" : String(Math.round(auto[field]))}
                        value={draft?.[field] ?? ""}
                        onChange={(event) => state.patchCarton(key, { [field]: event.target.value })}
                      />
                    </td>
                  ))}
                  <td className="border-b border-line px-2 py-1.5">
                    <input
                      className="h-10 w-20 rounded-lg border border-line bg-card px-2 font-mono text-sm tabular-nums"
                      dir="ltr"
                      inputMode="decimal"
                      placeholder="1"
                      value={draft?.pieces ?? "1"}
                      onChange={(event) => state.patchCarton(key, { pieces: event.target.value })}
                    />
                  </td>
                  <td className="border-b border-line px-2 py-1.5">
                    <input
                      className="h-10 w-28 rounded-lg border border-line bg-card px-2 font-mono text-sm tabular-nums"
                      dir="ltr"
                      inputMode="decimal"
                      placeholder="بانتظار السعر"
                      value={draft?.price ?? ""}
                      onChange={(event) => state.patchCarton(key, { price: event.target.value })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function cartonDiameter(
  sch: { nps: string; actualId: string; coverNps: string }[],
  product: ProductKind,
  nps: string,
): number | null {
  const row = sch.find((item) => item.nps === nps);
  if (product === "insulated") {
    const coverNps = row?.coverNps ?? "";
    if (!coverNps) return null;
    const cover = sch.find((item) => item.nps === coverNps);
    return approvedId(coverNps, cover?.actualId ?? "");
  }
  return approvedId(nps, row?.actualId ?? "");
}

export function summaryText(pack: ReturnType<typeof usePack>, currency: string) {
  const { state, joint, cover, insulated, cost } = pack;
  const n = (value: number | null | undefined, d = 3) =>
    value == null || !Number.isFinite(value) ? "—" : value.toFixed(d);
  const lines = [
    `حاسبة الفليكسيبل`,
    `وصلة ${state.joint.nps}" × ${state.joint.lengthM} م · ${state.joint.layerType === "double" ? "Double" : "Single"} · ${wireByKey(state.joint.wireKey)?.label}`,
    `سلك ${n(joint.wire?.lengthM)} م (${n(joint.wireWeightG, 2)} جم)`,
    `خامة/طبقة ${n(joint.strip?.lengthM)} م (${n(joint.layer1G, 2)} جم)`,
    `غراء ${n(joint.glueG, 2)} جم`,
    `وزن الوصلة ${n(joint.totalG, 2)} جم · ${n(joint.perMeterG, 2)} جم/م`,
    `Cover ${state.cover.nps}" × ${state.cover.lengthM} م · ${n(cover.totalG, 2)} جم`,
    `معزولة ${state.insulated.nps}" × ${state.insulated.lengthM} م · عزل ${n(insulated.insulationMm, 1)} مم · ${n(insulated.totalG, 2)} جم`,
  ];
  if (cost.sell != null) lines.push(`سعر البيع ${cost.sell.toFixed(2)} ${currency}`);
  else if (cost.jointMissing.length > 0) lines.push(`التكلفة غير مكتملة — ينقص ${cost.jointMissing.length} سعر`);
  return lines.join("\n");
}

export function PrintReport() {
  const pack = usePack();
  const digits = useDigits();
  const { joint, cover, insulated, cost, state } = pack;
  const currency = state.currency || "جنيه";
  return (
    <article className="only-print mx-auto max-w-3xl bg-card p-6 text-ink">
      <h1 className="text-2xl font-semibold">حاسبة الفليكسيبل</h1>
      <p className="text-sm text-muted">وصلات ألومنيوم حلزونية — بيان استهلاك وتكلفة</p>
      <h2 className="mt-4 text-lg font-semibold">الوصلة {state.joint.nps}″ × {state.joint.lengthM} م</h2>
      <p className="text-sm">{recipeLine(state)}</p>
      <DetailRow label="طول السلك" value={digits(joint.wire?.lengthM ?? null, "len")} unit="م" />
      <DetailRow label="طول الخامة لكل طبقة" value={digits(joint.strip?.lengthM ?? null, "len")} unit="م" />
      <DetailRow label="الوزن" value={digits(joint.totalG, "g")} unit="جم" />
      <DetailRow label="سعر البيع" value={cost.sell == null ? "غير مكتمل" : digits(cost.sell, "money")} unit={currency} />
      <h2 className="mt-4 text-lg font-semibold">Cover {state.cover.nps}″</h2>
      <DetailRow label="الوزن" value={digits(cover.totalG, "g")} unit="جم" />
      <DetailRow label="التكلفة" value={cost.coverTotal == null ? "—" : digits(cost.coverTotal, "money")} unit={currency} />
      <h2 className="mt-4 text-lg font-semibold">الوصلة المعزولة {state.insulated.nps}″</h2>
      <DetailRow label="سمك العزل" value={digits(insulated.insulationMm, "mm")} unit="مم" />
      <DetailRow label="الوزن" value={digits(insulated.totalG, "g")} unit="جم" />
      <DetailRow label="تكلفة الخامات" value={cost.insTotal == null ? "—" : digits(cost.insTotal, "money")} unit={currency} />
    </article>
  );
}

export type Pack = {
  joint: JointResult;
  cover: CoverResult;
  insulated: InsulatedResult;
  cost: CostResult;
};
