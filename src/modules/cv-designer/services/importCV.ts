import { CanvasElement } from "../store/designerStore";
import { v4 as uuid } from "uuid";

export function importCV(sections: any[]): CanvasElement[] {
  // naive mapping for MVP: each section becomes a textbox
  let y = 24;
  return sections.map((s) => {
    const el: CanvasElement = {
      kind: "section",
      id: uuid(),
      frame: { x: 24, y, width: 547, height: 100 },
      content: s.title + "\n" + s.content,
    };
    y += 120;
    return el;
  });
}
