import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Pencil, Trash2, Images } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { BuildingImageGallery } from './BuildingImageGallery';
import type { Building } from '@/shared/types/entity/building.entity';
import type { Apartment } from '@/shared/types/entity/apartment.entity';
import type { Location } from '@/shared/types/entity/location.entity';
import type { BuildingImage } from '@/shared/types/building-detail.types';

interface BuildingCardProps {
  building: Building & { location: Location; apartments: Apartment[]; images?: BuildingImage[] };
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUploadImage?: (file: File) => Promise<void>;
  onDeleteImage?: (imageId: string) => Promise<void>;
  imageLoading?: boolean;
  children?: React.ReactNode;
}

const statusLabelMap: Record<string, string> = {
  PLANNED: 'Planiran',
  IN_PROGRESS: 'U izgradnji',
  COMPLETED: 'Završen',
};

export const BuildingCardInvestor: React.FC<BuildingCardProps> = ({
  building,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onUploadImage,
  onDeleteImage,
  imageLoading = false,
  children,
}) => {
  const [uploadingFile, setUploadingFile] = useState(false);
  const minPrice = building.apartments.length > 0
    ? Math.min(...building.apartments.map((a) => Number(a.price)))
    : 0;

  const handleImageUpload = async (file: File) => {
    if (!onUploadImage) return;
    setUploadingFile(true);
    try {
      await onUploadImage(file);
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-xl border border-border bg-card"
    >
      <div className="flex items-center justify-between p-6">
        <div className="flex-1 cursor-pointer" onClick={onToggleExpand}>
          <h3 className="font-display text-xl font-bold text-foreground">{building.title}</h3>
          <p className="font-body text-sm text-muted-foreground">
            {building.location.name} · {statusLabelMap[building.status]} · od €
            {minPrice > 0 ? Number(minPrice).toLocaleString() : '0'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleExpand}
            className="text-muted-foreground hover:text-foreground"
            title={isExpanded ? 'Smanji' : 'Proširi'}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            onClick={onEdit}
            className="text-muted-foreground hover:text-primary"
            title="Izmeni"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive"
            title="Obriši"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-t border-border"
        >
          {/* Images Section */}
          <div className="border-b border-border p-6">
            <div className="mb-4 flex items-center gap-2">
              <Images size={18} className="text-primary" />
              <h4 className="font-display text-lg font-semibold">Slike projekta</h4>
            </div>

            {/* Upload Section */}
            {onUploadImage && (
              <div className="mb-6">
                <p className="mb-3 text-sm text-muted-foreground">
                  Dodaj do 10 slika za svoj projekat
                </p>
                <ImageUpload
                  onUploadSuccess={handleImageUpload}
                  isLoading={uploadingFile || imageLoading}
                />
              </div>
            )}

            {/* Gallery Section */}
            {building.images && building.images.length > 0 && onDeleteImage ? (
              <BuildingImageGallery
                images={building.images}
                onDelete={onDeleteImage}
                isLoading={imageLoading}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Nema uploadovanih slika</p>
              </div>
            )}
          </div>

          {/* Apartments Section */}
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};
