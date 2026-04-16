import api from '../axios';

export const getApartmentsByBuildingId = async (buildingId: string) => {
  const response = await api.get(`/apartments`, {
    params: { buildingId },
  });
  return response.data;
};

export const getApartmentById = async (id: string) => {
  const response = await api.get(`/apartments/${id}`);
  return response.data;
};
