import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ApartmentViewToggle from '@/shared/components/ApartmentViewToggle';
import { Spinner, ConfirmDialog } from '@/shared/components/ui';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Role } from '@/shared/types/enums/role.enum';
import { createReservation } from '@/api/services/reservations.service';
import type { ApartmentDetail } from '@/shared/types/building-detail.types';
import { BuildingHero } from './building-detail/BuildingHero';
import { ApartmentTable } from './building-detail/ApartmentTable';
import { ApartmentCards } from './building-detail/ApartmentCards';
import { FloorPlanDialog } from './building-detail/FloorPlanDialog';
import { InvestorContactDialog } from './building-detail/InvestorContactDialog';
import { useBuildingDetail } from './building-detail/useBuildingDetail';

const BuildingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isBuyer = user?.role === Role.BUYER;
  const { building, apartments, investor, loading, error, refetch } = useBuildingDetail(id);
  const [selectedApt, setSelectedApt] = useState<ApartmentDetail | null>(null);
  const [aptView, setAptView] = useState<'list' | 'cards'>('list');
  const [showInvestor, setShowInvestor] = useState(false);
  const [aptToReserve, setAptToReserve] = useState<ApartmentDetail | null>(null);
  const [reserving, setReserving] = useState(false);

  const handleReserve = async () => {
    if (!aptToReserve) return;
    setReserving(true);
    try {
      await createReservation(aptToReserve.id);
      toast.success(`Stan ${aptToReserve.aptNo} je uspešno rezervisan.`);
      setAptToReserve(null);
      refetch();
    } catch {
      toast.error('Greška pri rezervaciji stana. Pokušajte ponovo.');
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={32} label="Učitavanje..." />
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-body text-muted-foreground">
          {error || 'Projekat nije pronađen.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <BuildingHero
        building={building}
        apartmentCount={apartments.length}
        investor={investor}
        onContactInvestor={() => setShowInvestor(true)}
      />

      <section className="py-12">
        <div className="container mx-auto px-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl font-body text-lg leading-relaxed text-muted-foreground"
          >
            {building.description || 'Nema dostupnog opisa za ovaj projekat.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl font-bold text-foreground">
                Stanovi ({apartments.length})
              </h2>
              <ApartmentViewToggle view={aptView} onChange={setAptView} />
            </div>

            {apartments.length === 0 ? (
              <p className="mt-6 font-body text-muted-foreground">
                Nema dodanih stanova za ovaj projekat.
              </p>
            ) : aptView === 'list' ? (
              <ApartmentTable
                apartments={apartments}
                onSelect={setSelectedApt}
                onReserve={isBuyer ? setAptToReserve : undefined}
              />
            ) : (
              <ApartmentCards
                apartments={apartments}
                onSelect={setSelectedApt}
                onReserve={isBuyer ? setAptToReserve : undefined}
              />
            )}
          </motion.div>
        </div>
      </section>

      <FloorPlanDialog apartment={selectedApt} onClose={() => setSelectedApt(null)} />
      <InvestorContactDialog
        open={showInvestor}
        onOpenChange={setShowInvestor}
        investor={investor}
        buildingTitle={building.title}
      />
      <ConfirmDialog
        open={!!aptToReserve}
        title="Rezervacija stana"
        description={
          aptToReserve
            ? `Da li ste sigurni da želite da rezervišete stan ${aptToReserve.aptNo}?`
            : undefined
        }
        confirmLabel="Rezerviši"
        variant="primary"
        isSubmitting={reserving}
        onConfirm={handleReserve}
        onCancel={() => setAptToReserve(null)}
      />
    </div>
  );
};

export default BuildingDetailPage;
