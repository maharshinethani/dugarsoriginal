'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/lib/admin-auth';
import Link from 'next/link';
import { Package, Mail, CalendarDays, CheckCircle2, TrendingUp, Plus, Layers, Eye, Edit } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState({ totalProducts: 0, publishedProducts: 0, enquiries: 0, appointments: 0, featured: 0, newArrivals: 0 });
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [prods, pubs, enq, appts, feat, newArr] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'published'),
          supabase.from('enquiries').select('id', { count: 'exact', head: true }),
          supabase.from('appointments').select('id', { count: 'exact', head: true }),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_featured', true),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_new_arrival', true),
        ]);
        setStats({
          totalProducts: prods.count || 0,
          publishedProducts: pubs.count || 0,
          enquiries: enq.count || 0,
          appointments: appts.count || 0,
          featured: feat.count || 0,
          newArrivals: newArr.count || 0,
        });

        const [recentEnq, recentAppt] = await Promise.all([
          supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('appointments').select('*').order('created_at', { ascending: false }).limit(5),
        ]);
        setRecentEnquiries(recentEnq.data || []);
        setRecentAppointments(recentAppt.data || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, href: '/admin/products' },
    { label: 'Published', value: stats.publishedProducts, icon: CheckCircle2, href: '/admin/products' },
    { label: 'Enquiries', value: stats.enquiries, icon: Mail, href: '/admin/enquiries' },
    { label: 'Appointments', value: stats.appointments, icon: CalendarDays, href: '/admin/appointments' },
    { label: 'Featured', value: stats.featured, icon: TrendingUp, href: '/admin/products' },
    { label: 'New Arrivals', value: stats.newArrivals, icon: TrendingUp, href: '/admin/products' },
  ];

  const quickActions = [
    { label: 'Add Product', href: '/admin/products/new', icon: Plus },
    { label: 'Add Collection', href: '/admin/collections', icon: Layers },
    { label: 'View Enquiries', href: '/admin/enquiries', icon: Mail },
    { label: 'View Appointments', href: '/admin/appointments', icon: CalendarDays },
    { label: 'Edit Settings', href: '/admin/settings', icon: Edit },
  ];

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><span className="text-sm text-secondary-text/70">Loading...</span></div>;
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-heading">Dashboard</h1>
      <p className="mt-1 text-xs text-secondary-text/70">Welcome back{user?.email ? `, ${user.email}` : ''}</p>

      {/* Stats cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="border border-border/10 bg-card p-4 transition-colors hover:border-gold/30">
            <card.icon className="h-5 w-5 text-gold" />
            <p className="mt-3 text-2xl font-light text-heading">{card.value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-secondary-text/70">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wider text-heading">Quick Actions</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href} className="flex items-center gap-2 border border-border/15 px-4 py-2.5 text-xs font-medium text-heading transition-colors hover:border-gold hover:text-gold">
              <action.icon className="h-4 w-4" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-border/10 bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-heading">Recent Enquiries</h2>
            <Link href="/admin/enquiries" className="text-[10px] uppercase tracking-wider text-gold hover:underline">View All</Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentEnquiries.length > 0 ? recentEnquiries.map((enq) => (
              <div key={enq.id} className="flex items-center justify-between border-b border-border/5 pb-3">
                <div>
                  <p className="text-sm text-heading">{enq.customer_name}</p>
                  <p className="text-xs text-secondary-text/70">{enq.email || enq.phone || '-'}</p>
                </div>
                <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider ${enq.status === 'new' ? 'bg-gold/20 text-gold' : 'bg-muted text-secondary-text/70'}`}>{enq.status}</span>
              </div>
            )) : <p className="text-xs text-secondary-text/70">No enquiries yet</p>}
          </div>
        </div>

        <div className="border border-border/10 bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-heading">Recent Appointments</h2>
            <Link href="/admin/appointments" className="text-[10px] uppercase tracking-wider text-gold hover:underline">View All</Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentAppointments.length > 0 ? recentAppointments.map((appt) => (
              <div key={appt.id} className="flex items-center justify-between border-b border-border/5 pb-3">
                <div>
                  <p className="text-sm text-heading">{appt.customer_name}</p>
                  <p className="text-xs text-secondary-text/70">{appt.appointment_date || '-'} {appt.appointment_time || ''}</p>
                </div>
                <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider ${appt.status === 'pending' ? 'bg-yellow-500/20 text-yellow-700' : appt.status === 'confirmed' ? 'bg-green-500/20 text-green-700' : 'bg-muted text-secondary-text/70'}`}>{appt.status}</span>
              </div>
            )) : <p className="text-xs text-secondary-text/70">No appointments yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
