"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Binary, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Base = "dec" | "bin" | "oct" | "hex";

export default function NumberBaseConverter() {
  const [value, setValue] = useState("255");
  const [fromBase, setFromBase] = useState<Base>("dec");
  const [copied, setCopied] = useState<string | null>(null);

  const bases: { key: Base; label: string; radix: number }[] = [
    { key: "bin", label: "Binární", radix: 2 },
    { key: "oct", label: "Oktálová", radix: 8 },
    { key: "dec", label: "Decimální", radix: 10 },
    { key: "hex", label: "Hexadecimální", radix: 16 },
  ];

  const convert = useCallback(
    (target: Base) => {
      const source = bases.find((b) => b.key === fromBase);
      const dest = bases.find((b) => b.key === target);
      if (!source || !dest) return "";
      try {
        const num = parseInt(value.replace(/\s/g, ""), source.radix);
        if (isNaN(num)) return "";
        return num.toString(dest.radix).toUpperCase();
      } catch {
        return "";
      }
    },
    [value, fromBase]
  );

  const handleCopy = async (text: string, key: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Zkopírováno");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="bg-secondary/50">Lokální</Badge>
      </div>

      <div className="flex items-center gap-3">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="font-mono text-lg bg-card/50"
          placeholder="Zadejte číslo..."
        />
        <select
          value={fromBase}
          onChange={(e) => setFromBase(e.target.value as Base)}
          className="h-10 px-3 rounded-md border border-input bg-card text-sm"
        >
          {bases.map((b) => (
            <option key={b.key} value={b.key}>{b.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {bases.map((b) => {
          const result = convert(b.key);
          return (
            <div key={b.key} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/30">
              <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">{b.label}</span>
              <Input value={result} readOnly className="font-mono text-sm bg-transparent border-0" />
              <Button variant="ghost" size="icon" onClick={() => handleCopy(result, b.key)} disabled={!result}>
                {copied === b.key ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
