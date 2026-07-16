import React from 'react';
import { Trash2, AlertCircle, Star } from 'lucide-react';
import type { BuildingImage } from '@/shared/types/building-detail.types';
import { getCoverImage } from '@/shared/utils/buildingImages';

interface BuildingImageGalleryProps {
  images: BuildingImage[];
  onDelete: (imageId: string) => Promise<void>;
  onSetCover?: (imageId: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function BuildingImageGallery({
  images,
  onDelete,
  onSetCover,
  isLoading = false,
  error = null,
}: BuildingImageGalleryProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [coveringId, setCoveringId] = React.useState<string | null>(null);
  const coverId = getCoverImage(images)?.id ?? null;

  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId);
    try {
      await onDelete(imageId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetCover = async (imageId: string) => {
    if (!onSetCover || imageId === coverId) return;
    setCoveringId(imageId);
    try {
      await onSetCover(imageId);
    } finally {
      setCoveringId(null);
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No images uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Greška pri brisanju slike</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image.imageUrl}
                  alt="Building"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Cover badge */}
              {image.id === coverId && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-xs font-medium rounded px-2 py-1">
                  <Star className="w-3 h-3 fill-current" /> Naslovna
                </div>
              )}

              {/* Action buttons - Always visible, no opacity hiding */}
              <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                {onSetCover && (
                  <button
                    onClick={() => handleSetCover(image.id)}
                    disabled={coveringId === image.id || isLoading || image.id === coverId}
                    className="bg-black/50 hover:bg-black/70 disabled:bg-amber-500 text-white p-2 rounded transition-all hover:scale-110 disabled:cursor-default disabled:hover:scale-100"
                    title={image.id === coverId ? 'Naslovna slika' : 'Postavi kao naslovnu'}
                  >
                    {coveringId === image.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Star className={`w-4 h-4 ${image.id === coverId ? 'fill-current' : ''}`} />
                    )}
                  </button>
                )}

                <button
                  onClick={() => handleDelete(image.id)}
                  disabled={deletingId === image.id || isLoading}
                  className="bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:bg-gray-400 text-white p-2 rounded transition-all hover:scale-110 disabled:cursor-not-allowed"
                  title="Delete image"
                >
                  {deletingId === image.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-lg bg-black/0 hover:bg-black/10 transition-colors" />
            </div>
          ))}
      </div>
    </div>
  );
}
