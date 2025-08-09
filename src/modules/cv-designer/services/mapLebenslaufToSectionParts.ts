import type { GroupKey, PartKey } from "../store/designerStore";

type Mapped = {
  group: GroupKey;
  sourceKey: string;
  title?: string;
  parts: { key: PartKey; text: string }[];
};

const pick = (obj: any, keys: string[], fallback: any = ""): any => {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== "") return obj[k];
  }
  return fallback;
};

const toBullets = (v: any): string => {
  if (Array.isArray(v)) return v.filter(Boolean).map((s) => `• ${String(s)}`).join("\n");
  if (typeof v === "string") return v.split(/\r?\n/).filter(Boolean).map((s) => `• ${s}`).join("\n");
  return "";
};

const ym = (y?: any, m?: any) =>
  y ? `${String(y)}-${String(m ?? 1).padStart(2, "0")}` : "";

const range = (s?: string, e?: string) =>
  s && e ? `${s} — ${e}` : s ? `${s} — heute` : e || "";

export function mapLebenslaufToSectionParts(ll: any): Mapped[] {
  const out: Mapped[] = [];

  // ---- Kontakt
  const pd = ll?.personalData ?? ll?.person ?? {};
  const kontaktLines = [
    pick(pd, ["email", "mail"]),
    pick(pd, ["phone", "telefon"]),
    [pick(pd, ["street"]), pick(pd, ["zip", "plz"]), pick(pd, ["city", "ort"])].filter(Boolean).join(" "),
  ].filter(Boolean);
  if (kontaktLines.length) {
    out.push({
      group: "kontakt",
      sourceKey: "contact:main",
      title: "Kontakt",
      parts: [
        { key: "titel", text: "Kontakt" },
        { key: "kontakt", text: kontaktLines.join("\n") },
      ],
    });
  }

  // ---- Erfahrung
  const erf = ll?.berufserfahrung ?? ll?.workExperience ?? ll?.experience ?? [];
  erf.forEach((item: any, idx: number) => {
    const start = pick(item, ["startDate"]) || ym(pick(item, ["startYear","fromYear"]), pick(item, ["startMonth","fromMonth"]));
    const end   = pick(item, ["endDate"])   || ym(pick(item, ["endYear","toYear"]),   pick(item, ["endMonth","toMonth"]));
    const zeitraum = range(start, end);
    const unternehmen = pick(item, ["company","unternehmen","firma"]);
    const position    = pick(item, ["position","title","rolle"]);
    const bullets     = toBullets(pick(item, ["tasks","aufgaben","description","duties","bullets","punkte"]));

    out.push({
      group: "erfahrung",
      sourceKey: `experience:${item?.id ?? idx}`,
      title: "Berufserfahrung",
      parts: [
        { key: "titel",        text: position || unternehmen || "" },
        { key: "zeitraum",     text: zeitraum },
        { key: "unternehmen",  text: unternehmen },
        { key: "position",     text: position },
        { key: "taetigkeiten", text: bullets },
      ],
    });
  });

  // ---- Ausbildung
  const edu = ll?.ausbildung ?? ll?.education ?? [];
  edu.forEach((item: any, idx: number) => {
    const start = pick(item, ["startDate"]) || ym(pick(item, ["startYear","fromYear"]), pick(item, ["startMonth","fromMonth"]));
    const end   = pick(item, ["endDate"])   || ym(pick(item, ["endYear","toYear"]),   pick(item, ["endMonth","toMonth"]));
    const zeitraum = range(start, end);
    const inst  = pick(item, ["institution","schule","hochschule","university"]);
    const degree= pick(item, ["degree","abschluss"]);
    out.push({
      group: "ausbildung",
      sourceKey: `education:${item?.id ?? idx}`,
      title: "Ausbildung",
      parts: [
        { key: "titel",       text: degree || inst || "" },
        { key: "zeitraum",    text: zeitraum },
        { key: "unternehmen", text: inst },
        { key: "abschluss",   text: degree },
      ],
    });
  });

  return out;
}
