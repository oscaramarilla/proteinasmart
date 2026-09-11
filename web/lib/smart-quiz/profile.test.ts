import assert from "node:assert/strict";
import test from "node:test";
import type { QuizInput } from "./engine.ts";
import { buildProfileWhatsAppMessage, buildSmartProfile, parseQuizParams } from "./profile.ts";

const input = (extra: Partial<QuizInput> = {}): QuizInput => ({
  goal: "MASS", frequency: "HIGH", trainingMonths: 12, structuredRoutine: true, budget: 800000, safetyRedFlag: false, ...extra,
});

test("parseQuizParams rechaza lo que no puede resolver", () => {
  assert.equal(parseQuizParams({ goal: "CUALQUIERA", frequency: "HIGH" }), null);
  assert.equal(parseQuizParams({ goal: "MASS" }), null);
  assert.equal(parseQuizParams({}), null);
});

test("parseQuizParams normaliza valores repetidos o inválidos", () => {
  const parsed = parseQuizParams({ goal: ["CUT", "MASS"], frequency: "LOW", months: "-4", budget: "abc", structured: "true", safety: "false" });
  assert.deepEqual(parsed, { goal: "CUT", frequency: "LOW", trainingMonths: 0, structuredRoutine: true, budget: 0, safetyRedFlag: false });
});

test("el Safety Gate corta antes de cualquier producto", () => {
  const profile = buildSmartProfile(input({ safetyRedFlag: true }));
  assert.equal(profile.safetyStatus, "REVIEW_REQUIRED");
  assert.equal(profile.protocol, undefined);
  assert.deepEqual(profile.suggested, []);
  assert.deepEqual(profile.optional, []);
  assert.deepEqual(profile.avoid, []);
  assert.equal(profile.decisions.length, 1);
});

test("el objetivo y el entrenamiento eligen el protocolo", () => {
  assert.equal(buildSmartProfile(input()).protocol?.id, "SMART_MUSCLE");
  assert.equal(buildSmartProfile(input({ frequency: "LOW", trainingMonths: 0, structuredRoutine: false })).protocol?.id, "SMART_START");
  assert.equal(buildSmartProfile(input({ goal: "CUT" })).protocol?.id, "SMART_CUT");
  assert.equal(buildSmartProfile(input({ goal: "LONGEVITY" })).protocol?.id, "SMART_40_PLUS");
});

test("el presupuesto mueve prioridades a 'más adelante', no cambia el protocolo", () => {
  const essential = buildSmartProfile(input({ budget: 300000 }));
  const full = buildSmartProfile(input({ budget: 800000 }));
  assert.equal(essential.protocol?.id, full.protocol?.id);
  assert.deepEqual(essential.suggested.map((item) => item.priority.key), ["CREATINE"]);
  assert.deepEqual(essential.later.map((item) => item.priority.key), ["PROTEIN_GAP", "EAA"]);
  assert.deepEqual(full.suggested.map((item) => item.priority.key), ["CREATINE", "PROTEIN_GAP"]);
  assert.deepEqual(full.optional.map((item) => item.priority.key), ["EAA"]);
  assert.deepEqual(full.later, []);
});

test("el perfil explica cada decisión que toma", () => {
  const profile = buildSmartProfile(input());
  assert.ok(profile.decisions.length >= profile.suggested.length + 2);
  for (const decision of profile.decisions) {
    assert.ok(decision.title.length > 0);
    assert.ok(decision.detail.length > 0);
  }
  // Mientras el catálogo no tenga datos confirmados, el perfil lo dice.
  assert.ok(profile.decisions.some((decision) => decision.title.includes("todavía no ves productos")));
});

test("el perfil trae lo que no recomendamos, con motivo", () => {
  const profile = buildSmartProfile(input());
  assert.ok(profile.avoid.length > 0);
  for (const item of profile.avoid) assert.ok(item.reason.length > 0);
});

test("el mensaje de WhatsApp no lleva respuestas de seguridad", () => {
  const message = buildSmartProfileMessageFor(input());
  assert.ok(message.includes("Smart Profile"));
  assert.ok(message.includes("Smart Muscle"));
  for (const forbidden of ["REVIEW_REQUIRED", "safety", "medicación", "embarazo", "SMART LEAD"]) {
    assert.ok(!message.includes(forbidden), `el mensaje no debería incluir "${forbidden}"`);
  }
});

test("con Safety Gate el mensaje solo pide una revisión humana", () => {
  const message = buildSmartProfileMessageFor(input({ safetyRedFlag: true }));
  assert.ok(message.includes("revisión"));
  assert.ok(!message.includes("Objetivo"));
});

function buildSmartProfileMessageFor(quizInput: QuizInput) {
  return buildProfileWhatsAppMessage(buildSmartProfile(quizInput));
}
