import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Home, ArrowLeft, User } from 'lucide-react';
import type { BuildingDetail, InvestorInfo } from '@/shared/types/building-detail.types';
import { formatDate } from '@/shared/utils/format';
import { getCoverImage, getGalleryImages } from '@/shared/utils/buildingImages';
import { BuildingGalleryDialog } from './BuildingGalleryDialog';

interface BuildingHeroProps {
  building: BuildingDetail;
  apartmentCount: number;
  investor: InvestorInfo | null;
  onContactInvestor: () => void;
}

const MAX_THUMBNAILS = 4;

export const BuildingHero: React.FC<BuildingHeroProps> = ({
  building,
  apartmentCount,
  investor,
  onContactInvestor,
}) => {
  const cover = getCoverImage(building.images);
  const heroImage = cover ? cover.imageUrl : building.image_url;
  const galleryImages = getGalleryImages(building.images);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const thumbnails = galleryImages.slice(0, MAX_THUMBNAILS);
  const extraCount = galleryImages.length - thumbnails.length;

  return (
    <div className="relative h-72 overflow-hidden md:h-96">
      {heroImage ? (
        <img
          src={heroImage}
          alt={building.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-secondary">
          <Home size={64} className="text-muted-foreground" />
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

      {galleryImages.length > 0 && (
        <div className="absolute bottom-4 right-4 z-10 flex gap-2">
          {thumbnails.map((img, i) => {
            const isLast = i === thumbnails.length - 1;
            const showOverlay = isLast && extraCount > 0;
            return (
              <button
                key={img.id}
                onClick={() => openGallery(i)}
                className="relative h-14 w-14 overflow-hidden rounded-lg border-2 border-white/70 shadow-md transition-transform hover:scale-105 md:h-16 md:w-16"
                title="Pogledaj slike projekta"
              >
                <img src={img.imageUrl} alt="Slika projekta" className="h-full w-full object-cover" />
                {showOverlay && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/60 font-body text-sm font-semibold text-white">
                    +{extraCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <BuildingGalleryDialog
        images={galleryImages}
        index={galleryIndex}
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onIndexChange={setGalleryIndex}
      />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="container mx-auto">
          <Link
            to="/oglasi"
            className="mb-4 inline-flex items-center gap-1 font-body text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft size={14} /> Nazad na oglase
          </Link>
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            {building.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {building.address}
              {building.location ? `, ${building.location.name}` : ''}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {formatDate(building.dueDate)}
            </span>
            <span className="flex items-center gap-1">
              <Home size={14} /> {apartmentCount} stanova
            </span>
            {investor && (
              <span className="flex items-center gap-1">
                <User size={14} /> {investor.companyName}
              </span>
            )}
          </div>
          {investor && (
            <button
              onClick={onContactInvestor}
              className="mt-3 inline-flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-2 font-body text-sm hover:bg-secondary hover:text-primary transition-colors"
            >
              <User size={14} /> Kontakt investitora
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
