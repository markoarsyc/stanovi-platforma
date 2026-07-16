import type { BuildingImage } from '@/shared/types/building-detail.types';

export function getCoverImage(images?: BuildingImage[] | null): BuildingImage | null {
  if (!images || images.length === 0) return null;
  return images.find((img) => img.isCover) ?? images[0];
}

export function getGalleryImages(images?: BuildingImage[] | null): BuildingImage[] {
  const cover = getCoverImage(images);
  if (!images || !cover) return [];
  return images.filter((img) => img.id !== cover.id);
}
