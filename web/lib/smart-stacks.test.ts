import assert from "node:assert/strict";
import test from "node:test";
import { getSmartStack, resolvePriorityProducts, resolveStackProducts } from "./smart-stacks.ts";

test("Smart Muscle mantiene prioridades semánticas separadas de los productos", () => {
  const stack = getSmartStack("SMART_MUSCLE");
  assert.ok(stack);
  assert.deepEqual(stack.priorities.filter((item) => item.required).map((item) => item.key), ["CREATINE", "PROTEIN_GAP"]);
  assert.ok(resolveStackProducts(stack).every((product) => product.active));
});

test("el resolver no inventa SKUs: creatina resuelve solo productos de categoría creatina", () => {
  const resolved = resolvePriorityProducts("CREATINE", "PRIMARY");
  assert.equal(resolved.length, 0);
});
