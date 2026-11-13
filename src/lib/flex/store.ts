import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Scenario, TimeDrive } from "./calc.ts";
import {
  CARTON_SIZES,
  WIRES,
  cartonKey,
  defaultBom,
  defaultCover,
  defaultExtras,
  defaultInsulated,
  defaultJoint,
  defaultMatG,
  defaultPlan,
  defaultPrices,
  defaultSch,
  defaultStockItem,
  defaultTime,
  defaultWireG,
  defaultWool,
  emptyCarton,
  estimateWireGPerM,
  num,
  stockCatalog,
  type BomDraft,
  type CartonDraft,
  type CoverDraft,
  type DriveMode,
  type ExtraDraft,
  type InsulatedDraft,
  type JointDraft,
  type MovementDraft,
  type MovementKind,
  type PlanDraft,
  type PriceDraft,
  type ProductKind,
  type SchDraft,
  type StockDraft,
  type TimeDraft,
  type WoolDraft,
} from "./model.ts";

export type SectionId = "joint" | "cover" | "insulated" | "time" | "bom" | "cost" | "stock" | "tables";

export type Quote = {
  id: string;
  name: string;
  savedAt: string;
  joint: JointDraft;
  cover: CoverDraft;
  insulated: InsulatedDraft;
  wool: WoolDraft;
  wireG: Record<string, string>;
  matG: Record<string, string>;
  sch: SchDraft[];
  prices: Record<string, PriceDraft>;
  extras: ExtraDraft[];
  marginPct: string;
  currency: string;
  time: TimeDraft;
  bom: BomDraft;
  cartons: Record<string, CartonDraft>;
  costFocus: ProductKind;
};

export type FlexState = {
  section: SectionId | null;
  precision: boolean;
  installDismissed: boolean;
  joint: JointDraft;
  cover: CoverDraft;
  insulated: InsulatedDraft;
  wool: WoolDraft;
  wireG: Record<string, string>;
  matG: Record<string, string>;
  sch: SchDraft[];
  prices: Record<string, PriceDraft>;
  extras: ExtraDraft[];
  marginPct: string;
  currency: string;
  quotes: Quote[];
  time: TimeDraft;
  bom: BomDraft;
  cartons: Record<string, CartonDraft>;
  costFocus: ProductKind;
  stock: Record<string, StockDraft>;
  movements: MovementDraft[];
  plan: PlanDraft;
  setSection: (section: SectionId | null) => void;
  setPrecision: (precision: boolean) => void;
  dismissInstall: () => void;
  patchJoint: (patch: Partial<JointDraft>) => void;
  patchCover: (patch: Partial<CoverDraft>) => void;
  patchInsulated: (patch: Partial<InsulatedDraft>) => void;
  patchWool: (patch: Partial<WoolDraft>) => void;
  setWireG: (key: string, value: string) => void;
  setMatG: (id: string, value: string) => void;
  setSchField: (nps: string, field: "actualId" | "coverNps", value: string) => void;
  setPrice: (key: string, patch: Partial<PriceDraft>) => void;
  setExtra: (id: string, patch: Partial<ExtraDraft>) => void;
  addExtra: () => void;
  removeExtra: (id: string) => void;
  setMargin: (value: string) => void;
  setCurrency: (value: string) => void;
  restoreSheetPrices: () => void;
  clearPrices: () => void;
  estimateWires: () => void;
  resetRecipe: () => void;
  resetTables: () => void;
  saveQuote: (name: string) => void;
  loadQuote: (id: string) => void;
  deleteQuote: (id: string) => void;
  patchTime: (patch: Partial<TimeDraft>) => void;
  setFreq: (index: number, value: string) => void;
  patchBom: (patch: Partial<BomDraft>) => void;
  patchCarton: (key: string, patch: Partial<CartonDraft>) => void;
  setCostFocus: (focus: ProductKind) => void;
  setStock: (itemId: string, patch: Partial<StockDraft>) => void;
  postMovement: (itemId: string, kind: MovementKind, qty: string, note: string) => boolean;
  patchPlan: (patch: Partial<PlanDraft>) => void;
};

function snapshot(state: FlexState): Omit<Quote, "id" | "name" | "savedAt"> {
  return {
    joint: state.joint,
    cover: state.cover,
    insulated: state.insulated,
    wool: state.wool,
    wireG: state.wireG,
    matG: state.matG,
    sch: state.sch,
    prices: state.prices,
    extras: state.extras,
    marginPct: state.marginPct,
    currency: state.currency,
    time: state.time,
    bom: state.bom,
    cartons: state.cartons,
    costFocus: state.costFocus,
  };
}

function fresh(): Pick<
  FlexState,
  | "section"
  | "precision"
  | "installDismissed"
  | "joint"
  | "cover"
  | "insulated"
  | "wool"
  | "wireG"
  | "matG"
  | "sch"
  | "prices"
  | "extras"
  | "marginPct"
  | "currency"
  | "quotes"
  | "time"
  | "bom"
  | "cartons"
  | "costFocus"
  | "stock"
  | "movements"
  | "plan"
> {
  return {
    section: null,
    precision: false,
    installDismissed: false,
    joint: defaultJoint(),
    cover: defaultCover(),
    insulated: defaultInsulated(),
    wool: defaultWool(),
    wireG: defaultWireG(),
    matG: defaultMatG(),
    sch: defaultSch(),
    prices: defaultPrices(),
    extras: defaultExtras(),
    marginPct: "",
    currency: "جنيه",
    quotes: [],
    time: defaultTime(),
    bom: defaultBom(),
    cartons: {},
    costFocus: "joint",
    stock: {},
    movements: [],
    plan: defaultPlan(),
  };
}

export const useFlex = create<FlexState>()(
  persist(
    (set, get) => ({
      ...fresh(),
      setSection: (section) => set({ section }),
      setPrecision: (precision) => set({ precision }),
      dismissInstall: () => set({ installDismissed: true }),
      patchJoint: (patch) => set({ joint: { ...get().joint, ...patch } }),
      patchCover: (patch) => set({ cover: { ...get().cover, ...patch } }),
      patchInsulated: (patch) => set({ insulated: { ...get().insulated, ...patch } }),
      patchWool: (patch) => set({ wool: { ...get().wool, ...patch } }),
      setWireG: (key, value) => set({ wireG: { ...get().wireG, [key]: value } }),
      setMatG: (id, value) => set({ matG: { ...get().matG, [id]: value } }),
      setSchField: (nps, field, value) =>
        set({
          sch: get().sch.map((row) => (row.nps === nps ? { ...row, [field]: value } : row)),
        }),
      setPrice: (key, patch) =>
        set({
          prices: {
            ...get().prices,
            [key]: { ...(get().prices[key] ?? { price: "", unit: "kg" }), ...patch },
          },
        }),
      setExtra: (id, patch) =>
        set({
          extras: get().extras.map((row) => (row.id === id ? { ...row, ...patch } : row)),
        }),
      addExtra: () =>
        set({
          extras: [...get().extras, { id: crypto.randomUUID(), label: "بند جديد", value: "", basis: "per_piece" }],
        }),
      removeExtra: (id) => set({ extras: get().extras.filter((row) => row.id !== id) }),
      setMargin: (marginPct) => set({ marginPct }),
      setCurrency: (currency) => set({ currency }),
      restoreSheetPrices: () => set({ prices: defaultPrices() }),
      clearPrices: () =>
        set({
          prices: Object.fromEntries(
            Object.entries(defaultPrices()).map(([key, value]) => [key, { ...value, price: "" }]),
          ),
          marginPct: "",
          extras: defaultExtras(),
        }),
      estimateWires: () => {
        const wireG = { ...get().wireG };
        const ref =
          (num(wireG["1"]) != null && (num(wireG["1"]) ?? 0) > 0 && { mm: 1, g: num(wireG["1"])! }) ||
          (num(wireG["0.8"]) != null && (num(wireG["0.8"]) ?? 0) > 0 && { mm: 0.8, g: num(wireG["0.8"])! }) ||
          null;
        if (!ref) return;
        for (const wire of WIRES) {
          if (num(wireG[wire.key]) == null) {
            wireG[wire.key] = estimateWireGPerM(wire.mm, ref.mm, ref.g).toFixed(2);
          }
        }
        set({ wireG });
      },
      resetRecipe: () =>
        set({
          joint: defaultJoint(),
          cover: defaultCover(),
          insulated: defaultInsulated(),
          wool: defaultWool(),
        }),
      resetTables: () =>
        set({
          sch: defaultSch(),
          wireG: defaultWireG(),
          matG: defaultMatG(),
          wool: defaultWool(),
          joint: {
            ...get().joint,
            glueGPerM: defaultJoint().glueGPerM,
            glueRefOverlapMm: defaultJoint().glueRefOverlapMm,
            stripWidthMm: defaultJoint().stripWidthMm,
          },
        }),
      saveQuote: (name) => {
        const state = get();
        const quote: Quote = {
          id: crypto.randomUUID(),
          name: name.trim() || "حسبة بدون اسم",
          savedAt: new Date().toISOString(),
          ...snapshot(state),
        };
        set({ quotes: [quote, ...state.quotes].slice(0, 24) });
      },
      loadQuote: (id) => {
        const quote = get().quotes.find((item) => item.id === id);
        if (!quote) return;
        set({
          joint: quote.joint,
          cover: quote.cover,
          insulated: quote.insulated,
          wool: quote.wool,
          wireG: quote.wireG,
          matG: quote.matG,
          sch: quote.sch,
          prices: { ...defaultPrices(), ...quote.prices },
          extras: quote.extras,
          marginPct: quote.marginPct,
          currency: quote.currency,
          time: { ...defaultTime(), ...quote.time },
          bom: { ...defaultBom(), ...quote.bom },
          cartons: quote.cartons ?? {},
          costFocus: quote.costFocus ?? "joint",
        });
      },
      deleteQuote: (id) => set({ quotes: get().quotes.filter((item) => item.id !== id) }),
      patchTime: (patch) => set({ time: { ...get().time, ...patch } }),
      setFreq: (index, value) => {
        const freqRows = [...get().time.freqRows];
        freqRows[index] = value;
        set({ time: { ...get().time, freqRows } });
      },
      patchBom: (patch) => set({ bom: { ...get().bom, ...patch } }),
      patchCarton: (key, patch) => {
        const current = get().cartons[key] ?? emptyCarton();
        set({ cartons: { ...get().cartons, [key]: { ...current, ...patch } } });
      },
      setCostFocus: (costFocus) => set({ costFocus }),
      setStock: (itemId, patch) => {
        const catalog = stockCatalog().find((item) => item.id === itemId);
        const current = get().stock[itemId] ?? (catalog ? defaultStockItem(catalog) : { qty: "", unit: "kg" as const });
        set({ stock: { ...get().stock, [itemId]: { ...current, ...patch } } });
      },
      postMovement: (itemId, kind, qtyRaw, note) => {
        const qty = num(qtyRaw);
        if (qty == null || qty <= 0) return false;
        const catalog = stockCatalog().find((item) => item.id === itemId);
        const carton = itemId.startsWith("carton:");
        const current =
          get().stock[itemId] ??
          (catalog ? defaultStockItem(catalog) : carton ? { qty: "", unit: "carton" as const } : { qty: "", unit: "kg" as const });
        const onHand = num(current.qty) ?? 0;
        const next = kind === "issue" ? onHand - qty : onHand + qty;
        const movement: MovementDraft = {
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          itemId,
          kind,
          qty: String(qty),
          note: note.trim(),
        };
        set({
          stock: {
            ...get().stock,
            [itemId]: { ...current, qty: String(Math.round(next * 1000) / 1000) },
          },
          movements: [movement, ...get().movements].slice(0, 80),
        });
        return true;
      },
      patchPlan: (patch) => set({ plan: { ...get().plan, ...patch } }),
    }),
    {
      name: "flexduct-calc-v2",
      skipHydration: true,
      version: 2,
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<FlexState>;
        return {
          ...current,
          ...saved,
          prices: { ...defaultPrices(), ...(saved.prices ?? {}) },
          wireG: { ...defaultWireG(), ...(saved.wireG ?? {}) },
          matG: { ...defaultMatG(), ...(saved.matG ?? {}) },
          time: { ...defaultTime(), ...(saved.time ?? {}) },
          bom: { ...defaultBom(), ...(saved.bom ?? {}) },
          plan: { ...defaultPlan(), ...(saved.plan ?? {}) },
          cartons: saved.cartons ?? {},
          stock: saved.stock ?? {},
          movements: saved.movements ?? [],
          costFocus: saved.costFocus ?? "joint",
          section: saved.section ?? null,
          extras: saved.extras?.length ? saved.extras : defaultExtras(),
          sch: saved.sch?.length ? saved.sch : defaultSch(),
        };
      },
    },
  ),
);

export function toScenario(state: FlexState): Scenario {
  const schActual: Record<string, number | null> = {};
  const schCover: Record<string, string> = {};
  for (const row of state.sch) {
    schActual[row.nps] = num(row.actualId);
    schCover[row.nps] = row.coverNps.trim();
  }
  const wireG: Record<string, number | null> = {};
  for (const [key, value] of Object.entries(state.wireG)) wireG[key] = num(value);
  const matG: Record<string, number | null> = {};
  for (const [key, value] of Object.entries(state.matG)) matG[key] = num(value);
  const prices: Scenario["prices"] = {};
  for (const [key, value] of Object.entries(state.prices)) {
    prices[key] = { price: num(value.price), unit: value.unit };
  }
  const cartons: Scenario["cartons"] = {};
  for (const row of CARTON_SIZES) {
    const key = cartonKey(row.product, row.nps);
    const draft = state.cartons[key];
    if (!draft) continue;
    cartons[key] = {
      lengthMm: num(draft.lengthMm),
      widthMm: num(draft.widthMm),
      heightMm: num(draft.heightMm),
      pieces: num(draft.pieces),
      price: num(draft.price),
    };
  }
  return {
    jointLengthM: num(state.joint.lengthM),
    jointNps: state.joint.nps,
    layerType: state.joint.layerType,
    wireKey: state.joint.wireKey,
    pitchMm: num(state.joint.pitchMm),
    stripWidthMm: num(state.joint.stripWidthMm),
    material1: state.joint.material1,
    material2: state.joint.material2,
    glueGPerM: num(state.joint.glueGPerM),
    glueRefOverlapMm: num(state.joint.glueRefOverlapMm),
    coverLengthM: num(state.cover.lengthM),
    coverNps: state.cover.nps,
    coverMaterial: state.cover.material,
    coverOverlapMm: num(state.cover.overlapMm),
    insLengthM: num(state.insulated.lengthM),
    insNps: state.insulated.nps,
    wireG,
    matG,
    schActual,
    schCover,
    woolThkMm: num(state.wool.thicknessMm),
    woolDensity: num(state.wool.density),
    prices,
    extras: state.extras.map((row) => ({
      id: row.id,
      label: row.label,
      value: num(row.value),
      basis: row.basis,
    })),
    marginPct: num(state.marginPct),
    costFocus: state.costFocus,
    cartons,
  };
}

export function toDrive(state: FlexState): TimeDrive {
  return {
    mode: state.time.mode as DriveMode,
    motorRpm: num(state.time.motorRpm),
    ratedHz: num(state.time.ratedHz),
    setHz: num(state.time.setHz),
    gearRatio: num(state.time.gearRatio),
    pulleyMm: num(state.time.pulleyMm),
    grooveMm: num(state.time.grooveMm),
    directRpm: num(state.time.directRpm),
    extraSec: num(state.time.extraSec),
    freqRows: state.time.freqRows.map((row) => num(row)),
  };
}
