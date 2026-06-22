// ============================================================================
// Resolución de la ruta del sidecar SMTC (espejo-smtc.exe).
//
// Prioridad:
//   1. SMTC_SIDECAR (env) — si el usuario la fuerza, se respeta; SmtcReader.start()
//      valida que exista y, si no, SMTC queda deshabilitado.
//   2. Autodetección: <repoRoot>/native/smtc/dist/espejo-smtc.exe para cada raíz
//      candidata (cwd, app.getAppPath(), __dirname relativo al repo, recursos
//      empaquetados). La primera que exista gana.
//   3. '' → SMTC deshabilitado (AudD sigue como fallback).
//
// Pura respecto a la lista de raíces y al chequeo de existencia (inyectable para
// tests), así se puede testear sin tocar el disco real.
// ============================================================================

import * as path from 'path';
import * as fs from 'fs';

const EXE_NAME = 'espejo-smtc.exe';
/** Subruta del sidecar compilado bajo una raíz del repo. */
export const SMTC_DIST_SUBPATH = path.join('native', 'smtc', 'dist');

/** Devuelve el path al sidecar bajo una raíz dada. */
export function smtcSidecarPath(repoRoot: string): string {
  return path.join(repoRoot, SMTC_DIST_SUBPATH, EXE_NAME);
}

/**
 * Resuelve el ejecutable del sidecar SMTC.
 *
 * - Si `envValue` está definido (SMTC_SIDECAR), se devuelve tal cual (ruta
 *   explícita del usuario; start() valida existencia).
 * - Si no, recorre `roots` en orden y devuelve la primera ruta existente.
 * - Si ninguna existe, devuelve '' (SMTC fuera, fallback a AudD).
 */
export function resolveSmtcSidecar(
  envValue: string | undefined,
  roots: string[],
  existsFn: (p: string) => boolean = defaultExists,
): string {
  const env = envValue?.trim();
  if (env) return env;
  for (const root of roots) {
    const p = smtcSidecarPath(root);
    if (existsFn(p)) return p;
  }
  return '';
}

const defaultExists: (p: string) => boolean = (p) => fs.existsSync(p);