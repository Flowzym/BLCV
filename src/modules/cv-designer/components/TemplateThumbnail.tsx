import React from "react";
import { LayoutElement } from "../types/section";
import { StyleConfig } from "../../../types/cv-designer";
import { A4_WIDTH, A4_HEIGHT } from "../services/layoutRenderer";

interface TemplateThumbnailProps {
  name: string;
  layout: LayoutElement[];
  styleConfig: StyleConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
  name,
  layout,
  styleConfig,
  isSelected,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`w-full rounded-md border ${
        isSelected ? "border-blue-500 shadow-md" : "border-gray-300"
      } cursor-pointer overflow-hidden`}
      style={{ height: 160, background: "#fff" }}
    >
      {/* Mini Preview Canvas */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          backgroundColor: "#fafafa",
        }}
      >
        {layout.map((el) => {
          const left = (el.x / A4_WIDTH) * 100;
          const top = (el.y / A4_HEIGHT) * 100;
          const width = (el.width / A4_WIDTH) * 100;
          const height = ((el.height || 100) / A4_HEIGHT) * 100;

          return (
            <div
              key={el.id}
              style={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
                backgroundColor: styleConfig.accentColor || "#3b82f6",
                opacity: 0.2,
                border: "1px solid #d1d5db",
                borderRadius: "2px",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TemplateThumbnail;
