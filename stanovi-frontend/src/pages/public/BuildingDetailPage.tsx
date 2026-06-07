import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApartmentViewToggle from '@/shared/components/ApartmentViewToggle';
import { Spinner } from '@/shared/components/ui';
import type { ApartmentDetail } from '@/shared/types/building-detail.types';
import { BuildingHero } from './building-detail/BuildingHero';
import { ApartmentTable } from './building-detail/ApartmentTable';
import { ApartmentCards } from './building-detail/ApartmentCards';
import { FloorPlanDialog } from './building-detail/FloorPlanDialog';
import { InvestorContactDialog } from './building-detail/InvestorContactDialog';
import { useBuildingDetail } from './building-detail/useBuildingDetail';

const BuildingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { building, apartments, investor, loading, error } = useBuildingDetail(id);
  const [selectedApt, setSelectedApt] = useState<ApartmentDetail | null>(null);
  const [aptView, setAptView] = useState<'list' | 'cards'>('list');
  const [showInvestor, setShowInvestor] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <Spinner size={32} label="Učitavanje..." />
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <p className="font-body text-muted-foreground">
          {error || 'Projekat nije pronađen.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
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
              <ApartmentTable apartments={apartments} onSelect={setSelectedApt} />
            ) : (
              <ApartmentCards apartments={apartments} onSelect={setSelectedApt} />
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
    </div>
  );
};

export default BuildingDetailPage;
