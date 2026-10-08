'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { useEditStore } from '@/lib/editStore';
import type { EditPlan } from '@editor/edit-schema';

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export function ChatPanel({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [configured, setConfigured] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const loadPlan = useEditStore((s) => s.loadPlan);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch(`/api/projects/${projectId}/chat`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages ?? []);
        setConfigured(data.configured ?? false);
      })
      .catch(() => {});
  }, [projectId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setNotConfigured(false);
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, role: 'user', content: text, createdAt: new Date().toISOString() },
    ]);
    setSending(true);

    try {
      const res = await apiFetch(`/api/projects/${projectId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (res.status === 503) {
        setNotConfigured(true);
        setConfigured(false);
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: body.error ?? 'Something went wrong.',
            createdAt: new Date().toISOString(),
          },
        ]);
        return;
      }

      const data: { reply: string; editPlan: EditPlan } = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: 'assistant', content: data.reply, createdAt: new Date().toISOString() },
      ]);
      loadPlan(data.editPlan);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-panel-border bg-panel/40">
      <div className="flex items-center gap-2 border-b border-panel-border/60 px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand">
          <Sparkles size={13} className="text-white" />
        </div>
        <h2 className="text-sm font-semibold text-ink">Ask AI to edit</h2>
      </div>

      {messages.length > 0 && (
        <div ref={listRef} className="flex max-h-40 flex-col gap-2 overflow-y-auto px-4 py-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-xl px-3 py-1.5 text-sm ${
                m.role === 'user'
                  ? 'self-end bg-gradient-brand text-white'
                  : 'self-start bg-panel-hover text-ink-muted'
              }`}
            >
              {m.content}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {notConfigured && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mb-2 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning"
          >
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            AI editing isn&apos;t turned on yet — add an Anthropic API key on the backend to enable
            this.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            configured
              ? 'Describe the edit — "cut to the beat", "add a title at the start"…'
              : 'AI editing not configured yet'
          }
          disabled={sending}
          className="h-10 flex-1 rounded-xl border border-panel-border bg-panel/60 px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent/60 focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          aria-label="Send to AI"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white transition-opacity disabled:opacity-40"
        >
          {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </div>
    </div>
  );
}
