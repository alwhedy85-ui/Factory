import { SCH40 } from "@/lib/flex/model";
import { calcTime } from "@/lib/flex/calc";
import { toDrive, toScenario, useFlex } from "@/lib/flex/store";
import { Card, DetailRow, HeroStat, NumberField, Readout, SelectField, StatusBanner, useDigits } from "@/components/flex/bits";

const npsOptions = SCH40.map((row) => ({ value: row.nps, label: `${row.nps}″` }));

export function TimePanel() {
  const state = useFlex();
  const digits = useDigits();
  const scenario = toScenario(state);
  const time = calcTime(scenario, toDrive(state), scenario.jointLengthM, scenario.pitchMm, state.time.headNps);
  return (
    <div className="grid w-full min-w-0 gap-4">
      <Card>
        <h2 className="text-base font-semibold text-ink">زمن التصنيع</h2>
        <p className="mt-1 text-xs text-muted">الطول والخطوة من الوصلة. لكل مقاس Head بقطر الـ ID بعد خصم الفريز.</p>
        <div className="mt-4 grid gap-3">
          <Readout label="طول الوصلة" value={`${state.joint.lengthM || "—"} م`} hint="من حاسبة الاستهلاك" />
          <Readout label="خطوة اللفة" value={`${state.joint.pitchMm || "—"} مم`} />
          <SelectField
            label="مقاس الـ Head"
            value={state.time.headNps}
            onChange={(headNps) => state.patchTime({ headNps })}
            options={npsOptions}
            hint={time.headIdMm == null ? "من جدول Sch 40" : `قطر الـ Head ${digits(time.headIdMm, "mm")} مم`}
          />
          <div>
            <p className="mb-1 text-sm font-medium text-ink">طريقة دوران الـ Head</p>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-paper-2 p-1">
              {(
                [
                  ["drive", "من الماتور"],
                  ["direct", "إدخال مباشر"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={state.time.mode === value}
                  className={`h-11 rounded-md text-sm font-medium ${state.time.mode === value ? "bg-card text-ink shadow-card" : "text-muted"}`}
                  onClick={() => state.patchTime({ mode: value })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <NumberField label="سرعة الماتور المقننة" unit="لفة/د" value={state.time.motorRpm} onChange={(motorRpm) => state.patchTime({ motorRpm })} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="التردد المقنن" unit="Hz" value={state.time.ratedHz} onChange={(ratedHz) => state.patchTime({ ratedHz })} />
            <NumberField label="تردد الانفرتر" unit="Hz" value={state.time.setHz} onChange={(setHz) => state.patchTime({ setHz })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="نسبة الجيربوكس" value={state.time.gearRatio} onChange={(gearRatio) => state.patchTime({ gearRatio })} />
            <NumberField label="قطر الطنبورة" unit="مم" value={state.time.pulleyMm} onChange={(pulleyMm) => state.patchTime({ pulleyMm })} hint="الفعّال 92، وبالشفة 116" />
          </div>
          <NumberField
            label="خصم فريز الـ Head"
            unit="مم"
            value={state.time.grooveMm}
            onChange={(grooveMm) => state.patchTime({ grooveMm })}
            hint="لو الـ 3 مم عمق نصف قطري اكتب 6"
          />
          <NumberField
            label="دوران مباشر للـ Head"
            unit="لفة/د"
            value={state.time.directRpm}
            onChange={(directRpm) => state.patchTime({ directRpm })}
            hint="يُستخدم فقط مع الإدخال المباشر"
          />
          <NumberField label="زمن إضافي لكل وصلة" unit="ث" value={state.time.extraSec} onChange={(extraSec) => state.patchTime({ extraSec })} hint="تحميل أو ربط أو قطع. صفر = زمن الـ Head فقط" />
        </div>
      </Card>
      <div className="grid content-start gap-4">
        <StatusBanner issues={time.issues} okText="مدخلات الزمن سليمة" />
        <div className="grid grid-cols-2 gap-2">
          <HeroStat label="زمن الوصلة" value={time.hms ?? "—"} unit="" />
          <HeroStat label="بالدقائق" value={digits(time.totalMin, "n")} unit="د" />
          <HeroStat label="إنتاج الساعة" value={digits(time.perHour, "n")} unit="وصلة" />
          <HeroStat label="سرعة التقدم" value={digits(time.advanceMPerMin, "n")} unit="م/د" />
        </div>
        <Card>
          <DetailRow label="عدد اللفات" value={digits(time.turns, "n")} unit="لفة" />
          <DetailRow label="سرعة الماتور الفعلية" value={digits(time.motorRpm, "n")} unit="لفة/د" note="المقننة × التردد المضبوط ÷ المقنن" />
          <DetailRow label="سرعة الطنبورة" value={digits(time.pulleyRpm, "n")} unit="لفة/د" />
          <DetailRow label="سرعة السير" value={digits(time.beltMPerMin, "n")} unit="م/د" />
          <DetailRow label="القطر الفعّال للـ Head" value={digits(time.headEffMm, "mm")} unit="مم" />
          <DetailRow label="دوران الـ Head المحسوب" value={digits(time.headRpmCalc, "n")} unit="لفة/د" />
          <DetailRow label="الدوران المستخدم" value={digits(time.headRpm, "n")} unit="لفة/د" />
          <DetailRow label="زمن اللفة" value={digits(time.turnSec, "n")} unit="ث" />
          <DetailRow label="زمن اللف" value={digits(time.windSec, "n")} unit="ث" />
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-ink">جدول التردد</h3>
          <p className="mt-1 text-xs text-muted">نفس الماتور والطنبورة والفريز. عدّل الترددات كما تشاء.</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-start text-xs text-muted">
                  <th className="border-b border-line py-2 font-medium">Hz</th>
                  <th className="border-b border-line py-2 font-medium">لفة/د</th>
                  <th className="border-b border-line py-2 font-medium">زمن ث</th>
                  <th className="border-b border-line py-2 font-medium">وصلة/س</th>
                </tr>
              </thead>
              <tbody>
                {time.rows.map((row, index) => (
                  <tr key={index}>
                    <td className="border-b border-line py-1.5">
                      <input
                        className="h-10 w-20 rounded-lg border border-line bg-card px-2 font-mono text-sm tabular-nums"
                        dir="ltr"
                        inputMode="decimal"
                        value={state.time.freqRows[index] ?? ""}
                        onChange={(event) => state.setFreq(index, event.target.value)}
                      />
                    </td>
                    <td className="border-b border-line py-1.5 font-mono tabular-nums" dir="ltr">{digits(row.headRpm, "n")}</td>
                    <td className="border-b border-line py-1.5 font-mono tabular-nums" dir="ltr">{digits(row.totalSec, "n")}</td>
                    <td className="border-b border-line py-1.5 font-mono tabular-nums" dir="ltr">{digits(row.perHour, "n")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
