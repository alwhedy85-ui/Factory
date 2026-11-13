/** Schedule 40 + material defaults from flexible_duct_calc v9.2. */

export type LayerType = "single" | "double";
export type PriceUnit = "kg" | "m" | "m2";
export type CostBasis = "pct" | "per_m" | "per_piece";

export type SchSpec = {
  nps: string;
  od: number;
  wall: number;
  /** Manufacturing ID from the sheet. Null = use OD − 2×wall. */
  actualId: number | null;
  /** Cover NPS from column F. Null = not entered. */
  coverNps: string | null;
};

export type WireSpec = {
  key: string;
  mm: number;
  label: string;
  gPerM: number | null;
};

export type MaterialSpec = {
  id: string;
  name: string;
  gPerM: number;
};

export const SCH40: SchSpec[] = [
  { nps: "1/8", od: 10.3, wall: 1.73, actualId: null, coverNps: null },
  { nps: "1/4", od: 13.7, wall: 2.24, actualId: null, coverNps: null },
  { nps: "3/8", od: 17.1, wall: 2.31, actualId: null, coverNps: null },
  { nps: "1/2", od: 21.3, wall: 2.77, actualId: null, coverNps: null },
  { nps: "3/4", od: 26.7, wall: 2.87, actualId: null, coverNps: null },
  { nps: "1", od: 33.4, wall: 3.38, actualId: null, coverNps: null },
  { nps: "1 1/4", od: 42.2, wall: 3.56, actualId: null, coverNps: null },
  { nps: "1 1/2", od: 48.3, wall: 3.68, actualId: null, coverNps: null },
  { nps: "2", od: 60.3, wall: 3.91, actualId: null, coverNps: null },
  { nps: "2 1/2", od: 73, wall: 5.16, actualId: null, coverNps: null },
  { nps: "3", od: 88.9, wall: 5.49, actualId: null, coverNps: null },
  { nps: "3 1/2", od: 101.6, wall: 5.74, actualId: null, coverNps: null },
  { nps: "4", od: 114.3, wall: 6.02, actualId: 102, coverNps: "6" },
  { nps: "5", od: 141.3, wall: 6.55, actualId: 127, coverNps: null },
  { nps: "6", od: 168.3, wall: 7.11, actualId: 153, coverNps: "8" },
  { nps: "8", od: 219.1, wall: 8.18, actualId: 203, coverNps: "10" },
  { nps: "10", od: 273.1, wall: 9.27, actualId: 255, coverNps: "12" },
  { nps: "12", od: 323.9, wall: 10.31, actualId: 305, coverNps: "14" },
  { nps: "14", od: 355.6, wall: 11.13, actualId: 356, coverNps: "16" },
  { nps: "16", od: 406.4, wall: 12.7, actualId: 406, coverNps: "18" },
  { nps: "18", od: 457, wall: 14.27, actualId: 457, coverNps: null },
  { nps: "20", od: 508, wall: 15.09, actualId: null, coverNps: null },
  { nps: "22", od: 559, wall: 15.88, actualId: null, coverNps: null },
  { nps: "24", od: 610, wall: 17.48, actualId: null, coverNps: null },
];

export const WIRES: WireSpec[] = [
  { key: "0.8", mm: 0.8, label: "سلك 0.8 مم", gPerM: 4 },
  { key: "0.9", mm: 0.9, label: "سلك 0.9 مم", gPerM: null },
  { key: "1", mm: 1, label: "سلك 1 مم", gPerM: 6.11 },
  { key: "1.2", mm: 1.2, label: "سلك 1.2 مم", gPerM: null },
  { key: "1.4", mm: 1.4, label: "سلك 1.4 مم", gPerM: null },
];

export const MATERIALS: MaterialSpec[] = [
  { id: "al-single", name: "Aluminum Single (0.012)", gPerM: 1.76 },
  { id: "al-double", name: "Aluminum Double (0.015)", gPerM: 2.89 },
  { id: "pvc", name: "PVC", gPerM: 5.8 },
  { id: "mpet", name: "MPET", gPerM: 0.85 },
  { id: "pure-mpet", name: "Clear PET Film", gPerM: 0.87 },
];

export const GLUE_NAME = "الغراء (Water base acrylic)";

export type SchDraft = {
  nps: string;
  actualId: string;
  coverNps: string;
};

export type PriceDraft = {
  price: string;
  unit: PriceUnit;
};

export type ExtraDraft = {
  id: string;
  label: string;
  value: string;
  basis: CostBasis;
};

export type JointDraft = {
  lengthM: string;
  nps: string;
  layerType: LayerType;
  wireKey: string;
  pitchMm: string;
  stripWidthMm: string;
  material1: string;
  material2: string;
  glueGPerM: string;
  glueRefOverlapMm: string;
};

export type CoverDraft = {
  lengthM: string;
  nps: string;
  material: string;
  overlapMm: string;
};

export type InsulatedDraft = {
  lengthM: string;
  nps: string;
};

export type WoolDraft = {
  thicknessMm: string;
  density: string;
};

export function defaultJoint(): JointDraft {
  return {
    lengthM: "1",
    nps: "4",
    layerType: "single",
    wireKey: "0.8",
    pitchMm: "35",
    stripWidthMm: "50",
    material1: "al-double",
    material2: "pvc",
    glueGPerM: "0.22",
    glueRefOverlapMm: "15",
  };
}

export function defaultCover(): CoverDraft {
  return {
    lengthM: "1",
    nps: "6",
    material: "pvc",
    overlapMm: "15",
  };
}

export function defaultInsulated(): InsulatedDraft {
  return { lengthM: "1", nps: "6" };
}

export function defaultWool(): WoolDraft {
  return { thicknessMm: "25", density: "16" };
}

export function defaultSch(): SchDraft[] {
  return SCH40.map((row) => ({
    nps: row.nps,
    actualId: row.actualId == null ? "" : String(row.actualId),
    coverNps: row.coverNps ?? "",
  }));
}

export function defaultWireG(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const wire of WIRES) out[wire.key] = wire.gPerM == null ? "" : String(wire.gPerM);
  return out;
}

export function defaultMatG(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const mat of MATERIALS) out[mat.id] = String(mat.gPerM);
  return out;
}

export function priceKeyWire(key: string): string {
  return `wire:${key}`;
}

export function priceKeyMat(id: string): string {
  return `mat:${id}`;
}

export const PRICE_GLUE = "glue";
export const PRICE_WOOL = "wool";

/** Prices written on sheet v15. Empty means the user still has to enter them. */
export const SHEET_PRICES: Record<string, PriceDraft> = {
  [priceKeyWire("0.8")]: { price: "69.81", unit: "kg" },
  [priceKeyWire("0.9")]: { price: "", unit: "kg" },
  [priceKeyWire("1")]: { price: "66.81", unit: "kg" },
  [priceKeyWire("1.2")]: { price: "", unit: "kg" },
  [priceKeyWire("1.4")]: { price: "", unit: "kg" },
  [priceKeyMat("al-single")]: { price: "291.28", unit: "kg" },
  [priceKeyMat("al-double")]: { price: "309.83", unit: "kg" },
  [priceKeyMat("pvc")]: { price: "165.33", unit: "kg" },
  [priceKeyMat("mpet")]: { price: "188.08", unit: "kg" },
  [priceKeyMat("pure-mpet")]: { price: "177.9", unit: "kg" },
  [PRICE_GLUE]: { price: "198.68", unit: "kg" },
  [PRICE_WOOL]: { price: "", unit: "kg" },
};

export function defaultPrices(): Record<string, PriceDraft> {
  const out: Record<string, PriceDraft> = {};
  for (const wire of WIRES) {
    out[priceKeyWire(wire.key)] = { ...(SHEET_PRICES[priceKeyWire(wire.key)] ?? { price: "", unit: "kg" }) };
  }
  for (const mat of MATERIALS) {
    out[priceKeyMat(mat.id)] = { ...(SHEET_PRICES[priceKeyMat(mat.id)] ?? { price: "", unit: "kg" }) };
  }
  out[PRICE_GLUE] = { ...SHEET_PRICES[PRICE_GLUE]! };
  out[PRICE_WOOL] = { ...SHEET_PRICES[PRICE_WOOL]! };
  return out;
}

export function defaultExtras(): ExtraDraft[] {
  return [
    { id: "waste", label: "هالك وفاقد الخامات", value: "", basis: "pct" },
    { id: "labor", label: "عمالة التشغيل", value: "", basis: "per_m" },
    { id: "power", label: "كهرباء وطاقة", value: "", basis: "per_m" },
    { id: "pack", label: "تغليف", value: "", basis: "per_piece" },
    { id: "depr", label: "إهلاك الماكينات والصيانة", value: "", basis: "per_m" },
    { id: "ship", label: "نقل وتحميل", value: "", basis: "per_piece" },
    { id: "overhead", label: "مصروفات عامة وإدارية", value: "", basis: "pct" },
    { id: "other", label: "تكاليف أخرى", value: "", basis: "per_piece" },
  ];
}

export const EXAMPLE_PRICES: Record<string, PriceDraft> = SHEET_PRICES;

export function num(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const trimmed = raw.trim().replaceAll("٬", "").replace(",", ".");
  if (trimmed === "" || trimmed === "." || trimmed === "-" || trimmed === "-.") return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export function schByNps(nps: string): SchSpec | undefined {
  return SCH40.find((row) => row.nps === nps);
}

export function geometricId(row: SchSpec): number {
  const raw = row.od - 2 * row.wall;
  return Math.round(raw * 100) / 100;
}

/** Approved ID: manufacturing ID when entered, otherwise OD − 2×wall. */
export function approvedId(nps: string, actualRaw: string | undefined): number | null {
  const spec = schByNps(nps);
  if (!spec) return null;
  const actual = num(actualRaw ?? "");
  if (actual != null && actual > 0) return actual;
  return geometricId(spec);
}

export function wireByKey(key: string): WireSpec | undefined {
  return WIRES.find((wire) => wire.key === key);
}

export function materialById(id: string): MaterialSpec | undefined {
  return MATERIALS.find((mat) => mat.id === id);
}

/** Scale a measured g/m by diameter squared (steel wire). */
export function estimateWireGPerM(mm: number, refMm: number, refG: number): number {
  return refG * (mm / refMm) ** 2;
}

export function fmt(value: number | null | undefined, max = 3, min = 0): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: max,
    minimumFractionDigits: min,
    useGrouping: true,
  }).format(value);
}

export type ProductKind = "joint" | "cover" | "insulated";

export type DriveMode = "drive" | "direct";

export type TimeDraft = {
  mode: DriveMode;
  motorRpm: string;
  ratedHz: string;
  setHz: string;
  gearRatio: string;
  pulleyMm: string;
  grooveMm: string;
  directRpm: string;
  extraSec: string;
  headNps: string;
  freqRows: string[];
};

export function defaultTime(): TimeDraft {
  return {
    mode: "drive",
    motorRpm: "1400",
    ratedHz: "50",
    setHz: "50",
    gearRatio: "10",
    pulleyMm: "92",
    grooveMm: "3",
    directRpm: "130",
    extraSec: "0",
    headNps: "4",
    freqRows: ["10", "15", "20", "25", "30", "35", "40", "45", "50"],
  };
}

export type BomDraft = {
  product: ProductKind;
  nps: string;
  lengthM: string;
  pieces: string;
};

export function defaultBom(): BomDraft {
  return { product: "joint", nps: "4", lengthM: "10", pieces: "1" };
}

export type CartonDraft = {
  lengthMm: string;
  widthMm: string;
  heightMm: string;
  pieces: string;
  price: string;
};

export function emptyCarton(): CartonDraft {
  return { lengthMm: "", widthMm: "", heightMm: "", pieces: "1", price: "" };
}

export function cartonKey(product: ProductKind, nps: string): string {
  return `${product}|${nps}`;
}

export const CARTON_SIZES: { product: ProductKind; nps: string }[] = [
  ...["4", "5", "6", "8", "10", "12", "14", "16", "18"].map((nps) => ({ product: "joint" as const, nps })),
  ...["4", "5", "6", "8", "10", "12", "14", "16", "18"].map((nps) => ({ product: "cover" as const, nps })),
  ...["4", "6", "8", "10", "12", "14", "16"].map((nps) => ({ product: "insulated" as const, nps })),
];

export function productLabel(product: ProductKind): string {
  if (product === "joint") return "وصلة";
  if (product === "cover") return "Cover";
  return "وصلة معزولة";
}

/** Packing rule: length and width = outer diameter + 50 mm. Height 400 mm, or 1000 mm when insulated. */
export function autoCartonMm(product: ProductKind, diameterMm: number) {
  return {
    lengthMm: diameterMm + 50,
    widthMm: diameterMm + 50,
    heightMm: product === "insulated" ? 1000 : 400,
  };
}

export type StockUnit = "m" | "kg" | "g" | "m2" | "carton";

export type StockDraft = {
  qty: string;
  unit: StockUnit;
};

export type MovementKind = "receipt" | "return" | "issue";

export type MovementDraft = {
  id: string;
  at: string;
  itemId: string;
  kind: MovementKind;
  qty: string;
  note: string;
};

export type PlanDraft = {
  product: ProductKind;
  nps: string;
  lengthM: string;
  batch: string;
  hoursPerDay: string;
  rateMode: "machine" | "manual";
  piecesPerDay: string;
};

export function defaultPlan(): PlanDraft {
  return {
    product: "joint",
    nps: "4",
    lengthM: "10",
    batch: "",
    hoursPerDay: "8",
    rateMode: "machine",
    piecesPerDay: "20",
  };
}

export type StockCatalogItem = {
  id: string;
  label: string;
  hint: string;
  units: StockUnit[];
  defaultUnit: StockUnit;
};

export function stockCatalog(): StockCatalogItem[] {
  const items: StockCatalogItem[] = WIRES.map((wire) => ({
    id: priceKeyWire(wire.key),
    label: wire.label,
    hint: "سلك",
    units: ["kg", "m"],
    defaultUnit: "kg",
  }));
  for (const mat of MATERIALS) {
    items.push({
      id: priceKeyMat(mat.id),
      label: mat.name,
      hint: "شريط عرض 5 سم",
      units: ["kg", "m"],
      defaultUnit: "kg",
    });
  }
  items.push({
    id: PRICE_GLUE,
    label: "الغراء (Water base acrylic)",
    hint: "يُصرف على منطقة التداخل",
    units: ["kg", "g"],
    defaultUnit: "kg",
  });
  items.push({
    id: PRICE_WOOL,
    label: "الصوف الزجاجي",
    hint: "يُستخدم في الوصلة المعزولة فقط",
    units: ["m2", "kg"],
    defaultUnit: "m2",
  });
  return items;
}

export function defaultStockItem(item: StockCatalogItem): StockDraft {
  return { qty: "", unit: item.defaultUnit };
}

export function unitLabel(unit: StockUnit): string {
  if (unit === "m") return "متر";
  if (unit === "kg") return "كجم";
  if (unit === "g") return "جم";
  if (unit === "m2") return "م²";
  return "كرتونة";
}
