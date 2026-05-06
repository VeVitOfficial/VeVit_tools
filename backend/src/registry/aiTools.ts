export interface AiToolDef {
  slug: string;
  category: 'text' | 'vision' | 'pdf';
  freeLimit: number;
  extraCostXp: number;
  label: string;
}

export const AI_TOOLS: Record<string, AiToolDef> = {
  // Text tools (cheap)
  'translate':             { slug: 'translate',             category: 'text',   freeLimit: 30, extraCostXp: 8,  label: 'Překlad' },
  'summarize-text':        { slug: 'summarize-text',       category: 'text',   freeLimit: 20, extraCostXp: 10, label: 'Shrnutí textu' },
  'ai-search':             { slug: 'ai-search',            category: 'text',   freeLimit: 15, extraCostXp: 10, label: 'AI vyhledávání' },
  'ai-chat':               { slug: 'ai-chat',              category: 'text',   freeLimit: 20, extraCostXp: 15, label: 'AI chat' },
  'ai-seo':                { slug: 'ai-seo',               category: 'text',   freeLimit: 10, extraCostXp: 12, label: 'AI SEO' },
  'ai-sql-gen':            { slug: 'ai-sql-gen',           category: 'text',   freeLimit: 15, extraCostXp: 10, label: 'SQL generátor' },
  'grammar-check':         { slug: 'grammar-check',        category: 'text',   freeLimit: 20, extraCostXp: 10, label: 'Kontrola gramatiky' },
  'paraphrase':            { slug: 'paraphrase',           category: 'text',   freeLimit: 20, extraCostXp: 10, label: 'Parafráze' },

  // Vision tools (medium)
  'ai-vision':             { slug: 'ai-vision',            category: 'vision', freeLimit: 10, extraCostXp: 15, label: 'AI vidění' },
  'ai-code-review':        { slug: 'ai-code-review',      category: 'vision', freeLimit: 10, extraCostXp: 15, label: 'AI code review' },
  'screenshot-to-code':    { slug: 'screenshot-to-code',   category: 'vision', freeLimit: 5,  extraCostXp: 25, label: 'Screenshot → kód' },
  'analyze-image':         { slug: 'analyze-image',       category: 'vision', freeLimit: 10, extraCostXp: 15, label: 'Analýza obrázku' },

  // PDF tools (expensive)
  'ai-pdf-summarize':     { slug: 'ai-pdf-summarize',     category: 'pdf',    freeLimit: 5,  extraCostXp: 30, label: 'AI shrnutí PDF' },
  'ai-pdf-translate':     { slug: 'ai-pdf-translate',    category: 'pdf',    freeLimit: 3,  extraCostXp: 45, label: 'AI překlad PDF' },
  'ai-image-gen':          { slug: 'ai-image-gen',        category: 'pdf',    freeLimit: 3,  extraCostXp: 50, label: 'AI generování obrázků' },
};

export function isAiTool(slug: string): boolean {
  return slug in AI_TOOLS;
}

export function getAiTool(slug: string): AiToolDef | undefined {
  return AI_TOOLS[slug];
}

// Bundle definitions
export interface BundleDef {
  key: string;
  label: string;
  xpCost: number;
  category: 'text' | 'vision' | 'pdf';
  credits: number;
  appliesTo: string[];
}

export const BUNDLES: BundleDef[] = [
  {
    key: 'bundle:text-10',
    label: 'Balíček 10 textových AI',
    xpCost: 70,
    category: 'text',
    credits: 10,
    appliesTo: Object.values(AI_TOOLS).filter(t => t.category === 'text').map(t => t.slug),
  },
  {
    key: 'bundle:vision-5',
    label: 'Balíček 5 vision AI',
    xpCost: 60,
    category: 'vision',
    credits: 5,
    appliesTo: Object.values(AI_TOOLS).filter(t => t.category === 'vision').map(t => t.slug),
  },
  {
    key: 'bundle:pdf-3',
    label: 'Balíček 3 PDF AI',
    xpCost: 75,
    category: 'pdf',
    credits: 3,
    appliesTo: Object.values(AI_TOOLS).filter(t => t.category === 'pdf').map(t => t.slug),
  },
];

export const DAY_PASS = {
  key: 'day-pass',
  label: 'Den neomezeně',
  xpCost: 400,
  durationHours: 24,
} as const;

// Premium tier multipliers
export const TIER_MULTIPLIERS: Record<string, number> = {
  free: 1,
  bronze: 2,
  silver: 5,
  gold: Infinity,
};

// Helper: get all purchase options for a given tool slug
export function getPurchaseOptions(toolSlug: string, userXp: number) {
  const tool = AI_TOOLS[toolSlug];
  if (!tool) return [];

  const options: { key: string; cost: number; label: string; credits: number | null; affordable: boolean }[] = [
    {
      key: `credit:${toolSlug}`,
      cost: tool.extraCostXp,
      label: `1 další použití za ${tool.extraCostXp} XP`,
      credits: 1,
      affordable: userXp >= tool.extraCostXp,
    },
  ];

  const bundle = BUNDLES.find(b => b.appliesTo.includes(toolSlug));
  if (bundle) {
    options.push({
      key: bundle.key,
      cost: bundle.xpCost,
      label: `${bundle.label} za ${bundle.xpCost} XP`,
      credits: bundle.credits,
      affordable: userXp >= bundle.xpCost,
    });
  }

  options.push({
    key: DAY_PASS.key,
    cost: DAY_PASS.xpCost,
    label: `Den neomezeně za ${DAY_PASS.xpCost} XP`,
    credits: null,
    affordable: userXp >= DAY_PASS.xpCost,
  });

  return options;
}