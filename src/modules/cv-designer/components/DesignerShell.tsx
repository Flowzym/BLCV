import React, { useEffect } from "react";
import { FabricCanvas } from "../canvas/FabricCanvas";
import { RightSidebar } from "./RightSidebar";

export const DesignerShell: React.FC = () => {
  // designer-hotkeys
  useEffect(()=>{
    const onKey = (e: KeyboardEvent)=>{
      try{
        const st: any = (useDesignerStore as any).getState();
        const isCmd = e.ctrlKey || e.metaKey;
        if (isCmd && e.key === '0') { e.preventDefault(); const el = document.getElementById('cv-canvas-wrapper'); if (el) { const r = el.getBoundingClientRect(); st.fitToScreen?.(r.width, r.height); } return; }
        if (isCmd && e.key === '1') { e.preventDefault(); st.zoom100?.(); return; }
        if (e.key === '+' || e.key === '=') { e.preventDefault(); st.zoomIn?.(); return; }
        if (e.key === '-' || e.key === '_') { e.preventDefault(); st.zoomOut?.(); return; }
      }catch(_){}
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex h-full">
      <div className="relative flex-1 flex items-center justify-center bg-gray-100">
        <FabricCanvas />
      </div>
      <RightSidebar />
    </div>
  );
};
