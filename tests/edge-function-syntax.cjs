const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const EDGE_FN = path.join(ROOT, 'supabase', 'edge-functions', 'seguimiento-25-dias', 'index.ts');
const TSC = path.join(ROOT, 'web', 'node_modules', 'typescript', 'bin', 'tsc');

test('seguimiento-25-dias edge function parses without syntax errors', () => {
  assert.ok(fs.existsSync(EDGE_FN), 'falta la edge function');
  assert.ok(fs.existsSync(TSC), 'falta typescript en web/node_modules');
  let output = '';
  try {
    output = execFileSync(process.execPath, [
      TSC, '--noEmit', '--noResolve', '--skipLibCheck',
      '--target', 'es2022', '--module', 'esnext', '--strict', EDGE_FN,
    ], { encoding: 'utf8' });
  } catch (err) {
    output = String(err.stdout || '') + String(err.stderr || '');
  }
  // Los unicos errores aceptables son ambientales: globals de Deno (TS2304),
  // imports remotos sin resolver (TS2792) y parametros implicitos sin tipos
  // de la API de Deno (TS7006). Cualquier TS1xxx es un error de sintaxis.
  const syntaxErrors = output.split('\n').filter((line) => /error TS1\d+/.test(line));
  assert.deepEqual(syntaxErrors, [], 'errores de sintaxis en la edge function:\n' + syntaxErrors.join('\n'));
});