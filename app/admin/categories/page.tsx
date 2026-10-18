'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';
import { Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { GalleryImagePicker } from '@/components/gallery-image-picker';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ 
    name_en: '', 
    name_ar: '', 
    slug: '', 
    description_en: '', 
    description_ar: '', 
    image_url: '', 
    display_order: '0', 
    is_published: true 
  });

  useEffect(() => { 
    fetchCategories(); 
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
    setCategories((data as Category[]) || []);
    setLoading(false);
  }

  function startEdit(cat: Category) {
    setEditing(cat);
    setForm({ 
      name_en: cat.name_en, 
      name_ar: cat.name_ar || '', 
      slug: cat.slug, 
      description_en: cat.description_en || '', 
      description_ar: cat.description_ar || '', 
      image_url: cat.image_url || '', 
      display_order: String(cat.display_order), 
      is_published: cat.is_published 
    });
    setShowForm(true);
  }

  function startNew() {
    setEditing(null);
    setForm({ 
      name_en: '', 
      name_ar: '', 
      slug: '', 
      description_en: '', 
      description_ar: '', 
      image_url: '', 
      display_order: '0', 
      is_published: true 
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name_en || !form.slug) { 
      toast.error('Name and slug required'); 
      return; 
    }
    try {
      if (editing) {
        const { error } = await supabase.from('categories').update({
          name_en: form.name_en, 
          name_ar: form.name_ar || null, 
          slug: form.slug,
          description_en: form.description_en || null, 
          description_ar: form.description_ar || null,
          image_url: form.image_url || null, 
          display_order: parseInt(form.display_order) || 0, 
          is_published: form.is_published,
        }).eq('id', editing.id);
        if (error) throw error;
        toast.success('Category updated');
      } else {
        const { error } = await supabase.from('categories').insert({
          name_en: form.name_en, 
          name_ar: form.name_ar || null, 
          slug: form.slug,
          description_en: form.description_en || null, 
          description_ar: form.description_ar || null,
          image_url: form.image_url || null, 
          display_order: parseInt(form.display_order) || 0, 
          is_published: form.is_published,
        });
        if (error) throw error;
        toast.success('Category created');
      }
      setShowForm(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { 
      toast.error('Failed'); 
      return; 
    }
    toast.success('Deleted');
    fetchCategories();
  }

  // -------------------------------------------------------------
  // FULL PAGE STACKED CARD FORM LAYOUT (LEFT ALIGNED & HIGHLIGHTED BORDERS)
  // -------------------------------------------------------------
  if (showForm) {
    return (
      <div className="w-full text-left space-y-6 pb-12">
        {/* Page Title */}
        <div className="flex items-center gap-3 pb-3 border-b border-gold/30">
          <h1 className="font-serif text-2xl text-heading">
            {editing ? 'Edit Category' : 'Add Category'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          
          {/* 1. BASIC SECTION */}
          <div className="w-full bg-card border-2 border-border/30 hover:border-gold/40 transition-colors p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gold mb-4 border-b border-border/20 pb-2">
              BASIC
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminField 
                label="NAME (ENGLISH) *" 
                value={form.name_en} 
                onChange={(v) => {
                  const generatedSlug = !editing && !form.slug ? v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : form.slug;
                  setForm({ ...form, name_en: v, slug: generatedSlug });
                }} 
              />
              <AdminField 
                label="NAME (ARABIC)" 
                value={form.name_ar} 
                onChange={(v) => setForm({ ...form, name_ar: v })} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminField 
                label="SLUG *" 
                value={form.slug} 
                onChange={(v) => setForm({ ...form, slug: v })} 
              />
              <AdminField 
                label="DISPLAY ORDER" 
                value={form.display_order} 
                onChange={(v) => setForm({ ...form, display_order: v })} 
                type="number" 
              />
            </div>
          </div>

          {/* 2. DESCRIPTION SECTION */}
          <div className="w-full bg-card border-2 border-border/30 hover:border-gold/40 transition-colors p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gold mb-4 border-b border-border/20 pb-2">
              DESCRIPTION
            </h2>
            <AdminField 
              label="DESCRIPTION (ENGLISH)" 
              value={form.description_en} 
              onChange={(v) => setForm({ ...form, description_en: v })} 
              textarea 
              rows={3}
            />
            <AdminField 
              label="DESCRIPTION (ARABIC)" 
              value={form.description_ar} 
              onChange={(v) => setForm({ ...form, description_ar: v })} 
              textarea 
              rows={3}
            />
          </div>

          {/* 3. CATEGORY MEDIA SECTION */}
          <div className="w-full bg-card border-2 border-border/30 hover:border-gold/40 transition-colors p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gold mb-4 border-b border-border/20 pb-2">
              CATEGORY MEDIA
            </h2>
            <div className="max-w-2xl">
              <GalleryImagePicker 
                label="Upload Category Image" 
                value={form.image_url} 
                onChange={(v) => setForm({ ...form, image_url: v || '' })} 
                category="categories" 
              />
            </div>
          </div>

          {/* 4. STATUS SECTION */}
          <div className="w-full bg-card border-2 border-border/30 hover:border-gold/40 transition-colors p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gold mb-4 border-b border-border/20 pb-2">
              STATUS
            </h2>
            <div className="max-w-xs">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-text/80 mb-1.5 block">
                PUBLISH STATUS
              </label>
              <select 
                value={form.is_published ? 'published' : 'draft'} 
                onChange={(e) => setForm({ ...form, is_published: e.target.value === 'published' })}
                className="w-full border-2 border-border/30 px-3 py-2 text-xs outline-none focus:border-gold bg-transparent text-heading transition-colors"
              >
                <option value="published" className="bg-card">Published</option>
                <option value="draft" className="bg-card">Draft</option>
              </select>
            </div>
          </div>

          {/* ACTIONS BUTTONS */}
          <div className="flex gap-4 pt-2">
            <button 
              type="submit" 
              className="bg-gold border-2 border-gold px-8 py-3 text-xs font-medium uppercase tracking-wider text-soft-black hover:bg-gold-light hover:border-gold-light transition-colors"
            >
              {editing ? 'SAVE CATEGORY' : 'CREATE CATEGORY'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowForm(false)} 
              className="border-2 border-border/40 px-8 py-3 text-xs font-medium uppercase tracking-wider text-secondary-text hover:bg-muted hover:border-border/60 transition-colors"
            >
              CANCEL
            </button>
          </div>

        </form>
      </div>
    );
  }

  // -------------------------------------------------------------
  // FULL PAGE CATEGORIES LIST VIEW
  // -------------------------------------------------------------
  return (
    <div className="w-full text-left space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gold/30">
        <div>
          <h1 className="font-serif text-2xl text-heading">Categories</h1>
          <p className="text-xs text-secondary-text/70 mt-1">Manage store categories and display hierarchy</p>
        </div>
        <button 
          onClick={startNew} 
          className="flex items-center gap-2 bg-gold px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-soft-black hover:bg-gold-light transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse bg-muted border-2 border-border/20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="group border-2 border-border/20 hover:border-gold/60 bg-card p-4 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square overflow-hidden bg-muted border border-border/20">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name_en} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-secondary-text/50">No Image</div>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-medium text-heading truncate">{cat.name_en}</h3>
                <p className="text-xs text-secondary-text/70 truncate">{cat.slug}</p>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/20">
                <span className="text-[10px] uppercase tracking-wider text-secondary-text/60">
                  Order: {cat.display_order}
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => startEdit(cat)} 
                    className="flex h-8 w-8 items-center justify-center border-2 border-border/20 text-secondary-text/70 hover:border-gold hover:text-gold transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)} 
                    className="flex h-8 w-8 items-center justify-center border-2 border-border/20 text-secondary-text/70 hover:border-red-300 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminField({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  textarea,
  rows = 2
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  type?: string; 
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div className="w-full text-left">
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-secondary-text/80">
        {label}
      </label>
      {textarea ? (
        <textarea 
          rows={rows} 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full border-2 border-border/30 px-3 py-2 text-xs outline-none focus:border-gold bg-transparent text-heading transition-colors" 
        />
      ) : (
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full border-2 border-border/30 px-3 py-2 text-xs outline-none focus:border-gold bg-transparent text-heading transition-colors" 
        />
      )}
    </div>
  );
}