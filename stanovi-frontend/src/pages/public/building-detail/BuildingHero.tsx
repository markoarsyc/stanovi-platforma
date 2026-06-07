import { Link } from 'react-router-dom';
import { MapPin, Calendar, Home, ArrowLeft, User } from 'lucide-react';
import type { BuildingDetail, InvestorInfo } from '@/shared/types/building-detail.types';
import { formatDate } from '@/shared/utils/format';

interface BuildingHeroProps {
  building: BuildingDetail;
  apartmentCount: number;
  investor: InvestorInfo | null;
  onContactInvestor: () => void;
}

export const BuildingHero: React.FC<BuildingHeroProps> = ({
  building,
  apartmentCount,
  investor,
  onContactInvestor,
}) => {
  const heroImage = building.images && building.images.length > 0
    ? building.images[0].imageUrl
    : building.image_url;

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
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
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
