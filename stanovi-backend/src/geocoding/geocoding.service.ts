import { Injectable, Logger } from '@nestjs/common';

export interface Coordinates {
  lat: number;
  lng: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly endpoint = 'https://nominatim.openstreetmap.org/search';

  async geocode(
    address: string,
    locationName: string,
  ): Promise<Coordinates | null> {
    const query = `${address}, ${locationName}, Beograd, Srbija`;
    const url = `${this.endpoint}?format=json&limit=1&q=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'stanovi-platforma/1.0',
          'Accept-Language': 'sr',
        },
      });

      if (!res.ok) {
        this.logger.warn(`Nominatim returned ${res.status} for "${query}"`);
        return null;
      }

      const data = (await res.json()) as NominatimResult[];
      if (!data.length) {
        this.logger.warn(`No geocoding result for "${query}"`);
        return null;
      }

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

      return { lat, lng };
    } catch (err) {
      this.logger.error(`Geocoding failed for "${query}": ${String(err)}`);
      return null;
    }
  }
}
