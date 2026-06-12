"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useOllamaStream } from "@/hooks/useOllamaStream";
import { marked } from "marked";
import DOMPurify from "dompurify";

export default function AiChat() {
  const { messages, send, isLoading, error, abort } = useOllamaStream();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    await send(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-12rem)]"
    >
      <div className="flex items-center gap-2 mb-4">
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">AI</Badge>
        <span className="text-sm text-muted-foreground">Model: llama3.2</span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <Bot className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">AI asistent</p>
            <p className="text-sm">Zeptejte se na cokoliv. Odpovědi se generují lokálně přes Ollama.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" ? (
                <div
                  className="markdown-body"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      marked.parse(msg.content, { async: false }) as string
                    ),
                  }}
                />
              ) : (
                <p>{msg.content}</p>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-sky-400" />
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              Přemýšlím...
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Napište zprávu..."
          className="min-h-[56px] max-h-[160px] bg-card/80 resize-y"
          disabled={isLoading}
        />
        <Button
          onClick={isLoading ? abort : handleSubmit}
          disabled={!isLoading && !input.trim()}
          className="h-14 px-4 shrink-0"
        >
          {isLoading ? (
            <span className="text-sm">Zastavit</span>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </motion.div>
  );
}
