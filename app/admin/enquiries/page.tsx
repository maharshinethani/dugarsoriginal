'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

const statuses = ['new', 'contacted', 'qualified', 'closed'];

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchEnquiries(); }, []);

  async function fetchEnquiries() {
    setLoading(true);
    const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
    setEnquiries(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('enquiries').update({ status }).eq('id', id);
    if (error) { toast.error('Failed'); return; }
    toast.success('Status updated');
    fetchEnquiries();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this enquiry?')) return;
    const { error } = await supabase.from('enquiries').delete().eq('id', id);
    if (error) { toast.error('Failed'); return; }
    toast.success('Deleted');
    fetchEnquiries();
  }

  const filtered = filter ? enquiries.filter((e) => e.status === filter) : enquiries;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-heading">Enquiries</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-border/15 bg-card px-3 py-2 text-sm outline-none focus:border-gold">
          <option value="">All</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 animate-pulse bg-muted" />)}</div>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((enq) => (
            <div key={enq.id} className="border border-border/10 bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium text-heading">{enq.customer_name}</h3>
                    <span className="text-[10px] uppercase tracking-wider text-secondary-text/70">{enq.source || '-'}</span>
                  </div>
                  <p className="mt-1 text-xs text-secondary-text/70">{enq.email} · {enq.phone || '-'}</p>
                  {enq.message && <p className="mt-2 text-sm text-secondary-text/70">{enq.message}</p>}
                  {enq.product_name && <p className="mt-1 text-xs text-gold">Product: {enq.product_name}</p>}
                  <p className="mt-1 text-[10px] text-secondary-text/30">{new Date(enq.created_at).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select value={enq.status} onChange={(e) => updateStatus(enq.id, e.target.value)} className="border border-border/15 bg-card px-2 py-1 text-xs outline-none">
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => handleDelete(enq.id)} className="text-secondary-text/70 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="py-12 text-center text-sm text-secondary-text/70">No enquiries</p>}
        </div>
      )}
    </div>
  );
}
