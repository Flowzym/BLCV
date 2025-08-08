import { useDesignerStore } from './designerStore';
(function(){ const api:any=useDesignerStore as any; api.setState({zoom:1, fitMode:false}); })();
;(useDesignerStore as any).setState((s:any)=>{
  const def = 28.35; // ~10mm
  const cur = s?.exportMargins || { top: def, right: def, bottom: def, left: def };
  const legacy = typeof s?.exportMargin === 'number' ? s.exportMargin : undefined;
  const merged = legacy ? { top: legacy, right: legacy, bottom: legacy, left: legacy } : cur;
  return {
    exportMargins: merged,
    setExportMargins: (partial: Partial<{top:number;right:number;bottom:number;left:number}>) => {
      const st = (useDesignerStore as any).getState();
      const m = { ...(st.exportMargins||merged) };
      ['top','right','bottom','left'].forEach((k:any)=>{
        if (k in (partial||{})) {
          const v:any = (partial as any)[k];
          m[k] = Math.max(0, Number(v)||0);
        }
      });
      (useDesignerStore as any).setState({ exportMargins: m });
    }
  };
}, false);
