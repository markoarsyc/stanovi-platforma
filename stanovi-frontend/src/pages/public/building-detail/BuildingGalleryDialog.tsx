import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/shared/components/Dialog';
import type { BuildingImage } from '@/shared/types/building-detail.types';

interface BuildingGalleryDialogProps {
  images: BuildingImage[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export const BuildingGalleryDialog: React.FC<BuildingGalleryDialogProps> = ({
  images,
  index,
  open,
  onClose,
  onIndexChange,
}) => {
  const count = images.length;

  const goPrev = () => onIndexChange((index - 1 + count) % count);
  const goNext = () => onIndexChange((index + 1) % count);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, count]);

  if (count === 0) return null;

  const current = images[index];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[90vw] max-w-3xl">
        <div className="flex items-center gap-3">
          <button
            onClick={goPrev}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary hover:text-primary"
            title="Prethodna"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex h-[65vh] flex-1 items-center justify-center overflow-hidden rounded-lg bg-black/20">
            <img
              src={current.imageUrl}
              alt="Slika projekta"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <button
            onClick={goNext}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary hover:text-primary"
            title="Sledeća"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <p className="mt-3 text-center font-body text-sm text-muted-foreground">
          {index + 1} / {count}
        </p>
      </DialogContent>
    </Dialog>
  );
};
