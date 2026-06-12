import { ToolMeta } from "@/types/tool";
import JsonFormatter from "./JsonFormatter";
import UuidGenerator from "./UuidGenerator";
import HashGenerator from "./HashGenerator";
import RegexTester from "./RegexTester";
import AiChat from "./AiChat";
import PasswordGenerator from "./PasswordGenerator";
import ColorConverter from "./ColorConverter";
import NumberBaseConverter from "./NumberBaseConverter";

interface ToolRendererProps {
  tool: ToolMeta;
}

export default function ToolRenderer({ tool }: ToolRendererProps) {
  switch (tool.slug) {
    case "json-formatter":
      return <JsonFormatter />;
    case "uuid-gen":
      return <UuidGenerator />;
    case "hash-gen":
      return <HashGenerator />;
    case "regex-tester":
      return <RegexTester />;
    case "ai-chat":
      return <AiChat />;
    case "password-gen":
      return <PasswordGenerator />;
    case "color-converter":
      return <ColorConverter />;
    case "number-base-converter":
      return <NumberBaseConverter />;
    default:
      return (
        <div className="max-w-2xl mx-auto text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium mb-2">Nástroj „{tool.name}“</p>
          <p className="text-sm">
            Tento nástroj je zatím ve vývoji. Brzy bude dostupný.
          </p>
        </div>
      );
  }
}
