"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Lock, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let chars = "";
    if (includeLower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (includeUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) chars += "0123456789";
    if (includeSymbols) chars += "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    if (!chars) return;

    let result = "";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    setPassword(result);
    setCopied(false);
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols]);

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success("Heslo zkopírováno");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = () => {
    let score = 0;
    if (length >= 8) score++;
    if (length >= 12) score++;
    if (includeUpper && includeLower) score++;
    if (includeNumbers) score++;
    if (includeSymbols) score++;
    return score;
  };

  const strength = getStrength();
  const strengthLabel = ["Velmi slabé", "Slabé", "Průměrné", "Silné", "Velmi silné"][strength] || "Neznámé";
  const strengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-400"][strength] || "bg-gray-500";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="bg-secondary/50">Lokální</Badge>
      </div>

      <div className="flex items-center gap-3">
        <Input value={password} readOnly className="font-mono text-lg tracking-wider bg-card/50" placeholder="Stiskněte Generovat" />
        <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!password}>
          {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
        </Button>
      </div>

      {password && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Síla hesla</span>
            <span>{strengthLabel}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className={`h-full ${strengthColor} transition-all duration-300`} style={{ width: `${(strength + 1) * 20}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-border bg-card/40 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm">Délka: {length}</span>
          <input type="range" min={4} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-48 accent-primary" />
        </div>

        {[
          { label: "Malá písmena (a-z)", state: includeLower, set: setIncludeLower },
          { label: "Velká písmena (A-Z)", state: includeUpper, set: setIncludeUpper },
          { label: "Číslice (0-9)", state: includeNumbers, set: setIncludeNumbers },
          { label: "Speciální znaky", state: includeSymbols, set: setIncludeSymbols },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center justify-between text-sm cursor-pointer">
            <span>{opt.label}</span>
            <input type="checkbox" checked={opt.state} onChange={(e) => opt.set(e.target.checked)} className="w-4 h-4 accent-primary" />
          </label>
        ))}
      </div>

      <Button onClick={generate} className="w-full">
        <RefreshCw className="w-4 h-4 mr-2" /> Generovat
      </Button>
    </motion.div>
  );
}
