import { useEffect } from "react";
import type { DeltaStatic } from "quill";
import { useDocumentStore } from "@/store/DocumentStore";

export function QuillToSection({delta}:{delta: DeltaStatic}){
  const setCover = useDocumentStore(s=>s.setCoverLetter);
  useEffect(()=>{
    const blocks = delta.ops.filter((o:any)=>typeof o.insert==="string")
                            .map((op:any,i:number)=>({id:i.toString(), text: op.insert.trim()}));
    setCover(blocks);
  },[delta,setCover]);
  return null;
}
