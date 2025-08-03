import { LayoutElement } from "../types/section";

/**
 * Gibt ein Default-Template zurück, falls keine Sections vorhanden sind
 */
export function getDefaultTemplate(name: string): LayoutElement[] {
  switch (name) {
    case "classic":
      return [
        {
          id: "profile",
          type: "profil",
          title: "Profil",
          content: "Kurzbeschreibung...",
          style: {},
          position: { x: 0, y: 0 },
        },
        {
          id: "experience",
          type: "erfahrung",
          title: "Berufserfahrung",
          content: "",
          style: {},
          position: { x: 0, y: 100 },
        },
        {
          id: "education",
          type: "ausbildung",
          title: "Ausbildung",
          content: "",
          style: {},
          position: { x: 0, y: 200 },
        },
      ];

    case "modern":
      return [
        {
          id: "profile",
          type: "profil",
          title: "Über mich",
          content: "Selbstbeschreibung...",
          style: { fontSize: 14, fontWeight: "bold" },
          position: { x: 0, y: 0 },
        },
        {
          id: "skills",
          type: "kenntnisse",
          title: "Fähigkeiten",
          content: "",
          style: {},
          position: { x: 200, y: 0 },
        },
        {
          id: "experience",
          type: "erfahrung",
          title: "Erfahrung",
          content: "",
          style: {},
          position: { x: 0, y: 150 },
        },
      ];

    default:
      return [];
  }
}
