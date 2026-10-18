'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProductMediaUploader, type MediaItem } from '@/components/product-media-uploader';
import { CollectionMultiSelect } from '@/components/collection-multi-select';

const categories = ['rings', 'necklaces', 'earrings', 'bracelets', 'pendants', 'bridal', 'bangles', 'custom'];
const stockStatuses = ['in_stock', 'low_stock', 'out_of_stock', 'made_to_order'];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminProductNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    name_en: '', name_ar: '', slug: '', sku: '', description_en: '', description_ar: '',
    short_description_en: '', short_description_ar: '', price: '', sale_price: '', compare_price: '',
    category: '', material: '', metal: '', stone: '', carat: '', weight: '',
    sizes: '', colours: '', stock_status: 'in_stock', quantity: '0',
    is_featured: false, is_bestseller: false, is_new_arrival: false, is_signature: false, is_bridal: false, is_limited: false,
    status: 'draft',
    seo_title_en: '', seo_description_en: '',
  });

  const updateField = useCallback((key: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name_en' && !slugManuallyEdited) {
        next.slug = slugify(value);
      }
      return next;
    });
  }, [slugManuallyEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name_en.trim()) { toast.error('Product name (English) is required'); return; }
    if (!form.slug.trim()) { toast.error('Slug is required'); return; }
    if (!form.price || isNaN(parseFloat(form.price))) { toast.error('A valid price is required'); return; }

    setSaving(true);
    try {
      const slug = slugify(form.slug);
      const primaryImage = mediaItems.find((m) => m.is_primary && m.media_type === 'image');
      const thumbnailUrl = primaryImage?.url || mediaItems.find((m) => m.media_type === 'image')?.url || null;
      const videoUrls = mediaItems.filter((m) => m.media_type === 'video').map((m) => m.url);

      const { data, error } = await supabase.from('products').insert({
        name_en: form.name_en.trim(),
        name_ar: form.name_ar.trim() || null,
        slug,
        sku: form.sku.trim() || null,
        description_en: form.description_en || null,
        description_ar: form.description_ar || null,
        short_description_en: form.short_description_en || null,
        short_description_ar: form.short_description_ar || null,
        price: parseFloat(form.price),
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        category: form.category || null,
        material: form.material || null,
        metal: form.metal || null,
        stone: form.stone || null,
        carat: form.carat || null,
        weight: form.weight || null,
        sizes: form.sizes ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
        colours: form.colours ? form.colours.split(',').map((s) => s.trim()).filter(Boolean) : [],
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
        seo_title_en: form.seo_title_en || null,
        seo_description_en: form.seo_description_en || null,
      }).select().single();

      if (error) {
        if (error.code === '23505') {
          toast.error(`A product with slug "${slug}" already exists. Please use a different slug.`);
        } else {
          toast.error(`Failed to create product: ${error.message}`);
        }
        return;
      }

      // Save collection assignments
      if (data && selectedCollectionIds.length > 0) {
        const rows = selectedCollectionIds.map((cid, i) => ({
          collection_id: cid,
          product_id: data.id,
          position: i,
        }));
        await supabase.from('collection_products').insert(rows);
      }

      if (data && mediaItems.length > 0) {
        let mediaErrors = false;

        const mediaRows = mediaItems.map((m, i) => ({
          product_id: data.id,
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

        const imageRows = mediaItems.filter((m) => m.media_type === 'image').map((m, i) => ({
          product_id: data.id,
          url: m.url,
          alt_en: form.name_en || null,
          position: i,
        }));
        if (imageRows.length > 0) {
          const { error: imgErr } = await supabase.from('product_images').insert(imageRows);
          if (imgErr) { mediaErrors = true; console.error('product_images insert failed:', imgErr); }
        }

        if (mediaErrors) {
          toast.success('Product created, but some media could not be saved. You can edit the product to retry.');
        } else {
          toast.success('Product created successfully');
        }
      } else {
        toast.success('Product created successfully');
      }

      router.push('/admin/products');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-2xl text-heading">Add Product</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-6">
        <Section title="Basic">
          <Field label="Name (English) *" value={form.name_en} onChange={(v) => updateField('name_en', v)} />
          <Field label="Name (Arabic)" value={form.name_ar} onChange={(v) => updateField('name_ar', v)} />
          <Field label="Slug *" value={form.slug} onChange={(v) => { setSlugManuallyEdited(true); updateField('slug', v); }} hint="URL-friendly name, e.g. diamond-ring" />
          <Field label="SKU" value={form.sku} onChange={(v) => updateField('sku', v)} />
        </Section>

        <Section title="Description">
          <Field label="Description (English)" value={form.description_en} onChange={(v) => updateField('description_en', v)} textarea />
          <Field label="Description (Arabic)" value={form.description_ar} onChange={(v) => updateField('description_ar', v)} textarea />
          <Field label="Short Description (English)" value={form.short_description_en} onChange={(v) => updateField('short_description_en', v)} />
          <Field label="Short Description (Arabic)" value={form.short_description_ar} onChange={(v) => updateField('short_description_ar', v)} />
        </Section>

        <Section title="Pricing">
          <Field label="Price *" value={form.price} onChange={(v) => updateField('price', v)} type="number" />
          <Field label="Sale Price" value={form.sale_price} onChange={(v) => updateField('sale_price', v)} type="number" />
          <Field label="Compare Price" value={form.compare_price} onChange={(v) => updateField('compare_price', v)} type="number" />
        </Section>

        <Section title="Classification">
          <SelectField label="Category" value={form.category} onChange={(v) => updateField('category', v)} options={categories} />
          <Field label="Material" value={form.material} onChange={(v) => updateField('material', v)} />
          <Field label="Metal" value={form.metal} onChange={(v) => updateField('metal', v)} />
          <Field label="Stone" value={form.stone} onChange={(v) => updateField('stone', v)} />
          <Field label="Carat" value={form.carat} onChange={(v) => updateField('carat', v)} />
          <Field label="Weight" value={form.weight} onChange={(v) => updateField('weight', v)} />
        </Section>

        <Section title="Variants">
          <Field label="Sizes (comma-separated)" value={form.sizes} onChange={(v) => updateField('sizes', v)} hint="e.g. 4,5,6,7,8" />
          <Field label="Colours (comma-separated)" value={form.colours} onChange={(v) => updateField('colours', v)} hint="e.g. Yellow Gold,White Gold" />
        </Section>

        <Section title="Inventory">
          <SelectField label="Stock Status" value={form.stock_status} onChange={(v) => updateField('stock_status', v)} options={stockStatuses} />
          <Field label="Quantity" value={form.quantity} onChange={(v) => updateField('quantity', v)} type="number" />
        </Section>

        <Section title="Marketing">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(['is_featured', 'is_bestseller', 'is_new_arrival', 'is_signature', 'is_bridal', 'is_limited'] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 text-xs text-heading">
                <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="accent-gold" />
                {key.replace('is_', '').replace('_', ' ')}
              </label>
            ))}
          </div>
        </Section>

        <Section title="Product Media (Images & Videos)">
          <div className="sm:col-span-2">
            <ProductMediaUploader initialMedia={[]} onChange={setMediaItems} />
          </div>
        </Section>

        <Section title="SEO">
          <Field label="SEO Title (English)" value={form.seo_title_en} onChange={(v) => updateField('seo_title_en', v)} />
          <Field label="SEO Description (English)" value={form.seo_description_en} onChange={(v) => updateField('seo_description_en', v)} textarea />
        </Section>

        <Section title="Collections">
          <CollectionMultiSelect selectedIds={selectedCollectionIds} onChange={setSelectedCollectionIds} />
        </Section>

        <Section title="Status">
          <SelectField label="Status" value={form.status} onChange={(v) => updateField('status', v)} options={['draft', 'published']} />
        </Section>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-gold px-8 py-3 text-xs font-medium uppercase tracking-wider text-soft-black disabled:opacity-50">
            {saving ? 'Saving...' : 'Create Product'}
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

function Field({ label, value, onChange, type = 'text', textarea, hint }: { label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean; hint?: string }) {
  return (
    <div className={textarea ? 'sm:col-span-2' : ''}>
      <label className="label-luxury mb-1.5 block text-secondary-text/70">{label}</label>
      {textarea ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-border/15 px-3 py-2 text-sm outline-none focus:border-gold" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-border/15 px-3 py-2 text-sm outline-none focus:border-gold" />
      )}
      {hint && <p className="mt-1 text-[10px] text-secondary-text/30">{hint}</p>}
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
