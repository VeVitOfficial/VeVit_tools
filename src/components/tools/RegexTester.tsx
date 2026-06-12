"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Regex } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("");

  const result = useMemo(() => {
    if (!pattern || !text) return null;
    try {
      const regex = new RegExp(pattern, flags);
      const matches = Array.from(text.matchAll(regex));
      const highlighted = text.replace(regex, (match) => `⦅${match}⦆`);
      return { matches, highlighted, error: null };
    } catch (err) {
      return { matches: [], highlighted: "", error: (err as Error).message };
    }
  }, [pattern, flags, text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="bg-secondary/50">Lokální</Badge>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Regulární výraz</label>
          <Input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="např. \\d+"
            className="font-mono bg-card/50"
          />
        </div>
        <div className="w-24">
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Flags</label>
          <Input
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="gi"
            className="font-mono bg-card/50"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1 block">Testovací text</label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Vložte text k testování..."
          className="min-h-[120px] bg-card/50 resize-y"
        />
      </div>

      {result?.error ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : result ? (
        <div className="space-y-4">
          <div className="p-3 rounded-lg border border-border bg-card/30 font-mono text-sm whitespace-pre-wrap">
            {result.highlighted || text}
          </div>
          <div className="text-sm">
            <span className="font-medium">Nalezeno shod: {result.matches.length}</span>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
