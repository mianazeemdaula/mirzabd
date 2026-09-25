// lib/category-visuals.ts
// One place that decides the icon + color family for a category, so category tiles,
// product covers and filters all look consistent. Colors stay close to the brand blues,
// with a few warm accents so a long catalog doesn't look monotone.
import {
  Backpack,
  BookOpen,
  Briefcase,
  FileText,
  Feather,
  Gift,
  GlassWater,
  GraduationCap,
  Landmark,
  Library,
  Moon,
  NotebookPen,
  Palette,
  PencilRuler,
  ScrollText,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

export interface CategoryTone {
  /** Cover gradient (from → to) */
  from: string;
  to: string;
  /** Soft tile background + icon color on white surfaces */
  soft: string;
  text: string;
}

export const TONES = {
  royal: { from: "#1B5FB5", to: "#0E2A6B", soft: "#E6EFFB", text: "#1B5FB5" },
  azure: { from: "#0A9BDB", to: "#0B5F9E", soft: "#E1F4FC", text: "#0879B0" },
  teal: { from: "#0F9D8A", to: "#0B5E62", soft: "#E0F5F1", text: "#0B7F70" },
  indigo: { from: "#4F46E5", to: "#2A2380", soft: "#ECEBFD", text: "#4338CA" },
  emerald: { from: "#16A34A", to: "#0E5A34", soft: "#E3F6EA", text: "#15803D" },
  amber: { from: "#F5A524", to: "#B45309", soft: "#FEF3DC", text: "#B45309" },
  rose: { from: "#E0475C", to: "#8E1D3A", soft: "#FDE8EB", text: "#BE2F45" },
  violet: { from: "#8B5CF6", to: "#4C1D95", soft: "#F1EBFE", text: "#6D28D9" },
} satisfies Record<string, CategoryTone>;

type ToneName = keyof typeof TONES;

const RULES: { match: string[]; icon: LucideIcon; tone: ToneName }[] = [
  { match: ["quran", "tafseer"], icon: BookOpen, tone: "emerald" },
  { match: ["hadith", "islamic book"], icon: ScrollText, tone: "teal" },
  { match: ["islamic", "deen"], icon: Moon, tone: "emerald" },
  { match: ["paper"], icon: FileText, tone: "indigo" },
  { match: ["css", "pms"], icon: Landmark, tone: "royal" },
  { match: ["entry test", "job"], icon: Target, tone: "rose" },
  { match: ["register", "account book", "notebook"], icon: NotebookPen, tone: "azure" },
  { match: ["bag"], icon: Backpack, tone: "indigo" },
  { match: ["school", "college", "textbook", "class"], icon: GraduationCap, tone: "royal" },
  { match: ["novel", "fiction", "poetry"], icon: Feather, tone: "violet" },
  { match: ["literature", "general book"], icon: Library, tone: "royal" },
  { match: ["lunch", "bottle"], icon: GlassWater, tone: "azure" },
  { match: ["gift", "play", "toy", "fun"], icon: Gift, tone: "rose" },
  { match: ["art"], icon: Palette, tone: "amber" },
  { match: ["office"], icon: Briefcase, tone: "royal" },
  { match: ["stationery", "pen", "pencil"], icon: PencilRuler, tone: "amber" },
];

const FALLBACK_TONES: ToneName[] = ["royal", "azure", "teal", "indigo", "violet", "amber"];

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getCategoryVisual(name = "", slug = ""): { icon: LucideIcon; tone: CategoryTone } {
  const key = `${name} ${slug.replace(/-/g, " ")}`.toLowerCase();
  const rule = RULES.find((r) => r.match.some((m) => key.includes(m)));
  if (rule) return { icon: rule.icon, tone: TONES[rule.tone] };
  if (!name && !slug) return { icon: Sparkles, tone: TONES.royal };
  return { icon: Library, tone: TONES[FALLBACK_TONES[hash(key) % FALLBACK_TONES.length]] };
}
