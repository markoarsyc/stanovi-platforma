import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useInvestorBuildings } from './hooks/useInvestorBuildings';
import { useInvestorApartments } from './hooks/useInvestorApartments';
import { useLocationsList } from './hooks/useLocationsList';
import { BuildingForm } from './components/BuildingForm';
import { ApartmentForm } from './components/ApartmentForm';
import { ApartmentImageGallery } from './components/ApartmentImageGallery';
import { BuildingCardInvestor } from './components/BuildingCard';
import { ApartmentList } from './components/ApartmentList';
import type { Building } from '@/shared/types/entity/building.entity';
import type { Apartment } from '@/shared/types/entity/apartment.entity';

const InvestorPanel = () => {
  const { user, loading: authLoading, isInvestor } = useAuth();
  const navigate = useNavigate();

  // Hooks
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

  // Local state
  const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(null);
  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | undefined>(undefined);
  const [showApartmentForm, setShowApartmentForm] = useState<string | null>(null);
  const [editingApartment, setEditingApartment] = useState<Apartment | undefined>(undefined);
  const [apartmentViewMode, setApartmentViewMode] = useState<'list' | 'cards'>('list');
  const [submitting, setSubmitting] = useState(false);
  const [showApartmentImages, setShowApartmentImages] = useState(false);
  const [managingApartment, setManagingApartment] = useState<Apartment | undefined>(undefined);

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || !isInvestor)) {
      navigate('/auth', { replace: true });
    }
  }, [authLoading, user, isInvestor, navigate]);

  // Fetch buildings on mount
  useEffect(() => {
    if (user && isInvestor) {
      fetchBuildings();
    }
  }, [user, isInvestor]);

  // Handlers
  const handleExpandBuilding = (buildingId: string) => {
    if (expandedBuildingId === buildingId) {
      setExpandedBuildingId(null);
    } else {
      setExpandedBuildingId(buildingId);
      if (!apartments[buildingId]) {
        fetchApartments(buildingId);
      }
    }
  };

  const handleOpenBuildingForm = (building?: Building) => {
    if (building) {
      setEditingBuilding(building);
    } else {
      setEditingBuilding(undefined);
    }
    setShowBuildingForm(true);
  };

  const handleSaveBuilding = async (data: any) => {
    setSubmitting(true);
    const success = editingBuilding
      ? await updateBuilding(editingBuilding.id, data)
      : await createBuilding(data);
    setSubmitting(false);

    if (success) {
      setShowBuildingForm(false);
      setEditingBuilding(undefined);
    }
  };

  const handleDeleteBuilding = async (id: string) => {
    if (confirm('Da li ste sigurni da želite da obrišete ovaj projekat?')) {
      await deleteBuilding(id);
    }
  };

  const handleOpenApartmentForm = (buildingId: string, apartment?: Apartment) => {
    setShowApartmentForm(buildingId);
    if (apartment) {
      setEditingApartment(apartment);
    } else {
      setEditingApartment(undefined);
    }
  };

  const handleSaveApartment = async (data: any) => {
    setSubmitting(true);
    const success = editingApartment && showApartmentForm
      ? await updateApartment(editingApartment.id, showApartmentForm, data)
      : await createApartment(data);
    setSubmitting(false);

    if (success) {
      setShowApartmentForm(null);
      setEditingApartment(undefined);
    }
  };

  const handleDeleteApartment = async (id: string, buildingId: string) => {
    if (confirm('Da li ste sigurni da želite da obrišete ovaj stan?')) {
      await deleteApartment(id, buildingId);
    }
  };

  const handleManageApartmentImages = (apartment: Apartment) => {
    setManagingApartment(apartment);
    setShowApartmentImages(true);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <p className="text-muted-foreground">Učitavanje...</p>
      </div>
    );
  }

  if (!user || !isInvestor) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24">
      <section className="py-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
                Moji <span className="text-gradient-indigo">projekti</span>
              </h1>
              <p className="mt-2 font-body text-muted-foreground">Upravljajte vašim projektima i stanovima</p>
            </div>
            <button
              onClick={() => handleOpenBuildingForm()}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-indigo px-6 py-3 font-body text-sm font-semibold text-primary-foreground shadow-indigo transition-transform hover:scale-105"
            >
              <Plus size={16} /> Novi projekat
            </button>
          </motion.div>

          {/* Building Form Dialog */}
          <Dialog open={showBuildingForm} onOpenChange={setShowBuildingForm}>
            <BuildingForm
              building={editingBuilding}
              locations={locations}
              onSubmit={handleSaveBuilding}
              onCancel={() => {
                setShowBuildingForm(false);
                setEditingBuilding(undefined);
              }}
              isSubmitting={submitting}
            />
          </Dialog>

          {/* Apartment Form Dialog */}
          {showApartmentForm && (
            <Dialog
              open={!!showApartmentForm}
              onOpenChange={(open) => {
                if (!open) {
                  setShowApartmentForm(null);
                  setEditingApartment(undefined);
                }
              }}
            >
              <ApartmentForm
                buildingId={showApartmentForm}
                apartment={editingApartment}
                onSubmit={handleSaveApartment}
                onCancel={() => {
                  setShowApartmentForm(null);
                  setEditingApartment(undefined);
                }}
                isSubmitting={submitting}
              />
            </Dialog>
          )}

          {/* Apartment Images Dialog */}
          {showApartmentImages && managingApartment && (
            <Dialog
              open={showApartmentImages}
              onOpenChange={(open) => {
                if (!open) {
                  setShowApartmentImages(false);
                  setManagingApartment(undefined);
                }
              }}
            >
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">
                    Upravljanje slikama - Stan {managingApartment.aptNo}
                  </DialogTitle>
                </DialogHeader>
                <ApartmentImageGallery
                  apartmentId={managingApartment.id}
                  onImageUploadSuccess={() => {
                    // Refresh the apartment list after image upload/delete
                    fetchApartments(managingApartment.buildingId);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}

          {/* Buildings List */}
          <div className="mt-10 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-20">
                <p className="font-body text-muted-foreground">Učitavanje projekata...</p>
              </div>
            ) : buildings.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
                <Building2 size={48} className="text-muted-foreground" />
                <p className="mt-4 font-body text-muted-foreground">
                  Nemate još projekata. Kliknite "Novi projekat" da dodate prvi.
                </p>
              </div>
            ) : (
              buildings.map((building) => (
                <BuildingCardInvestor
                  key={building.id}
                  building={building}
                  isExpanded={expandedBuildingId === building.id}
                  onToggleExpand={() => handleExpandBuilding(building.id)}
                  onEdit={() => handleOpenBuildingForm(building)}
                  onDelete={() => handleDeleteBuilding(building.id)}
                  onUploadImage={async (file) => {
                    await uploadBuildingImage(building.id, file);
                  }}
                  onDeleteImage={(imageId) => deleteBuildingImage(building.id, imageId)}
                  imageLoading={imageLoading}
                >
                  <ApartmentList
                    apartments={apartments[building.id] || []}
                    view={apartmentViewMode}
                    onViewChange={setApartmentViewMode}
                    onEdit={(apt) => handleOpenApartmentForm(building.id, apt)}
                    onDelete={(id) => handleDeleteApartment(id, building.id)}
                    onAddNew={() => handleOpenApartmentForm(building.id)}
                    onManageImages={handleManageApartmentImages}
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
