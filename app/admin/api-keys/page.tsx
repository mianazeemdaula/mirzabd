// app/admin/api-keys/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Key, Plus, Trash2, Eye, ShieldCheck, Clipboard, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ApiKey {
  id: string;
  description: string;
  consumerKey: string;
  permissions: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState("read_write");

  // State to hold newly generated key info (displayed exactly once)
  const [newKeyDetails, setNewKeyDetails] = useState<{
    consumerKey: string;
    consumerSecret: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/credentials");
      if (res.ok) {
        const data = await res.json();
        setKeys(data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, permissions }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to generate key");
      }

      setNewKeyDetails({
        consumerKey: data.consumerKey,
        consumerSecret: data.consumerSecret,
      });

      toast.success("API credentials generated successfully!");
      setDescription("");
      fetchKeys(); // Refresh list
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API credential? Any active syncs using this key will immediately fail.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/credentials?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("API key successfully revoked");
        fetchKeys();
      } else {
        toast.error("Failed to revoke key");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    }
  };

  const copyToClipboard = (text: string, type: "key" | "secret") => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">API Credentials</h1>
          <p className="text-xs text-muted">Generate WooCommerce REST API consumer keys to synchronize books with POS systems.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Keys List */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Active Keys</h3>

          <div className="border border-border bg-surface rounded-[var(--radius-card)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-border/60">
                <thead className="bg-elevated/40">
                  <tr className="text-left text-xs font-bold uppercase tracking-wider text-muted">
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Consumer Key</th>
                    <th className="px-6 py-3.5 text-center">Permissions</th>
                    <th className="px-6 py-3.5 text-center">Last Used</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm text-ink">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted">
                        Loading API keys...
                      </td>
                    </tr>
                  ) : keys.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted">
                        No active API credentials found. Generate a key on the right to start syncing.
                      </td>
                    </tr>
                  ) : (
                    keys.map((key) => (
                      <tr key={key.id} className="hover:bg-elevated/20 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-ink block">{key.description}</span>
                          <span className="text-[10px] text-muted block mt-0.5">
                            Created: {new Date(key.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-muted max-w-[180px] truncate">
                          {key.consumerKey}
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-xs">
                          <Badge variant={key.permissions === "read_write" ? "green" : "outline"} className="rounded text-[10px]">
                            {key.permissions}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-xs text-muted">
                          {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRevoke(key.id)}
                            className="p-1.5 rounded hover:bg-elevated text-muted hover:text-crimson transition-colors cursor-pointer"
                            title="Revoke Key"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Panel: Generate form */}
        <div className="lg:col-span-4 space-y-6">
          {/* Newly Generated Details Display (Shown ONLY once details exist) */}
          {newKeyDetails && (
            <div className="bg-green-950/20 border border-green-500/30 p-5 rounded-[var(--radius-card)] space-y-4">
              <h3 className="text-sm font-bold text-green-400 flex items-center gap-1.5">
                <ShieldCheck size={18} className="animate-pulse" />
                Copy Secret Credentials
              </h3>
              <p className="text-[11px] text-green-300 leading-relaxed">
                Make sure to copy your consumer secret now. For security purposes, this secret is hashed and will <span className="font-bold underline">never be shown again</span>.
              </p>

              <div className="space-y-3">
                {/* CK */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted block">Consumer Key</span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={newKeyDetails.consumerKey}
                      className="w-full bg-void border border-border text-ink text-xs font-mono rounded-[var(--radius-btn)] h-8 px-2.5"
                    />
                    <button
                      onClick={() => copyToClipboard(newKeyDetails.consumerKey, "key")}
                      className="p-1.5 border border-border rounded bg-elevated hover:text-gold cursor-pointer"
                      aria-label="Copy key"
                    >
                      {copiedKey ? <Check size={14} className="text-green-400" /> : <Clipboard size={14} />}
                    </button>
                  </div>
                </div>

                {/* CS */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted block">Consumer Secret</span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={newKeyDetails.consumerSecret}
                      className="w-full bg-void border border-border text-ink text-xs font-mono rounded-[var(--radius-btn)] h-8 px-2.5"
                    />
                    <button
                      onClick={() => copyToClipboard(newKeyDetails.consumerSecret, "secret")}
                      className="p-1.5 border border-border rounded bg-elevated hover:text-gold cursor-pointer"
                      aria-label="Copy secret"
                    >
                      {copiedSecret ? <Check size={14} className="text-green-400" /> : <Clipboard size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNewKeyDetails(null)}
                className="w-full text-xs h-8 border-green-500/20 text-green-400 hover:bg-green-500/10 cursor-pointer"
              >
                I have saved these credentials
              </Button>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-surface border border-border p-5 rounded-[var(--radius-card)] space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold border-b border-border/60 pb-2 flex items-center gap-1.5">
              <Plus size={16} />
              Generate API Key
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              <Input
                label="Key Description *"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. WooCommerce POS Sync Key"
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  Key Permissions
                </label>
                <select
                  value={permissions}
                  onChange={(e) => setPermissions(e.target.value)}
                  className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] h-10 px-3 focus:outline-none focus:border-gold cursor-pointer"
                >
                  <option value="read_write">Read & Write</option>
                  <option value="read">Read Only</option>
                  <option value="write">Write Only</option>
                </select>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  variant="primary"
                  className="w-full h-11 rounded-[var(--radius-btn)] font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <Key size={14} />
                  {isGenerating ? "Generating..." : "Generate Key Pair"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
