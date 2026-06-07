import type { ApartmentDetail } from '@/shared/types/building-detail.types';
import { apartmentStatusConfig } from '@/shared/constants/statusConfig';
import { formatPrice } from '@/shared/utils/format';

interface ApartmentTableProps {
  apartments: ApartmentDetail[];
  onSelect: (apt: ApartmentDetail) => void;
}

const headerCellClass =
  'px-5 py-4 text-left font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground';

export const ApartmentTable: React.FC<ApartmentTableProps> = ({ apartments, onSelect }) => (
  <div className="mt-6 overflow-x-auto rounded-xl border border-border">
    <table className="w-full">
      <thead>
        <tr className="border-b border-border bg-secondary/50">
          <th className={headerCellClass}>Stan</th>
          <th className={headerCellClass}>Sprat</th>
          <th className={headerCellClass}>Sobe</th>
          <th className={headerCellClass}>Površina</th>
          <th className={headerCellClass}>Cena</th>
          <th className={headerCellClass}>Status</th>
        </tr>
      </thead>
      <tbody>
        {apartments.map((apt) => {
          const config = apartmentStatusConfig[apt.status];
          const StatusIcon = config.icon;
          return (
            <tr
              key={apt.id}
              onClick={() => onSelect(apt)}
              className="cursor-pointer border-b border-border transition-colors hover:bg-secondary/30"
            >
              <td className="px-5 py-4 font-body text-sm font-medium text-foreground">{apt.aptNo}</td>
              <td className="px-5 py-4 font-body text-sm text-muted-foreground">{apt.floor}.</td>
              <td className="px-5 py-4 font-body text-sm text-muted-foreground">{apt.rooms}</td>
              <td className="px-5 py-4 font-body text-sm text-muted-foreground">{Number(apt.area)} m²</td>
              <td className="px-5 py-4 font-body text-sm font-semibold text-accent">{formatPrice(apt.price)}</td>
              <td className="px-5 py-4">
                <span className={`inline-flex items-center gap-1 font-body text-sm font-medium ${config.textClassName}`}>
                  <StatusIcon size={14} />
                  {config.label}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
