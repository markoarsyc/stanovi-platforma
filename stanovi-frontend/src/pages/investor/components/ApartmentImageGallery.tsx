import { useEffect, useState } from 'react';
import { Trash2, Upload, AlertCircle } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { useInvestorApartmentImages } from '../hooks/useInvestorApartmentImages';
import type { ApartmentImage } from '@/shared/types/building-detail.types';

interface ApartmentImageGalleryProps {
  apartmentId: string;
  onImageUploadSuccess?: () => void;
}

export function ApartmentImageGallery({
  apartmentId,
  onImageUploadSuccess,
}: ApartmentImageGalleryProps) {
  const [images, setImages] = useState<ApartmentImage[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const { imageLoading, imageError, uploadApartmentImage, deleteApartmentImage, getApartmentImages } =
    useInvestorApartmentImages();

  useEffect(() => {
    loadImages();
  }, [apartmentId]);

  const loadImages = async () => {
    setLocalLoading(true);
    try {
      console.log(`[APARTMENT IMAGE GALLERY] Loading images for apartment ${apartmentId}`);
      const fetchedImages = await getApartmentImages(apartmentId);
      const sorted = fetchedImages.sort((a, b) => a.displayOrder - b.displayOrder);
      setImages(sorted);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const success = await uploadApartmentImage(apartmentId, file);
    if (success) {
      await loadImages();
      onImageUploadSuccess?.();
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (confirm('Da li ste sigurni da želite da obrišete ovu sliku?')) {
      // Instant remove from UI
      setImages(images.filter(img => img.id !== imageId));
      
      const success = await deleteApartmentImage(apartmentId, imageId);
      if (success) {
        onImageUploadSuccess?.();
      } else {
        // Reload if delete failed
        await loadImages();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Upload size={16} />
        <h4 className="font-display text-sm font-semibold text-foreground">Slike stana</h4>
      </div>

      <ImageUpload onUploadSuccess={handleImageUpload} isLoading={imageLoading} />

      {imageError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-600">
          <AlertCircle size={16} />
          {imageError}
        </div>
      )}

      {localLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nema dodanih slika za ovaj stan.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group rounded-lg overflow-hidden bg-secondary">
              <img
                src={image.imageUrl}
                alt={`Apartment image ${image.displayOrder}`}
                className="w-full h-40 object-cover"
              />
              <button
                onClick={() => handleDeleteImage(image.id)}
                disabled={imageLoading}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                <Trash2 size={20} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
