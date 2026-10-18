'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Upload, ImageIcon, X, Check, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export interface MediaItem {
  id: string;
  url: string;
  storage_path: string;
  file_name: string;
  alt_en: string | null;
  alt_ar: string | null;
  category: string | null;
}

interface GalleryImagePickerProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  category?: string;
  multiple?: boolean;
  multipleValues?: string[];
  onMultipleChange?: (urls: string[]) => void;
}

const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNlMmU4ZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5YmEzYjciPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

export function GalleryImagePicker({
  value,
  onChange,
  label = 'Image',
  category = 'general',
  multiple = false,
  multipleValues = [],
  onMultipleChange,
}: GalleryImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(value);
  }, [value]);

  useEffect(() => {
    if (multiple && onMultipleChange) {
      setSelectedIds(new Set(multipleValues));
    }
  }, [multiple, multipleValues, onMultipleChange]);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('media').select('*').order('created_at', { ascending: false });
      if (category !== 'general') {
        query = query.or(`category.eq.${category},category.is.null`);
      }
      const { data, error } = await query;
      if (error) throw error;
      setMediaItems((data as MediaItem[]) || []);
    } catch {
      toast.error('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    if (open) fetchMedia();
  }, [open, fetchMedia]);

  const handleUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error('You must be logged in to upload images');
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          continue;
        }
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = `${category}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          toast.error(`Upload failed: ${uploadError.message}`);
          continue;
        }

        const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);

        const { data: mediaRow, error: dbError } = await supabase
          .from('media')
          .insert({
            url: urlData.publicUrl,
            storage_path: filePath,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            category,
          })
          .select()
          .single();

        if (dbError) {
          toast.error(`Database error: ${dbError.message}`);
          continue;
        }

        if (mediaRow) {
          const uploadedMedia = mediaRow as MediaItem;
          setMediaItems((prev) => [uploadedMedia, ...prev]);

          if (multiple && onMultipleChange) {
            const nextUrls = multipleValues.includes(uploadedMedia.url)
              ? multipleValues
              : [...multipleValues, uploadedMedia.url];
            setSelectedIds((prev) => new Set(prev).add(uploadedMedia.id));
            onMultipleChange(nextUrls);
          } else {
            onChange(uploadedMedia.url);
            setPreviewUrl(uploadedMedia.url);
          }
        }
      }
      toast.success('Image(s) uploaded successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelect = (item: MediaItem) => {
    if (multiple && onMultipleChange) {
      const newIds = new Set(selectedIds);
      const newUrls = [...multipleValues];
      if (newIds.has(item.id)) {
        newIds.delete(item.id);
        const idx = newUrls.indexOf(item.url);
        if (idx > -1) newUrls.splice(idx, 1);
      } else {
        newIds.add(item.id);
        newUrls.push(item.url);
      }
      setSelectedIds(newIds);
      onMultipleChange(newUrls);
    } else {
      onChange(item.url);
      setPreviewUrl(item.url);
      setOpen(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreviewUrl(null);
  };

  const handleConfirmMultiple = () => {
    setOpen(false);
  };

  const handleDeleteMedia = async (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase.storage.from('media').remove([item.storage_path]);
      await supabase.from('media').delete().eq('id', item.id);
      setMediaItems((prev) => prev.filter((m) => m.id !== item.id));
      toast.success('Image deleted from gallery');
    } catch {
      toast.error('Failed to delete image');
    }
  };

  const filteredMedia = mediaItems.filter((item) =>
    item.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-secondary-text">
          {label}
        </label>
      )}

      {/* Preview / Placeholder */}
      <div className="flex items-start gap-4">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden border border-border/20 bg-muted">
          {previewUrl ? (
            <>
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center bg-soft-black/60 text-white transition-colors hover:bg-destructive"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : multiple && multipleValues.length > 0 ? (
            <div className="relative h-full w-full">
              <img src={multipleValues[0]} alt="Preview" className="h-full w-full object-cover" />
              {multipleValues.length > 1 && (
                <span className="absolute bottom-1 right-1 rounded bg-soft-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  +{multipleValues.length - 1}
                </span>
              )}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-8 w-8 text-secondary-text/40" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Choose from Gallery
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload New Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleUpload(e.target.files);
            }}
          />
        </div>
      </div>

      {/* Gallery Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl bg-card">
          <DialogHeader>
            <DialogTitle>Image Gallery</DialogTitle>
          </DialogHeader>

          {/* Search + Upload */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-text/50" />
              <Input
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload
            </Button>
          </div>

          {/* Gallery Grid */}
          <ScrollArea className="h-[400px] rounded border border-border/20">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-secondary-text/50" />
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
                <ImageIcon className="h-12 w-12 text-secondary-text/30" />
                <p className="text-sm text-secondary-text/60">
                  {searchQuery ? 'No images match your search.' : 'No images in the gallery yet. Upload one to get started.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-4 md:grid-cols-5">
                {filteredMedia.map((item) => {
                  const isSelected = multiple
                    ? selectedIds.has(item.id)
                    : value === item.url;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`group relative aspect-square cursor-pointer overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-gold ring-2 ring-gold/30'
                          : 'border-border/20 hover:border-gold/50'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.alt_en || item.file_name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-soft-black">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-soft-black/70 px-1 py-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="truncate text-[9px] text-white">{item.file_name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteMedia(item, e)}
                        className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center bg-soft-black/60 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                        aria-label="Delete image from gallery"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {multiple && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary-text">
                {selectedIds.size} image(s) selected
              </span>
              <Button type="button" size="sm" onClick={handleConfirmMultiple}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { FALLBACK_IMAGE };
