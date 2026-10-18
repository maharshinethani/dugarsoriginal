'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Collection } from '@/lib/types';
import { Check, ChevronDown, Search, X } from 'lucide-react';

interface CollectionMultiSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function CollectionMultiSelect({ selectedIds, onChange }: CollectionMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCollections() {
      const { data } = await supabase
        .from('collections')
        .select('*')
        .order('display_order', { ascending: true });
      setCollections((data as Collection[]) || []);
      setLoading(false);
    }
    fetchCollections();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCollections = collections.filter((c) => selectedIds.includes(c.id));
  const filtered = collections.filter((c) => {
    const q = search.toLowerCase();
    return c.name_en.toLowerCase().includes(q) || (c.name_ar || '').toLowerCase().includes(q);
  });

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  function remove(id: string) {
    onChange(selectedIds.filter((sid) => sid !== id));
  }

  return (
    <div className="sm:col-span-2" ref={ref}>
      <label className="label-luxury mb-1.5 block text-secondary-text/70">Collections</label>

      {/* Chips */}
      {selectedCollections.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedCollections.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-heading"
            >
              {c.name_en}
              <button type="button" onClick={() => remove(c.id)} className="text-secondary-text/50 hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between border border-border/15 bg-card px-3 py-2 text-sm text-heading outline-none transition-colors focus:border-gold"
        >
          <span className="text-secondary-text/70">
            {loading ? 'Loading collections...' : selectedIds.length === 0 ? 'Select collections...' : `${selectedIds.length} selected`}
          </span>
          <ChevronDown className={`h-4 w-4 text-secondary-text/50 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute z-30 mt-1 w-full border border-border/15 bg-card shadow-lg">
            {/* Search */}
            <div className="relative border-b border-border/10 p-2">
              <Search className="absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary-text/50" />
              <input
                type="text"
                placeholder="Search collections..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-border/10 py-1.5 ps-7 pe-2 text-xs outline-none focus:border-gold"
                autoFocus
              />
            </div>

            {/* List */}
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-6 text-center text-xs text-secondary-text/60">
                  {loading ? 'Loading...' : 'No collections found.'}
                </div>
              ) : (
                filtered.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggle(c.id)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-gold/5 ${
                        isSelected ? 'text-heading' : 'text-secondary-text/80'
                      }`}
                    >
                      <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center border ${isSelected ? 'border-gold bg-gold' : 'border-border/30'}`}>
                        {isSelected && <Check className="h-3 w-3 text-soft-black" />}
                      </span>
                      <span className="flex-1 truncate">
                        {c.name_en}
                        {!c.is_published && <span className="ms-1.5 text-[9px] uppercase tracking-wider text-secondary-text/40">draft</span>}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
