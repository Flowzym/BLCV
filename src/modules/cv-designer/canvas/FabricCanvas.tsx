import React, { useEffect, useRef } from "react";
import fabric from '@/lib/fabric-shim';
import { useDesignerStore } from "../store/designerStore";
import { CanvasToolbar } from "../components/CanvasToolbar";
import { useUndoRedoHotkeys } from "../hooks/useUndoRedoHotkeys";
import { loadFabricImage } from "./imageLoader";

function throttle<T extends (...args:any[])=>void>(fn:T, ms:number):T{
  let last = 0; let t:any=null;
  return function(this:any, ...args:any[]){
    const now = Date.now();
    if(now-last>=ms){ last=now; fn.apply(this,args); }
    else { clearTimeout(t); t=setTimeout(()=>{ last=Date.now(); fn.apply(this,args); }, ms-(now-last)); }
  } as T;
}

export const FabricCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { elements, updateFrame, select } = useDesignerStore();
  useUndoRedoHotkeys();

  useEffect(() => {
    if (!canvasRef.current) return;
    const fabricCanvas = new fabric.Canvas(canvasRef.current, { backgroundColor: '#ffffff',
      width: 595,
      height: 842,
      selection: true,
    });

    // Snap grid
    const grid = 8;
    const handleMove = throttle((e: fabric.IEvent<Event>) => {
      const obj = e.target as fabric.Object | undefined;
      if (!obj) return;
      obj.set({
        left: Math.round((obj.left || 0) / grid) * grid,
        top: Math.round((obj.top || 0) / grid) * grid,
      });
    }, 16);

    const handleModified = throttle((e: fabric.IEvent<Event>) => {
      const obj = e.target as any;
      if (!obj) return;
      const id = obj?.data?.id;
      if (!id) return;
      const width = obj.getScaledWidth ? obj.getScaledWidth() : obj.width;
      const height = obj.getScaledHeight ? obj.getScaledHeight() : obj.height;
      updateFrame(id, {
        x: obj.left || 0,
        y: obj.top || 0,
        width: width || 0,
        height: height || 0
      });
    }, 200);

    fabricCanvas.on("object:moving", handleMove);
    fabricCanvas.on("object:scaling", handleModified);
    fabricCanvas.on("object:rotating", handleModified);
    fabricCanvas.on("object:modified", handleModified);

    fabricCanvas.on("selection:created", (e) => {
      const obj = e.target as any;
      select(obj?.data?.id ?? null);
    });
    fabricCanvas.on("selection:updated", (e) => {
      const obj = e.target as any;
      select(obj?.data?.id ?? null);
    });

    // Render existing elements
    elements.forEach((el) => {
      if (el.kind === "section") {
        const textbox = new fabric.Textbox((el as any).content, {
          left: el.frame.x,
          top: el.frame.y,
          width: el.frame.width,
          height: el.frame.height,
          fontSize: 14,
          fill: "#111827",
          hasControls: true,
        });
        textbox.set("data", { id: el.id });
        fabricCanvas.add(textbox);
      
      } else if (el.kind === "photo") {
        const src = (el as any).src;
        if (typeof src === "string" && src.trim().length > 0) {
          loadFabricImage(src, fabric)
            .then((img) => {
              if (!img) return;
              img.set({
                left: el.frame.x,
                top: el.frame.y,
                scaleX: el.frame.width / ((img.width as number) || 1),
                scaleY: el.frame.height / ((img.height as number) || 1),
              });
              (img as any).set("data", { id: el.id });
              fabricCanvas.add(img);
            })
            .catch((e) => {
              console.warn("[FabricCanvas] image load failed:", e);
              // fallback: simple gray rect
              const rect = new fabric.Rect({ left: el.frame.x, top: el.frame.y, width: el.frame.width, height: el.frame.height, fill: "#eee", stroke: "#f59e0b" });
              (rect as any).set("data", { id: el.id });
              fabricCanvas.add(rect);
            });
        } else {
          // invalid src: draw placeholder
          const rect = new fabric.Rect({ left: el.frame.x, top: el.frame.y, width: el.frame.width, height: el.frame.height, fill: "#eee", stroke: "#f59e0b" });
          (rect as any).set("data", { id: el.id });
          fabricCanvas.add(rect);
        }
}
    });

    return () => {
      fabricCanvas.dispose();
    };
  }, []); // mount once, state writes come from events

  return (
    <div className="relative">
      <CanvasToolbar />
      <canvas ref={canvasRef} style={{ border: "1px solid #e5e7eb" }} />
    </div>
  );
};
