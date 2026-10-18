'use client';

import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Upload, Trash2, Star, ArrowLeft, ArrowRight, Loader2, Film, ImageIcon, X } from 'lucide-react';
import type { ProductMedia } from '@/lib/types';

const MAX_IMAGE_SIZE = 25 * 1024 * 1024;
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

interface MediaItem {
  id?: string;
  media_type: 'image' | 'video';
  url: string;
  storage_path?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  alt_en?: string | null;
  alt_ar?: string | null;
  position: number;
  is_primary: boolean;
  _isNew?: boolean;
}

interface ProductMediaUploaderProps {
  productId?: string;
  initialMedia: ProductMedia[];
  onChange: (media: MediaItem[]) => void;
}

export function ProductMediaUploader({ productId, initialMedia, onChange }: ProductMediaUploaderProps) {
  const [media, setMedia] = useState<MediaItem[]>(
    initialMedia.map((m) => ({ ...m, _isNew: false }))
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const updateMedia = useCallback((newMedia: MediaItem[]) => {
    setMedia(newMedia);
    onChange(newMedia);
  }, [onChange]);

  const uploadFile = async (file: File, mediaType: 'image' | 'video'): Promise<MediaItem | null> => {
    const isImage = mediaType === 'image';
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    const accepted = isImage ? ACCEPTED_IMAGE_TYPES : ACCEPTED_VIDEO_TYPES;

    if (!accepted.includes(file.type)) {
      toast.error(`${file.name}: unsupported format. Use ${isImage ? 'JPG, PNG, WebP' : 'MP4, WebM'}`);
      return null;
    }
    if (file.size > maxSize) {
      toast.error(`${file.name}: file too large (max ${isImage ? '25MB' : '500MB'})`);
      return null;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast.error('You must be logged in to upload');
      return null;
    }

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const bucket = isImage ? 'media' : 'product-videos';
    const folder = isImage ? 'products' : '';
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    setUploadProgress(`Uploading ${file.name}...`);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
      return null;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

    if (isImage) {
      const { error: dbError } = await supabase.from('media').insert({
        url: urlData.publicUrl,
        storage_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        category: 'products',
      });
      if (dbError) {
        console.error('media table insert failed:', dbError);
      }
    }

    return {
      media_type: mediaType,
      url: urlData.publicUrl,
      storage_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      position: 0,
      is_primary: false,
      _isNew: true,
    };
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newItems: MediaItem[] = [];
      for (const file of Array.from(files)) {
        const item = await uploadFile(file, 'image');
        if (item) newItems.push(item);
      }
      if (newItems.length > 0) {
        const combined = [...media, ...newItems.map((m, i) => ({ ...m, position: media.length + i, is_primary: media.length === 0 && i === 0 }))];
        updateMedia(combined);
        toast.success(`${newItems.length} image(s) uploaded`);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newItems: MediaItem[] = [];
      for (const file of Array.from(files)) {
        const item = await uploadFile(file, 'video');
        if (item) newItems.push(item);
      }
      if (newItems.length > 0) {
        const combined = [...media, ...newItems.map((m, i) => ({ ...m, position: media.length + i }))];
        updateMedia(combined);
        toast.success(`${newItems.length} video(s) uploaded`);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleDelete = (index: number) => {
    const item = media[index];
    const filtered = media.filter((_, i) => i !== index);
    const repositioned = filtered.map((m, i) => ({
      ...m,
      position: i,
      is_primary: item.is_primary ? (i === 0 ? true : m.is_primary) : m.is_primary,
    }));
    if (item.is_primary && repositioned.length > 0) {
      repositioned[0].is_primary = true;
    }
    updateMedia(repositioned);
  };

  const handleSetPrimary = (index: number) => {
    const updated = media.map((m, i) => ({ ...m, is_primary: i === index }));
    updateMedia(updated);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === media.length - 1) return;
    const swapped = [...media];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    [swapped[index], swapped[targetIndex]] = [swapped[targetIndex], swapped[index]];
    const repositioned = swapped.map((m, i) => ({ ...m, position: i }));
    updateMedia(repositioned);
  };

  const sorted = [...media].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-4">
      {/* Upload buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 border border-border/15 px-4 py-2 text-xs font-medium uppercase tracking-wider text-heading transition-colors hover:border-gold disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          Upload Images
        </button>
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 border border-border/15 px-4 py-2 text-xs font-medium uppercase tracking-wider text-heading transition-colors hover:border-gold disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
          Upload Videos
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) handleImageUpload(e.target.files); }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) handleVideoUpload(e.target.files); }}
        />
      </div>

      {uploadProgress && (
        <p className="text-xs text-secondary-text/70">{uploadProgress}</p>
      )}

      {/* Media grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border/20 p-12 text-center">
          <ImageIcon className="h-12 w-12 text-secondary-text/30" />
          <p className="text-sm text-secondary-text/60">No media yet. Upload images and videos to showcase this product.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {sorted.map((item, index) => (
            <div key={item.id || `new-${index}`} className="group relative border border-border/15 bg-muted/30">
              {/* Preview */}
              <div className="relative aspect-square overflow-hidden">
                {item.media_type === 'image' ? (
                  <img src={item.url} alt={item.alt_en || item.file_name || ''} className="h-full w-full object-cover" />
                ) : (
                  <video src={item.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                )}
                {/* Type badge */}
                <span className="absolute left-1 top-1 rounded bg-soft-black/70 px-1.5 py-0.5 text-[9px] font-medium uppercase text-white">
                  {item.media_type === 'video' && <Film className="mr-1 inline h-2.5 w-2.5" />}
                  {item.media_type}
                </span>
                {/* Primary badge */}
                {item.is_primary && (
                  <span className="absolute right-1 top-1 flex items-center gap-1 rounded bg-gold px-1.5 py-0.5 text-[9px] font-medium uppercase text-soft-black">
                    <Star className="h-2.5 w-2.5 fill-soft-black" /> Primary
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between p-1.5">
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => handleMove(index, 'left')} disabled={index === 0} title="Move left" className="text-secondary-text/50 hover:text-heading disabled:opacity-30">
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => handleMove(index, 'right')} disabled={index === sorted.length - 1} title="Move right" className="text-secondary-text/50 hover:text-heading disabled:opacity-30">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  {!item.is_primary && item.media_type === 'image' && (
                    <button type="button" onClick={() => handleSetPrimary(index)} title="Set as primary" className="text-secondary-text/50 hover:text-gold">
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button type="button" onClick={() => handleDelete(index)} title="Remove" className="text-secondary-text/50 hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Filename */}
              {item.file_name && (
                <p className="truncate px-1.5 pb-1.5 text-[9px] text-secondary-text/50">{item.file_name}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload info */}
      <div className="text-[10px] text-secondary-text/50">
        <p>Images: JPG, PNG, WebP (max 25MB). Videos: MP4, WebM (max 500MB).</p>
        <p>Only image files can be set as primary. The primary image appears on product cards.</p>
      </div>
    </div>
  );
}

export type { MediaItem };
