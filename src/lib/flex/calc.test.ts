import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bomNeeds, calcBom, calcCost, calcCover, calcCoverage, calcInsulated, calcJoint, calcTime, excelScenario, quoteCarton } from "./calc.ts";
import { approvedId, geometricId, schByNps } from "./model.ts";

function close(actual: number | null, expected: number, digits = 6) {
  assert.ok(actual != null, `expected ${expected} but got null`);
  const tol = 10 ** -digits;
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `${actual} is not within ${tol} of ${expected}`,
  );
}

describe("flexible duct workbook v9.2", () => {
  it("uses manufacturing ID when present, otherwise OD − 2×wall", () => {
    assert.equal(approvedId("4", "102"), 102);
    const half = schByNps("1/2");
    assert.ok(half);
    assert.equal(geometricId(half), 15.76);
    assert.equal(approvedId("1/2", ""), 15.76);
    assert.equal(approvedId("4", ""), geometricId(schByNps("4")!));
  });

  it("matches the sample joint", () => {
    const scenario = excelScenario();
    const joint = calcJoint(scenario, scenario.jointLengthM, scenario.jointNps);
    assert.equal(joint.inputOk, true);
    assert.equal(joint.idMm, 102);
    assert.equal(joint.overlapMm, 15);
    assert.equal(joint.layers, 1);
    close(joint.turns, 28.5714285714286);
    close(joint.wire?.lengthM ?? null, 9.28133523882835);
    close(joint.strip?.lengthM ?? null, 9.35272826081163);
    close(joint.wireWeightG, 37.1253409553134);
    close(joint.layer1G, 27.0293846737456);
    close(joint.layer2G, 0);
    close(joint.gluePerM, 0.22);
    close(joint.glueG, 2.05760021737856);
    close(joint.totalG, 66.2123258464376);
    close(joint.totalKg, 0.0662123258464376);
  });

  it("matches the sample cover", () => {
    const cover = calcCover(excelScenario());
    assert.equal(cover.inputOk, true);
    assert.equal(cover.idMm, 153);
    assert.equal(cover.pitchMm, 35);
    close(cover.turns, 28.5714285714286);
    close(cover.stripM, 13.7696077464058);
    close(cover.matWeightG, 79.8637249291536);
    close(cover.glueG, 3.02931370420927);
    close(cover.totalG, 82.8930386333628);
  });

  it("matches the sample insulated joint", () => {
    const scenario = excelScenario();
    const insulated = calcInsulated(scenario);
    assert.equal(insulated.dimsOk, true);
    assert.equal(insulated.idMm, 153);
    assert.equal(insulated.coverNps, "8");
    assert.equal(insulated.coverIdMm, 203);
    close(insulated.outerMm, 154.6, 4);
    close(insulated.insulationMm, 24.2, 4);
    close(insulated.inner?.wire?.lengthM ?? null, 13.8412269460067);
    close(insulated.inner?.strip?.lengthM ?? null, 13.9128480902129);
    close(insulated.inner?.wireWeightG ?? null, 55.3649077840266);
    close(insulated.inner?.layer1G ?? null, 40.2081309807152);
    close(insulated.inner?.glueG ?? null, 3.06082657984683);
    close(insulated.inner?.totalG ?? null, 98.6338653445886);
    assert.equal(insulated.woolGPerM2, 400);
    close(insulated.woolWidthMm, 637.743308678728);
    close(insulated.woolAreaM2, 0.637743308678728);
    close(insulated.woolG, 255.097323471491);
    close(insulated.coverStripM, 18.2486572671155);
    close(insulated.coverMatG, 105.84221214927);
    close(insulated.coverGlueG, 4.0147045987654);
    close(insulated.coverTotalG, 109.856916748035);
    close(insulated.totalG, 463.588105564115);
  });

  it("doubles strip and glue on a double layer", () => {
    const scenario = excelScenario();
    scenario.layerType = "double";
    const joint = calcJoint(scenario, 1, "4");
    assert.equal(joint.layers, 2);
    close(joint.totalStripM, 9.35272826081163 * 2);
    close(joint.layer2G, 9.35272826081163 * 5.8);
    close(joint.glueG, 2.05760021737856 * 2);
  });

  it("prices wire by the kilogram and glue by the gram", () => {
    const scenario = excelScenario();
    scenario.prices = {
      "wire:0.8": { price: 85, unit: "kg" },
      "mat:al-double": { price: 140, unit: "kg" },
      glue: { price: 45, unit: "kg" },
    };
    scenario.extras = [{ id: "labor", label: "عمالة", value: 2, basis: "per_m" }];
    scenario.marginPct = 20;
    const joint = calcJoint(scenario, 1, "4");
    const cover = calcCover(scenario);
    const insulated = calcInsulated(scenario);
    const cost = calcCost(scenario, joint, cover, insulated);
    close(cost.jointLines[0]?.cost ?? null, 9.28133523882835 * 85 * 4 / 1000, 6);
    close(cost.jointLines[3]?.cost ?? null, 2.05760021737856 * 45 / 1000, 6);
    assert.equal(cost.jointMissing.length, 0);
    close(cost.extrasTotal, 2, 6);
    assert.ok(cost.sell != null && cost.total != null);
    close(cost.sell, cost.total * 1.2, 6);
  });

  it("blocks NPS 5 insulation until a cover size is entered", () => {
    const scenario = excelScenario();
    scenario.insNps = "5";
    const insulated = calcInsulated(scenario);
    assert.equal(insulated.dimsOk, false);
    assert.equal(insulated.totalG, null);
    assert.match(insulated.issues.map((issue) => issue.text).join(" "), /Cover/);
  });

  it("matches sheet v15 joint, cover, insulation, time and prices", () => {
    const scenario = excelScenario();
    scenario.jointLengthM = 10;
    scenario.jointNps = "6";
    scenario.pitchMm = 25;
    scenario.material2 = "pvc";
    scenario.coverLengthM = 10;
    scenario.coverNps = "4";
    scenario.coverMaterial = "al-double";
    scenario.coverOverlapMm = 25;
    scenario.insLengthM = 1;
    scenario.insNps = "8";
    const joint = calcJoint(scenario, scenario.jointLengthM, scenario.jointNps);
    close(joint.turns, 400, 6);
    close(joint.wire?.lengthM ?? null, 193.529311528483);
    close(joint.strip?.lengthM ?? null, 194.533285142524);
    close(joint.gluePerM, 0.366666666666667);
    close(joint.glueG, 71.3288712189254);
    close(joint.totalG, 1407.64731139475);
    const cover = calcCover(scenario);
    close(cover.stripM, 128.566474130037);
    close(cover.glueG, 47.1410405143468);
    close(cover.totalG, 418.698150750153);
    const insulated = calcInsulated(scenario);
    close(insulated.outerMm, 204.6, 4);
    close(insulated.insulationMm, 25.2, 4);
    close(insulated.woolWidthMm, 801.106126665397);
    close(insulated.totalG, 611.164590854811);
    const time = calcTime(
      scenario,
      {
        mode: "drive",
        motorRpm: 1400,
        ratedHz: 50,
        setHz: 50,
        gearRatio: 10,
        pulleyMm: 92,
        grooveMm: 3,
        directRpm: 130,
        extraSec: 0,
        freqRows: [50],
      },
      10,
      25,
      "4",
    );
    close(time.headRpm, 130.10101010101);
    close(time.totalSec, 184.472049689441);
    close(time.perHour, 19.5151515151515);
    assert.equal(time.hms, "0:03:04");
    const bom = calcBom(scenario, "joint", "4", 10, 1);
    close(bom.lines.find((line) => line.id === "wire")?.qty ?? null, 129.568761774748);
    close(bom.lines.find((line) => line.id === "layer1")?.qty ?? null, 130.571095884329);
    close(bom.lines.find((line) => line.id === "glue")?.qty ?? null, 47.8760684909205);
    const carton = quoteCarton(scenario, "joint", "4", 102);
    close(carton.lengthMm, 152, 4);
    close(carton.widthMm, 152, 4);
    assert.equal(carton.heightMm, 400);
    const insulatedCarton = quoteCarton(scenario, "insulated", "8", 255);
    assert.equal(insulatedCarton.heightMm, 1000);
    close(insulatedCarton.lengthMm, 305, 4);
    scenario.prices = {
      "wire:0.8": { price: 69.81, unit: "kg" },
      "mat:al-double": { price: 309.83, unit: "kg" },
      glue: { price: 198.68, unit: "kg" },
    };
    scenario.costFocus = "joint";
    const cost = calcCost(scenario, joint, cover, insulated);
    close(cost.jointLines[0]?.cost ?? null, 54.0411249512136, 4);
    close(cost.jointMaterial, 242.399541041186, 4);
    assert.equal(cost.insTotal, null);
    scenario.costFocus = "cover";
    scenario.cartons["cover|4"] = { lengthMm: null, widthMm: null, heightMm: null, pieces: 1, price: 12 };
    const coverCost = calcCost(scenario, joint, cover, insulated);
    close(coverCost.coverTotal, 124.48552139375, 4);
    assert.equal(coverCost.focus, "cover");
    close(coverCost.total, (coverCost.coverTotal ?? 0) + 12, 4);
  });

  it("turns warehouse kilograms into how many joints the wire can make", () => {
    const scenario = excelScenario();
    const bom = calcBom(scenario, "joint", "4", 1, 1);
    const needs = bomNeeds(scenario, bom, "joint");
    const wire = needs.find((need) => need.itemId === "wire:0.8");
    assert.ok(wire && wire.perPiece != null && wire.perPiece > 0);
    const coverage = calcCoverage(
      needs,
      { "wire:0.8": { qty: 50, unit: "kg" }, "mat:al-double": { qty: 80, unit: "kg" }, glue: { qty: 10, unit: "kg" } },
      60,
      8,
      null,
      scenario,
    );
    const row = coverage.rows.find((item) => item.itemId === "wire:0.8");
    assert.equal(row?.note, null);
    assert.ok((row?.pieces ?? 0) > 100);
    assert.match(coverage.headline, /تكفي/);
  });
});
