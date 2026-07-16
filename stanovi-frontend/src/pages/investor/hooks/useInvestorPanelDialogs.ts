import { useCallback, useState } from 'react';
import type { Building } from '@/shared/types/entity/building.entity';
import type { Apartment } from '@/shared/types/entity/apartment.entity';

export const useInvestorPanelDialogs = () => {
  const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(null);

  const [buildingForm, setBuildingForm] = useState<{
    open: boolean;
    editing?: Building;
  }>({ open: false });

  const [apartmentForm, setApartmentForm] = useState<{
    buildingId: string | null;
    editing?: Apartment;
  }>({ buildingId: null });

  const [apartmentImages, setApartmentImages] = useState<Apartment | null>(null);

  const [apartmentModel, setApartmentModel] = useState<Apartment | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedBuildingId((current) => (current === id ? null : id));
  }, []);

  const openBuildingForm = useCallback((editing?: Building) => {
    setBuildingForm({ open: true, editing });
  }, []);

  const closeBuildingForm = useCallback(() => {
    setBuildingForm({ open: false });
  }, []);

  const openApartmentForm = useCallback((buildingId: string, editing?: Apartment) => {
    setApartmentForm({ buildingId, editing });
  }, []);

  const closeApartmentForm = useCallback(() => {
    setApartmentForm({ buildingId: null });
  }, []);

  const openApartmentImages = useCallback((apartment: Apartment) => {
    setApartmentImages(apartment);
  }, []);

  const closeApartmentImages = useCallback(() => {
    setApartmentImages(null);
  }, []);

  const openApartmentModel = useCallback((apartment: Apartment) => {
    setApartmentModel(apartment);
  }, []);

  const closeApartmentModel = useCallback(() => {
    setApartmentModel(null);
  }, []);

  return {
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
  };
};
