import React from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import type { BuildingImage } from '@/shared/types/building-detail.types';

interface BuildingImageGalleryProps {
  images: BuildingImage[];
  onDelete: (imageId: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function BuildingImageGallery({
  images,
  onDelete,
  isLoading = false,
  error = null,
}: BuildingImageGalleryProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId);
    try {
      await onDelete(imageId);
    } finally {
      setDeletingId(null);
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
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

              {/* Order badge */}
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-medium rounded px-2 py-1">
                #{image.displayOrder + 1}
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(image.id)}
                disabled={deletingId === image.id || isLoading}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                title="Delete image"
              >
                {deletingId === image.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>

              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
          ))}
      </div>
    </div>
  );
}
