import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import type { Building } from '@/shared/types/entity/building.entity';
import type { Apartment } from '@/shared/types/entity/apartment.entity';
import type { Location } from '@/shared/types/entity/location.entity';

interface BuildingCardProps {
  building: Building & { location: Location; apartments: Apartment[] };
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
}

const statusLabelMap: Record<string, string> = {
  PLANNED: 'Planiran',
  IN_PROGRESS: 'U izgradnji',
  COMPLETED: 'Završen',
};

export const BuildingCard: React.FC<BuildingCardProps> = ({
  building,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  children,
}) => {
  const minPrice = building.apartments.length > 0
    ? Math.min(...building.apartments.map((a) => Number(a.price)))
    : 0;

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

      {isExpanded && children && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-t border-border"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};
