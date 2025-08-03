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

const aspectRatio = A4_HEIGHT / A4_WIDTH; // A4 Verhältnis ≈ 1.414

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
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: `${aspectRatio * 100}%`, // Höhe nach A4-Verhältnis
          backgroundColor: "#fff",
        }}
      >
        {/* Layout Elemente */}
        {layout.map((el) => {
          const left = (el.x / A4_WIDTH) * 100;
          const top = (el.y / A4_HEIGHT) * 100;
          const width = (el.width / A4_WIDTH) * 100;
          const height = ((el.height || 100) / A4_HEIGHT) * 100;

          let bg = "#d1d5db"; // Standard grau
          if (el.type === "photo") bg = "#9ca3af"; // Foto = dunkler Kreis
          if (["kenntnisse", "skills", "softskills"].includes(el.type))
            bg = "#93c5fd"; // Skills = blau
          if (["profil", "personal"].includes(el.type))
            bg = "#f3f4f6"; // Header/Profil = hellgrau
          if (["erfahrung", "experience"].includes(el.type))
            bg = "#cbd5e1"; // Erfahrung = etwas dunkler

          return (
            <div
              key={el.id}
              style={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
                backgroundColor: bg,
                border: "1px solid #e5e7eb",
                borderRadius: el.type === "photo" ? "50%" : "2px",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TemplateThumbnail;
