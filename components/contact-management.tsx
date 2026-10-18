'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Check, X, Star, Mail, Phone, MessageCircle } from 'lucide-react';
import type { ContactEmail, ContactPhone, WhatsAppNumber } from '@/lib/types';

const inputClass = 'w-full border border-border/15 bg-card px-3 py-2 text-sm text-heading outline-none focus:border-gold';
const labelClass = 'mb-1 block text-[10px] font-medium uppercase tracking-wider text-secondary-text/70';

type ContactType = 'emails' | 'phones' | 'whatsapp';

export function ContactManagement() {
  return (
    <>
      <EmailManagementSection />
      <PhoneManagementSection />
      <WhatsAppManagementSection />
    </>
  );
}

function EmailManagementSection() {
  const [items, setItems] = useState<ContactEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editLabel, setEditLabel] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('contact_emails').select('*').order('display_order', { ascending: true });
    setItems((data as ContactEmail[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAdd = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) { toast.error('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Invalid email format'); return; }
    if (items.some((i) => i.email.toLowerCase() === email)) { toast.error('Duplicate email'); return; }
    const { error } = await supabase.from('contact_emails').insert({
      email, label: newLabel.trim() || null, is_enabled: true, is_primary: items.length === 0,
      display_order: items.length,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Email added');
    setNewEmail(''); setNewLabel(''); setAdding(false);
    fetch();
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await supabase.from('contact_emails').update({ is_enabled: enabled, updated_at: new Date().toISOString() }).eq('id', id);
    fetch();
  };

  const handleSetPrimary = async (id: string) => {
    await supabase.from('contact_emails').update({ is_primary: false, updated_at: new Date().toISOString() }).neq('id', id);
    await supabase.from('contact_emails').update({ is_primary: true, updated_at: new Date().toISOString() }).eq('id', id);
    toast.success('Primary email updated');
    fetch();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('contact_emails').delete().eq('id', id);
    toast.success('Email deleted');
    fetch();
  };

  const handleSaveEdit = async (id: string) => {
    const email = editEmail.trim().toLowerCase();
    if (!email) { toast.error('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Invalid email format'); return; }
    if (items.some((i) => i.id !== id && i.email.toLowerCase() === email)) { toast.error('Duplicate email'); return; }
    await supabase.from('contact_emails').update({ email, label: editLabel.trim() || null, updated_at: new Date().toISOString() }).eq('id', id);
    toast.success('Email updated');
    setEditingId(null);
    fetch();
  };

  return (
    <ContactSection
      title="Contact Email Management"
      description="Add multiple email addresses for different purposes. Enabled emails appear on the website contact section."
      icon={Mail}
      loading={loading}
      adding={adding}
      setAdding={setAdding}
      addForm={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Email Address *</label>
            <input className={inputClass} type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="sales@dugars.com" />
          </div>
          <div>
            <label className={labelClass}>Label (optional)</label>
            <input className={inputClass} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Sales, Support..." />
          </div>
        </div>
      }
      onAdd={handleAdd}
      onCancelAdd={() => { setAdding(false); setNewEmail(''); setNewLabel(''); }}
    >
      {items.map((item) => (
        <ContactRow
          key={item.id}
          enabled={item.is_enabled}
          isPrimary={item.is_primary}
          onToggle={() => handleToggle(item.id, !item.is_enabled)}
          onSetPrimary={() => handleSetPrimary(item.id)}
          onDelete={() => handleDelete(item.id)}
          onEdit={() => { setEditingId(item.id); setEditEmail(item.email); setEditLabel(item.label || ''); }}
          editing={editingId === item.id}
          editForm={
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input className={inputClass} type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              <input className={inputClass} value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Label" />
            </div>
          }
          onSaveEdit={() => handleSaveEdit(item.id)}
          onCancelEdit={() => setEditingId(null)}
          primaryText={item.email}
          secondaryText={item.label || ''}
        />
      ))}
    </ContactSection>
  );
}

function PhoneManagementSection() {
  const [items, setItems] = useState<ContactPhone[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState('');
  const [editLabel, setEditLabel] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('contact_phones').select('*').order('display_order', { ascending: true });
    setItems((data as ContactPhone[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAdd = async () => {
    const phone = newPhone.trim();
    if (!phone) { toast.error('Phone number is required'); return; }
    if (items.some((i) => i.phone === phone)) { toast.error('Duplicate phone number'); return; }
    const { error } = await supabase.from('contact_phones').insert({
      phone, label: newLabel.trim() || null, is_enabled: true, is_primary: items.length === 0,
      display_order: items.length,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Phone number added');
    setNewPhone(''); setNewLabel(''); setAdding(false);
    fetch();
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await supabase.from('contact_phones').update({ is_enabled: enabled, updated_at: new Date().toISOString() }).eq('id', id);
    fetch();
  };

  const handleSetPrimary = async (id: string) => {
    await supabase.from('contact_phones').update({ is_primary: false, updated_at: new Date().toISOString() }).neq('id', id);
    await supabase.from('contact_phones').update({ is_primary: true, updated_at: new Date().toISOString() }).eq('id', id);
    toast.success('Primary phone updated');
    fetch();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('contact_phones').delete().eq('id', id);
    toast.success('Phone number deleted');
    fetch();
  };

  const handleSaveEdit = async (id: string) => {
    const phone = editPhone.trim();
    if (!phone) { toast.error('Phone number is required'); return; }
    if (items.some((i) => i.id !== id && i.phone === phone)) { toast.error('Duplicate phone number'); return; }
    await supabase.from('contact_phones').update({ phone, label: editLabel.trim() || null, updated_at: new Date().toISOString() }).eq('id', id);
    toast.success('Phone number updated');
    setEditingId(null);
    fetch();
  };

  return (
    <ContactSection
      title="Phone Number Management"
      description="Add multiple phone numbers. Enabled numbers appear on the website with clickable tel: links."
      icon={Phone}
      loading={loading}
      adding={adding}
      setAdding={setAdding}
      addForm={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Phone Number *</label>
            <input className={inputClass} value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+971 4 123 4567" />
          </div>
          <div>
            <label className={labelClass}>Label (optional)</label>
            <input className={inputClass} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Store, Sales..." />
          </div>
        </div>
      }
      onAdd={handleAdd}
      onCancelAdd={() => { setAdding(false); setNewPhone(''); setNewLabel(''); }}
    >
      {items.map((item) => (
        <ContactRow
          key={item.id}
          enabled={item.is_enabled}
          isPrimary={item.is_primary}
          onToggle={() => handleToggle(item.id, !item.is_enabled)}
          onSetPrimary={() => handleSetPrimary(item.id)}
          onDelete={() => handleDelete(item.id)}
          onEdit={() => { setEditingId(item.id); setEditPhone(item.phone); setEditLabel(item.label || ''); }}
          editing={editingId === item.id}
          editForm={
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input className={inputClass} value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              <input className={inputClass} value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Label" />
            </div>
          }
          onSaveEdit={() => handleSaveEdit(item.id)}
          onCancelEdit={() => setEditingId(null)}
          primaryText={item.phone}
          secondaryText={item.label || ''}
        />
      ))}
    </ContactSection>
  );
}

function WhatsAppManagementSection() {
  const [items, setItems] = useState<WhatsAppNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newPurposes, setNewPurposes] = useState({ product_enquiry: false, buy_now: false, general: false, order: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNumber, setEditNumber] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editPurposes, setEditPurposes] = useState({ product_enquiry: false, buy_now: false, general: false, order: false });

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('whatsapp_numbers').select('*').order('display_order', { ascending: true });
    setItems((data as WhatsAppNumber[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAdd = async () => {
    const number = newNumber.trim().replace(/[^0-9]/g, '');
    if (!number) { toast.error('WhatsApp number is required'); return; }
    if (items.some((i) => i.number.replace(/[^0-9]/g, '') === number)) { toast.error('Duplicate WhatsApp number'); return; }
    const hasPurpose = newPurposes.product_enquiry || newPurposes.buy_now || newPurposes.general || newPurposes.order;
    const { error } = await supabase.from('whatsapp_numbers').insert({
      number, label: newLabel.trim() || null, country_code: newCountry.trim() || null,
      is_enabled: true, is_primary: items.length === 0,
      purpose_product_enquiry: newPurposes.product_enquiry,
      purpose_buy_now: newPurposes.buy_now,
      purpose_general: newPurposes.general,
      purpose_order: newPurposes.order,
      display_order: items.length,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('WhatsApp number added');
    setNewNumber(''); setNewLabel(''); setNewCountry('');
    setNewPurposes({ product_enquiry: false, buy_now: false, general: false, order: false });
    setAdding(false);
    fetch();
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await supabase.from('whatsapp_numbers').update({ is_enabled: enabled, updated_at: new Date().toISOString() }).eq('id', id);
    fetch();
  };

  const handleSetPrimary = async (id: string) => {
    await supabase.from('whatsapp_numbers').update({ is_primary: false, updated_at: new Date().toISOString() }).neq('id', id);
    await supabase.from('whatsapp_numbers').update({ is_primary: true, updated_at: new Date().toISOString() }).eq('id', id);
    toast.success('Primary WhatsApp number updated');
    fetch();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('whatsapp_numbers').delete().eq('id', id);
    toast.success('WhatsApp number deleted');
    fetch();
  };

  const handleSaveEdit = async (id: string) => {
    const number = editNumber.trim().replace(/[^0-9]/g, '');
    if (!number) { toast.error('WhatsApp number is required'); return; }
    if (items.some((i) => i.id !== id && i.number.replace(/[^0-9]/g, '') === number)) { toast.error('Duplicate WhatsApp number'); return; }
    await supabase.from('whatsapp_numbers').update({
      number, label: editLabel.trim() || null, country_code: editCountry.trim() || null,
      purpose_product_enquiry: editPurposes.product_enquiry,
      purpose_buy_now: editPurposes.buy_now,
      purpose_general: editPurposes.general,
      purpose_order: editPurposes.order,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    toast.success('WhatsApp number updated');
    setEditingId(null);
    fetch();
  };

  const purposeLabels: Array<keyof typeof newPurposes> = ['product_enquiry', 'buy_now', 'general', 'order'];
  const purposeDisplay: Record<string, string> = { product_enquiry: 'Product Enquiry', buy_now: 'Buy Now', general: 'General', order: 'Order' };

  return (
    <ContactSection
      title="WhatsApp Number Management"
      description="Add multiple WhatsApp numbers and assign them to different purposes (product enquiry, buy now, general, order)."
      icon={MessageCircle}
      loading={loading}
      adding={adding}
      setAdding={setAdding}
      addForm={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>WhatsApp Number *</label>
            <input className={inputClass} value={newNumber} onChange={(e) => setNewNumber(e.target.value)} placeholder="971501234567" />
          </div>
          <div>
            <label className={labelClass}>Label (optional)</label>
            <input className={inputClass} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Sales, Support..." />
          </div>
          <div>
            <label className={labelClass}>Country Code</label>
            <input className={inputClass} value={newCountry} onChange={(e) => setNewCountry(e.target.value)} placeholder="971, 966..." />
          </div>
          <div className="sm:col-span-3">
            <label className={labelClass}>Purposes</label>
            <div className="flex flex-wrap gap-4">
              {purposeLabels.map((p) => (
                <label key={p} className="flex items-center gap-2 text-xs text-heading">
                  <input type="checkbox" checked={newPurposes[p]} onChange={(e) => setNewPurposes({ ...newPurposes, [p]: e.target.checked })} className="accent-gold" />
                  {purposeDisplay[p]}
                </label>
              ))}
            </div>
          </div>
        </div>
      }
      onAdd={handleAdd}
      onCancelAdd={() => { setAdding(false); setNewNumber(''); setNewLabel(''); setNewCountry(''); setNewPurposes({ product_enquiry: false, buy_now: false, general: false, order: false }); }}
    >
      {items.map((item) => (
        <ContactRow
          key={item.id}
          enabled={item.is_enabled}
          isPrimary={item.is_primary}
          onToggle={() => handleToggle(item.id, !item.is_enabled)}
          onSetPrimary={() => handleSetPrimary(item.id)}
          onDelete={() => handleDelete(item.id)}
          onEdit={() => {
            setEditingId(item.id); setEditNumber(item.number); setEditLabel(item.label || '');
            setEditCountry(item.country_code || '');
            setEditPurposes({
              product_enquiry: item.purpose_product_enquiry,
              buy_now: item.purpose_buy_now,
              general: item.purpose_general,
              order: item.purpose_order,
            });
          }}
          editing={editingId === item.id}
          editForm={
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <input className={inputClass} value={editNumber} onChange={(e) => setEditNumber(e.target.value)} placeholder="Number" />
                <input className={inputClass} value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Label" />
                <input className={inputClass} value={editCountry} onChange={(e) => setEditCountry(e.target.value)} placeholder="Country code" />
              </div>
              <div className="flex flex-wrap gap-4">
                {purposeLabels.map((p) => (
                  <label key={p} className="flex items-center gap-2 text-xs text-heading">
                    <input type="checkbox" checked={editPurposes[p]} onChange={(e) => setEditPurposes({ ...editPurposes, [p]: e.target.checked })} className="accent-gold" />
                    {purposeDisplay[p]}
                  </label>
                ))}
              </div>
            </div>
          }
          onSaveEdit={() => handleSaveEdit(item.id)}
          onCancelEdit={() => setEditingId(null)}
          primaryText={item.number}
          secondaryText={item.label || ''}
          badges={purposeLabels.filter((p) => item[`purpose_${p}` as keyof WhatsAppNumber] === true).map((p) => purposeDisplay[p])}
        />
      ))}
    </ContactSection>
  );
}

// ============ Shared UI ============

function ContactSection({
  title, description, icon: Icon, loading, adding, setAdding, addForm, onAdd, onCancelAdd, children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
  adding: boolean;
  setAdding: (v: boolean) => void;
  addForm: React.ReactNode;
  onAdd: () => void;
  onCancelAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 border border-border/10 bg-card p-6">
      <h2 className="flex items-center gap-2 font-serif text-lg text-heading">
        <Icon className="h-5 w-5 text-gold" />
        {title}
      </h2>
      <p className="mt-1 text-xs text-secondary-text/70">{description}</p>

      {loading ? (
        <div className="mt-4 space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-12 animate-pulse bg-muted" />)}</div>
      ) : (
        <div className="mt-4 space-y-3">
          {children}
          {!adding && (
            <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gold transition-colors hover:text-gold-light">
              <Plus className="h-4 w-4" /> Add New
            </button>
          )}
          {adding && (
            <div className="border border-border/15 bg-muted/30 p-4">
              {addForm}
              <div className="mt-3 flex gap-2">
                <button onClick={onAdd} className="bg-gold px-4 py-2 text-xs font-medium uppercase tracking-wider text-soft-black">Add</button>
                <button onClick={onCancelAdd} className="border border-border/15 px-4 py-2 text-xs font-medium uppercase tracking-wider text-heading">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ContactRow({
  enabled, isPrimary, onToggle, onSetPrimary, onDelete, onEdit, editing, editForm, onSaveEdit, onCancelEdit,
  primaryText, secondaryText, badges,
}: {
  enabled: boolean;
  isPrimary: boolean;
  onToggle: () => void;
  onSetPrimary: () => void;
  onDelete: () => void;
  onEdit: () => void;
  editing: boolean;
  editForm: React.ReactNode;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  primaryText: string;
  secondaryText: string;
  badges?: string[];
}) {
  return (
    <div className={`flex flex-col gap-3 border border-border/15 p-3 ${enabled ? '' : 'opacity-50'}`}>
      {editing ? (
        <>
          {editForm}
          <div className="flex gap-2">
            <button onClick={onSaveEdit} className="flex items-center gap-1 bg-gold px-3 py-1.5 text-xs text-soft-black"><Check className="h-3 w-3" /> Save</button>
            <button onClick={onCancelEdit} className="flex items-center gap-1 border border-border/15 px-3 py-1.5 text-xs text-heading"><X className="h-3 w-3" /> Cancel</button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={onToggle} className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${enabled ? 'bg-gold' : 'bg-muted'}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${enabled ? 'left-4.5' : 'left-0.5'}`} style={{ left: enabled ? '1.125rem' : '0.125rem' }} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-heading">{primaryText}</span>
                {isPrimary && <span className="flex items-center gap-1 rounded bg-gold/15 px-1.5 py-0.5 text-[9px] font-medium uppercase text-gold"><Star className="h-2.5 w-2.5 fill-gold" /> Primary</span>}
              </div>
              {secondaryText && <p className="text-xs text-secondary-text/70">{secondaryText}</p>}
              {badges && badges.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {badges.map((b) => <span key={b} className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-secondary-text/80">{b}</span>)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isPrimary && <button onClick={onSetPrimary} title="Set as primary" className="text-secondary-text/50 hover:text-gold"><Star className="h-4 w-4" /></button>}
            <button onClick={onEdit} title="Edit" className="text-secondary-text/50 hover:text-heading"><Edit2 className="h-4 w-4" /></button>
            <button onClick={onDelete} title="Delete" className="text-secondary-text/50 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
