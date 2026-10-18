'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X, Play, Film, Maximize2 } from 'lucide-react';
import type { ProductMedia } from '@/lib/types';

interface PremiumGalleryProps {
  media: ProductMedia[];
  productName: string;
  productAlt: string;
}

export function PremiumGallery({ media, productName }: PremiumGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Hover zoom state (desktop)
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Touch zoom state (mobile)
  const [touchZoomActive, setTouchZoomActive] = useState(false);
  const [touchZoomScale, setTouchZoomScale] = useState(1);
  const [touchPan, setTouchPan] = useState({ x: 0, y: 0 });
  const pinchStartRef = useRef<{ dist: number; scale: number } | null>(null);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  const sorted = [...media].sort((a, b) => a.position - b.position);
  const current = sorted[selected];
  const isVideo = current?.media_type === 'video';

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i - 1 + sorted.length) % sorted.length);
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i + 1) % sorted.length);
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, sorted.length]);

  // Mouse move for hover zoom
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isVideo || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, [isVideo]);

  const handleMouseEnter = useCallback(() => {
    if (!isVideo) setIsHovering(true);
  }, [isVideo]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  // Touch handlers for mobile pinch-zoom and double-tap
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isVideo) return;
    if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      pinchStartRef.current = { dist, scale: touchZoomScale };
    } else if (e.touches.length === 1 && touchZoomScale > 1) {
      panStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        panX: touchPan.x,
        panY: touchPan.y,
      };
    }
  }, [isVideo, touchZoomScale, touchPan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isVideo) return;
    if (e.touches.length === 2 && pinchStartRef.current) {
      e.preventDefault();
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const newScale = Math.max(1, Math.min(3, (dist / pinchStartRef.current.dist) * pinchStartRef.current.scale));
      setTouchZoomScale(newScale);
      if (newScale <= 1) {
        setTouchPan({ x: 0, y: 0 });
        setTouchZoomActive(false);
      } else {
        setTouchZoomActive(true);
      }
    } else if (e.touches.length === 1 && panStartRef.current && touchZoomScale > 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - panStartRef.current.x;
      const dy = e.touches[0].clientY - panStartRef.current.y;
      setTouchPan({ x: panStartRef.current.panX + dx, y: panStartRef.current.panY + dy });
    }
  }, [isVideo, touchZoomScale]);

  const handleTouchEnd = useCallback(() => {
    pinchStartRef.current = null;
    panStartRef.current = null;
  }, []);

  const handleDoubleTap = useCallback(() => {
    if (isVideo) return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (touchZoomScale > 1) {
        setTouchZoomScale(1);
        setTouchPan({ x: 0, y: 0 });
        setTouchZoomActive(false);
      } else {
        setTouchZoomScale(2);
        setTouchZoomActive(true);
      }
    }
    lastTapRef.current = now;
  }, [isVideo, touchZoomScale]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const handleThumbClick = useCallback((index: number) => {
    setSelected(index);
    setTouchZoomScale(1);
    setTouchPan({ x: 0, y: 0 });
    setTouchZoomActive(false);
  }, []);

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center bg-muted">
        <span className="text-sm text-secondary-text/50">No images available</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main image area */}
        <div
          ref={imageContainerRef}
          className="group relative aspect-square overflow-hidden bg-muted shadow-luxury"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            if (touchZoomScale <= 1 && !isVideo) {
              handleDoubleTap();
            }
          }}
          style={{ cursor: isVideo ? 'default' : touchZoomActive ? 'grab' : isHovering ? 'zoom-in' : 'pointer' }}
        >
          {isVideo ? (
            <video
              key={current?.id}
              src={current?.url}
              controls
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
              poster={sorted.find((m) => m.media_type === 'image' && m.is_primary)?.url || sorted.find((m) => m.media_type === 'image')?.url}
            />
          ) : (
            <div
              className="h-full w-full transition-transform duration-300 ease-out"
              style={{
                transform: touchZoomActive
                  ? `scale(${touchZoomScale}) translate(${touchPan.x / touchZoomScale}px, ${touchPan.y / touchZoomScale}px)`
                  : isHovering
                  ? `scale(2.2) translate(${(50 - zoomPos.x) * 0.5}px, ${(50 - zoomPos.y) * 0.5}px)`
                  : 'scale(1)',
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                transition: touchZoomActive ? 'none' : 'transform 0.3s ease-out',
              }}
            >
              <img
                src={current?.url}
                alt={current?.alt_en || productName}
                className="h-full w-full object-cover"
                loading="eager"
                draggable={false}
              />
            </div>
          )}

          {/* Zoom indicator (desktop, non-hovering, image only) */}
          {!isVideo && !isHovering && !touchZoomActive && (
            <div className="pointer-events-none absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-0">
              <ZoomIn className="h-4 w-4 text-heading" />
            </div>
          )}

          {/* Expand/lightbox button */}
          {!isVideo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openLightbox(selected);
              }}
              aria-label="Open full screen"
              className="absolute bottom-3 end-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-all duration-200 hover:bg-card hover:scale-110"
            >
              <Maximize2 className="h-4 w-4 text-heading" />
            </button>
          )}

          {/* Prev/Next arrows */}
          {sorted.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected((prev) => (prev - 1 + sorted.length) % sorted.length);
                  setTouchZoomScale(1);
                  setTouchPan({ x: 0, y: 0 });
                  setTouchZoomActive(false);
                }}
                className="absolute start-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-all duration-200 hover:bg-card hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5 text-heading rtl:rotate-180" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected((prev) => (prev + 1) % sorted.length);
                  setTouchZoomScale(1);
                  setTouchPan({ x: 0, y: 0 });
                  setTouchZoomActive(false);
                }}
                className="absolute end-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-all duration-200 hover:bg-card hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5 text-heading rtl:rotate-180" />
              </button>
            </>
          )}

          {/* Touch zoom hint */}
          {!isVideo && !touchZoomActive && sorted.length <= 1 && (
            <div className="pointer-events-none absolute bottom-3 start-3 rounded bg-soft-black/60 px-2 py-1 text-[9px] uppercase tracking-wider text-white/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:hidden">
              Double-tap to zoom
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {sorted.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
            {sorted.map((m, i) => (
              <button
                key={m.id || `media-${i}`}
                onClick={() => handleThumbClick(i)}
                className={`relative h-[88px] w-[88px] flex-shrink-0 overflow-hidden border-2 transition-all duration-300 ${
                  selected === i
                    ? 'border-gold shadow-sm'
                    : 'border-border/10 opacity-70 hover:opacity-100 hover:border-gold/40'
                }`}
                aria-label={`View ${m.media_type} ${i + 1}`}
              >
                {m.media_type === 'video' ? (
                  <>
                    <video src={m.url} className="h-full w-full object-cover" muted preload="metadata" />
                    <div className="absolute inset-0 flex items-center justify-center bg-soft-black/35">
                      <Play className="h-5 w-5 fill-white text-white" />
                    </div>
                    <span className="absolute bottom-0.5 right-0.5 flex items-center gap-0.5 rounded bg-soft-black/75 px-1 py-0.5 text-[7px] font-medium uppercase text-white">
                      <Film className="h-2 w-2" /> Video
                    </span>
                  </>
                ) : (
                  <img src={m.url} alt="" className="h-full w-full object-cover" loading="lazy" draggable={false} />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Dot indicators for mobile */}
        {sorted.length > 1 && (
          <div className="flex justify-center gap-1.5 lg:hidden">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => handleThumbClick(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${selected === i ? 'w-6 bg-gold' : 'w-1.5 bg-border/30'}`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Full-screen lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-soft-black/95"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute end-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-card/10 text-white transition-colors hover:bg-card/20"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <div className="absolute start-4 top-4 z-10 rounded bg-card/10 px-3 py-1.5 text-xs text-white/80">
            {lightboxIndex + 1} / {sorted.length}
          </div>

          {/* Prev */}
          {sorted.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i - 1 + sorted.length) % sorted.length);
              }}
              aria-label="Previous"
              className="absolute start-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-card/10 text-white transition-colors hover:bg-card/20"
            >
              <ChevronLeft className="h-6 w-6 rtl:rotate-180" />
            </button>
          )}

          {/* Content */}
          <div className="flex max-h-[90vh] max-w-[90vw] items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {sorted[lightboxIndex]?.media_type === 'video' ? (
              <video
                src={sorted[lightboxIndex]?.url}
                controls
                autoPlay
                playsInline
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />
            ) : (
              <img
                src={sorted[lightboxIndex]?.url}
                alt={sorted[lightboxIndex]?.alt_en || productName}
                className="max-h-[90vh] max-w-[90vw] object-contain"
                draggable={false}
              />
            )}
          </div>

          {/* Next */}
          {sorted.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i + 1) % sorted.length);
              }}
              aria-label="Next"
              className="absolute end-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-card/10 text-white transition-colors hover:bg-card/20"
            >
              <ChevronRight className="h-6 w-6 rtl:rotate-180" />
            </button>
          )}

          {/* Thumbnail strip in lightbox */}
          {sorted.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-lg bg-card/5 p-2 backdrop-blur-sm">
              {sorted.map((m, i) => (
                <button
                  key={m.id || `lb-${i}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(i);
                  }}
                  className={`relative h-14 w-14 flex-shrink-0 overflow-hidden border-2 transition-all ${
                    lightboxIndex === i ? 'border-gold' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                  aria-label={`Go to ${m.media_type} ${i + 1}`}
                >
                  {m.media_type === 'video' ? (
                    <>
                      <video src={m.url} className="h-full w-full object-cover" muted preload="metadata" />
                      <div className="absolute inset-0 flex items-center justify-center bg-soft-black/30">
                        <Play className="h-3 w-3 fill-white text-white" />
                      </div>
                    </>
                  ) : (
                    <img src={m.url} alt="" className="h-full w-full object-cover" draggable={false} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
