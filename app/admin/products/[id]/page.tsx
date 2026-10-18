'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Product, ProductMedia } from '@/lib/types';
import { ProductMediaUploader, type MediaItem } from '@/components/product-media-uploader';
import { CollectionMultiSelect } from '@/components/collection-multi-select';

const categories = ['rings', 'necklaces', 'earrings', 'bracelets', 'pendants', 'bridal', 'bangles', 'custom'];
const stockStatuses = ['in_stock', 'low_stock', 'out_of_stock', 'made_to_order'];

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [existingMedia, setExistingMedia] = useState<ProductMedia[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from('products')
        .select('*, product_images(*), product_media(*)')
        .eq('id', id)
        .maybeSingle();
      if (data) {
        setProduct(data as Product);
        setForm({
          ...data,
          sizes: (data.sizes || []).join(','),
          colours: (data.colours || []).join(','),
          price: String(data.price),
          sale_price: data.sale_price ? String(data.sale_price) : '',
          compare_price: data.compare_price ? String(data.compare_price) : '',
          quantity: String(data.quantity),
        });
        const pm = (data.product_media || []) as ProductMedia[];
        setExistingMedia(pm);

        // Load existing collection assignments
        const { data: cpRows } = await supabase
          .from('collection_products')
          .select('collection_id')
          .eq('product_id', id);
        if (cpRows) {
          setSelectedCollectionIds(cpRows.map((r) => r.collection_id));
        }
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const primaryImage = mediaItems.find((m) => m.is_primary && m.media_type === 'image');
      const thumbnailUrl = primaryImage?.url || mediaItems.find((m) => m.media_type === 'image')?.url || form.thumbnail_url || null;
      const videoUrls = mediaItems.filter((m) => m.media_type === 'video').map((m) => m.url);

      const { error } = await supabase.from('products').update({
        name_en: form.name_en,
        name_ar: form.name_ar || null,
        sku: form.sku || null,
        description_en: form.description_en || null,
        description_ar: form.description_ar || null,
        short_description_en: form.short_description_en || null,
        short_description_ar: form.short_description_ar || null,
        price: parseFloat(form.price) || 0,
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        category: form.category || null,
        material: form.material || null,
        metal: form.metal || null,
        stone: form.stone || null,
        carat: form.carat || null,
        weight: form.weight || null,
        sizes: form.sizes ? form.sizes.split(',').map((s: string) => s.trim()) : [],
        colours: form.colours ? form.colours.split(',').map((s: string) => s.trim()) : [],
        stock_status: form.stock_status,
        quantity: parseInt(form.quantity) || 0,
        is_featured: form.is_featured,
        is_bestseller: form.is_bestseller,
        is_new_arrival: form.is_new_arrival,
        is_signature: form.is_signature,
        is_bridal: form.is_bridal,
        is_limited: form.is_limited,
        thumbnail_url: thumbnailUrl,
        video_urls: videoUrls.length > 0 ? videoUrls : null,
        status: form.status,
        updated_at: new Date().toISOString(),
      }).eq('id', id);

      if (error) throw error;

      // Reconcile collection assignments: remove unselected, add new ones
      const { data: existingRows } = await supabase
        .from('collection_products')
        .select('collection_id')
        .eq('product_id', id);
      const existingCollectionIds = (existingRows || []).map((r) => r.collection_id);
      const toRemove = existingCollectionIds.filter((cid) => !selectedCollectionIds.includes(cid));
      const toAdd = selectedCollectionIds.filter((cid) => !existingCollectionIds.includes(cid));

      if (toRemove.length > 0) {
        await supabase.from('collection_products').delete().eq('product_id', id).in('collection_id', toRemove);
      }
      if (toAdd.length > 0) {
        const addRows = toAdd.map((cid) => ({ collection_id: cid, product_id: id, position: 0 }));
        await supabase.from('collection_products').insert(addRows);
      }

      let mediaErrors = false;

      await supabase.from('product_media').delete().eq('product_id', id);

      if (mediaItems.length > 0) {
        const mediaRows = mediaItems.map((m, i) => ({
          product_id: id,
          media_type: m.media_type,
          url: m.url,
          storage_path: m.storage_path || null,
          file_name: m.file_name || null,
          file_size: m.file_size || null,
          mime_type: m.mime_type || null,
          alt_en: form.name_en || null,
          position: i,
          is_primary: m.is_primary,
        }));
        const { error: mediaErr } = await supabase.from('product_media').insert(mediaRows);
        if (mediaErr) { mediaErrors = true; console.error('product_media insert failed:', mediaErr); }

        await supabase.from('product_images').delete().eq('product_id', id);
        const imageRows = mediaItems.filter((m) => m.media_type === 'image').map((m, i) => ({
          product_id: id,
          url: m.url,
          alt_en: form.name_en || null,
          position: i,
        }));
        if (imageRows.length > 0) {
          const { error: imgErr } = await supabase.from('product_images').insert(imageRows);
          if (imgErr) { mediaErrors = true; console.error('product_images insert failed:', imgErr); }
        }
      } else {
        await supabase.from('product_images').delete().eq('product_id', id);
      }

      if (mediaErrors) {
        toast.success('Product updated, but some media could not be saved.');
      } else {
        toast.success('Product updated');
      }
      router.push('/admin/products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center text-sm text-secondary-text/70">Loading...</div>;
  if (!product) return <div className="pt-10 text-center text-sm text-secondary-text/70">Product not found</div>;

  return (
    <div>
      <h1 className="font-serif text-2xl text-heading">Edit Product</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-6">
        <Section title="Basic">
          <Field label="Name (English)" value={form.name_en || ''} onChange={(v) => setForm({ ...form, name_en: v })} />
          <Field label="Name (Arabic)" value={form.name_ar || ''} onChange={(v) => setForm({ ...form, name_ar: v })} />
          <Field label="SKU" value={form.sku || ''} onChange={(v) => setForm({ ...form, sku: v })} />
        </Section>

        <Section title="Description">
          <Field label="Description (English)" value={form.description_en || ''} onChange={(v) => setForm({ ...form, description_en: v })} textarea />
          <Field label="Description (Arabic)" value={form.description_ar || ''} onChange={(v) => setForm({ ...form, description_ar: v })} textarea />
          <Field label="Short Description (English)" value={form.short_description_en || ''} onChange={(v) => setForm({ ...form, short_description_en: v })} />
          <Field label="Short Description (Arabic)" value={form.short_description_ar || ''} onChange={(v) => setForm({ ...form, short_description_ar: v })} />
        </Section>

        <Section title="Pricing">
          <Field label="Price" value={form.price || ''} onChange={(v) => setForm({ ...form, price: v })} type="number" />
          <Field label="Sale Price" value={form.sale_price || ''} onChange={(v) => setForm({ ...form, sale_price: v })} type="number" />
          <Field label="Compare Price" value={form.compare_price || ''} onChange={(v) => setForm({ ...form, compare_price: v })} type="number" />
        </Section>

        <Section title="Classification">
          <SelectField label="Category" value={form.category || ''} onChange={(v) => setForm({ ...form, category: v })} options={categories} />
          <Field label="Material" value={form.material || ''} onChange={(v) => setForm({ ...form, material: v })} />
          <Field label="Metal" value={form.metal || ''} onChange={(v) => setForm({ ...form, metal: v })} />
          <Field label="Stone" value={form.stone || ''} onChange={(v) => setForm({ ...form, stone: v })} />
          <Field label="Carat" value={form.carat || ''} onChange={(v) => setForm({ ...form, carat: v })} />
          <Field label="Weight" value={form.weight || ''} onChange={(v) => setForm({ ...form, weight: v })} />
        </Section>

        <Section title="Variants & Inventory">
          <Field label="Sizes (comma-separated)" value={form.sizes || ''} onChange={(v) => setForm({ ...form, sizes: v })} />
          <Field label="Colours (comma-separated)" value={form.colours || ''} onChange={(v) => setForm({ ...form, colours: v })} />
          <SelectField label="Stock Status" value={form.stock_status || 'in_stock'} onChange={(v) => setForm({ ...form, stock_status: v })} options={stockStatuses} />
          <Field label="Quantity" value={form.quantity || '0'} onChange={(v) => setForm({ ...form, quantity: v })} type="number" />
        </Section>

        <Section title="Marketing">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(['is_featured', 'is_bestseller', 'is_new_arrival', 'is_signature', 'is_bridal', 'is_limited'] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 text-xs text-heading">
                <input type="checkbox" checked={form[key] || false} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="accent-gold" />
                {key.replace('is_', '').replace('_', ' ')}
              </label>
            ))}
          </div>
        </Section>

        <Section title="Product Media (Images & Videos)">
          <div className="sm:col-span-2">
            <ProductMediaUploader
              productId={id}
              initialMedia={existingMedia}
              onChange={setMediaItems}
            />
          </div>
        </Section>

        <Section title="Collections">
          <CollectionMultiSelect selectedIds={selectedCollectionIds} onChange={setSelectedCollectionIds} />
        </Section>

        <Section title="Status">
          <SelectField label="Status" value={form.status || 'draft'} onChange={(v) => setForm({ ...form, status: v })} options={['draft', 'published']} />
        </Section>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-gold px-8 py-3 text-xs font-medium uppercase tracking-wider text-soft-black disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.push('/admin/products')} className="border border-border/15 px-8 py-3 text-xs font-medium uppercase tracking-wider text-heading">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border/10 bg-card p-5">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-heading">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', textarea }: { label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean }) {
  return (
    <div className={textarea ? 'sm:col-span-2' : ''}>
      <label className="label-luxury mb-1.5 block text-secondary-text/70">{label}</label>
      {textarea ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-border/15 px-3 py-2 text-sm outline-none focus:border-gold" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-border/15 px-3 py-2 text-sm outline-none focus:border-gold" />
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="label-luxury mb-1.5 block text-secondary-text/70">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-border/15 bg-card px-3 py-2 text-sm outline-none focus:border-gold">
        <option value="">—</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
