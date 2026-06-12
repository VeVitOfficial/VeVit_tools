import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { tools } from "@/lib/registry";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/types/tool";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolRenderer from "@/components/tools/ToolRenderer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — VeVit Tools`,
    description: tool.description,
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) {
    notFound();
  }

  const color = CATEGORY_COLORS[tool.category];
  const categoryLabel = CATEGORY_LABELS[tool.category];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Nástroje
          </Link>
          <span>/</span>
          <span style={{ color }}>{categoryLabel}</span>
          <span>/</span>
          <span className="text-foreground">{tool.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h1 className="text-3xl font-semibold tracking-tight">{tool.name}</h1>
            <span
              className="text-xs font-medium px-2 py-1 rounded-md border"
              style={{
                borderColor: `${color}30`,
                color,
                backgroundColor: `${color}10`,
              }}
            >
              {tool.processingLocation === "client"
                ? "Lokální"
                : tool.processingLocation === "server"
                ? "Server"
                : "AI"}
            </span>
          </div>
          <p className="text-muted-foreground">{tool.description}</p>
        </div>

        {/* Tool content */}
        <div className="glass rounded-xl p-6 md:p-8">
          <ToolRenderer tool={tool} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
