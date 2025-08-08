// Normalisiert den Fabric-Export (ESM/CJS, Vite)
// Nutzung: import fabric from '@/lib/fabric-shim';
import * as FabricNS from '@/lib/fabric-shim';

const mod: any = FabricNS as any;
// Manche Bundles exportieren "fabric" named, andere als default/namespace
const fabric = (mod.fabric ?? (mod.default ?? mod)) as any;

export default fabric;
export { fabric };
