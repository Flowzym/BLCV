// 📄 src/modules/cv-designer/components/ExportButtons.tsx
import React from "react";
import { LayoutElement } from "../../types/section";
import { StyleConfig } from "../../../types/cv-designer";
import { FileDown, FileType } from "lucide-react";
import { exportLayoutDocx } from "../export/exportLayoutDocx";
import { exportLayoutPdf } from "../export/exportLayoutPdf";

interface Props {
  layout: LayoutElement[];
  style: StyleConfig;
}

export const ExportButtons: React.FC<Props> = ({ layout, style }) => {
  const handleDocx = () => exportLayoutDocx(layout, style);
  const handlePdf = () => exportLayoutPdf(layout, style);

  return (
    <div className="flex gap-2">
      <button className="btn btn-sm bg-blue-600 text-white rounded-md px-3 py-1" onClick={handleDocx}>
        <FileType className="w-4 h-4 mr-1" /> DOCX
      </button>
      <button className="btn btn-sm bg-red-600 text-white rounded-md px-3 py-1" onClick={handlePdf}>
        <FileDown className="w-4 h-4 mr-1" /> PDF
      </button>
    </div>
  );
};
