"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Wrench, Zap, Shield, Cpu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolCard from "@/components/tools/ToolCard";
import { tools } from "@/lib/registry";
import { CATEGORY_LABELS, ToolMeta } from "@/types/tool";

const CATEGORIES: { key: string; label: string }[] = [
  { key: "all", label: "Všechny" },
  ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    key,
    label,
  })),
];

export default function Hub() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result: ToolMeta[] = tools;

    if (activeCategory !== "all") {
      result = result.filter((t) => t.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeCategory, search]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 md:py-28 flex flex-col items-center text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(16,185,129,0.12) 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-3xl mx-auto px-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/50 text-xs font-medium text-muted-foreground mb-8">
              <Wrench className="w-3.5 h-3.5" />
              Nástroje
            </div>

            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-6">
              Nástroje pro{" "}
              <span className="text-emerald-400">Kreativce</span>
              <span className="text-white"> & </span>
              <span className="text-sky-400">Vývojáře.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Výkonná sada nástrojů pro vaše soubory. Bezpečně zpracujte PDF,
              video, obrázky a audio přímo ve svém prohlížeči.
            </p>

            {/* Stats pills */}
            <div className="flex items-center justify-center gap-3 flex-wrap mb-10">
              {[
                { icon: Zap, text: `${tools.length} nástrojů`, color: "#10b981" },
                { icon: Cpu, text: "AI Powered", color: "#0ea5e9" },
                { icon: Shield, text: "Soukromé & bezpečné", color: "#a1a1aa" },
              ].map((stat) => (
                <div
                  key={stat.text}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/60 text-sm text-muted-foreground"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stat.color }}
                  />
                  {stat.text}
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Hledat nástroj... (např. 'json', 'pdf', 'hash')"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-4 pl-12 pr-6 h-auto rounded-2xl text-base bg-card/80 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60"
              />
            </div>
          </motion.div>
        </section>

        {/* Category tabs */}
        <section className="max-w-7xl mx-auto px-6">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-8 bg-transparent gap-1 flex-wrap h-auto">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.key}
                  value={cat.key}
                  className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none border border-transparent data-[state=active]:border-primary/20 transition-all"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Tool grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
              {filtered.map((tool, i) => (
                <ToolCard key={tool.slug} tool={tool} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Žádný nástroj neodpovídá hledání.</p>
              <p className="text-sm">Zkuste jiné klíčové slovo.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
