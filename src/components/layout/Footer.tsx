import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <Link
          href="https://vevit.fun"
          className="transition-colors hover:text-foreground flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět na VeVit.fun
        </Link>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Vše zpracováno lokálně v prohlížeči</span>
        </div>

        <p>© 2026 VeVit Tools.</p>
      </div>
    </footer>
  );
}
