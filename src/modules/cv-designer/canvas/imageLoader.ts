import type fabricNS from '@/lib/fabric-shim';

export async function loadFabricImage(src: string, fabric: typeof fabricNS): Promise<any | null> {
  return new Promise((resolve, reject) => {
    try {
      const fromUrl = (s: string) => {
        const options: any = {};
        if (/^https?:\/\//i.test(s)) options.crossOrigin = 'anonymous';
        (fabric.Image as any).fromURL(s, (img: any) => resolve(img), options);
      };
      if (typeof src === 'string' && src.trim().length > 0) {
        fromUrl(src);
      } else {
        resolve(null);
      }
    } catch (e) {
      reject(e);
    }
  });
}
