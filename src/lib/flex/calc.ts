import {
  GLUE_NAME,
  MATERIALS,
  PRICE_GLUE,
  PRICE_WOOL,
  SCH40,
  WIRES,
  approvedId,
  autoCartonMm,
  cartonKey,
  materialById,
  priceKeyMat,
  priceKeyWire,
  productLabel,
  schByNps,
  wireByKey,
  type CostBasis,
  type DriveMode,
  type LayerType,
  type PriceUnit,
  type ProductKind,
  type StockUnit,
} from "./model.ts";

export type Issue = { tone: "bad" | "warn"; text: string };

export type Scenario = {
  jointLengthM: number | null;
  jointNps: string;
  layerType: LayerType;
  wireKey: string;
  pitchMm: number | null;
  stripWidthMm: number | null;
  material1: string;
  material2: string;
  glueGPerM: number | null;
  glueRefOverlapMm: number | null;
  coverLengthM: number | null;
  coverNps: string;
  coverMaterial: string;
  coverOverlapMm: number | null;
  insLengthM: number | null;
  insNps: string;
  wireG: Record<string, number | null>;
  matG: Record<string, number | null>;
  /** actual manufacturing ID override; null/absent falls back to the formula */
  schActual: Record<string, number | null>;
  schCover: Record<string, string>;
  woolThkMm: number | null;
  woolDensity: number | null;
  prices: Record<string, { price: number | null; unit: PriceUnit }>;
  extras: { id: string; label: string; value: number | null; basis: CostBasis }[];
  marginPct: number | null;
  costFocus: ProductKind;
  cartons: Record<string, { lengthMm: number | null; widthMm: number | null; heightMm: number | null; pieces: number | null; price: number | null }>;
};

export type Helix = {
  turns: number;
  lengthM: number;
};

export type JointResult = {
  issues: Issue[];
  inputOk: boolean;
  idMm: number | null;
  overlapMm: number | null;
  layers: number;
  turns: number | null;
  wire: Helix | null;
  strip: Helix | null;
  totalStripM: number | null;
  wireGPerM: number | null;
  mat1GPerM: number | null;
  mat2GPerM: number | null;
  wireWeightG: number | null;
  layer1G: number | null;
  layer2G: number | null;
  gluePerM: number | null;
  glueG: number | null;
  totalG: number | null;
  perMeterG: number | null;
  totalKg: number | null;
  missingWeights: string[];
};

export type CoverResult = {
  issues: Issue[];
  inputOk: boolean;
  idMm: number | null;
  pitchMm: number | null;
  turns: number | null;
  stripM: number | null;
  matGPerM: number | null;
  matWeightG: number | null;
  gluePerM: number | null;
  glueG: number | null;
  totalG: number | null;
  perMeterG: number | null;
  totalKg: number | null;
};

export type InsulatedResult = {
  issues: Issue[];
  dimsOk: boolean;
  idMm: number | null;
  coverNps: string | null;
  coverIdMm: number | null;
  outerMm: number | null;
  insulationMm: number | null;
  inner: JointResult | null;
  woolGPerM2: number | null;
  woolWidthMm: number | null;
  woolAreaM2: number | null;
  woolG: number | null;
  coverStripM: number | null;
  coverMatG: number | null;
  coverGluePerM: number | null;
  coverGlueG: number | null;
  coverTotalG: number | null;
  totalG: number | null;
  perMeterG: number | null;
  totalKg: number | null;
};

export type MoneyLine = {
  id: string;
  label: string;
  qty: number | null;
  unit: string;
  unitPrice: number | null;
  cost: number | null;
  chosen: string;
  missing: string | null;
};

export type ExtraLine = {
  id: string;
  label: string;
  basis: CostBasis;
  basisText: string;
  base: number | null;
  cost: number | null;
};

export type CostResult = {
  currencyNote: string;
  jointLines: MoneyLine[];
  jointMaterial: number | null;
  jointMissing: string[];
  extras: ExtraLine[];
  extrasTotal: number | null;
  total: number | null;
  marginPct: number | null;
  profit: number | null;
  sell: number | null;
  costPerM: number | null;
  sellPerM: number | null;
  coverLines: MoneyLine[];
  coverTotal: number | null;
  coverMissing: string[];
  insLines: MoneyLine[];
  insTotal: number | null;
  insMissing: string[];
  insPerM: number | null;
  focus: ProductKind;
  carton: CartonQuote | null;
  cartonSkipped: boolean;
  extrasSkipped: number;
};

export type CartonQuote = {
  key: string;
  product: ProductKind;
  nps: string;
  diameterMm: number | null;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  auto: boolean;
  piecesPerCarton: number;
  cartonsForOne: number;
  unitPrice: number | null;
  costPerPiece: number | null;
  missingPrice: boolean;
};

export type TimeResult = {
  issues: Issue[];
  inputOk: boolean;
  lengthM: number | null;
  pitchMm: number | null;
  turns: number | null;
  headIdMm: number | null;
  motorRpm: number | null;
  pulleyRpm: number | null;
  beltMPerMin: number | null;
  headEffMm: number | null;
  headRpmCalc: number | null;
  headRpm: number | null;
  turnSec: number | null;
  advanceMPerMin: number | null;
  windSec: number | null;
  totalSec: number | null;
  totalMin: number | null;
  hms: string | null;
  perHour: number | null;
  rows: { hz: number | null; headRpm: number | null; totalSec: number | null; perHour: number | null }[];
};

export type BomLine = {
  id: string;
  item: string;
  spec: string;
  qty: number | null;
  unit: string;
  weightG: number | null;
  orderQty: number | null;
  applies: boolean;
};

export type BomResult = {
  issues: Issue[];
  lines: BomLine[];
  pieceWeightG: number | null;
  orderWeightKg: number | null;
  carton: CartonQuote | null;
  cartons: number | null;
  idMm: number | null;
  coverNps: string | null;
  coverIdMm: number | null;
};

export type CoverageRow = {
  itemId: string;
  label: string;
  perPiece: number | null;
  unit: "m" | "g" | "m2" | "carton";
  stock: number | null;
  pieces: number | null;
  hours: number | null;
  days: number | null;
  batchNeed: number | null;
  batchOk: boolean | null;
  note: string | null;
};

export type CoverageResult = {
  rows: CoverageRow[];
  secondsPerPiece: number | null;
  piecesPerHour: number | null;
  bottleneck: CoverageRow | null;
  headline: string;
};

const bad = (text: string): Issue => ({ tone: "bad", text });
const warn = (text: string): Issue => ({ tone: "warn", text });

function recipeIssues(scenario: Scenario): Issue[] {
  const issues: Issue[] = [];
  const layers = scenario.layerType === "double" ? 2 : 1;
  const overlapMm =
    scenario.stripWidthMm != null && scenario.pitchMm != null
      ? scenario.stripWidthMm - scenario.pitchMm
      : null;
  if (scenario.pitchMm == null || scenario.pitchMm <= 0) issues.push(bad("خطوة السلك لازم تكون أكبر من صفر."));
  if (scenario.stripWidthMm == null || scenario.stripWidthMm <= 0) {
    issues.push(bad("عرض شريط الخامة لازم يكون أكبر من صفر."));
  }
  if (!wireByKey(scenario.wireKey)) issues.push(bad("تخانة السلك غير معرّفة."));
  if (!materialById(scenario.material1)) issues.push(bad("خامة الطبقة الأولى غير معرّفة."));
  if (layers === 2 && !materialById(scenario.material2)) issues.push(bad("خامة الطبقة الثانية غير معرّفة."));
  if (scenario.glueGPerM == null || scenario.glueGPerM < 0) issues.push(bad("كمية الغراء المرجعية ناقصة."));
  if (scenario.glueRefOverlapMm == null || scenario.glueRefOverlapMm <= 0) {
    issues.push(bad("التداخل المرجعي للغراء لازم يكون أكبر من صفر."));
  }
  if (overlapMm != null && overlapMm <= 0) {
    issues.push(warn("التداخل صفر أو سالب — الخطوة أكبر من أو تساوي عرض الشريط."));
  }
  return issues;
}

export function helix(lengthM: number, pitchMm: number, diameterMm: number): Helix {
  const turns = (lengthM * 1000) / pitchMm;
  const turnMm = Math.hypot(Math.PI * diameterMm, pitchMm);
  return { turns, lengthM: (turns * turnMm) / 1000 };
}

function idOf(scenario: Scenario, nps: string): number | null {
  return approvedId(nps, scenario.schActual[nps] == null ? "" : String(scenario.schActual[nps]));
}

function weightOfWire(scenario: Scenario, key: string): number | null {
  const value = scenario.wireG[key];
  return value == null || value <= 0 ? null : value;
}

function weightOfMat(scenario: Scenario, id: string): number | null {
  const value = scenario.matG[id];
  return value == null || value < 0 ? null : value;
}

export function glueRate(refG: number, overlapMm: number, refOverlapMm: number): number | null {
  if (!(refOverlapMm > 0) || !Number.isFinite(refG)) return null;
  return (refG * overlapMm) / refOverlapMm;
}

export function calcJoint(
  scenario: Scenario,
  lengthM: number | null,
  nps: string,
): JointResult {
  const layers = scenario.layerType === "double" ? 2 : 1;
  const idMm = idOf(scenario, nps);
  const overlapMm =
    scenario.stripWidthMm != null && scenario.pitchMm != null
      ? scenario.stripWidthMm - scenario.pitchMm
      : null;

  const issues: Issue[] = [...recipeIssues(scenario)];
  if (lengthM == null || lengthM <= 0) issues.push(bad("طول الوصلة لازم يكون أكبر من صفر."));
  if (!schByNps(nps) || idMm == null || idMm <= 0) issues.push(bad("مقاس NPS غير موجود في جدول Sch 40."));

  const inputOk = !issues.some((issue) => issue.tone === "bad");
  const wire = wireByKey(scenario.wireKey);
  const empty: JointResult = {
    issues,
    inputOk,
    idMm,
    overlapMm,
    layers,
    turns: null,
    wire: null,
    strip: null,
    totalStripM: null,
    wireGPerM: null,
    mat1GPerM: null,
    mat2GPerM: null,
    wireWeightG: null,
    layer1G: null,
    layer2G: null,
    gluePerM: null,
    glueG: null,
    totalG: null,
    perMeterG: null,
    totalKg: null,
    missingWeights: [],
  };
  if (!inputOk || !wire || lengthM == null || scenario.pitchMm == null || idMm == null) return empty;

  const turns = (lengthM * 1000) / scenario.pitchMm;
  const wireHelix = helix(lengthM, scenario.pitchMm, idMm + wire.mm);
  const stripHelix = helix(lengthM, scenario.pitchMm, idMm + 2 * wire.mm);
  const totalStripM = stripHelix.lengthM * layers;
  const wireGPerM = weightOfWire(scenario, wire.key);
  const mat1GPerM = weightOfMat(scenario, scenario.material1);
  const mat2GPerM = layers === 2 ? weightOfMat(scenario, scenario.material2) : 0;
  const missingWeights: string[] = [];
  if (wireGPerM == null) missingWeights.push(wire.label);
  if (mat1GPerM == null) missingWeights.push(materialById(scenario.material1)?.name ?? "الطبقة الأولى");
  if (layers === 2 && mat2GPerM == null) {
    missingWeights.push(materialById(scenario.material2)?.name ?? "الطبقة الثانية");
  }
  for (const name of missingWeights) {
    issues.push(warn(`وزن المتر غير مُدخل لـ ${name} في جدول الخامات.`));
  }

  const gluePerM =
    scenario.glueGPerM != null && scenario.glueRefOverlapMm != null && overlapMm != null
      ? glueRate(scenario.glueGPerM, overlapMm, scenario.glueRefOverlapMm)
      : null;

  const wireWeightG = wireGPerM == null ? null : wireHelix.lengthM * wireGPerM;
  const layer1G = mat1GPerM == null ? null : stripHelix.lengthM * mat1GPerM;
  const layer2G = layers === 1 ? 0 : mat2GPerM == null ? null : stripHelix.lengthM * mat2GPerM;
  const glueG = gluePerM == null ? null : gluePerM * stripHelix.lengthM * layers;
  const parts = [wireWeightG, layer1G, layer2G, glueG];
  const totalG = parts.some((part) => part == null) ? null : parts.reduce<number>((sum, part) => sum + (part ?? 0), 0);
  const perMeterG = totalG == null ? null : totalG / lengthM;

  return {
    issues,
    inputOk: true,
    idMm,
    overlapMm,
    layers,
    turns,
    wire: wireHelix,
    strip: stripHelix,
    totalStripM,
    wireGPerM,
    mat1GPerM,
    mat2GPerM,
    wireWeightG,
    layer1G,
    layer2G,
    gluePerM,
    glueG,
    totalG,
    perMeterG,
    totalKg: totalG == null ? null : totalG / 1000,
    missingWeights,
  };
}

export function calcCover(scenario: Scenario): CoverResult {
  const issues: Issue[] = [];
  const idMm = idOf(scenario, scenario.coverNps);
  const pitchMm =
    scenario.stripWidthMm != null && scenario.coverOverlapMm != null
      ? scenario.stripWidthMm - scenario.coverOverlapMm
      : null;

  if (scenario.coverLengthM == null || scenario.coverLengthM <= 0) {
    issues.push(bad("طول الـ Cover لازم يكون أكبر من صفر."));
  }
  if (!schByNps(scenario.coverNps) || idMm == null || idMm <= 0) {
    issues.push(bad("مقاس الـ Cover غير موجود في جدول Sch 40."));
  }
  if (!materialById(scenario.coverMaterial)) issues.push(bad("خامة الـ Cover غير معرّفة."));
  if (scenario.coverOverlapMm == null || scenario.coverOverlapMm < 0) issues.push(bad("تداخل الـ Cover ناقص."));
  if (scenario.stripWidthMm == null || scenario.stripWidthMm <= 0) issues.push(bad("عرض الشريط ناقص."));
  if (pitchMm != null && pitchMm <= 0) issues.push(bad("خطوة لفّ الـ Cover لازم تكون أكبر من صفر (عرض الشريط − التداخل)."));
  if (scenario.glueGPerM == null || scenario.glueRefOverlapMm == null || scenario.glueRefOverlapMm <= 0) {
    issues.push(bad("مرجع الغراء ناقص."));
  }

  const inputOk = !issues.some((issue) => issue.tone === "bad");
  const base: CoverResult = {
    issues,
    inputOk,
    idMm,
    pitchMm,
    turns: null,
    stripM: null,
    matGPerM: null,
    matWeightG: null,
    gluePerM: null,
    glueG: null,
    totalG: null,
    perMeterG: null,
    totalKg: null,
  };
  if (
    !inputOk ||
    scenario.coverLengthM == null ||
    pitchMm == null ||
    pitchMm <= 0 ||
    idMm == null
  ) {
    return base;
  }

  const wound = helix(scenario.coverLengthM, pitchMm, idMm);
  const matGPerM = weightOfMat(scenario, scenario.coverMaterial);
  if (matGPerM == null) issues.push(warn("وزن متر خامة الـ Cover غير مُدخل."));
  const gluePerM =
    scenario.glueGPerM != null && scenario.glueRefOverlapMm != null && scenario.coverOverlapMm != null
      ? glueRate(scenario.glueGPerM, scenario.coverOverlapMm, scenario.glueRefOverlapMm)
      : null;
  const matWeightG = matGPerM == null ? null : wound.lengthM * matGPerM;
  const glueG = gluePerM == null ? null : gluePerM * wound.lengthM;
  const totalG = matWeightG == null || glueG == null ? null : matWeightG + glueG;

  return {
    issues,
    inputOk: true,
    idMm,
    pitchMm,
    turns: wound.turns,
    stripM: wound.lengthM,
    matGPerM,
    matWeightG,
    gluePerM,
    glueG,
    totalG,
    perMeterG: totalG == null ? null : totalG / scenario.coverLengthM,
    totalKg: totalG == null ? null : totalG / 1000,
  };
}

export function calcInsulated(scenario: Scenario): InsulatedResult {
  const issues: Issue[] = [];
  const idMm = idOf(scenario, scenario.insNps);
  const coverNps = scenario.schCover[scenario.insNps] ?? "";
  const coverIdMm = coverNps ? idOf(scenario, coverNps) : null;
  const wire = wireByKey(scenario.wireKey);
  const recipe = recipeIssues(scenario);

  if (scenario.insLengthM == null || scenario.insLengthM <= 0) issues.push(bad("طول الوصلة المعزولة لازم يكون أكبر من صفر."));
  if (!schByNps(scenario.insNps) || idMm == null) issues.push(bad("مقاس الوصلة المعزولة غير موجود."));
  if (!coverNps) issues.push(bad("مقاس الـ Cover المناسب غير مُدخل في جدول Sch 40 لهذا المقاس."));
  else if (coverIdMm == null) issues.push(bad("مقاس الـ Cover المكتوب في الجدول غير موجود."));
  for (const issue of recipe) {
    if (issue.tone === "bad") issues.push(issue);
  }

  const outerMm = idMm != null && wire ? idMm + 2 * wire.mm : null;
  const insulationMm = outerMm != null && coverIdMm != null ? (coverIdMm - outerMm) / 2 : null;
  if (insulationMm != null && insulationMm <= 0) {
    issues.push(warn("قطر الـ Cover أصغر من أو يساوي القطر الخارجي للوصلة — سمك العزل غير منطقي."));
  }

  const dimsOk = !issues.some((issue) => issue.tone === "bad");
  const pitch =
    scenario.stripWidthMm != null && scenario.coverOverlapMm != null
      ? scenario.stripWidthMm - scenario.coverOverlapMm
      : null;
  if (dimsOk && (pitch == null || pitch <= 0)) {
    issues.push(bad("خطوة لفّ غطاء العزل لازم تكون أكبر من صفر."));
  }
  const ready = dimsOk && pitch != null && pitch > 0;

  const inner = ready
    ? calcJoint(scenario, scenario.insLengthM, scenario.insNps)
    : null;

  let woolGPerM2: number | null = null;
  let woolWidthMm: number | null = null;
  let woolAreaM2: number | null = null;
  let woolG: number | null = null;
  let coverStripM: number | null = null;
  let coverMatG: number | null = null;
  let coverGluePerM: number | null = null;
  let coverGlueG: number | null = null;
  let coverTotalG: number | null = null;

  if (
    ready &&
    scenario.insLengthM != null &&
    coverIdMm != null &&
    scenario.woolThkMm != null &&
    scenario.woolThkMm > 0 &&
    scenario.woolDensity != null &&
    scenario.woolDensity > 0
  ) {
    woolGPerM2 = scenario.woolThkMm * scenario.woolDensity;
    woolWidthMm = Math.PI * coverIdMm;
    woolAreaM2 = (woolWidthMm / 1000) * scenario.insLengthM;
    woolG = woolAreaM2 * woolGPerM2;
  } else if (ready) {
    issues.push(bad("سمك أو كثافة الصوف الزجاجي ناقصة."));
  }

  if (ready && scenario.insLengthM != null && coverIdMm != null && pitch != null && pitch > 0) {
    const wound = helix(scenario.insLengthM, pitch, coverIdMm);
    coverStripM = wound.lengthM;
    const gPerM = weightOfMat(scenario, scenario.coverMaterial);
    if (gPerM == null) issues.push(warn("وزن متر خامة الـ Cover غير مُدخل."));
    coverMatG = gPerM == null ? null : wound.lengthM * gPerM;
    coverGluePerM =
      scenario.glueGPerM != null && scenario.glueRefOverlapMm != null && scenario.coverOverlapMm != null
        ? glueRate(scenario.glueGPerM, scenario.coverOverlapMm, scenario.glueRefOverlapMm)
        : null;
    coverGlueG = coverGluePerM == null ? null : coverGluePerM * wound.lengthM;
    coverTotalG = coverMatG == null || coverGlueG == null ? null : coverMatG + coverGlueG;
  }

  const innerTotal = inner?.totalG ?? null;
  const parts = [innerTotal, woolG, coverTotalG];
  const totalG =
    !ready || parts.some((part) => part == null)
      ? null
      : parts.reduce<number>((sum, part) => sum + (part ?? 0), 0);
  const lengthM = scenario.insLengthM;

  const finalIssues = [
    ...issues,
    ...(inner?.issues.filter((issue) => issue.tone === "warn") ?? []),
  ];

  return {
    issues: finalIssues,
    dimsOk: ready && (inner?.inputOk ?? false) && !finalIssues.some((issue) => issue.tone === "bad"),
    idMm,
    coverNps: coverNps || null,
    coverIdMm,
    outerMm,
    insulationMm,
    inner,
    woolGPerM2,
    woolWidthMm,
    woolAreaM2,
    woolG,
    coverStripM,
    coverMatG,
    coverGluePerM,
    coverGlueG,
    coverTotalG,
    totalG,
    perMeterG: totalG == null || lengthM == null || lengthM <= 0 ? null : totalG / lengthM,
    totalKg: totalG == null ? null : totalG / 1000,
  };
}

function lineCost(
  qty: number | null,
  price: number | null,
  unit: PriceUnit,
  perBasis: number | null,
  qtyKind: "m" | "g" | "m2",
): { unitPrice: number | null; cost: number | null; missing: string | null } {
  if (qty == null) return { unitPrice: null, cost: null, missing: "الكمية غير مكتملة" };
  if (price == null) return { unitPrice: null, cost: null, missing: "السعر غير مُدخل" };
  if (qtyKind === "g") {
    const unitPrice = price / 1000;
    return { unitPrice, cost: qty * unitPrice, missing: null };
  }
  if (qtyKind === "m2") {
    if (unit === "m2") return { unitPrice: price, cost: qty * price, missing: null };
    if (perBasis == null) return { unitPrice: null, cost: null, missing: "وزن المتر المربع غير مكتمل" };
    const unitPrice = (price * perBasis) / 1000;
    return { unitPrice, cost: qty * unitPrice, missing: null };
  }
  if (unit === "m") return { unitPrice: price, cost: qty * price, missing: null };
  if (perBasis == null) return { unitPrice: null, cost: null, missing: "وزن المتر غير مُدخل" };
  const unitPrice = (price * perBasis) / 1000;
  return { unitPrice, cost: qty * unitPrice, missing: null };
}

function pushLine(
  lines: MoneyLine[],
  missing: string[],
  line: Omit<MoneyLine, "unitPrice" | "cost" | "missing"> & {
    price: number | null;
    priceUnit: PriceUnit;
    perBasis: number | null;
    qtyKind: "m" | "g" | "m2";
  },
) {
  const priced = lineCost(line.qty, line.price, line.priceUnit, line.perBasis, line.qtyKind);
  if (priced.missing && line.qty !== 0) missing.push(`${line.chosen}: ${priced.missing}`);
  lines.push({
    id: line.id,
    label: line.label,
    qty: line.qty,
    unit: line.unit,
    unitPrice: line.qty === 0 ? 0 : priced.unitPrice,
    cost: line.qty === 0 ? 0 : priced.cost,
    chosen: line.chosen,
    missing: line.qty === 0 ? null : priced.missing,
  });
}

function sumCosts(lines: MoneyLine[]): number | null {
  if (lines.some((line) => line.cost == null)) return null;
  return lines.reduce((sum, line) => sum + (line.cost ?? 0), 0);
}

function priceOf(scenario: Scenario, key: string): { price: number | null; unit: PriceUnit } {
  return scenario.prices[key] ?? { price: null, unit: "kg" };
}

export function calcCost(
  scenario: Scenario,
  joint: JointResult,
  cover: CoverResult,
  insulated: InsulatedResult,
): CostResult {
  const jointLines: MoneyLine[] = [];
  const jointMissing: string[] = [];
  const wire = wireByKey(scenario.wireKey);
  const mat1 = materialById(scenario.material1);
  const mat2 = materialById(scenario.material2);
  const wirePrice = priceOf(scenario, priceKeyWire(scenario.wireKey));
  const mat1Price = priceOf(scenario, priceKeyMat(scenario.material1));
  const mat2Price = priceOf(scenario, priceKeyMat(scenario.material2));
  const gluePrice = priceOf(scenario, PRICE_GLUE);

  pushLine(jointLines, jointMissing, {
    id: "wire",
    label: "السلك",
    qty: joint.wire?.lengthM ?? null,
    unit: "m",
    chosen: wire?.label ?? "السلك",
    price: wirePrice.price,
    priceUnit: wirePrice.unit,
    perBasis: joint.wireGPerM,
    qtyKind: "m",
  });
  pushLine(jointLines, jointMissing, {
    id: "layer1",
    label: "الطبقة الأولى",
    qty: joint.strip?.lengthM ?? null,
    unit: "m",
    chosen: mat1?.name ?? "الطبقة الأولى",
    price: mat1Price.price,
    priceUnit: mat1Price.unit,
    perBasis: joint.mat1GPerM,
    qtyKind: "m",
  });
  pushLine(jointLines, jointMissing, {
    id: "layer2",
    label: "الطبقة الثانية",
    qty: joint.layers === 2 ? (joint.strip?.lengthM ?? null) : 0,
    unit: "m",
    chosen: joint.layers === 2 ? (mat2?.name ?? "الطبقة الثانية") : "— (Single layer)",
    price: mat2Price.price,
    priceUnit: mat2Price.unit,
    perBasis: joint.mat2GPerM,
    qtyKind: "m",
  });
  pushLine(jointLines, jointMissing, {
    id: "glue",
    label: "الغراء",
    qty: joint.glueG,
    unit: "جم",
    chosen: "Water base acrylic (السعر لكل جم)",
    price: gluePrice.price,
    priceUnit: "kg",
    perBasis: null,
    qtyKind: "g",
  });

  const jointMaterial = sumCosts(jointLines);

  const coverLines: MoneyLine[] = [];
  const coverMissing: string[] = [];
  const coverMat = materialById(scenario.coverMaterial);
  const coverPrice = priceOf(scenario, priceKeyMat(scenario.coverMaterial));
  pushLine(coverLines, coverMissing, {
    id: "cover-mat",
    label: "الـ Cover المستقل — الخامة",
    qty: cover.stripM,
    unit: "m",
    chosen: coverMat?.name ?? "Cover",
    price: coverPrice.price,
    priceUnit: coverPrice.unit,
    perBasis: cover.matGPerM,
    qtyKind: "m",
  });
  pushLine(coverLines, coverMissing, {
    id: "cover-glue",
    label: "الـ Cover المستقل — الغراء",
    qty: cover.glueG,
    unit: "جم",
    chosen: "Water base acrylic (السعر لكل جم)",
    price: gluePrice.price,
    priceUnit: "kg",
    perBasis: null,
    qtyKind: "g",
  });

  const insLines: MoneyLine[] = [];
  const insMissing: string[] = [];
  const woolPrice = priceOf(scenario, PRICE_WOOL);
  const inner = insulated.inner;
  pushLine(insLines, insMissing, {
    id: "wool",
    label: "المعزولة — الصوف الزجاجي",
    qty: insulated.woolAreaM2,
    unit: "م²",
    chosen: "Glass wool",
    price: woolPrice.price,
    priceUnit: woolPrice.unit === "m" ? "kg" : woolPrice.unit,
    perBasis: insulated.woolGPerM2,
    qtyKind: "m2",
  });
  pushLine(insLines, insMissing, {
    id: "ins-cover",
    label: "المعزولة — خامة الـ Cover",
    qty: insulated.coverStripM,
    unit: "m",
    chosen: coverMat?.name ?? "Cover",
    price: coverPrice.price,
    priceUnit: coverPrice.unit,
    perBasis: weightOfMat(scenario, scenario.coverMaterial),
    qtyKind: "m",
  });
  pushLine(insLines, insMissing, {
    id: "ins-cover-glue",
    label: "المعزولة — غراء الـ Cover",
    qty: insulated.coverGlueG,
    unit: "جم",
    chosen: "Water base acrylic (السعر لكل جم)",
    price: gluePrice.price,
    priceUnit: "kg",
    perBasis: null,
    qtyKind: "g",
  });
  pushLine(insLines, insMissing, {
    id: "ins-wire",
    label: "المعزولة — سلك الوصلة الداخلية",
    qty: inner?.wire?.lengthM ?? null,
    unit: "m",
    chosen: wire?.label ?? "السلك",
    price: wirePrice.price,
    priceUnit: wirePrice.unit,
    perBasis: inner?.wireGPerM ?? null,
    qtyKind: "m",
  });
  pushLine(insLines, insMissing, {
    id: "ins-l1",
    label: "المعزولة — الطبقة الأولى",
    qty: inner?.strip?.lengthM ?? null,
    unit: "m",
    chosen: mat1?.name ?? "الطبقة الأولى",
    price: mat1Price.price,
    priceUnit: mat1Price.unit,
    perBasis: inner?.mat1GPerM ?? null,
    qtyKind: "m",
  });
  pushLine(insLines, insMissing, {
    id: "ins-l2",
    label: "المعزولة — الطبقة الثانية",
    qty: inner == null ? null : inner.layers === 2 ? (inner.strip?.lengthM ?? null) : 0,
    unit: "m",
    chosen: inner != null && inner.layers === 2 ? (mat2?.name ?? "الطبقة الثانية") : "— (Single layer)",
    price: mat2Price.price,
    priceUnit: mat2Price.unit,
    perBasis: inner?.mat2GPerM ?? null,
    qtyKind: "m",
  });
  pushLine(insLines, insMissing, {
    id: "ins-glue",
    label: "المعزولة — غراء الوصلة الداخلية",
    qty: inner?.glueG ?? null,
    unit: "جم",
    chosen: "Water base acrylic (السعر لكل جم)",
    price: gluePrice.price,
    priceUnit: "kg",
    perBasis: null,
    qtyKind: "g",
  });

  const insTotal = sumCosts(insLines);
  const coverMaterial = sumCosts(coverLines);
  const focus = scenario.costFocus ?? "joint";
  const focusMaterial = focus === "joint" ? jointMaterial : focus === "cover" ? coverMaterial : insTotal;
  const focusLength =
    focus === "joint" ? scenario.jointLengthM : focus === "cover" ? scenario.coverLengthM : scenario.insLengthM;
  const focusNps = focus === "joint" ? scenario.jointNps : focus === "cover" ? scenario.coverNps : scenario.insNps;
  const carton = quoteCarton(
    scenario,
    focus,
    focusNps,
    focus === "insulated" ? insulated.coverIdMm : focus === "cover" ? cover.idMm : joint.idMm,
  );
  let extrasSkipped = 0;
  const extras: ExtraLine[] = scenario.extras.map((extra) => {
    const basisText = extra.basis === "pct" ? "% من الخامات" : extra.basis === "per_m" ? "جنيه/متر" : "جنيه/قطعة";
    if (extra.value == null) {
      extrasSkipped += 1;
      return { id: extra.id, label: extra.label, basis: extra.basis, basisText, base: null, cost: 0 };
    }
    if (extra.basis === "pct") {
      if (focusMaterial == null) {
        return { id: extra.id, label: extra.label, basis: extra.basis, basisText, base: null, cost: null };
      }
      return {
        id: extra.id,
        label: extra.label,
        basis: extra.basis,
        basisText,
        base: focusMaterial,
        cost: (extra.value / 100) * focusMaterial,
      };
    }
    const lengthM = focusLength ?? 0;
    if (extra.basis === "per_m") {
      return {
        id: extra.id,
        label: extra.label,
        basis: extra.basis,
        basisText,
        base: lengthM,
        cost: extra.value * lengthM,
      };
    }
    return { id: extra.id, label: extra.label, basis: extra.basis, basisText, base: 1, cost: extra.value };
  });
  const extrasTotal = extras.some((extra) => extra.cost == null)
    ? null
    : extras.reduce((sum, extra) => sum + (extra.cost ?? 0), 0);
  const cartonSkipped = carton?.missingPrice ?? false;
  const cartonCost = cartonSkipped ? 0 : (carton?.costPerPiece ?? 0);
  const total =
    focusMaterial == null || extrasTotal == null ? null : focusMaterial + extrasTotal + cartonCost;
  const marginPct = scenario.marginPct;
  const profit = total == null || marginPct == null ? null : (total * marginPct) / 100;
  const sell = total == null || profit == null ? null : total + profit;
  const costPerM = total == null || focusLength == null || focusLength <= 0 ? null : total / focusLength;
  const sellPerM = sell == null || focusLength == null || focusLength <= 0 ? null : sell / focusLength;
  const insLen = scenario.insLengthM;

  return {
    currencyNote: GLUE_NAME,
    jointLines,
    jointMaterial,
    jointMissing,
    extras,
    extrasTotal,
    total,
    marginPct,
    profit,
    sell,
    costPerM,
    sellPerM,
    coverLines,
    coverTotal: coverMaterial,
    coverMissing,
    insLines,
    insTotal,
    insMissing,
    insPerM: insTotal == null || insLen == null || insLen <= 0 ? null : insTotal / insLen,
    focus,
    carton,
    cartonSkipped,
    extrasSkipped,
  };
}

export function excelScenario(): Scenario {
  const wireG: Record<string, number | null> = {};
  for (const wire of WIRES) wireG[wire.key] = wire.gPerM;
  const matG: Record<string, number | null> = {};
  for (const mat of MATERIALS) matG[mat.id] = mat.gPerM;
  const schActual: Record<string, number | null> = {};
  const schCover: Record<string, string> = {};
  for (const row of SCH40) {
    schActual[row.nps] = row.actualId;
    schCover[row.nps] = row.coverNps ?? "";
  }
  return {
    jointLengthM: 1,
    jointNps: "4",
    layerType: "single",
    wireKey: "0.8",
    pitchMm: 35,
    stripWidthMm: 50,
    material1: "al-double",
    material2: "pvc",
    glueGPerM: 0.22,
    glueRefOverlapMm: 15,
    coverLengthM: 1,
    coverNps: "6",
    coverMaterial: "pvc",
    coverOverlapMm: 15,
    insLengthM: 1,
    insNps: "6",
    wireG,
    matG,
    schActual,
    schCover,
    woolThkMm: 25,
    woolDensity: 16,
    prices: {},
    extras: [],
    marginPct: null,
    costFocus: "joint",
    cartons: {},
  };
}

export type CartonInput = {
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  pieces: number | null;
  price: number | null;
};

export function quoteCarton(
  scenario: Scenario,
  product: ProductKind,
  nps: string,
  diameterMm: number | null,
): CartonQuote {
  const meta = scenario.cartons[cartonKey(product, nps)];
  const auto = diameterMm != null && diameterMm > 0 ? autoCartonMm(product, diameterMm) : null;
  const lengthMm = meta?.lengthMm != null && meta.lengthMm > 0 ? meta.lengthMm : (auto?.lengthMm ?? null);
  const widthMm = meta?.widthMm != null && meta.widthMm > 0 ? meta.widthMm : (auto?.widthMm ?? null);
  const heightMm = meta?.heightMm != null && meta.heightMm > 0 ? meta.heightMm : (auto?.heightMm ?? null);
  const manual = Boolean(
    (meta?.lengthMm != null && meta.lengthMm > 0) ||
      (meta?.widthMm != null && meta.widthMm > 0) ||
      (meta?.heightMm != null && meta.heightMm > 0),
  );
  const piecesPerCarton = meta?.pieces != null && meta.pieces > 0 ? meta.pieces : 1;
  const unitPrice = meta?.price != null && meta.price >= 0 ? meta.price : null;
  const missingPrice = unitPrice == null;
  const costPerPiece = unitPrice == null ? null : unitPrice / piecesPerCarton;
  return {
    key: cartonKey(product, nps),
    product,
    nps,
    diameterMm,
    lengthMm,
    widthMm,
    heightMm,
    auto: !manual,
    piecesPerCarton,
    cartonsForOne: 1 / piecesPerCarton,
    unitPrice,
    costPerPiece,
    missingPrice,
  };
}

function hms(totalSec: number): string {
  const rounded = Math.round(totalSec);
  const sign = rounded < 0 ? "-" : "";
  const abs = Math.abs(rounded);
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  const seconds = abs % 60;
  return `${sign}${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export type TimeDrive = {
  mode: DriveMode;
  motorRpm: number | null;
  ratedHz: number | null;
  setHz: number | null;
  gearRatio: number | null;
  pulleyMm: number | null;
  grooveMm: number | null;
  directRpm: number | null;
  extraSec: number | null;
  freqRows: (number | null)[];
};

export function calcTime(
  scenario: Scenario,
  drive: TimeDrive,
  lengthM: number | null,
  pitchMm: number | null,
  headNps: string,
): TimeResult {
  const issues: Issue[] = [];
  const headIdMm = idOf(scenario, headNps);
  if (lengthM == null || lengthM <= 0) issues.push(bad("طول الوصلة لازم يكون أكبر من صفر."));
  if (pitchMm == null || pitchMm <= 0) issues.push(bad("خطوة اللفة لازم تكون أكبر من صفر."));
  if (headIdMm == null || headIdMm <= 0) issues.push(bad("مقاس الـ Head غير موجود في جدول Sch 40."));
  if (drive.grooveMm == null || drive.grooveMm < 0) issues.push(bad("خصم الفريز ناقص."));
  const headEffMm = headIdMm != null && drive.grooveMm != null ? headIdMm - drive.grooveMm : null;
  if (headEffMm != null && headEffMm <= 0) issues.push(bad("القطر الفعّال للـ Head لازم يكون أكبر من صفر."));

  let motorRpm: number | null = null;
  let pulleyRpm: number | null = null;
  let beltMPerMin: number | null = null;
  let headRpmCalc: number | null = null;

  if (drive.mode === "direct") {
    if (drive.directRpm == null || drive.directRpm <= 0) issues.push(bad("دوران الـ Head المُدخل لازم يكون أكبر من صفر."));
  } else {
    if (drive.motorRpm == null || drive.motorRpm <= 0) issues.push(bad("سرعة الماتور لازم تكون أكبر من صفر."));
    if (drive.ratedHz == null || drive.ratedHz <= 0) issues.push(bad("التردد المقنن لازم يكون أكبر من صفر."));
    if (drive.setHz == null || drive.setHz <= 0) issues.push(bad("تردد الانفرتر لازم يكون أكبر من صفر."));
    if (drive.gearRatio == null || drive.gearRatio <= 0) issues.push(bad("نسبة التخفيض لازم تكون أكبر من صفر."));
    if (drive.pulleyMm == null || drive.pulleyMm <= 0) issues.push(bad("قطر الطنبورة لازم يكون أكبر من صفر."));
    if (
      drive.motorRpm != null &&
      drive.ratedHz != null &&
      drive.ratedHz > 0 &&
      drive.setHz != null &&
      drive.gearRatio != null &&
      drive.gearRatio > 0 &&
      drive.pulleyMm != null &&
      headEffMm != null &&
      headEffMm > 0
    ) {
      motorRpm = drive.motorRpm * (drive.setHz / drive.ratedHz);
      pulleyRpm = motorRpm / drive.gearRatio;
      beltMPerMin = (Math.PI * drive.pulleyMm * pulleyRpm) / 1000;
      headRpmCalc = (pulleyRpm * drive.pulleyMm) / headEffMm;
    }
  }

  const headRpm = drive.mode === "direct" ? drive.directRpm : headRpmCalc;
  const inputOk = !issues.some((issue) => issue.tone === "bad") && headRpm != null && headRpm > 0;
  const turns = lengthM != null && pitchMm != null && pitchMm > 0 ? (lengthM * 1000) / pitchMm : null;
  const extra = drive.extraSec != null && drive.extraSec >= 0 ? drive.extraSec : 0;
  const turnSec = inputOk && headRpm ? 60 / headRpm : null;
  const advanceMPerMin = inputOk && headRpm && pitchMm ? (headRpm * pitchMm) / 1000 : null;
  const windSec = inputOk && headRpm && turns != null ? (turns / headRpm) * 60 : null;
  const totalSec = windSec == null ? null : windSec + extra;
  const rows = drive.freqRows.map((hz) => freqRow(drive, headEffMm, turns, extra, hz));

  return {
    issues,
    inputOk,
    lengthM,
    pitchMm,
    turns,
    headIdMm,
    motorRpm,
    pulleyRpm,
    beltMPerMin,
    headEffMm,
    headRpmCalc,
    headRpm: inputOk ? headRpm : headRpm,
    turnSec,
    advanceMPerMin,
    windSec,
    totalSec,
    totalMin: totalSec == null ? null : totalSec / 60,
    hms: totalSec == null ? null : hms(totalSec),
    perHour: totalSec != null && totalSec > 0 ? 3600 / totalSec : null,
    rows,
  };
}

function freqRow(
  drive: TimeDrive,
  headEffMm: number | null,
  turns: number | null,
  extra: number,
  hz: number | null,
): TimeResult["rows"][number] {
  if (
    hz == null ||
    hz <= 0 ||
    drive.motorRpm == null ||
    drive.ratedHz == null ||
    drive.ratedHz <= 0 ||
    drive.gearRatio == null ||
    drive.gearRatio <= 0 ||
    drive.pulleyMm == null ||
    drive.pulleyMm <= 0 ||
    headEffMm == null ||
    headEffMm <= 0
  ) {
    return { hz, headRpm: null, totalSec: null, perHour: null };
  }
  const headRpm = ((drive.motorRpm * (hz / drive.ratedHz)) / drive.gearRatio) * (drive.pulleyMm / headEffMm);
  if (!(headRpm > 0) || turns == null) return { hz, headRpm, totalSec: null, perHour: null };
  const totalSec = (turns / headRpm) * 60 + extra;
  return { hz, headRpm, totalSec, perHour: totalSec > 0 ? 3600 / totalSec : null };
}

export function calcBom(
  scenario: Scenario,
  product: ProductKind,
  nps: string,
  lengthM: number | null,
  pieces: number | null,
): BomResult {
  const scoped: Scenario = {
    ...scenario,
    jointLengthM: product === "joint" ? lengthM : scenario.jointLengthM,
    jointNps: product === "joint" ? nps : scenario.jointNps,
    coverLengthM: product === "cover" ? lengthM : scenario.coverLengthM,
    coverNps: product === "cover" ? nps : scenario.coverNps,
    insLengthM: product === "insulated" ? lengthM : scenario.insLengthM,
    insNps: product === "insulated" ? nps : scenario.insNps,
  };
  const joint = calcJoint(scoped, scoped.jointLengthM, scoped.jointNps);
  const cover = calcCover(scoped);
  const insulated = calcInsulated(scoped);
  const wire = wireByKey(scenario.wireKey);
  const mat1 = materialById(scenario.material1);
  const mat2 = materialById(scenario.material2);
  const coverMat = materialById(scenario.coverMaterial);
  const issues: Issue[] = [];
  if (lengthM == null || lengthM <= 0) issues.push(bad("طول القطعة لازم يكون أكبر من صفر."));
  if (pieces == null || pieces <= 0) issues.push(bad("عدد القطع لازم يكون أكبر من صفر."));
  if (product === "joint") issues.push(...joint.issues);
  if (product === "cover") issues.push(...cover.issues);
  if (product === "insulated") issues.push(...insulated.issues);

  const scale = (qty: number | null) => (qty == null || pieces == null ? null : qty * pieces);
  const useJoint = product === "joint" || product === "insulated";
  const useCover = product === "cover" || product === "insulated";
  const useWool = product === "insulated";
  const jointSrc = product === "insulated" ? insulated.inner : joint;
  const layer2Applies = useJoint && (jointSrc?.layers ?? 1) === 2;

  const lines: BomLine[] = [
    {
      id: "wire",
      item: "سلك الوصلة",
      spec: wire?.label ?? "سلك",
      qty: useJoint ? (jointSrc?.wire?.lengthM ?? null) : null,
      unit: "m",
      weightG: useJoint ? (jointSrc?.wireWeightG ?? null) : null,
      orderQty: useJoint ? scale(jointSrc?.wire?.lengthM ?? null) : null,
      applies: useJoint,
    },
    {
      id: "layer1",
      item: "شريط الوصلة — الطبقة الأولى",
      spec: mat1?.name ?? "—",
      qty: useJoint ? (jointSrc?.strip?.lengthM ?? null) : null,
      unit: "m",
      weightG: useJoint ? (jointSrc?.layer1G ?? null) : null,
      orderQty: useJoint ? scale(jointSrc?.strip?.lengthM ?? null) : null,
      applies: useJoint,
    },
    {
      id: "layer2",
      item: "شريط الوصلة — الطبقة الثانية",
      spec: layer2Applies ? (mat2?.name ?? "—") : "—",
      qty: layer2Applies ? (jointSrc?.strip?.lengthM ?? null) : null,
      unit: "m",
      weightG: layer2Applies ? (jointSrc?.layer2G ?? null) : null,
      orderQty: layer2Applies ? scale(jointSrc?.strip?.lengthM ?? null) : null,
      applies: layer2Applies,
    },
    {
      id: "glue",
      item: "غراء الوصلة",
      spec: "Water base acrylic",
      qty: useJoint ? (jointSrc?.glueG ?? null) : null,
      unit: "جم",
      weightG: useJoint ? (jointSrc?.glueG ?? null) : null,
      orderQty: useJoint ? scale(jointSrc?.glueG ?? null) : null,
      applies: useJoint,
    },
    {
      id: "wool",
      item: "صوف زجاجي (Glass wool)",
      spec: useWool ? `${insulated.woolGPerM2 ?? "—"} جم/م²` : "—",
      qty: useWool ? (insulated.woolAreaM2 ?? null) : null,
      unit: "م²",
      weightG: useWool ? (insulated.woolG ?? null) : null,
      orderQty: useWool ? scale(insulated.woolAreaM2 ?? null) : null,
      applies: useWool,
    },
    {
      id: "cover",
      item: "شريط الـ Cover",
      spec: useCover ? (coverMat?.name ?? "—") : "—",
      qty: product === "cover" ? cover.stripM : product === "insulated" ? insulated.coverStripM : null,
      unit: "m",
      weightG: product === "cover" ? cover.matWeightG : product === "insulated" ? insulated.coverMatG : null,
      orderQty:
        product === "cover"
          ? scale(cover.stripM)
          : product === "insulated"
            ? scale(insulated.coverStripM)
            : null,
      applies: useCover,
    },
    {
      id: "cover-glue",
      item: "غراء الـ Cover",
      spec: useCover ? "Water base acrylic" : "—",
      qty: product === "cover" ? cover.glueG : product === "insulated" ? insulated.coverGlueG : null,
      unit: "جم",
      weightG: product === "cover" ? cover.glueG : product === "insulated" ? insulated.coverGlueG : null,
      orderQty:
        product === "cover" ? scale(cover.glueG) : product === "insulated" ? scale(insulated.coverGlueG) : null,
      applies: useCover,
    },
  ];

  const diameter =
    product === "joint" ? joint.idMm : product === "cover" ? cover.idMm : insulated.coverIdMm;
  const carton = quoteCarton(scenario, product, nps, diameter);
  const cartons =
    pieces == null ? null : Math.ceil(pieces / carton.piecesPerCarton);
  lines.push({
    id: "carton",
    item: "كرتونة التغليف",
    spec:
      carton.lengthMm == null
        ? "القطر غير معروف"
        : `${Math.round(carton.lengthMm)} × ${Math.round(carton.widthMm ?? 0)} × ${Math.round(carton.heightMm ?? 0)} مم`,
    qty: cartons,
    unit: "كرتونة",
    weightG: null,
    orderQty: cartons,
    applies: true,
  });

  const pieceParts =
    product === "joint"
      ? [joint.totalG]
      : product === "cover"
        ? [cover.totalG]
        : [insulated.totalG];
  const pieceWeightG = pieceParts.some((part) => part == null) ? null : (pieceParts[0] ?? null);
  const orderWeightKg =
    pieceWeightG == null || pieces == null ? null : (pieceWeightG * pieces) / 1000;

  return {
    issues,
    lines,
    pieceWeightG,
    orderWeightKg,
    carton,
    cartons,
    idMm: product === "insulated" ? insulated.idMm : product === "cover" ? cover.idMm : joint.idMm,
    coverNps: product === "insulated" ? insulated.coverNps : product === "cover" ? nps : null,
    coverIdMm: product === "insulated" ? insulated.coverIdMm : product === "cover" ? cover.idMm : null,
  };
}

type NeedAcc = { itemId: string; label: string; perPiece: number | null; unit: CoverageRow["unit"] };

function addNeed(map: Map<string, NeedAcc>, itemId: string, label: string, unit: CoverageRow["unit"], qty: number | null) {
  const prev = map.get(itemId);
  if (qty == null || (prev != null && prev.perPiece == null)) {
    map.set(itemId, { itemId, label: prev?.label ?? label, perPiece: null, unit });
    return;
  }
  map.set(itemId, { itemId, label, perPiece: (prev?.perPiece ?? 0) + qty, unit });
}

export function bomNeeds(scenario: Scenario, bom: BomResult, product: ProductKind): NeedAcc[] {
  const map = new Map<string, NeedAcc>();
  const wire = wireByKey(scenario.wireKey);
  const mat1 = materialById(scenario.material1);
  const mat2 = materialById(scenario.material2);
  const coverMat = materialById(scenario.coverMaterial);
  const byId = (id: string) => bom.lines.find((line) => line.id === id);
  if (product !== "cover" && wire) addNeed(map, priceKeyWire(wire.key), wire.label, "m", byId("wire")?.qty ?? null);
  if (product !== "cover" && mat1) addNeed(map, priceKeyMat(mat1.id), mat1.name, "m", byId("layer1")?.qty ?? null);
  if (product !== "cover" && (byId("layer2")?.applies ?? false) && mat2) {
    addNeed(map, priceKeyMat(mat2.id), mat2.name, "m", byId("layer2")?.qty ?? null);
  }
  if (product !== "cover") addNeed(map, PRICE_GLUE, "الغراء", "g", byId("glue")?.qty ?? null);
  if (product !== "joint" && coverMat) addNeed(map, priceKeyMat(coverMat.id), coverMat.name, "m", byId("cover")?.qty ?? null);
  if (product !== "joint") addNeed(map, PRICE_GLUE, "الغراء", "g", byId("cover-glue")?.qty ?? null);
  if (product === "insulated") addNeed(map, PRICE_WOOL, "الصوف الزجاجي", "m2", byId("wool")?.qty ?? null);
  if (bom.carton) {
    addNeed(
      map,
      `carton:${bom.carton.key}`,
      `كرتونة ${productLabel(product)} ${bom.carton.nps}″`,
      "carton",
      bom.carton.cartonsForOne,
    );
  }
  return [...map.values()];
}

export function stockToCanonical(
  itemId: string,
  qty: number | null,
  unit: StockUnit,
  scenario: Scenario,
): number | null {
  if (qty == null) return null;
  if (itemId.startsWith("carton:")) return unit === "carton" ? qty : null;
  if (itemId === PRICE_GLUE) {
    if (unit === "g") return qty;
    if (unit === "kg") return qty * 1000;
    return null;
  }
  if (itemId === PRICE_WOOL) {
    const gsm =
      scenario.woolThkMm != null && scenario.woolDensity != null ? scenario.woolThkMm * scenario.woolDensity : null;
    if (unit === "m2") return qty;
    if (unit === "kg" && gsm != null && gsm > 0) return (qty * 1000) / gsm;
    return null;
  }
  if (itemId.startsWith("wire:")) {
    const gPerM = scenario.wireG[itemId.slice(5)] ?? null;
    if (unit === "m") return qty;
    if (unit === "kg" && gPerM != null && gPerM > 0) return (qty * 1000) / gPerM;
    return null;
  }
  if (itemId.startsWith("mat:")) {
    const gPerM = scenario.matG[itemId.slice(4)] ?? null;
    if (unit === "m") return qty;
    if (unit === "kg" && gPerM != null && gPerM > 0) return (qty * 1000) / gPerM;
    return null;
  }
  return null;
}

export function calcCoverage(
  needs: NeedAcc[],
  stock: Record<string, { qty: number | null; unit: StockUnit }>,
  secondsPerPiece: number | null,
  hoursPerDay: number | null,
  batch: number | null,
  scenario: Scenario,
): CoverageResult {
  const rows: CoverageRow[] = needs.map((need) => {
    const held = stock[need.itemId];
    const onHand = stockToCanonical(need.itemId, held?.qty ?? null, held?.unit ?? "kg", scenario);
    const pieces =
      need.perPiece != null && need.perPiece > 0 && onHand != null ? onHand / need.perPiece : onHand === 0 ? 0 : null;
    const hours = pieces != null && secondsPerPiece != null && secondsPerPiece > 0 ? (pieces * secondsPerPiece) / 3600 : null;
    const days = hours != null && hoursPerDay != null && hoursPerDay > 0 ? hours / hoursPerDay : null;
    const batchNeed = need.perPiece != null && batch != null ? need.perPiece * batch : null;
    const batchOk = batchNeed != null && onHand != null ? onHand + 1e-9 >= batchNeed : null;
    let note: string | null = null;
    if (held?.qty == null) note = "الرصيد غير مُدخل";
    else if (need.perPiece == null) note = "استهلاك القطعة غير مكتمل";
    else if (onHand == null) note = "وحدة الرصيد لا تتحول لوحدة الاستهلاك";
    return {
      itemId: need.itemId,
      label: need.label,
      perPiece: need.perPiece,
      unit: need.unit,
      stock: onHand,
      pieces,
      hours,
      days,
      batchNeed,
      batchOk,
      note,
    };
  });
  const ranked = rows.filter((row) => row.pieces != null);
  const bottleneck = ranked.reduce<CoverageRow | null>((best, row) => {
    if (best == null || (row.pieces ?? Infinity) < (best.pieces ?? Infinity)) return row;
    return best;
  }, null);
  const piecesPerHour = secondsPerPiece != null && secondsPerPiece > 0 ? 3600 / secondsPerPiece : null;
  let headline = "أدخل رصيد الخامات لمعرفة مدة التغطية.";
  if (bottleneck?.pieces != null) {
    const pieceText = formatCount(bottleneck.pieces);
    if (bottleneck.pieces <= 0) {
      headline = `${bottleneck.label} رصيدها لا يكفي لأي قطعة من هذا المقاس.`;
    } else if (bottleneck.hours != null && bottleneck.days != null) {
      headline = `أضيق خامة هي ${bottleneck.label}: تكفي ${pieceText} قطعة، أي ${formatHours(bottleneck.hours)} (${formatDays(bottleneck.days)}).`;
    } else {
      headline = `${bottleneck.label} تكفي ${pieceText} قطعة. زمن الماكينة غير مكتمل، فالمدة بالساعات غير محسوبة.`;
    }
  }
  return { rows, secondsPerPiece, piecesPerHour, bottleneck, headline };
}

function formatCount(value: number): string {
  if (value < 10) return value.toFixed(1);
  return Math.floor(value).toLocaleString("en-US");
}

export function formatHours(hours: number): string {
  if (hours < 1 / 60) return "أقل من دقيقة";
  if (hours < 1) return `${Math.round(hours * 60)} دقيقة`;
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  if (minutes === 0) return `${whole} ساعة`;
  return `${whole} ساعة و ${minutes} دقيقة`;
}

export function formatDays(days: number): string {
  if (days < 1) return "أقل من يوم تشغيل";
  const whole = Math.floor(days);
  const rest = Math.round((days - whole) * 10) / 10;
  if (rest <= 0.05) return `${whole} يوم تشغيل`;
  return `${whole + rest} يوم تشغيل`;
}

export function makeSecondsFor(
  scenario: Scenario,
  drive: TimeDrive,
  product: ProductKind,
  nps: string,
  lengthM: number | null,
): number | null {
  if (product === "cover") {
    const pitch =
      scenario.stripWidthMm != null && scenario.coverOverlapMm != null
        ? scenario.stripWidthMm - scenario.coverOverlapMm
        : null;
    const time = calcTime(scenario, drive, lengthM, pitch, nps);
    return time.totalSec;
  }
  if (product === "joint") {
    const time = calcTime(scenario, drive, lengthM, scenario.pitchMm, nps);
    return time.totalSec;
  }
  const inner = calcTime(scenario, drive, lengthM, scenario.pitchMm, nps);
  const coverNps = scenario.schCover[nps] ?? "";
  const pitch =
    scenario.stripWidthMm != null && scenario.coverOverlapMm != null
      ? scenario.stripWidthMm - scenario.coverOverlapMm
      : null;
  const outer = coverNps ? calcTime(scenario, drive, lengthM, pitch, coverNps) : null;
  if (inner.totalSec == null || outer?.totalSec == null) return null;
  const extra = drive.extraSec != null && drive.extraSec > 0 ? drive.extraSec : 0;
  return inner.totalSec + outer.totalSec - extra;
}
