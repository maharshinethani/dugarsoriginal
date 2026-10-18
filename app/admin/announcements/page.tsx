'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Edit, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface AnnouncementMessage {
  id: string;
  text_en: string;
  text_ar: string;
  display_order: number;
  is_enabled: boolean;
}

type AnnouncementForm = Omit<AnnouncementMessage, 'id'>;

const emptyForm: AnnouncementForm = { text_en: '', text_ar: '', display_order: 0, is_enabled: true };

export default function AdminAnnouncementsPage() {
  const [messages, setMessages] = useState<AnnouncementMessage[]>([]);
  const [form, setForm] = useState<AnnouncementForm>(emptyForm);
  const [editing, setEditing] = useState<AnnouncementMessage | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMessages(); }, []);

  async function fetchMessages() {
    setLoading(true);
    const { data, error } = await supabase.from('announcement_messages').select('*').order('display_order').order('created_at');
    if (error) toast.error('Failed to load announcements');
    setMessages((data as AnnouncementMessage[]) || []);
    setLoading(false);
  }

  function startNew() {
    setEditing(null);
    setForm({ ...emptyForm, display_order: messages.length + 1 });
    setShowForm(true);
  }

  function startEdit(message: AnnouncementMessage) {
    setEditing(message);
    setForm({ text_en: message.text_en, text_ar: message.text_ar, display_order: message.display_order, is_enabled: message.is_enabled });
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.text_en.trim() || !form.text_ar.trim()) {
      toast.error('English and Arabic messages are required');
      return;
    }
    const payload = { ...form, text_en: form.text_en.trim(), text_ar: form.text_ar.trim(), display_order: Number(form.display_order) || 0 };
    const result = editing
      ? await supabase.from('announcement_messages').update(payload).eq('id', editing.id)
      : await supabase.from('announcement_messages').insert(payload);
    if (result.error) { toast.error('Failed to save announcement'); return; }
    toast.success(editing ? 'Announcement updated' : 'Announcement added');
    setShowForm(false);
    fetchMessages();
  }

  async function removeMessage(id: string) {
    if (!confirm('Delete this announcement?')) return;
    const { error } = await supabase.from('announcement_messages').delete().eq('id', id);
    if (error) { toast.error('Failed to delete announcement'); return; }
    setMessages((current) => current.filter((message) => message.id !== id));
    toast.success('Announcement deleted');
  }

  async function toggleMessage(message: AnnouncementMessage) {
    const { error } = await supabase.from('announcement_messages').update({ is_enabled: !message.is_enabled }).eq('id', message.id);
    if (error) { toast.error('Failed to update announcement'); return; }
    setMessages((current) => current.map((item) => item.id === message.id ? { ...item, is_enabled: !item.is_enabled } : item));
  }

  async function moveMessage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= messages.length) return;
    const current = messages[index];
    const next = messages[nextIndex];
    const updates = await Promise.all([
      supabase.from('announcement_messages').update({ display_order: next.display_order }).eq('id', current.id),
      supabase.from('announcement_messages').update({ display_order: current.display_order }).eq('id', next.id),
    ]);
    if (updates.some((result) => result.error)) { toast.error('Failed to reorder announcements'); return; }
    fetchMessages();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="font-serif text-2xl text-heading">Announcements</h1><p className="mt-1 text-xs text-muted-foreground">Manage the messages shown above the website navigation.</p></div>
        <button onClick={startNew} className="flex items-center gap-2 bg-gold px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-soft-black hover:bg-gold-light"><Plus className="h-4 w-4" /> Add Message</button>
      </div>
      {loading ? <div className="mt-6 h-20 animate-pulse bg-muted" /> : (
        <div className="mt-6 space-y-3">
          {messages.map((message, index) => (
            <div key={message.id} className="border border-border/10 bg-card p-4 text-card-foreground">
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1 pt-1"><button disabled={index === 0} onClick={() => moveMessage(index, -1)} aria-label="Move up" className="text-muted-foreground hover:text-gold disabled:opacity-25"><ArrowUp className="h-4 w-4" /></button><button disabled={index === messages.length - 1} onClick={() => moveMessage(index, 1)} aria-label="Move down" className="text-muted-foreground hover:text-gold disabled:opacity-25"><ArrowDown className="h-4 w-4" /></button></div>
                <div className="min-w-0 flex-1"><p className="text-sm font-medium">{message.text_en}</p><p dir="rtl" className="mt-1 text-xs text-muted-foreground">{message.text_ar}</p><p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">{message.is_enabled ? 'Visible on website' : 'Hidden from website'}</p></div>
                <div className="flex items-center gap-2"><button onClick={() => toggleMessage(message)} className={`h-6 w-11 rounded-full p-1 transition-colors ${message.is_enabled ? 'bg-gold' : 'bg-muted'}`} aria-label={message.is_enabled ? 'Disable message' : 'Enable message'}><span className={`block h-4 w-4 rounded-full bg-card transition-transform ${message.is_enabled ? 'translate-x-5' : ''}`} /></button><button onClick={() => startEdit(message)} aria-label="Edit message" className="text-muted-foreground hover:text-gold"><Edit className="h-4 w-4" /></button><button onClick={() => removeMessage(message.id)} aria-label="Delete message" className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-soft-black/60 p-4" onClick={() => setShowForm(false)}><form onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()} className="w-full max-w-lg space-y-5 bg-card p-6 text-card-foreground"><div className="flex items-center justify-between"><h2 className="font-serif text-xl">{editing ? 'Edit Announcement' : 'New Announcement'}</h2><button type="button" onClick={() => setShowForm(false)} aria-label="Close"><X className="h-5 w-5 text-muted-foreground" /></button></div><AdminField label="Message (English)" value={form.text_en} onChange={(value) => setForm({ ...form, text_en: value })} /><AdminField label="Message (Arabic)" value={form.text_ar} onChange={(value) => setForm({ ...form, text_ar: value })} dir="rtl" /><AdminField label="Display order" type="number" value={String(form.display_order)} onChange={(value) => setForm({ ...form, display_order: Number(value) || 0 })} /><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.is_enabled} onChange={(event) => setForm({ ...form, is_enabled: event.target.checked })} className="accent-gold" /> Show on website</label><button type="submit" className="w-full bg-gold py-3 text-xs font-medium uppercase tracking-wider text-soft-black">{editing ? 'Save Message' : 'Add Message'}</button></form></div>}
    </div>
  );
}

function AdminField({ label, value, onChange, type = 'text', dir }: { label: string; value: string; onChange: (value: string) => void; type?: string; dir?: 'rtl' }) {
  return <div><label className="label-luxury mb-1.5 block text-muted-foreground">{label}</label><input dir={dir} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full border border-border bg-card px-3 py-2 text-sm text-heading outline-none focus:border-gold" /></div>;
}
