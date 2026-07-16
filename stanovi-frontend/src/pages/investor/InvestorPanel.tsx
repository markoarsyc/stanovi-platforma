import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import { Button, EmptyState, Spinner } from '@/shared/components/ui';
import { useInvestorBuildings } from './hooks/useInvestorBuildings';
import { useInvestorApartments } from './hooks/useInvestorApartments';
import { useLocationsList } from './hooks/useLocationsList';
import { useInvestorPanelDialogs } from './hooks/useInvestorPanelDialogs';
import { BuildingForm } from './components/BuildingForm';
import { ApartmentForm } from './components/ApartmentForm';
import { ApartmentImageGallery } from './components/ApartmentImageGallery';
import { ApartmentModelManager } from './components/ApartmentModelManager';
import { BuildingCardInvestor } from './components/InvestorBuildingCard';
import { ApartmentList } from './components/ApartmentList';
import type { Building } from '@/shared/types/entity/building.entity';
import type { Apartment } from '@/shared/types/entity/apartment.entity';

const InvestorPanel = () => {
  const {
    buildings,
    loading,
    imageLoading,
    fetchBuildings,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    uploadBuildingImage,
    deleteBuildingImage,
  } = useInvestorBuildings();
  const {
    apartments,
    fetchApartments,
    createApartment,
    updateApartment,
    deleteApartment,
  } = useInvestorApartments(() => fetchBuildings());
  const { locations } = useLocationsList();

  const {
    expandedBuildingId,
    toggleExpand,
    buildingForm,
    openBuildingForm,
    closeBuildingForm,
    apartmentForm,
    openApartmentForm,
    closeApartmentForm,
    apartmentImages,
    openApartmentImages,
    closeApartmentImages,
    apartmentModel,
    openApartmentModel,
    closeApartmentModel,
  } = useInvestorPanelDialogs();

  const [apartmentViewMode, setApartmentViewMode] = useState<'list' | 'cards'>('list');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  const handleExpandBuilding = (buildingId: string) => {
    toggleExpand(buildingId);
    if (expandedBuildingId !== buildingId && !apartments[buildingId]) {
      fetchApartments(buildingId);
    }
  };

  const handleSaveBuilding = async (data: Record<string, unknown>) => {
    setSubmitting(true);
    const buildingData = data as Omit<Building, 'id'>;
    const success = buildingForm.editing
      ? await updateBuilding(buildingForm.editing.id, buildingData)
      : await createBuilding(buildingData);
    setSubmitting(false);
    if (success) closeBuildingForm();
  };

  const handleDeleteBuilding = async (id: string) => {
    if (confirm('Da li ste sigurni da želite da obrišete ovaj projekat?')) {
      await deleteBuilding(id);
    }
  };

  const handleSaveApartment = async (data: Record<string, unknown>) => {
    if (!apartmentForm.buildingId) return;
    setSubmitting(true);
    const apartmentData = data as Omit<Apartment, 'id'>;
    const success = apartmentForm.editing
      ? await updateApartment(apartmentForm.editing.id, apartmentForm.buildingId, apartmentData)
      : await createApartment(apartmentData);
    setSubmitting(false);
    if (success) closeApartmentForm();
  };

  const handleDeleteApartment = async (id: string, buildingId: string) => {
    if (confirm('Da li ste sigurni da želite da obrišete ovaj stan?')) {
      await deleteApartment(id, buildingId);
    }
  };

  return (
    <div className="min-h-screen pt-24">
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
                Moji <span className="text-gradient-indigo">projekti</span>
              </h1>
              <p className="mt-2 font-body text-muted-foreground">
                Upravljajte vašim projektima i stanovima
              </p>
            </div>
            <Button onClick={() => openBuildingForm()}>
              <Plus size={16} /> Novi projekat
            </Button>
          </motion.div>

          <Dialog open={buildingForm.open} onOpenChange={(o) => !o && closeBuildingForm()}>
            <BuildingForm
              building={buildingForm.editing}
              locations={locations}
              onSubmit={handleSaveBuilding}
              onCancel={closeBuildingForm}
              isSubmitting={submitting}
            />
          </Dialog>

          {apartmentForm.buildingId && (
            <Dialog
              open={!!apartmentForm.buildingId}
              onOpenChange={(open) => !open && closeApartmentForm()}
            >
              <ApartmentForm
                buildingId={apartmentForm.buildingId}
                apartment={apartmentForm.editing}
                onSubmit={handleSaveApartment}
                onCancel={closeApartmentForm}
                isSubmitting={submitting}
              />
            </Dialog>
          )}

          {apartmentImages && (
            <Dialog open onOpenChange={(open) => !open && closeApartmentImages()}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">
                    Upravljanje slikama - Stan {apartmentImages.aptNo}
                  </DialogTitle>
                </DialogHeader>
                <ApartmentImageGallery
                  apartmentId={apartmentImages.id}
                  onImageUploadSuccess={() => fetchApartments(apartmentImages.buildingId)}
                />
              </DialogContent>
            </Dialog>
          )}

          {apartmentModel && (
            <Dialog open onOpenChange={(open) => !open && closeApartmentModel()}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">
                    Upravljanje 3D modelom - Stan {apartmentModel.aptNo}
                  </DialogTitle>
                </DialogHeader>
                <ApartmentModelManager
                  apartmentId={apartmentModel.id}
                  onModelChangeSuccess={() => fetchApartments(apartmentModel.buildingId)}
                />
              </DialogContent>
            </Dialog>
          )}

          <div className="mt-10 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-20">
                <Spinner label="Učitavanje projekata..." />
              </div>
            ) : buildings.length === 0 ? (
              <EmptyState
                icon={Building2}
                title='Nemate još projekata. Kliknite "Novi projekat" da dodate prvi.'
              />
            ) : (
              buildings.map((building) => (
                <BuildingCardInvestor
                  key={building.id}
                  building={building}
                  isExpanded={expandedBuildingId === building.id}
                  onToggleExpand={() => handleExpandBuilding(building.id)}
                  onEdit={() => openBuildingForm(building)}
                  onDelete={() => handleDeleteBuilding(building.id)}
                  onUploadImage={async (file) => {
                    await uploadBuildingImage(building.id, file);
                  }}
                  onDeleteImage={(imageId) => deleteBuildingImage(building.id, imageId)}
                  imageLoading={imageLoading}
                  onReservationChange={() => fetchApartments(building.id)}
                >
                  <ApartmentList
                    apartments={apartments[building.id] || []}
                    view={apartmentViewMode}
                    onViewChange={setApartmentViewMode}
                    onEdit={(apt) => openApartmentForm(building.id, apt)}
                    onDelete={(id) => handleDeleteApartment(id, building.id)}
                    onAddNew={() => openApartmentForm(building.id)}
                    onManageImages={openApartmentImages}
                    onManageModel={openApartmentModel}
                  />
                </BuildingCardInvestor>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default InvestorPanel;
