import { useEffect } from "react";
import { useDesignerStore } from "../store/designerStore";

export function useUndoRedoHotkeys(){
  const undo = useDesignerStore(s=>s.undo);
  const redo = useDesignerStore(s=>s.redo);

  useEffect(()=>{
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if(!mod) return;

      if(e.key.toLowerCase()==="z" && !e.shiftKey){
        e.preventDefault();
        undo();
      } else if ((e.key.toLowerCase()==="z" && e.shiftKey) || e.key.toLowerCase()==="y"){
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return ()=>window.removeEventListener("keydown", onKey);
  }, [undo, redo]);
}
