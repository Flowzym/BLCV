import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(url, anon);

export interface TemplateMeta {
  id: string;
  name: string;
  tokens: Record<string, any>;
}

export async function fetchTemplates(){
  const {data, error} = await supabase.from("templates").select("*");
  if(error) throw error;
  return data as TemplateMeta[];
}

export async function saveTemplate(meta: TemplateMeta){
  const {error} = await supabase.from("templates").upsert(meta,{onConflict:"id"});
  if(error) throw error;
}
