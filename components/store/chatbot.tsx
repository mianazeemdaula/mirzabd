// components/store/chatbot.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  X,
  Sparkles,
  BookOpen,
  Store,
  History,
  CornerDownLeft,
  User,
  Bot
} from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  name?: string;
}

const PRESETS = [
  {
    icon: <BookOpen className="w-3.5 h-3.5 text-gold" />,
    text: "Find some mystery or thriller novels",
    query: "Can you recommend some mystery or thriller novels in the store?",
  },
  {
    icon: <Sparkles className="w-3.5 h-3.5 text-gold" />,
    text: "What are the featured books?",
    query: "Show me the featured books that are currently popular.",
  },
  {
    icon: <Store className="w-3.5 h-3.5 text-gold" />,
    text: "Shipping charges & delivery times",
    query: "What are your shipping charges and how long does delivery take?",
  },
  {
    icon: <History className="w-3.5 h-3.5 text-gold" />,
    text: "Check my order history",
    query: "What is my order history? Show me my recent orders.",
  },
];

export function ChatBot() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unread, setUnread] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("book_depot_chat");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved chat history", e);
      }
    }
  }, []);

  // Save chat history on change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("book_depot_chat", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when messages or open state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isOpen, isLoading]);

  // Handle setting unread badge
  useEffect(() => {
    if (isOpen) {
      setUnread(false);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Chat service responded with an error");
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        if (!isOpen) {
          setUnread(true);
        }
      }
    } catch (error: any) {
      console.error("Chatbot submit error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ *System Error:* ${
            error.message || "Something went wrong. Please try again."
          }`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleResetChat = () => {
    setMessages([]);
    sessionStorage.removeItem("book_depot_chat");
  };

  // Helper to parse markdown links and bold formatting safely in React
  const parseLinksAndBold = (text: string): React.ReactNode[] => {
    const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-gold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          const linkText = match[1];
          const linkUrl = match[2];
          const isExternal = linkUrl.startsWith("http");
          return (
            <Link
              key={i}
              href={linkUrl}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="text-gold underline hover:text-white transition-colors duration-150 inline-flex items-center gap-0.5"
            >
              {linkText}
            </Link>
          );
        }
      }
      return part;
    });
  };

  // Format message lines into paragraphs/bullet points
  const formatMessageContent = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");

    return (
      <div className="space-y-2 text-sm leading-relaxed text-ink/95">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Header formatting (e.g. ### Header or ## Header)
          if (trimmed.startsWith("#")) {
            const level = (trimmed.match(/^#+/) || ["#"])[0].length;
            const content = trimmed.replace(/^#+\s+/, "");
            const headerClass =
              level === 1
                ? "text-lg font-bold text-ink mt-2 mb-1"
                : level === 2
                ? "text-base font-bold text-ink mt-2 mb-1"
                : "text-sm font-semibold text-ink mt-1.5 mb-1";
            return <div key={idx} className={headerClass}>{parseLinksAndBold(content)}</div>;
          }

          // Bullet list items
          if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            const content = trimmed.replace(/^[-*]\s+/, "");
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
                <span className="text-gold mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-gold" />
                <span className="flex-1">{parseLinksAndBold(content)}</span>
              </div>
            );
          }

          // Numbered list items
          if (/^\d+\.\s+/.test(trimmed)) {
            const content = trimmed.replace(/^\d+\.\s+/, "");
            const num = trimmed.match(/^\d+/)?.[0];
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
                <span className="text-gold font-mono text-xs mt-0.5 shrink-0">{num}.</span>
                <span className="flex-1">{parseLinksAndBold(content)}</span>
              </div>
            );
          }

          // Standard line
          if (trimmed === "") {
            return <div key={idx} className="h-1.5" />;
          }

          return <div key={idx}>{parseLinksAndBold(line)}</div>;
        })}
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-[370px] sm:w-[400px] h-[550px] bg-surface border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden mb-4 card-shadow"
          >
            {/* Header */}
            <div className="p-4 bg-elevated border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center border border-gold/30 shadow-inner">
                  <Bot className="w-5 h-5 text-gold animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display text-base text-ink font-semibold flex items-center gap-1.5">
                    Mirza Book Assistant
                  </h3>
                  <p className="text-[11px] text-muted flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                    Online & ready to guide
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={handleResetChat}
                    title="Clear Conversation"
                    className="p-1.5 text-muted hover:text-ink hover:bg-border rounded-lg transition-all duration-200"
                  >
                    <History className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-muted hover:text-ink hover:bg-border rounded-lg transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Flow */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              {messages.length === 0 ? (
                /* Welcome Screen */
                <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-5">
                  <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 shadow-glow mb-2">
                    <Sparkles className="w-7 h-7 text-gold" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-ink font-semibold">
                      {session?.user?.name
                        ? `Greetings, ${session.user.name.split(" ")[0]}!`
                        : "Greetings, Bookworm!"}
                    </h4>
                    <p className="text-xs text-muted max-w-[280px] mt-1.5">
                      I can search the catalog, fetch book details, check category list, answer
                      shipping rules, or track your orders. How can I help you?
                    </p>
                  </div>

                  <div className="w-full space-y-2 mt-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted/80 font-semibold text-left pl-1">
                      Quick Enquiries
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {PRESETS.map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(preset.query)}
                          className="flex items-center gap-2.5 p-2.5 bg-elevated hover:bg-border border border-border/60 hover:border-gold/45 rounded-lg text-xs text-left text-ink hover:text-gold transition-all duration-200 cursor-pointer"
                        >
                          <span className="p-1 bg-void rounded-md shrink-0">
                            {preset.icon}
                          </span>
                          <span className="line-clamp-1">{preset.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Message list */
                <div className="space-y-4">
                  {messages.map((msg, index) => {
                    const isUser = msg.role === "user";
                    return (
                      <div
                        key={index}
                        className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2`}
                      >
                        {!isUser && (
                          <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Bot className="w-4 h-4 text-gold" />
                          </div>
                        )}
                        <div
                          className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-sm ${
                            isUser
                              ? "bg-gold text-void font-medium rounded-tr-none shadow-md"
                              : "bg-elevated border border-border text-ink rounded-tl-none"
                          }`}
                        >
                          {formatMessageContent(msg.content)}
                        </div>
                        {isUser && (
                          <div className="w-7 h-7 rounded-full bg-border flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-4 h-4 text-muted" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <div className="flex justify-start items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-gold" />
                      </div>
                      <div className="bg-elevated border border-border px-3.5 py-3 rounded-xl rounded-tl-none flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold/80 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-gold/80 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-gold/80 animate-bounce" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Form Footer */}
            <form
              onSubmit={handleFormSubmit}
              className="p-3 bg-elevated border-t border-border flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder={
                    session?.user
                      ? "Search books, orders, policies..."
                      : "Search books, track order BD-XXXX..."
                  }
                  className="w-full bg-void text-ink border border-border focus:border-gold/80 focus:ring-1 focus:ring-gold/30 rounded-lg pl-3 pr-8 py-2 text-xs transition-all duration-200 outline-none placeholder:text-muted/60 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-gold disabled:opacity-30 transition-colors duration-150"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleSendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-gold hover:bg-gold-dim text-void rounded-lg font-medium transition-all duration-200 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gold hover:bg-gold-dim text-void flex items-center justify-center shadow-lg cursor-pointer relative glow-gold border border-gold/20"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
        {unread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-crimson rounded-full border-2 border-void flex items-center justify-center animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
