export interface ToolMeta {
  slug: string;
  name: string;
  description: string;
  category:
    | "pdf"
    | "image"
    | "video"
    | "audio"
    | "text"
    | "ai"
    | "dev"
    | "security"
    | "calc";
  processingLocation: "client" | "server" | "ai";
  inputFormats: string[];
  outputFormats: string[];
  maxFileMB: number;
  icon: string;
  featured?: boolean;
  isNew?: boolean;
}

export const CATEGORY_COLORS: Record<ToolMeta["category"], string> = {
  pdf: "#3b82f6",
  image: "#8b5cf6",
  video: "#f59e0b",
  audio: "#ec4899",
  text: "#6b7280",
  ai: "#10b981",
  dev: "#06b6d4",
  security: "#ef4444",
  calc: "#9ca3af",
};

export const CATEGORY_LABELS: Record<ToolMeta["category"], string> = {
  pdf: "PDF",
  image: "Obrázky",
  video: "Video",
  audio: "Audio",
  text: "Text",
  ai: "AI",
  dev: "Dev",
  security: "Bezpečnost",
  calc: "Kalkulačky",
};
