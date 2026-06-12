"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToolMeta, CATEGORY_COLORS } from "@/types/tool";

interface ToolCardProps {
  tool: ToolMeta;
  index?: number;
}

export default function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const color = CATEGORY_COLORS[tool.category];
  const Icon =
    ((Icons as unknown) as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[
      tool.icon
    ] || Icons.Circle;

  const locationLabel =
    tool.processingLocation === "client"
      ? "Lokální"
      : tool.processingLocation === "server"
      ? "Server"
      : "AI";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Link
        href={`/tools/${tool.slug}`}
        className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
      >
        <div
          className="absolute top-0 left-4 right-4 h-[2px] rounded-b-full opacity-60 transition-opacity group-hover:opacity-100"
          style={{ backgroundColor: color }}
        />

        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          {tool.isNew && (
            <Badge variant="outline" className="text-[10px] h-5 border-primary/30 text-primary">
              NOVÉ
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
          {tool.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{tool.description}</p>

        <div className="mt-auto flex items-center justify-between">
          <Badge
            variant="secondary"
            className="text-[10px] h-5 bg-secondary/50 text-muted-foreground"
          >
            {locationLabel}
          </Badge>
          <span className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Otevřít →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
