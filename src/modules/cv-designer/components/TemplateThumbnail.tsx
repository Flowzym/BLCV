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

const aspectRatio = A4_HEIGHT / A4_WIDTH; // ≈ 1.414

const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
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
      } cursor-pointer overflow-hidden bg-white`}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: `${aspectRatio * 100}%`,
          backgroundColor: "#fff",
          maxHeight: "160px", // Miniaturhöhe begrenzen
        }}
      >
        {layout.map((el) => {
          const left = (el.x / A4_WIDTH) * 100;
          const top = (el.y / A4_HEIGHT) * 100;
          const width = (el.width / A4_WIDTH) * 100;
          const height = ((el.height || 100) / A4_HEIGHT) * 100;

          // Farben & Darstellung je nach Typ
          if (el.type === "photo") {
            return (
              <div
                key={el.id}
                style={{
                  position: "absolute",
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                  borderRadius: "50%",
                  backgroundColor: "#9ca3af",
                  border: "2px solid #e5e7eb",
                }}
              />
            );
          }

          return (
            <div
              key={el.id}
              style={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "2px",
                padding: "1px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                gap: "1px",
              }}
            >
              {/* Überschrift-Balken */}
              <div
                style={{
                  height: "10%",
                  backgroundColor: "#d1d5db",
                  borderRadius: "1px",
                  marginBottom: "1px",
                }}
              />
              {/* Platzhalter-Linien */}
              <div style={{ height: "6%", backgroundColor: "#e5e7eb" }} />
              <div
                style={{
                  height: "6%",
                  backgroundColor: "#e5e7eb",
                  width: "80%",
                }}
              />
              <div
                style={{
                  height: "6%",
                  backgroundColor: "#e5e7eb",
                  width: "60%",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateThumbnail;
