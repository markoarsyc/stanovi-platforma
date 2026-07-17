import type { BuildingImage } from '@/lib/api/types';

export function sortImages(images?: BuildingImage[] | null): BuildingImage[] {
  return [...(images ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getCoverImage(images?: BuildingImage[] | null): BuildingImage | null {
  const sorted = sortImages(images);
  if (sorted.length === 0) return null;
  return sorted.find((img) => img.isCover) ?? sorted[0];
}

export function getGalleryImages(images?: BuildingImage[] | null): BuildingImage[] {
  const cover = getCoverImage(images);
  if (!cover) return [];
  return sortImages(images).filter((img) => img.id !== cover.id);
}
