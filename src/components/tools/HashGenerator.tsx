"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import MD5 from "crypto-js/md5";
import SHA256 from "crypto-js/sha256";
import SHA512 from "crypto-js/sha512";

type HashType = "md5" | "sha256" | "sha512";

export default function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashType, setHashType] = useState<HashType>("sha256");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const compute = useCallback(() => {
    if (!input) {
      setResult("");
      return;
    }
    let hash = "";
    switch (hashType) {
      case "md5":
        hash = MD5(input).toString();
        break;
      case "sha256":
        hash = SHA256(input).toString();
        break;
      case "sha512":
        hash = SHA512(input).toString();
        break;
    }
    setResult(hash);
  }, [input, hashType]);

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Hash zkopírován");
    setTimeout(() => setCopied(false), 2000);
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

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Vložte text k hashování..."
        className="min-h-[160px] bg-card/50 resize-y"
      />

      <div className="flex items-center gap-3">
        <Select value={hashType} onValueChange={(v) => setHashType(v as HashType)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="md5">MD5</SelectItem>
            <SelectItem value="sha256">SHA-256</SelectItem>
            <SelectItem value="sha512">SHA-512</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={compute}>
          <Hash className="w-4 h-4 mr-2" /> Spočítat
        </Button>
      </div>

      {result && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">Výsledek</span>
          <div className="flex items-center gap-2">
            <Input value={result} readOnly className="font-mono text-sm bg-card/30" />
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
