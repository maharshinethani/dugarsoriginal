'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Currency, Country, ExchangeRate, ShippingCountrySetting } from '@/lib/types';
import { Plus, Trash2, Edit, X, Globe, Coins, Truck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'currencies' | 'countries' | 'rates' | 'shipping';

export default function AdminCurrenciesPage() {
  const [tab, setTab] = useState<Tab>('currencies');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [shipping, setShipping] = useState<ShippingCountrySetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: c }, { data: co }, { data: r }, { data: s }] = await Promise.all([
      supabase.from('currencies').select('*').order('sort_order'),
      supabase.from('countries').select('*').order('sort_order'),
      supabase.from('exchange_rates').select('*'),
      supabase.from('shipping_country_settings').select('*'),
    ]);
    setCurrencies((c as Currency[]) || []);
    setCountries((co as Country[]) || []);
    setRates((r as ExchangeRate[]) || []);
    setShipping((s as ShippingCountrySetting[]) || []);
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-heading">Countries & Currencies</h1>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-border/10">
        <TabBtn active={tab === 'currencies'} onClick={() => setTab('currencies')} icon={Coins} label="Currencies" />
        <TabBtn active={tab === 'countries'} onClick={() => setTab('countries')} icon={Globe} label="Countries" />
        <TabBtn active={tab === 'rates'} onClick={() => setTab('rates')} icon={RefreshCw} label="Exchange Rates" />
        <TabBtn active={tab === 'shipping'} onClick={() => setTab('shipping')} icon={Truck} label="Shipping" />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse bg-muted" />)}</div>
        ) : tab === 'currencies' ? (
          <CurrenciesTab currencies={currencies} onChanged={fetchAll} />
        ) : tab === 'countries' ? (
          <CountriesTab countries={countries} currencies={currencies} onChanged={fetchAll} />
        ) : tab === 'rates' ? (
          <RatesTab rates={rates} currencies={currencies} onChanged={fetchAll} />
        ) : (
          <ShippingTab shipping={shipping} countries={countries} onChanged={fetchAll} />
        )}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors ${active ? 'border-b-2 border-gold text-gold' : 'text-secondary-text/70 hover:text-heading'}`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

// ============================================================
// CURRENCIES TAB
// ============================================================
function CurrenciesTab({ currencies, onChanged }: { currencies: Currency[]; onChanged: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Currency | null>(null);
  const [form, setForm] = useState({ code: '', name: '', symbol: '', decimal_places: '2', symbol_position: 'before', is_base: false, is_enabled: true, sort_order: '0' });

  function startEdit(c: Currency) {
    setEditing(c);
    setForm({ code: c.code, name: c.name, symbol: c.symbol, decimal_places: String(c.decimal_places), symbol_position: c.symbol_position, is_base: c.is_base, is_enabled: c.is_enabled, sort_order: String(c.sort_order) });
    setShowForm(true);
  }
  function startNew() {
    setEditing(null);
    setForm({ code: '', name: '', symbol: '', decimal_places: '2', symbol_position: 'before', is_base: false, is_enabled: true, sort_order: '0' });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code || !form.name) { toast.error('Code and name required'); return; }
    const payload = {
      code: form.code.toUpperCase(), name: form.name, symbol: form.symbol,
      decimal_places: parseInt(form.decimal_places) || 2, symbol_position: form.symbol_position,
      is_base: form.is_base, is_enabled: form.is_enabled, sort_order: parseInt(form.sort_order) || 0,
    };
    try {
      if (editing) {
        const { error } = await supabase.from('currencies').update(payload).eq('code', editing.code);
        if (error) throw error;
        toast.success('Currency saved');
      } else {
        const { error } = await supabase.from('currencies').insert(payload);
        if (error) throw error;
        toast.success('Currency created');
      }
      setShowForm(false);
      onChanged();
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    }
  }

  async function handleDelete(code: string) {
    if (!confirm('Delete this currency?')) return;
    const { error } = await supabase.from('currencies').delete().eq('code', code);
    if (error) { toast.error('Cannot delete — it may be in use'); return; }
    toast.success('Currency deleted');
    onChanged();
  }

  async function toggleBase(c: Currency) {
    if (c.is_base) return;
    if (!confirm(`Set ${c.code} as the base currency? This affects all price conversions.`)) return;
    await supabase.from('currencies').update({ is_base: false }).eq('is_base', true);
    await supabase.from('currencies').update({ is_base: true }).eq('code', c.code);
    toast.success(`${c.code} is now the base currency`);
    onChanged();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={startNew} className="flex items-center gap-2 bg-gold px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-soft-black hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Currency
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/10 text-start text-xs uppercase tracking-wider text-secondary-text/70">
              <th className="px-3 py-2 text-start">Code</th>
              <th className="px-3 py-2 text-start">Name</th>
              <th className="px-3 py-2 text-start">Symbol</th>
              <th className="px-3 py-2 text-start">Decimals</th>
              <th className="px-3 py-2 text-start">Position</th>
              <th className="px-3 py-2 text-start">Base</th>
              <th className="px-3 py-2 text-start">Enabled</th>
              <th className="px-3 py-2 text-start">Order</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {currencies.map((c) => (
              <tr key={c.code} className="border-b border-border/5 hover:bg-muted/30">
                <td className="px-3 py-3 font-medium text-heading">{c.code}</td>
                <td className="px-3 py-3 text-secondary-text/85">{c.name}</td>
                <td className="px-3 py-3 text-secondary-text/85">{c.symbol}</td>
                <td className="px-3 py-3 text-secondary-text/85">{c.decimal_places}</td>
                <td className="px-3 py-3 text-secondary-text/85">{c.symbol_position}</td>
                <td className="px-3 py-3">
                  <button onClick={() => toggleBase(c)} className={`px-2 py-0.5 text-[10px] uppercase tracking-wider ${c.is_base ? 'bg-gold text-soft-black' : 'border border-border/20 text-secondary-text/70'}`}>
                    {c.is_base ? 'Base' : 'Set Base'}
                  </button>
                </td>
                <td className="px-3 py-3">
                  <button
                    onClick={async () => { await supabase.from('currencies').update({ is_enabled: !c.is_enabled }).eq('code', c.code); onChanged(); }}
                    className={`px-2 py-0.5 text-[10px] uppercase tracking-wider ${c.is_enabled ? 'bg-green-600/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}
                  >
                    {c.is_enabled ? 'Yes' : 'No'}
                  </button>
                </td>
                <td className="px-3 py-3 text-secondary-text/85">{c.sort_order}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(c)} className="flex h-7 w-7 items-center justify-center border border-border/15 text-secondary-text/70 hover:border-gold hover:text-gold"><Edit className="h-3 w-3" /></button>
                    <button onClick={() => handleDelete(c.code)} className="flex h-7 w-7 items-center justify-center border border-border/15 text-secondary-text/70 hover:border-red-300 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-soft-black/60 p-4" onClick={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-heading">{editing ? 'Edit Currency' : 'New Currency'}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5 text-secondary-text/70" /></button>
            </div>
            <F label="Code (e.g. USD) *" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} disabled={!!editing} />
            <F label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <F label="Symbol" value={form.symbol} onChange={(v) => setForm({ ...form, symbol: v })} />
            <F label="Decimal Places" value={form.decimal_places} onChange={(v) => setForm({ ...form, decimal_places: v })} type="number" />
            <div>
              <label className="label-luxury mb-1.5 block text-secondary-text/70">Symbol Position</label>
              <select value={form.symbol_position} onChange={(e) => setForm({ ...form, symbol_position: e.target.value })} className="w-full border border-border/15 px-3 py-2 text-sm outline-none focus:border-gold">
                <option value="before">Before amount</option>
                <option value="after">After amount</option>
              </select>
            </div>
            <F label="Sort Order" value={form.sort_order} onChange={(v) => setForm({ ...form, sort_order: v })} type="number" />
            <label className="flex items-center gap-2 text-xs text-heading"><input type="checkbox" checked={form.is_base} onChange={(e) => setForm({ ...form, is_base: e.target.checked })} className="accent-gold" /> Base Currency (prices stored in this currency)</label>
            <label className="flex items-center gap-2 text-xs text-heading"><input type="checkbox" checked={form.is_enabled} onChange={(e) => setForm({ ...form, is_enabled: e.target.checked })} className="accent-gold" /> Enabled (visible to customers)</label>
            <button type="submit" className="w-full bg-gold py-3 text-xs font-medium uppercase tracking-wider text-soft-black">{editing ? 'Save' : 'Create'}</button>
          </form>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COUNTRIES TAB
// ============================================================
function CountriesTab({ countries, currencies, onChanged }: { countries: Country[]; currencies: Currency[]; onChanged: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Country | null>(null);
  const [form, setForm] = useState({ code: '', name: '', flag_emoji: '', default_currency_code: '', is_enabled: true, sort_order: '0' });

  function startEdit(c: Country) {
    setEditing(c);
    setForm({ code: c.code, name: c.name, flag_emoji: c.flag_emoji, default_currency_code: c.default_currency_code, is_enabled: c.is_enabled, sort_order: String(c.sort_order) });
    setShowForm(true);
  }
  function startNew() {
    setEditing(null);
    setForm({ code: '', name: '', flag_emoji: '', default_currency_code: currencies[0]?.code || '', is_enabled: true, sort_order: '0' });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code || !form.name || !form.default_currency_code) { toast.error('All fields required'); return; }
    const payload = {
      code: form.code.toUpperCase(), name: form.name, flag_emoji: form.flag_emoji,
      default_currency_code: form.default_currency_code, is_enabled: form.is_enabled,
      sort_order: parseInt(form.sort_order) || 0,
    };
    try {
      if (editing) {
        const { error } = await supabase.from('countries').update(payload).eq('code', editing.code);
        if (error) throw error;
        toast.success('Country saved');
      } else {
        const { error } = await supabase.from('countries').insert(payload);
        if (error) throw error;
        toast.success('Country created');
      }
      setShowForm(false);
      onChanged();
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    }
  }

  async function handleDelete(code: string) {
    if (!confirm('Delete this country?')) return;
    const { error } = await supabase.from('countries').delete().eq('code', code);
    if (error) { toast.error('Failed'); return; }
    toast.success('Country deleted');
    onChanged();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={startNew} className="flex items-center gap-2 bg-gold px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-soft-black hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Country
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/10 text-xs uppercase tracking-wider text-secondary-text/70">
              <th className="px-3 py-2 text-start">Flag</th>
              <th className="px-3 py-2 text-start">Code</th>
              <th className="px-3 py-2 text-start">Name</th>
              <th className="px-3 py-2 text-start">Currency</th>
              <th className="px-3 py-2 text-start">Enabled</th>
              <th className="px-3 py-2 text-start">Order</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {countries.map((c) => (
              <tr key={c.code} className="border-b border-border/5 hover:bg-muted/30">
                <td className="px-3 py-3 text-lg">{c.flag_emoji}</td>
                <td className="px-3 py-3 font-medium text-heading">{c.code}</td>
                <td className="px-3 py-3 text-secondary-text/85">{c.name}</td>
                <td className="px-3 py-3 text-secondary-text/85">{c.default_currency_code}</td>
                <td className="px-3 py-3">
                  <button
                    onClick={async () => { await supabase.from('countries').update({ is_enabled: !c.is_enabled }).eq('code', c.code); onChanged(); }}
                    className={`px-2 py-0.5 text-[10px] uppercase tracking-wider ${c.is_enabled ? 'bg-green-600/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}
                  >
                    {c.is_enabled ? 'Yes' : 'No'}
                  </button>
                </td>
                <td className="px-3 py-3 text-secondary-text/85">{c.sort_order}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(c)} className="flex h-7 w-7 items-center justify-center border border-border/15 text-secondary-text/70 hover:border-gold hover:text-gold"><Edit className="h-3 w-3" /></button>
                    <button onClick={() => handleDelete(c.code)} className="flex h-7 w-7 items-center justify-center border border-border/15 text-secondary-text/70 hover:border-red-300 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-soft-black/60 p-4" onClick={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-heading">{editing ? 'Edit Country' : 'New Country'}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5 text-secondary-text/70" /></button>
            </div>
            <F label="Country Code (e.g. SA) *" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} disabled={!!editing} />
            <F label="Country Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <F label="Flag Emoji" value={form.flag_emoji} onChange={(v) => setForm({ ...form, flag_emoji: v })} />
            <div>
              <label className="label-luxury mb-1.5 block text-secondary-text/70">Default Currency *</label>
              <select value={form.default_currency_code} onChange={(e) => setForm({ ...form, default_currency_code: e.target.value })} className="w-full border border-border/15 px-3 py-2 text-sm outline-none focus:border-gold">
                {currencies.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            <F label="Sort Order" value={form.sort_order} onChange={(v) => setForm({ ...form, sort_order: v })} type="number" />
            <label className="flex items-center gap-2 text-xs text-heading"><input type="checkbox" checked={form.is_enabled} onChange={(e) => setForm({ ...form, is_enabled: e.target.checked })} className="accent-gold" /> Enabled</label>
            <button type="submit" className="w-full bg-gold py-3 text-xs font-medium uppercase tracking-wider text-soft-black">{editing ? 'Save' : 'Create'}</button>
          </form>
        </div>
      )}
    </div>
  );
}

// ============================================================
// EXCHANGE RATES TAB
// ============================================================
function RatesTab({ rates, currencies, onChanged }: { rates: ExchangeRate[]; currencies: Currency[]; onChanged: () => void }) {
  const [editRates, setEditRates] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};
    rates.forEach((r) => { map[r.currency_code] = String(r.rate); });
    setEditRates(map);
  }, [rates]);

  const baseCurrency = currencies.find((c) => c.is_base);

  async function saveRate(currencyCode: string) {
    const rateVal = parseFloat(editRates[currencyCode]);
    if (isNaN(rateVal) || rateVal <= 0) { toast.error('Invalid rate'); return; }
    const existing = rates.find((r) => r.currency_code === currencyCode);
    try {
      if (existing) {
        const { error } = await supabase.from('exchange_rates').update({ rate: rateVal, updated_at: new Date().toISOString(), source: 'manual' }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('exchange_rates').insert({ currency_code: currencyCode, rate: rateVal, source: 'manual' });
        if (error) throw error;
      }
      toast.success('Exchange rate saved');
      onChanged();
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    }
  }

  async function saveAll() {
    const updates = Object.entries(editRates).filter(([code]) => code !== baseCurrency?.code);
    let successCount = 0;
    for (const [code, val] of updates) {
      const rateVal = parseFloat(val);
      if (isNaN(rateVal) || rateVal <= 0) continue;
      const existing = rates.find((r) => r.currency_code === code);
      try {
        if (existing) {
          await supabase.from('exchange_rates').update({ rate: rateVal, updated_at: new Date().toISOString(), source: 'manual' }).eq('id', existing.id);
        } else {
          await supabase.from('exchange_rates').insert({ currency_code: code, rate: rateVal, source: 'manual' });
        }
        successCount++;
      } catch { /* continue */ }
    }
    toast.success(`${successCount} rates saved`);
    onChanged();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-secondary-text/70">
          {baseCurrency ? <>Base currency: <span className="font-medium text-heading">{baseCurrency.code}</span></> : 'No base currency set'}
        </p>
        <button onClick={saveAll} className="flex items-center gap-2 bg-gold px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-soft-black hover:opacity-90">
          <RefreshCw className="h-4 w-4" /> Save All Rates
        </button>
      </div>

      <div className="space-y-2">
        {currencies.map((c) => {
          const rate = rates.find((r) => r.currency_code === c.code);
          return (
            <div key={c.code} className="flex items-center gap-4 border border-border/10 bg-card p-3">
              <div className="w-20 flex-shrink-0">
                <p className="font-medium text-heading">{c.code}</p>
                <p className="text-[10px] text-secondary-text/70">{c.name}</p>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.000001"
                  value={editRates[c.code] ?? ''}
                  onChange={(e) => setEditRates({ ...editRates, [c.code]: e.target.value })}
                  disabled={c.is_base}
                  className="w-full max-w-xs border border-border/15 px-3 py-2 text-sm outline-none focus:border-gold disabled:bg-muted/50"
                  placeholder={c.is_base ? '1.0 (base)' : 'Enter rate'}
                />
              </div>
              <div className="flex-shrink-0 text-end">
                {rate && <p className="text-[10px] text-secondary-text/60">Updated: {new Date(rate.updated_at).toLocaleDateString()}</p>}
                {rate && <p className="text-[10px] text-secondary-text/60">Source: {rate.source}</p>}
              </div>
              {!c.is_base && (
                <button onClick={() => saveRate(c.code)} className="flex-shrink-0 border border-border/15 px-3 py-1.5 text-[10px] uppercase tracking-wider text-heading hover:border-gold hover:text-gold">
                  Save
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// SHIPPING TAB
// ============================================================
function ShippingTab({ shipping, countries, onChanged }: { shipping: ShippingCountrySetting[]; countries: Country[]; onChanged: () => void }) {
  const [forms, setForms] = useState<Record<string, any>>({});

  useEffect(() => {
    const map: Record<string, any> = {};
    countries.forEach((c) => {
      const s = shipping.find((s) => s.country_code === c.code);
      map[c.code] = {
        is_shippable: s?.is_shippable ?? true,
        shipping_fee: s?.shipping_fee ? String(s.shipping_fee) : '',
        delivery_estimate_en: s?.delivery_estimate_en || '',
        delivery_estimate_ar: s?.delivery_estimate_ar || '',
        tax_note_en: s?.tax_note_en || '',
        tax_note_ar: s?.tax_note_ar || '',
      };
    });
    setForms(map);
  }, [shipping, countries]);

  async function saveShipping(countryCode: string) {
    const f = forms[countryCode];
    if (!f) return;
    const existing = shipping.find((s) => s.country_code === countryCode);
    const payload = {
      country_code: countryCode,
      is_shippable: f.is_shippable,
      shipping_fee: f.shipping_fee ? parseInt(f.shipping_fee) : null,
      delivery_estimate_en: f.delivery_estimate_en || null,
      delivery_estimate_ar: f.delivery_estimate_ar || null,
      tax_note_en: f.tax_note_en || null,
      tax_note_ar: f.tax_note_ar || null,
    };
    try {
      if (existing) {
        const { error } = await supabase.from('shipping_country_settings').update(payload).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('shipping_country_settings').insert(payload);
        if (error) throw error;
      }
      toast.success('Shipping settings saved');
      onChanged();
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-secondary-text/70">Configure shipping availability, fees, and delivery estimates per country. Shipping fees are in base currency minor units (e.g. cents).</p>
      {countries.map((c) => {
        const f = forms[c.code];
        if (!f) return null;
        return (
          <div key={c.code} className="border border-border/10 bg-card p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-lg">{c.flag_emoji}</span>
              <h3 className="text-sm font-medium text-heading">{c.name} ({c.code})</h3>
              <label className="ms-auto flex items-center gap-2 text-xs text-heading">
                <input type="checkbox" checked={f.is_shippable} onChange={(e) => setForms({ ...forms, [c.code]: { ...f, is_shippable: e.target.checked } })} className="accent-gold" /> Shippable
              </label>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <F label="Shipping Fee (minor units)" value={f.shipping_fee} onChange={(v) => setForms({ ...forms, [c.code]: { ...f, shipping_fee: v } })} type="number" />
              <F label="Delivery Estimate (EN)" value={f.delivery_estimate_en} onChange={(v) => setForms({ ...forms, [c.code]: { ...f, delivery_estimate_en: v } })} />
              <F label="Delivery Estimate (AR)" value={f.delivery_estimate_ar} onChange={(v) => setForms({ ...forms, [c.code]: { ...f, delivery_estimate_ar: v } })} />
              <F label="Tax/Duty Note (EN)" value={f.tax_note_en} onChange={(v) => setForms({ ...forms, [c.code]: { ...f, tax_note_en: v } })} />
              <F label="Tax/Duty Note (AR)" value={f.tax_note_ar} onChange={(v) => setForms({ ...forms, [c.code]: { ...f, tax_note_ar: v } })} />
            </div>
            <button onClick={() => saveShipping(c.code)} className="mt-3 bg-gold px-4 py-2 text-xs font-medium uppercase tracking-wider text-soft-black hover:opacity-90">Save</button>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// SHARED FIELD COMPONENT
// ============================================================
function F({ label, value, onChange, type = 'text', disabled }: { label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean }) {
  return (
    <div>
      <label className="label-luxury mb-1.5 block text-secondary-text/70">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="w-full border border-border/15 px-3 py-2 text-sm outline-none focus:border-gold disabled:bg-muted/50" />
    </div>
  );
}
