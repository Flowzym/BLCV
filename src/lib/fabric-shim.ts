// Normalisiert den Fabric-Export (ESM/CJS, Vite) via Top-Level Await
// Nutzung: import fabric from '@/lib/fabric-shim';
let _fabric: any;
try {
  const mod: any = await import('fabric');
  _fabric = (mod?.fabric ?? mod?.default ?? mod);
} catch (e) {
  console.error('[fabric-shim] Konnte Modul "fabric" nicht laden:', e);
  _fabric = {};
}
const fabric = _fabric as any;
export default fabric;
export { fabric };
