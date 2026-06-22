import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { resolveSmtcSidecar, smtcSidecarPath, SMTC_DIST_SUBPATH } from '../electron/services/smtc/smtcPath';

describe('smtcPath', () => {
  it('smtcSidecarPath une raíz + native/smtc/dist/espejo-smtc.exe', () => {
    expect(smtcSidecarPath('/repo')).toBe(path.join('/repo', SMTC_DIST_SUBPATH, 'espejo-smtc.exe'));
  });

  it('respeta SMTC_SIDECAR explícita aunque no exista', () => {
    const exists = (p: string) => p === '/repo/native/smtc/dist/espejo-smtc.exe';
    expect(resolveSmtcSidecar('/custom/espejo-smtc.exe', ['/repo'], exists)).toBe('/custom/espejo-smtc.exe');
  });

  it('trim de la env: espacios → respeta la ruta limpia', () => {
    expect(resolveSmtcSidecar('  /forced.exe  ', ['/repo'], () => false)).toBe('/forced.exe');
  });

  it('autodetecta la primera raíz con sidecar compilado', () => {
    const target = smtcSidecarPath('/repo');
    const exists = (p: string) => p === target;
    expect(resolveSmtcSidecar(undefined, ['/nope1', '/repo', '/nope2'], exists)).toBe(target);
  });

  it('devuelve "" si ninguna raíz tiene el sidecar (SMTC fuera, fallback AudD)', () => {
    expect(resolveSmtcSidecar(undefined, ['/a', '/b'], () => false)).toBe('');
  });

  it('env vacía → cae a autodetección', () => {
    const target = smtcSidecarPath('/repo');
    expect(resolveSmtcSidecar('', ['/repo'], (p) => p === target)).toBe(target);
    expect(resolveSmtcSidecar(undefined, ['/repo'], (p) => p === target)).toBe(target);
  });
});