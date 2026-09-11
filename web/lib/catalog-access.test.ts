import assert from "node:assert/strict";
import test from "node:test";
import {
  catalogSessionMaxAge, createCatalogSession, hasCatalogSession,
  isCatalogAccessConfigured, matchesCatalogSecret,
} from "./catalog-access.ts";

const secret = "test-only-secret-at-least-24-characters";
const now = Date.UTC(2026, 8, 11, 12);

test("el informe queda cerrado sin activación explícita y clave interna suficiente", () => {
  assert.equal(isCatalogAccessConfigured(undefined, secret), false);
  assert.equal(isCatalogAccessConfigured("false", secret), false);
  assert.equal(isCatalogAccessConfigured("true", "short"), false);
  assert.equal(isCatalogAccessConfigured("true", secret), true);
  assert.equal(matchesCatalogSecret(secret, secret), true);
  assert.equal(matchesCatalogSecret("wrong", secret), false);
  assert.equal(matchesCatalogSecret(null, secret), false);
});

test("la sesión no expone la clave, caduca y rechaza modificaciones o rotación de clave", () => {
  const session = createCatalogSession(secret, now);
  assert.equal(session.includes(secret), false);
  assert.equal(hasCatalogSession(session, secret, now), true);
  assert.equal(hasCatalogSession(session, secret, now + catalogSessionMaxAge * 1000), false);
  assert.equal(hasCatalogSession(session, `${secret}-rotated`, now), false);
  assert.equal(hasCatalogSession(session.replace(/.$/, session.endsWith("0") ? "1" : "0"), secret, now), false);
  assert.equal(hasCatalogSession(session, secret, now - 1000), false);
  assert.equal(hasCatalogSession("malformed", secret, now), false);
  assert.equal(hasCatalogSession(undefined, secret, now), false);
});
