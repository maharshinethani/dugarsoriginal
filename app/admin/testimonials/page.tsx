'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Star, Check, X, Trash2, MessageSquare, Edit2, EyeOff, Save } from 'lucide-react';
import type { Testimonial } from '@/lib/types';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editProduct, setEditProduct] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    setLoading(true);
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    setTestimonials((data as Testimonial[]) || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
    const { error } = await supabase
      .from('testimonials')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      toast.error('Failed to update testimonial');
    } else {
      toast.success(`Testimonial ${status}`);
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete testimonial');
    } else {
      toast.success('Testimonial deleted');
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    }
    setConfirmDelete(null);
  }

  function startEdit(item: Testimonial) {
    setEditingId(item.id);
    setEditName(item.customer_name);
    setEditText(item.testimonial_text);
    setEditRating(item.rating);
    setEditProduct(item.product_ref || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditText('');
    setEditRating(5);
    setEditProduct('');
  }

  async function saveEdit(id: string) {
    if (!editName.trim() || !editText.trim()) {
      toast.error('Name and testimonial text are required');
      return;
    }
    setSavingEdit(true);
    const { error } = await supabase
      .from('testimonials')
      .update({
        customer_name: editName.trim().slice(0, 100),
        testimonial_text: editText.trim().slice(0, 500),
        rating: editRating,
        product_ref: editProduct.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) {
      toast.error('Failed to save changes');
    } else {
      toast.success('Testimonial updated');
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                customer_name: editName.trim().slice(0, 100),
                testimonial_text: editText.trim().slice(0, 500),
                rating: editRating,
                product_ref: editProduct.trim() || null,
              }
            : t
        )
      );
      cancelEdit();
    }
    setSavingEdit(false);
  }

  const filtered = filter === 'all' ? testimonials : testimonials.filter((t) => t.status === filter);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-700',
      approved: 'bg-green-500/20 text-green-700',
      rejected: 'bg-red-500/20 text-red-700',
    };
    return colors[status] || 'bg-muted text-secondary-text/70';
  };

  return (
    <div>
      <h1 className="font-serif text-2xl text-heading">Testimonials</h1>
      <p className="mt-1 text-xs text-secondary-text/70">Review, approve, reject, edit, and manage customer testimonials.</p>

      <div className="mt-6 flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors ${
              filter === f ? 'bg-gold text-soft-black' : 'border border-border/15 text-secondary-text/85 hover:border-gold'
            }`}
          >
            {f} ({f === 'all' ? testimonials.length : testimonials.filter((t) => t.status === f).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <MessageSquare className="h-10 w-10 text-secondary-text/20" />
          <p className="mt-4 text-sm text-secondary-text/70">No testimonials found.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((item) => (
            <div key={item.id} className="border border-border/10 bg-card p-5">
              {editingId === item.id ? (
                /* EDIT MODE */
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-secondary-text/60">Customer Name</label>
                    <input
                      className="w-full border border-border/15 bg-background px-3 py-2 text-sm text-heading outline-none focus:border-gold"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-secondary-text/60">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditRating(star)}
                        >
                          <Star
                            className={`h-5 w-5 ${star <= editRating ? 'fill-gold text-gold' : 'text-border/30'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-secondary-text/60">Product Reference</label>
                    <input
                      className="w-full border border-border/15 bg-background px-3 py-2 text-sm text-heading outline-none focus:border-gold"
                      value={editProduct}
                      onChange={(e) => setEditProduct(e.target.value)}
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-secondary-text/60">Testimonial Text</label>
                    <textarea
                      className="w-full border border-border/15 bg-background px-3 py-2 text-sm text-heading outline-none focus:border-gold"
                      rows={3}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      maxLength={500}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(item.id)}
                      disabled={savingEdit}
                      className="flex items-center gap-1.5 bg-gold px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-soft-black transition-colors hover:bg-gold/90 disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 border border-border/20 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-secondary-text/85 transition-colors hover:border-gold"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-serif text-sm text-heading">{item.customer_name}</p>
                      <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider ${statusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-1 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-3 w-3 ${idx < item.rating ? 'fill-gold text-gold' : 'text-border/20'}`}
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-secondary-text/85">
                      &ldquo;{item.testimonial_text}&rdquo;
                    </p>
                    {item.product_ref && (
                      <p className="mt-2 text-[10px] uppercase tracking-wider text-secondary-text/50">
                        {item.product_ref}
                      </p>
                    )}
                    <p className="mt-2 text-[10px] text-secondary-text/50">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {item.status === 'approved' ? (
                      <button
                        onClick={() => updateStatus(item.id, 'pending')}
                        className="flex h-8 w-8 items-center justify-center border border-border/20 text-secondary-text/70 transition-colors hover:border-gold hover:text-gold"
                        aria-label="Unpublish"
                        title="Unpublish"
                      >
                        <EyeOff className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(item.id, 'approved')}
                        className="flex h-8 w-8 items-center justify-center border border-green-500/30 text-green-600 transition-colors hover:bg-green-500/10"
                        aria-label="Approve"
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    {item.status !== 'rejected' && (
                      <button
                        onClick={() => updateStatus(item.id, 'rejected')}
                        className="flex h-8 w-8 items-center justify-center border border-border/20 text-secondary-text/70 transition-colors hover:border-red-400 hover:text-red-500"
                        aria-label="Reject"
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(item)}
                      className="flex h-8 w-8 items-center justify-center border border-border/20 text-secondary-text/70 transition-colors hover:border-gold hover:text-gold"
                      aria-label="Edit"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {confirmDelete === item.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex h-8 w-8 items-center justify-center bg-red-500 text-white"
                          aria-label="Confirm delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="flex h-8 w-8 items-center justify-center border border-border/20 text-secondary-text/70"
                          aria-label="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(item.id)}
                        className="flex h-8 w-8 items-center justify-center border border-border/20 text-secondary-text/70 transition-colors hover:border-red-400 hover:text-red-500"
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
