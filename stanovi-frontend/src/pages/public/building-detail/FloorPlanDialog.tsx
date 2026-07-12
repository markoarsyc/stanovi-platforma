import { ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/Dialog';
import type { ApartmentDetail } from '@/shared/types/building-detail.types';
import { apartmentStatusConfig } from '@/shared/constants/statusConfig';
import { formatPrice } from '@/shared/utils/format';
import { Model3DViewer } from './Model3DViewer';

interface FloorPlanDialogProps {
  apartment: ApartmentDetail | null;
  onClose: () => void;
}

export const FloorPlanDialog: React.FC<FloorPlanDialogProps> = ({ apartment, onClose }) => (
  <Dialog open={!!apartment} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">
          Stan br. {apartment?.aptNo} — {apartment?.rooms}-soban
        </DialogTitle>
        <DialogDescription className="font-body">
          Sprat {apartment?.floor}. · {Number(apartment?.area)} m² ·{' '}
          {apartment ? formatPrice(apartment.price) : ''} ·{' '}
          {apartment && apartmentStatusConfig[apartment.status].label}
        </DialogDescription>
      </DialogHeader>
      {apartment?.model && (
        <div className="mt-2">
          <Model3DViewer src={apartment.model.modelUrl} alt={`3D model stana ${apartment.aptNo}`} />
        </div>
      )}
      <div className="mt-2 flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
        {apartment?.images && apartment.images.length > 0 ? (
          <div className="w-full space-y-4">
            {apartment.images.map((img) => (
              <div key={img.id} className="rounded-lg overflow-hidden">
                <img
                  src={img.imageUrl}
                  alt={`Plan stana ${apartment.aptNo}`}
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            <ImageIcon size={48} className="text-muted-foreground" />
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Plan stana nije dostupan
            </p>
          </>
        )}
      </div>
    </DialogContent>
  </Dialog>
);
