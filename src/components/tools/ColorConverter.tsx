"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Palette, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ColorConverter() {
  const [hex, setHex] = useState("#10b981");
  const [rgb, setRgb] = useState("16, 185, 129");
  const [hsl, setHsl] = useState("153, 84%, 40%");
  const [copied, setCopied] = useState<string | null>(null);

  const parseHex = (h: string) => {
    const clean = h.replace("#", "");
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return { r, g, b };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const updateFromHex = useCallback((value: string) => {
    setHex(value);
    const parsed = parseHex(value);
    if (!parsed) return;
    const { r, g, b } = parsed;
    setRgb(`${r}, ${g}, ${b}`);
    const hslVal = rgbToHsl(r, g, b);
    setHsl(`${hslVal.h}, ${hslVal.s}%, ${hslVal.l}%`);
  }, []);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Zkopírováno");
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    updateFromHex("#10b981");
  }, [updateFromHex]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="bg-secondary/50">Lokální</Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl border border-border shadow-inner" style={{ backgroundColor: hex }} />
        <div className="text-2xl font-mono font-semibold">{hex.toUpperCase()}</div>
      </div>

      {[
        { label: "HEX", value: hex, setter: (v: string) => updateFromHex(v) },
        { label: "RGB", value: rgb, setter: setRgb },
        { label: "HSL", value: hsl, setter: setHsl },
      ].map((field) => (
        <div key={field.label} className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">{field.label}</label>
          <div className="flex items-center gap-2">
            <Input
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
              className="font-mono bg-card/50"
            />
            <Button variant="ghost" size="icon" onClick={() => handleCopy(field.value, field.label)}>
              {copied === field.label ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
