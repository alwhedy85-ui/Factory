import { SCH40, materialById, num, productLabel, wireByKey } from "@/lib/flex/model";
import { calcBom } from "@/lib/flex/calc";
import { toScenario, useFlex } from "@/lib/flex/store";
import { Card, DetailRow, HeroStat, NumberField, SelectField, StatusBanner, useDigits } from "@/components/flex/bits";

const npsOptions = SCH40.map((row) => ({ value: row.nps, label: `${row.nps}″` }));

export function BomPanel() {
  const state = useFlex();
  const digits = useDigits();
  const scenario = toScenario(state);
  const bom = calcBom(scenario, state.bom.product, state.bom.nps, num(state.bom.lengthM), num(state.bom.pieces));
  const currency = state.currency || "جنيه";
  return (
    <div className="grid gap-4">
      <Card>
        <h2 className="text-base font-semibold text-ink">قائمة المواد</h2>
        <p className="mt-1 text-xs text-muted">
          السلك والخطوة والخامات من الاستهلاك. المقاس والطول وعدد القطع من هنا.{" "}
          {wireByKey(state.joint.wireKey)?.label} · {materialById(state.joint.material1)?.name}
          {state.joint.layerType === "double" ? ` + ${materialById(state.joint.material2)?.name}` : ""}
          {" · "}
          Cover {materialById(state.cover.material)?.name}
        </p>
        <div className="mt-4 grid w-full min-w-0 gap-3">
          <SelectField
            label="نوع المنتج"
            value={state.bom.product}
            onChange={(product) => state.patchBom({ product: product as typeof state.bom.product })}
            options={[
              { value: "joint", label: "وصلة" },
              { value: "cover", label: "Cover" },
              { value: "insulated", label: "وصلة معزولة" },
            ]}
          />
          <SelectField label="المقاس NPS" value={state.bom.nps} onChange={(nps) => state.patchBom({ nps })} options={npsOptions} />
          <NumberField label="الطول" unit="م" value={state.bom.lengthM} onChange={(lengthM) => state.patchBom({ lengthM })} />
          <NumberField label="عدد القطع" value={state.bom.pieces} onChange={(pieces) => state.patchBom({ pieces })} />
        </div>
      </Card>
      <StatusBanner issues={bom.issues} okText="مدخلات القائمة سليمة" />
      <div className="grid w-full min-w-0 grid-cols-2 gap-2">
        <HeroStat label="قطر المنتج" value={digits(bom.idMm, "mm")} unit="مم" />
        <HeroStat label="قطر الغطاء" value={digits(bom.coverIdMm, "mm")} unit="مم" />
        <HeroStat label="وزن القطعة" value={digits(bom.pieceWeightG, "g")} unit="جم" />
        <HeroStat label="وزن الطلب" value={digits(bom.orderWeightKg, "n")} unit="كجم" />
      </div>
      <Card>
        <h3 className="text-sm font-semibold text-ink">البنود</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-start text-xs text-muted">
                <th className="border-b border-line py-2 font-medium">البند</th>
                <th className="border-b border-line py-2 font-medium">المواصفات</th>
                <th className="border-b border-line py-2 font-medium">للقطعة</th>
                <th className="border-b border-line py-2 font-medium">وزن القطعة</th>
                <th className="border-b border-line py-2 font-medium">للطلب</th>
              </tr>
            </thead>
            <tbody>
              {bom.lines.map((line) => (
                <tr key={line.id} className={line.applies ? "" : "text-muted"}>
                  <td className="border-b border-line py-2">{line.item}</td>
                  <td className="border-b border-line py-2">{line.applies ? line.spec : "—"}</td>
                  <td className="border-b border-line py-2 font-mono tabular-nums" dir="ltr">
                    {line.applies ? `${digits(line.qty, line.unit === "جم" ? "g" : "len")} ${line.unit}` : "—"}
                  </td>
                  <td className="border-b border-line py-2 font-mono tabular-nums" dir="ltr">
                    {line.applies && line.weightG != null ? `${digits(line.weightG, "g")} جم` : "—"}
                  </td>
                  <td className="border-b border-line py-2 font-mono tabular-nums" dir="ltr">
                    {line.applies ? `${digits(line.orderQty, line.unit === "جم" ? "g" : "len")} ${line.unit}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-semibold text-ink">الكرتونة</h3>
        <DetailRow
          label="الأبعاد الداخلية"
          value={
            bom.carton?.lengthMm == null
              ? "—"
              : `${digits(bom.carton.lengthMm, "mm")} × ${digits(bom.carton.widthMm, "mm")} × ${digits(bom.carton.heightMm, "mm")}`
          }
          unit="مم"
          note={
            bom.carton?.auto
              ? `${productLabel(state.bom.product)} — قطر + 5 سم، والارتفاع ${state.bom.product === "insulated" ? "100 سم" : "40 سم"}`
              : "أبعاد مُدخلة يدويًا"
          }
        />
        <DetailRow label="عدد الكراتين للطلب" value={digits(bom.cartons, "n")} unit="كرتونة" note={`${bom.carton?.piecesPerCarton ?? 1} قطعة في الكرتونة`} />
        <DetailRow
          label="تكلفة الكراتين"
          value={
            bom.carton?.missingPrice || bom.cartons == null || bom.carton?.unitPrice == null
              ? "بانتظار سعر المقاس"
              : digits(bom.cartons * bom.carton.unitPrice, "money")
          }
          unit={bom.carton?.missingPrice ? undefined : currency}
        />
      </Card>
    </div>
  );
}
