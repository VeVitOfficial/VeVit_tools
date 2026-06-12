"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Trash, AlignLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const formatJson = useCallback(() => {
    try {
      const trimmed = input.trim();
      if (!trimmed) {
        setError("Vložte JSON k formátování.");
        setOutput("");
        return;
      }
      const parsed = JSON.parse(trimmed);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError("");
    } catch (err) {
      setError("Neplatný JSON: " + (err instanceof Error ? err.message : String(err)));
      setOutput("");
    }
  }, [input]);

  const minifyJson = useCallback(() => {
    try {
      const trimmed = input.trim();
      if (!trimmed) return;
      const parsed = JSON.parse(trimmed);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (err) {
      setError("Neplatný JSON: " + (err instanceof Error ? err.message : String(err)));
      setOutput("");
    }
  }, [input]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Zkopírováno do schránky");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="bg-secondary/50">Lokální</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Vstup (JSON)</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setInput(""); setOutput(""); setError(""); }}
            >
              <Trash className="w-4 h-4 mr-1" /> Vyčistit
            </Button>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"hello": "world"}'
            className="min-h-[320px] font-mono text-sm bg-card/50 resize-y"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Výstup</span>
            <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              Kopírovat
            </Button>
          </div>
          <Textarea
            value={error || output}
            readOnly
            className={`min-h-[320px] font-mono text-sm resize-y ${error ? "text-destructive border-destructive/30" : "bg-card/30"}`}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={formatJson}>
          <AlignLeft className="w-4 h-4 mr-2" /> Formátovat
        </Button>
        <Button variant="secondary" onClick={minifyJson}>
          Minifikovat
        </Button>
      </div>
    </motion.div>
  );
}
