import React from "react";
import { useDesignerStore } from "../store/designerStore";

export const CanvasToolbar: React.FC = () => {
  const undo = useDesignerStore(s=>s.undo);
  const redo = useDesignerStore(s=>s.redo);
  const canUndo = useDesignerStore(s=>s.canUndo);
  const canRedo = useDesignerStore(s=>s.canRedo);

  return (
    <div className="absolute top-2 left-2 z-10 flex gap-2">
      <button
        className="border rounded px-2 py-1 bg-white text-sm"
        onClick={undo}
        disabled={!canUndo}
        title="Undo (Ctrl/Cmd+Z)"
      >↶</button>
      <button
        className="border rounded px-2 py-1 bg-white text-sm"
        onClick={redo}
        disabled={!canRedo}
        title="Redo (Ctrl/Cmd+Shift+Z)"
      >↷</button>
    </div>
  );
};
