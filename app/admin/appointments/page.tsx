'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchAppointments(); }, []);

  async function fetchAppointments() {
    setLoading(true);
    const { data } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
    setAppointments(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) { toast.error('Failed'); return; }
    toast.success('Status updated');
    fetchAppointments();
  }

  const filtered = filter ? appointments.filter((a) => a.status === filter) : appointments;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-heading">Appointments</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-border/15 bg-card px-3 py-2 text-sm outline-none focus:border-gold">
          <option value="">All</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 animate-pulse bg-muted" />)}</div>
      ) : (
        <div className="mt-6 overflow-x-auto border border-border/10">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-[10px] uppercase tracking-wider text-secondary-text/70">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-t border-border/5 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="text-heading">{a.customer_name}</p>
                    <p className="text-xs text-secondary-text/70">{a.country || '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-secondary-text/70">
                    <p>{a.email || '-'}</p>
                    <p className="text-xs">{a.phone || '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-secondary-text/70">
                    <p>{a.appointment_date || '-'}</p>
                    <p className="text-xs">{a.appointment_time || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-secondary-text/70">{a.appointment_type || '-'}</td>
                  <td className="px-4 py-3">
                    <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)} className="border border-border/15 bg-card px-2 py-1 text-xs outline-none">
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="py-12 text-center text-sm text-secondary-text/70">No appointments</p>}
        </div>
      )}
    </div>
  );
}
