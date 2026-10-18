'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Collection, Product } from '@/lib/types';
import { Plus, Trash2, Edit, Search, ArrowUp, ArrowDown, Package, Eye, EyeOff, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { GalleryImagePicker } from '@/components/gallery-image-picker';

interface AssignedProduct {
  product_id: string;
  position: number;
  product: Product;
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [form, setForm] = useState({
    name_en: '', 
    name_ar: '', 
    slug: '', 
    description_en: '', 
    description_ar: '',
    hero_image_url: '', 
    story_en: '', 
    story_ar: '', 
    display_order: '0', 
    is_published: true,
    seo_title_en: '', 
    seo_title_ar: '', 
    seo_description_en: '', 
    seo_description_ar: '',
  });

  // Product assignment state
  const [assignedProducts, setAssignedProducts] = useState<AssignedProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => { 
    fetchCollections(); 
  }, []);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('collections').select('*').order('display_order', { ascending: true });
    setCollections((data as Collection[]) || []);
    setLoading(false);
  }, []);

  async function fetchAssignedProducts(collectionId: string) {
    const { data: cpRows } = await supabase
      .from('collection_products')
      .select('product_id, position')
      .eq('collection_id', collectionId)
      .order('position', { ascending: true });

    if (!cpRows || cpRows.length === 0) {
      setAssignedProducts([]);
      return;
    }

    const ids = cpRows.map((r) => r.product_id);
    const { data: prods } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .in('id', ids);

    const sorted: AssignedProduct[] = (prods || [])
      .map((p) => {
        const row = cpRows.find((r) => r.product_id === p.id);
        return { product_id: p.id, position: row?.position ?? 999, product: p as Product };
      })
      .sort((a, b) => a.position - b.position);

    setAssignedProducts(sorted);
  }

  async function fetchAllProducts() {
    setLoadingProducts(true);
    const { data } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .order('name_en', { ascending: true });
    setAllProducts((data as Product[]) || []);
    setLoadingProducts(false);
  }

  function startEdit(col: Collection) {
    setEditing(col);
    setForm({
      name_en: col.name_en, 
      name_ar: col.name_ar || '', 
      slug: col.slug,
      description_en: col.description_en || '', 
      description_ar: col.description_ar || '',
      hero_image_url: col.hero_image_url || '', 
      story_en: col.story_en || '', 
      story_ar: col.story_ar || '',
      display_order: String(col.display_order), 
      is_published: col.is_published,
      seo_title_en: col.seo_title_en || '', 
      seo_title_ar: col.seo_title_ar || '',
      seo_description_en: col.seo_description_en || '', 
      seo_description_ar: col.seo_description_ar || '',
    });
    setShowForm(true);
    fetchAssignedProducts(col.id);
  }

  function startNew() {
    setEditing(null);
    setForm({
      name_en: '', 
      name_ar: '', 
      slug: '', 
      description_en: '', 
      description_ar: '',
      hero_image_url: '', 
      story_en: '', 
      story_ar: '', 
      display_order: '0', 
      is_published: true,
      seo_title_en: '', 
      seo_title_ar: '', 
      seo_description_en: '', 
      seo_description_ar: '',
    });
    setAssignedProducts([]);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name_en || !form.slug) { 
      toast.error('Name and slug required'); 
      return; 
    }
    try {
      const payload = {
        name_en: form.name_en, 
        name_ar: form.name_ar || null, 
        slug: form.slug,
        description_en: form.description_en || null, 
        description_ar: form.description_ar || null,
        hero_image_url: form.hero_image_url || null, 
        story_en: form.story_en || null, 
        story_ar: form.story_ar || null,
        display_order: parseInt(form.display_order) || 0, 
        is_published: form.is_published,
        seo_title_en: form.seo_title_en || null, 
        seo_title_ar: form.seo_title_ar || null,
        seo_description_en: form.seo_description_en || null, 
        seo_description_ar: form.seo_description_ar || null,
      };
      if (editing) {
        const { error } = await supabase.from('collections').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Collection updated');
      } else {
        const { data, error } = await supabase.from('collections').insert(payload).select().maybeSingle();
        if (error) throw error;
        if (data) {
          setEditing(data as Collection);
        }
        toast.success('Collection created');
      }
      setShowForm(false);
      fetchCollections();
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this collection? Products will not be deleted, only unassigned.')) return;
    await supabase.from('collection_products').delete().eq('collection_id', id);
    const { error } = await supabase.from('collections').delete().eq('id', id);
    if (error) { 
      toast.error('Failed'); 
      return; 
    }
    toast.success('Deleted');
    fetchCollections();
  }

  async function togglePublish(col: Collection) {
    const { error } = await supabase.from('collections').update({ is_published: !col.is_published }).eq('id', col.id);
    if (error) { 
      toast.error('Failed'); 
      return; 
    }
    toast.success(col.is_published ? 'Unpublished' : 'Published');
    fetchCollections();
  }

  async function moveProduct(index: number, dir: 'up' | 'down') {
    const newIndex = dir === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= assignedProducts.length) return;
    const updated = [...assignedProducts];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((item, i) => { item.position = i; });
    setAssignedProducts(updated);

    if (editing) {
      const updates = updated.map((item, i) => ({
        collection_id: editing.id, product_id: item.product_id, position: i,
      }));
      await supabase.from('collection_products').upsert(updates, { onConflict: 'collection_id,product_id' });
    }
  }

  async function addProductToCollection(product: Product) {
    if (!editing) { 
      toast.error('Save the collection first before adding products'); 
      return; 
    }
    if (assignedProducts.some((a) => a.product_id === product.id)) {
      toast.error('Product already assigned');
      return;
    }
    const newPosition = assignedProducts.length;
    const { error } = await supabase
      .from('collection_products')
      .insert({ collection_id: editing.id, product_id: product.id, position: newPosition });
    if (error) { 
      toast.error(error.message); 
      return; 
    }
    setAssignedProducts([...assignedProducts, { product_id: product.id, position: newPosition, product }]);
    toast.success('Product added');
  }

  async function removeProductFromCollection(productId: string) {
    if (!editing) return;
    const { error } = await supabase
      .from('collection_products')
      .delete()
      .eq('collection_id', editing.id)
      .eq('product_id', productId);
    if (error) { 
      toast.error(error.message); 
      return; 
    }
    const updated = assignedProducts.filter((a) => a.product_id !== productId).map((a, i) => ({ ...a, position: i }));
    setAssignedProducts(updated);
    const reorderUpdates = updated.map((item, i) => ({
      collection_id: editing.id, product_id: item.product_id, position: i,
    }));
    if (reorderUpdates.length > 0) {
      await supabase.from('collection_products').upsert(reorderUpdates, { onConflict: 'collection_id,product_id' });
    }
    toast.success('Product removed');
  }

  const filteredProducts = allProducts.filter((p) => {
    const q = productSearch.toLowerCase();
    return (
      p.name_en.toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q)
    );
  });

  const assignedIds = new Set(assignedProducts.map((a) => a.product_id));
  const availableProducts = filteredProducts.filter((p) => !assignedIds.has(p.id));

  // -------------------------------------------------------------
  // FULL PAGE STACKED CARD FORM LAYOUT (LEFT ALIGNED & HIGHLIGHTED BORDERS)
  // -------------------------------------------------------------
  if (showForm) {
    return (
      <div className="w-full text-left space-y-6 pb-12">
        {/* Page Title */}
        <div className="flex items-center gap-3 pb-3 border-b border-gold/30">
          <h1 className="font-serif text-2xl text-heading">
            {editing ? 'Edit Collection' : 'Add Collection'}
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

          {/* 3. STORY SECTION */}
          <div className="w-full bg-card border-2 border-border/30 hover:border-gold/40 transition-colors p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gold mb-4 border-b border-border/20 pb-2">
              COLLECTION STORY
            </h2>
            <AdminField 
              label="STORY (ENGLISH)" 
              value={form.story_en} 
              onChange={(v) => setForm({ ...form, story_en: v })} 
              textarea 
              rows={3}
            />
            <AdminField 
              label="STORY (ARABIC)" 
              value={form.story_ar} 
              onChange={(v) => setForm({ ...form, story_ar: v })} 
              textarea 
              rows={3}
            />
          </div>

          {/* 4. COLLECTION MEDIA SECTION */}
          <div className="w-full bg-card border-2 border-border/30 hover:border-gold/40 transition-colors p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gold mb-4 border-b border-border/20 pb-2">
              COLLECTION MEDIA
            </h2>
            <div className="max-w-2xl">
              <GalleryImagePicker 
                label="Hero Image" 
                value={form.hero_image_url} 
                onChange={(v) => setForm({ ...form, hero_image_url: v || '' })} 
                category="collections" 
              />
            </div>
          </div>

          {/* 5. SEO SECTION */}
          <div className="w-full bg-card border-2 border-border/30 hover:border-gold/40 transition-colors p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gold mb-4 border-b border-border/20 pb-2">
              SEO METADATA
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminField 
                label="SEO TITLE (ENGLISH)" 
                value={form.seo_title_en} 
                onChange={(v) => setForm({ ...form, seo_title_en: v })} 
              />
              <AdminField 
                label="SEO TITLE (ARABIC)" 
                value={form.seo_title_ar} 
                onChange={(v) => setForm({ ...form, seo_title_ar: v })} 
              />
            </div>
            <AdminField 
              label="SEO DESCRIPTION (ENGLISH)" 
              value={form.seo_description_en} 
              onChange={(v) => setForm({ ...form, seo_description_en: v })} 
              textarea 
              rows={2}
            />
            <AdminField 
              label="SEO DESCRIPTION (ARABIC)" 
              value={form.seo_description_ar} 
              onChange={(v) => setForm({ ...form, seo_description_ar: v })} 
              textarea 
              rows={2}
            />
          </div>

          {/* 6. STATUS SECTION */}
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

          {/* 7. ASSIGNED PRODUCTS SECTION (ONLY WHEN EDITING) */}
          {editing && (
            <div className="w-full bg-card border-2 border-border/30 hover:border-gold/40 transition-colors p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gold">
                  ASSIGNED PRODUCTS ({assignedProducts.length})
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowProductPicker(!showProductPicker); if (!showProductPicker) fetchAllProducts(); }}
                  className="flex items-center gap-1.5 border-2 border-gold/40 px-3 py-1 text-[10px] uppercase tracking-wider text-gold hover:bg-gold hover:text-soft-black transition-colors"
                >
                  <Plus className="h-3 w-3" /> Add Products
                </button>
              </div>

              {/* Product picker */}
              {showProductPicker && (
                <div className="border-2 border-border/30 bg-background p-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-text/50" />
                    <input
                      type="text"
                      placeholder="Search by name or SKU..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full border-2 border-border/30 py-2 ps-9 pe-3 text-xs outline-none focus:border-gold bg-transparent text-heading transition-colors"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {loadingProducts ? (
                      <div className="py-8 text-center text-xs text-secondary-text/60">Loading products...</div>
                    ) : availableProducts.length === 0 ? (
                      <div className="py-8 text-center text-xs text-secondary-text/60">
                        {filteredProducts.length === 0 ? 'No products found.' : 'All matching products are already assigned.'}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {availableProducts.slice(0, 20).map((p) => (
                          <div key={p.id} className="flex items-center gap-3 border-2 border-border/20 p-2 hover:border-gold/40 transition-colors">
                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden bg-muted border border-border/20">
                              {p.thumbnail_url && <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs font-medium text-heading">{p.name_en}</p>
                              {p.sku && <p className="text-[10px] text-secondary-text/60">{p.sku}</p>}
                            </div>
                            <button
                              type="button"
                              onClick={() => addProductToCollection(p)}
                              className="flex-shrink-0 border-2 border-gold/40 px-2.5 py-1 text-[10px] uppercase text-gold hover:bg-gold hover:text-soft-black transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Assigned products list with reordering */}
              {assignedProducts.length > 0 ? (
                <div className="space-y-2">
                  {assignedProducts.map((item, index) => (
                    <div key={item.product_id} className="flex items-center gap-3 border-2 border-border/20 p-3 bg-muted/20">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveProduct(index, 'up')}
                          disabled={index === 0}
                          className="text-secondary-text/50 hover:text-gold disabled:opacity-30"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveProduct(index, 'down')}
                          disabled={index === assignedProducts.length - 1}
                          className="text-secondary-text/50 hover:text-gold disabled:opacity-30"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                      <GripVertical className="h-4 w-4 text-secondary-text/30" />
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden bg-muted border border-border/20">
                        {(item.product.thumbnail_url || item.product.product_images?.[0]?.url) && (
                          <img src={item.product.thumbnail_url || item.product.product_images?.[0]?.url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-medium text-heading">{item.product.name_en}</p>
                        {item.product.sku && <p className="text-[10px] text-secondary-text/60">{item.product.sku}</p>}
                      </div>
                      <span className="text-[10px] text-secondary-text/50 uppercase tracking-wider">#{item.position}</span>
                      <button
                        type="button"
                        onClick={() => removeProductFromCollection(item.product_id)}
                        className="flex-shrink-0 text-secondary-text/50 hover:text-red-500 transition-colors p-1"
                        title="Remove from collection"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-border/30 py-8 text-center">
                  <Package className="mx-auto h-8 w-8 text-secondary-text/30" />
                  <p className="mt-2 text-xs text-secondary-text/60">No products assigned yet. Click "Add Products" to search and assign.</p>
                </div>
              )}
            </div>
          )}

          {!editing && (
            <div className="bg-card border-2 border-border/30 p-4">
              <p className="text-xs text-secondary-text/60">Save the collection first, then edit it to assign products.</p>
            </div>
          )}

          {/* ACTIONS BUTTONS */}
          <div className="flex gap-4 pt-2">
            <button 
              type="submit" 
              className="bg-gold border-2 border-gold px-8 py-3 text-xs font-medium uppercase tracking-wider text-soft-black hover:bg-gold-light hover:border-gold-light transition-colors"
            >
              {editing ? 'SAVE COLLECTION' : 'CREATE COLLECTION'}
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
  // FULL PAGE COLLECTIONS LIST VIEW
  // -------------------------------------------------------------
  return (
    <div className="w-full text-left space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gold/30">
        <div>
          <h1 className="font-serif text-2xl text-heading">Collections</h1>
          <p className="text-xs text-secondary-text/70 mt-1">Manage store collections and featured stories</p>
        </div>
        <button 
          onClick={startNew} 
          className="flex items-center gap-2 bg-gold px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-soft-black hover:bg-gold-light transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Collection
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse bg-muted border-2 border-border/20" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="mt-12 text-center text-xs text-secondary-text/70 border-2 border-dashed border-border/30 p-12">
          No collections yet. Click "Add Collection" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {collections.map((col) => (
            <div 
              key={col.id} 
              className="group border-2 border-border/20 hover:border-gold/60 bg-card p-4 transition-all flex gap-4"
            >
              <div className="h-20 w-28 flex-shrink-0 overflow-hidden bg-muted border border-border/20">
                {col.hero_image_url ? (
                  <img src={col.hero_image_url} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-secondary-text/50">No Image</div>
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-heading truncate">{col.name_en}</h3>
                  <span className={`px-1.5 py-0.5 text-[9px] uppercase tracking-wider border ${col.is_published ? 'border-green-300 text-green-700 bg-green-50/50' : 'border-border/40 text-secondary-text/70 bg-muted'}`}>
                    {col.is_published ? 'Live' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-secondary-text/70 truncate">{col.slug}</p>
                <p className="mt-1 text-xs text-secondary-text/70 line-clamp-1">{col.description_en}</p>
                <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/20">
                  <span className="text-[10px] uppercase tracking-wider text-secondary-text/60">
                    Order: {col.display_order}
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => startEdit(col)} 
                      className="flex h-7 w-7 items-center justify-center border-2 border-border/20 text-secondary-text/70 hover:border-gold hover:text-gold transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => togglePublish(col)} 
                      className="flex h-7 w-7 items-center justify-center border-2 border-border/20 text-secondary-text/70 hover:border-gold hover:text-gold transition-colors"
                      title={col.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {col.is_published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                    <button 
                      onClick={() => handleDelete(col.id)} 
                      className="flex h-7 w-7 items-center justify-center border-2 border-border/20 text-secondary-text/70 hover:border-red-300 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
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