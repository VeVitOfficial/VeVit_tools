"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { v4 as uuidv4, v7 as uuidv7 } from "uuid";

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [count, setCount] = useState(5);

  const generate = useCallback(
    (version: "v4" | "v7") => {
      const generated = Array.from({ length: count }, () => {
        if (version === "v7") {
          return uuidv7();
        }
        return uuidv4();
      });
      setUuids(generated);
      setCopiedIndex(null);
    },
    [count]
  );

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("UUID zkopírováno");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="bg-secondary/50">Lokální</Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Počet:</span>
          <Input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
            className="w-20"
          />
        </div>
        <Button onClick={() => generate("v4")}>
          <RefreshCw className="w-4 h-4 mr-2" /> Generovat UUID v4
        </Button>
        <Button variant="secondary" onClick={() => generate("v7")}>
          Generovat UUID v7
        </Button>
      </div>

      <div className="space-y-2">
        {uuids.length === 0 && (
          <p className="text-sm text-muted-foreground">Klikněte na tlačítko pro generování UUID.</p>
        )}
        {uuids.map((id, i) => (
          <div
            key={`${id}-${i}`}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/40 font-mono text-sm"
          >
            <span>{id}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(id, i)}
            >
              {copiedIndex === i ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
