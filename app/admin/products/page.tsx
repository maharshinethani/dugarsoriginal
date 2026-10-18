'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts((data as Product[]) || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = products.filter((p) => {
    const name = p.name_en || '';
    const sku = p.sku || '';
    return name.toLowerCase().includes(search.toLowerCase()) ||
      sku.toLowerCase().includes(search.toLowerCase());
  });

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('Product deleted');
    fetchProducts();
  }

  async function togglePublish(product: Product) {
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('products').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', product.id);
    if (error) { toast.error('Failed to update'); return; }
    toast.success(`Product ${newStatus === 'published' ? 'published' : 'unpublished'}`);
    fetchProducts();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-heading">Products</h1>
        <Link href="/admin/products/new" className="flex items-center gap-2 bg-gold px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-soft-black hover:bg-gold-light">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-3 border border-border/15 px-4 py-2.5">
        <Search className="h-4 w-4 text-secondary-text/70" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU..." className="flex-1 bg-card text-sm text-heading outline-none" />
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse bg-muted" />)}</div>
      ) : (
        <div className="mt-6 overflow-x-auto border border-border/10">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-[10px] uppercase tracking-wider text-secondary-text/70">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border/5 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.thumbnail_url && <img src={p.thumbnail_url} alt="" className="h-10 w-10 object-cover" />}
                      <span className="text-heading">{p.name_en || 'Untitled'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-secondary-text/70">{p.sku || '-'}</td>
                  <td className="px-4 py-3 text-secondary-text/70">${p.price}</td>
                  <td className="px-4 py-3 text-secondary-text/70">{p.category || '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublish(p)} className={`px-2 py-0.5 text-[9px] uppercase tracking-wider ${p.status === 'published' ? 'bg-green-500/20 text-green-700' : 'bg-muted text-secondary-text/70'}`}>
                      {p.status}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/jewellery/${p.slug}`} target="_blank" className="text-secondary-text/70 hover:text-gold"><Eye className="h-4 w-4" /></Link>
                      <Link href={`/admin/products/${p.id}`} className="text-secondary-text/70 hover:text-gold"><Edit className="h-4 w-4" /></Link>
                      <button onClick={() => handleDelete(p.id)} className="text-secondary-text/70 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="py-12 text-center text-sm text-secondary-text/70">No products found</p>}
        </div>
      )}
    </div>
  );
}
