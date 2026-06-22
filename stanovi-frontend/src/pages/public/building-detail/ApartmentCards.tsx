import { motion } from 'framer-motion';
import { ImageIcon, BookMarked } from 'lucide-react';
import type { ApartmentDetail } from '@/shared/types/building-detail.types';
import { apartmentStatusConfig } from '@/shared/constants/statusConfig';
import { formatPrice } from '@/shared/utils/format';
import { Button } from '@/shared/components/ui';

interface ApartmentCardsProps {
  apartments: ApartmentDetail[];
  onSelect: (apt: ApartmentDetail) => void;
  onReserve?: (apt: ApartmentDetail) => void;
}

export const ApartmentCards: React.FC<ApartmentCardsProps> = ({ apartments, onSelect, onReserve }) => (
  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {apartments.map((apt) => {
      const config = apartmentStatusConfig[apt.status];
      const StatusIcon = config.icon;
      return (
        <motion.div
          key={apt.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onSelect(apt)}
          className="cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
        >
          <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
            {apt.images?.[0]?.imageUrl ? (
              <img
                src={apt.images[0].imageUrl}
                alt="Plan"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon size={40} className="text-muted-foreground/40" />
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-foreground">Stan {apt.aptNo}</h3>
              <span className={`inline-flex items-center gap-1 font-body text-xs font-medium ${config.textClassName}`}>
                <StatusIcon size={12} />
                {config.label}
              </span>
            </div>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              Sprat {apt.floor}. · {apt.rooms} sobe · {Number(apt.area)} m²
            </p>
            <p className="mt-2 font-body text-lg font-semibold text-accent">
              {formatPrice(apt.price)}
            </p>
            {onReserve && (
              <Button
                size="sm"
                fullWidth
                className="mt-3"
                disabled={apt.status !== 'AVAILABLE'}
                onClick={(e) => {
                  e.stopPropagation();
                  onReserve(apt);
                }}
              >
                <BookMarked size={14} />
                {apt.status === 'AVAILABLE' ? 'Rezerviši' : 'Rezervisan'}
              </Button>
            )}
          </div>
        </motion.div>
      );
    })}
  </div>
);
