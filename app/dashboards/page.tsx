"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  KeyRound,
  X,
} from "lucide-react";

type ApiKey = {
  id: string;
  label: string;
  key: string;
  createdAt: string; // ISO
  lastUsedAt?: string | null; // ISO
};

const LOCAL_STORAGE_KEY = "micro_saas_api_keys";

function generateRandomHex(bytes: number) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateApiKey() {
  return `sk_${generateRandomHex(24)}`;
}

function maskKey(secret: string) {
  if (!secret) return "";
  const visible = secret.slice(-4);
  return `••••••••••••••••••••${visible}`;
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return iso ?? "—";
  }
}

export default function DashboardsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string>("");
  const [newSecret, setNewSecret] = useState("");
  const [newSecretRevealed, setNewSecretRevealed] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editKey, setEditKey] = useState("");
  const [editKeyRevealed, setEditKeyRevealed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ApiKey[];
        setApiKeys(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apiKeys));
    } catch {
      // ignore
    }
  }, [apiKeys]);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(""), 2000);
    return () => clearTimeout(id);
  }, [message]);

  const canCreate = useMemo(() => newLabel.trim().length > 0, [newLabel]);

  function handleCreate() {
    if (!canCreate) return;
    const now = new Date().toISOString();
    const key: ApiKey = {
      id: (crypto as Crypto & { randomUUID?: () => string }).randomUUID
        ? crypto.randomUUID()
        : `id_${generateRandomHex(12)}`,
      label: newLabel.trim(),
      key: newSecret.trim() || generateApiKey(),
      createdAt: now,
      lastUsedAt: null,
    };
    setApiKeys((prev) => [key, ...prev]);
    setNewLabel("")
    setNewSecret("")
    setNewSecretRevealed(false)
    setMessage("API key created");
  }

  function handleDelete(id: string) {
    const ok = window.confirm("Delete this API key? This cannot be undone.");
    if (!ok) return;
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
    setMessage("API key deleted");
  }

  async function handleCopy(secret: string) {
    try {
      await navigator.clipboard.writeText(secret);
      setMessage("Copied to clipboard");
    } catch {
      setMessage("Copy failed");
    }
  }

  function handleToggleReveal(id: string) {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleRegenerate(id: string) {
    const ok = window.confirm("Regenerate this key? The old key will be invalid.");
    if (!ok) return;
    setApiKeys((prev) =>
      prev.map((k) =>
        k.id === id ? { ...k, key: generateApiKey(), createdAt: new Date().toISOString() } : k
      )
    );
    setMessage("API key regenerated");
  }

  function handleStartEdit(id: string) {
    const current = apiKeys.find((k) => k.id === id);
    if (!current) return;
    setEditingId(id);
    setEditLabel(current.label);
    setEditKey(current.key);
    setEditKeyRevealed(false);
  }

  function handleSaveEdit() {
    if (!editingId) return;
    const trimmedLabel = editLabel.trim();
    const trimmedKey = editKey.trim();
    if (!trimmedLabel || !trimmedKey) {
      setMessage("Label and key are required");
      return;
    }
    setApiKeys((prev) =>
      prev.map((k) => (k.id === editingId ? { ...k, label: trimmedLabel, key: trimmedKey } : k))
    );
    setEditingId(null);
    setMessage("Key updated");
  }

  function handleCancelEdit() {
    setEditingId(null);
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <KeyRound className="size-5" /> API Keys
          </h1>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        <div className="rounded-lg border p-4 md:p-6 space-y-4">
          <div className="grid gap-3 md:grid-cols-3 md:items-end">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">New key label</label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Production server"
                className="w-full h-9 px-3 rounded-md border bg-background outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">API key (optional)</label>
              <div className="flex gap-2">
                <input
                  type={newSecretRevealed ? "text" : "password"}
                  value={newSecret}
                  onChange={(e) => setNewSecret(e.target.value)}
                  placeholder="Paste or type your API key"
                  className="w-full h-9 px-3 rounded-md border bg-background outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewSecretRevealed((v) => !v)}
                  title={newSecretRevealed ? "Hide" : "Reveal"}
                  aria-label={newSecretRevealed ? "Hide key" : "Reveal key"}
                >
                  {newSecretRevealed ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <div className="md:col-span-3">
              <Button onClick={handleCreate} disabled={!canCreate}>
                <Plus /> Create key
              </Button>
            </div>
          </div>
          {message ? (
            <div className="text-sm text-foreground inline-flex items-center gap-2 bg-accent/40 rounded-md px-3 py-2 w-fit">
              <Check className="size-4" /> {message}
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-accent/40 text-foreground">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Label</th>
                <th className="px-4 py-3 font-medium">Key</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Last used</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                    No API keys yet. Create your first key above.
                  </td>
                </tr>
              ) : (
                apiKeys.map((k) => {
                  const revealed = revealedIds.has(k.id);
                  const isEditing = editingId === k.id;
                  return (
                    <tr key={k.id} className="border-t">
                      <td className="px-4 py-3 align-middle">
                        {isEditing ? (
                          <input
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="w-full h-9 px-3 rounded-md border bg-background outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                          />
                        ) : (
                          <div className="font-medium">{k.label}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle font-mono">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type={editKeyRevealed ? "text" : "password"}
                              value={editKey}
                              onChange={(e) => setEditKey(e.target.value)}
                              className="w-full h-9 px-3 rounded-md border bg-background outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 font-mono"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditKeyRevealed((v) => !v)}
                              title={editKeyRevealed ? "Hide" : "Reveal"}
                              aria-label={editKeyRevealed ? "Hide key" : "Reveal key"}
                            >
                              {editKeyRevealed ? <EyeOff /> : <Eye />}
                            </Button>
                          </div>
                        ) : revealed ? (
                          k.key
                        ) : (
                          maskKey(k.key)
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle">{formatDate(k.createdAt)}</td>
                      <td className="px-4 py-3 align-middle">{formatDate(k.lastUsedAt)}</td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleSaveEdit}
                                title="Save"
                                aria-label="Save"
                              >
                                <Check />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                title="Cancel"
                                aria-label="Cancel"
                              >
                                <X />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleCopy(k.key)}
                                title="Copy key"
                                aria-label="Copy key"
                              >
                                <Copy />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleReveal(k.id)}
                                title={revealed ? "Hide" : "Reveal"}
                                aria-label={revealed ? "Hide" : "Reveal"}
                              >
                                {revealed ? <EyeOff /> : <Eye />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRegenerate(k.id)}
                                title="Regenerate key"
                                aria-label="Regenerate key"
                              >
                                <RotateCcw />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartEdit(k.id)}
                                title="Edit"
                                aria-label="Edit"
                              >
                                <Pencil />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(k.id)}
                                title="Delete key"
                              >
                                <Trash2 /> Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
