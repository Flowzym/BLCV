import { useEffect, useRef } from "react";
import { useLebenslauf } from "@/components/LebenslaufContext";
import { useDesignerStore, PartKey, SectionElement } from "../store/designerStore";
import { mapLebenslaufToSectionParts } from "./mapLebenslaufToSectionParts";
import { Templates, buildSectionFromTemplate } from "../templates";

const PAGE_W = 595;
const PAGE_H = 842;

type Margins = { top:number; right:number; bottom:number; left:number };

function computeFrameForRow(col:"left"|"right", rowIndex:number, margins:Margins, width:number, height:number){
  const innerW = PAGE_W - margins.left - margins.right;
  const leftW  = Math.round(innerW * 0.62);
  const rightW = innerW - leftW - 8;
  const x = col==="left" ? margins.left : margins.left + leftW + 8;
  const y = margins.top + 100 + rowIndex*(height+24);
  const w = col==="left" ? leftW : rightW;
  return { x, y, width: Math.min(w,width), height };
}
const sectionKey = (e:SectionElement)=> e.meta?.source?.key;

export function useLiveSyncFromGenerator(debounceMs=200){
  const ll      = useLebenslauf();
  const margins = useDesignerStore(s=>s.margins);
  const timer   = useRef<number|null>(null);

  useEffect(()=>{
    if(!ll) return;
    if(timer.current) window.clearTimeout(timer.current);

    timer.current = window.setTimeout(()=>{
      const mapped = mapLebenslaufToSectionParts(ll);

      const { elements, addSectionFromTemplate, updatePartText, setInitialElements } =
        useDesignerStore.getState();

      const existingByKey = new Map<string,SectionElement>();
      for(const e of elements){
        if(e.kind!=="section") continue;
        const k = sectionKey(e);
        if(k) existingByKey.set(k, e);
      }

      type Job = {
        tpl: typeof Templates[keyof typeof Templates];
        frame: {x:number;y:number;width:number;height:number};
        texts: Partial<Record<PartKey,string>>;
        meta: SectionElement["meta"];
        title?: string;
      };
      const adds: Job[] = [];

      let expRow=0, eduRow=0, contactPlaced=false;

      for(const m of mapped){
        const texts = Object.fromEntries(m.parts.map(p=>[p.key, p.text])) as Partial<Record<PartKey,string>>;
        const prev  = m.sourceKey ? existingByKey.get(m.sourceKey) : undefined;

        if(prev){
          // vorhandene, ungelockte Parts nachziehen (auch wenn bisher leer)
          for(const p of m.parts){
            const local = prev.parts.find(x=>x.key===p.key);
            if(!local || local.lockText) continue;
            if((local.text??"") !== (p.text??"")) updatePartText(prev.id, p.key, p.text);
          }
          continue;
        }

        if(m.group==="kontakt" && !contactPlaced){
          const tpl = Templates.contactRight;
          const frame = computeFrameForRow("right", 0, margins, tpl.baseSize.width, tpl.baseSize.height);
          const meta  = { source:{ key:m.sourceKey, group:m.group, template:tpl.id } };
          adds.push({ tpl, frame, texts, meta, title:m.title });
          contactPlaced = true;
          continue;
        }
        if(m.group==="erfahrung"){
          const tpl = Templates.experienceLeft;
          const frame = computeFrameForRow("left", expRow++, margins, tpl.baseSize.width, tpl.baseSize.height);
          const meta  = { source:{ key:m.sourceKey, group:m.group, template:tpl.id } };
          adds.push({ tpl, frame, texts, meta, title:m.title });
          continue;
        }
        if(m.group==="ausbildung"){
          const tpl = Templates.educationLeft;
          const frame = computeFrameForRow("left", eduRow++, margins, tpl.baseSize.width, tpl.baseSize.height);
          const meta  = { source:{ key:m.sourceKey, group:m.group, template:tpl.id } };
          adds.push({ tpl, frame, texts, meta, title:m.title });
          continue;
        }
      }

      if(!elements.length && adds.length){
        const secs = adds.map(a=> buildSectionFromTemplate(a.tpl, a.frame, a.texts, a.meta, a.title));
        setInitialElements(secs);
      }else{
        for(const a of adds){
          const sec = buildSectionFromTemplate(a.tpl, a.frame, a.texts, a.meta, a.title);
          addSectionFromTemplate({
            group: sec.group, frame: sec.frame, parts: sec.parts, meta: sec.meta, title: sec.title
          });
        }
      }
    }, debounceMs) as unknown as number;

    return ()=>{ if(timer.current) window.clearTimeout(timer.current); };
  }, [
    margins.top, margins.right, margins.bottom, margins.left,
    ll?.personalData, ll?.berufserfahrung, ll?.workExperience, ll?.experience, ll?.ausbildung, ll?.education
  ]);
}
