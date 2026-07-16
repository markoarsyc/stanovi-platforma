import { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface Model3DViewerProps {
  src: string;
  alt?: string;
}

// Responsive height: never taller than ~42% of the viewport, so the model fits
// on screen inside a dialog without forcing the modal to scroll.
const VIEWER_HEIGHT = 'clamp(220px, 42vh, 420px)';

export function Model3DViewer({ src, alt = '3D model stana' }: Model3DViewerProps) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const viewerRef = useRef<HTMLElement | null>(null);

  // Lazy-load the web component so three.js stays out of the initial bundle.
  useEffect(() => {
    let cancelled = false;
    import('@google/model-viewer')
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    const onError = () => setError(true);
    el.addEventListener('error', onError);
    return () => el.removeEventListener('error', onError);
  }, [ready]);

  if (error) {
    return (
      <div
        className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary"
        style={{ height: VIEWER_HEIGHT }}
      >
        <AlertCircle size={40} className="text-muted-foreground" />
        <p className="mt-2 font-body text-sm text-muted-foreground">
          3D model se ne može učitati
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div
        className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary"
        style={{ height: VIEWER_HEIGHT }}
      >
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-2 font-body text-sm text-muted-foreground">Učitavanje 3D modela...</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-secondary">
      <model-viewer
        ref={viewerRef}
        src={src}
        alt={alt}
        camera-controls
        auto-rotate
        loading="eager"
        touch-action="pan-y"
        shadow-intensity="1"
        style={{ width: '100%', height: VIEWER_HEIGHT, backgroundColor: 'transparent' }}
      />
    </div>
  );
}
