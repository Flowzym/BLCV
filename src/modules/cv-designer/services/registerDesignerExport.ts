import { registerExportStrategy, ExportContext, ExportHooks } from "@/services/exportService";


import { useDesignerStore } from "../store/designerStore";

const designerStrategy = {
  id: "designer",
  supports: (type: "pdf"|"docx") => type==="pdf" || type==="docx",
  async render(ctx: ExportContext, type: "pdf"|"docx", hooks?: ExportHooks): Promise<Blob> {
    const tokens = useDesignerStore.getState().tokens || ctx.style;
    hooks?.onProgress?.(25);
    if (type === "pdf") {
      const blob = await exportPdf(ctx.sections as any, tokens);
      hooks?.onProgress?.(90);
      return blob;
    } else {
      const blob = await exportDocx(ctx.sections as any, tokens);
      hooks?.onProgress?.(90);
      return blob;
    }
  }
};

registerExportStrategy(designerStrategy as any);
