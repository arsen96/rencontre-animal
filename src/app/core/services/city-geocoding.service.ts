import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { CitySuggestion } from '../interfaces/city-selection.interface';
import { GeoPoint } from '../interfaces/user.interface';

interface GeopfFeatureCollection {
  features?: GeopfFeature[];
}

interface GeopfFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    city?: string;
    name?: string;
    label?: string;
    context?: string;
    citycode?: string;
    type?: string;
  };
}

const GEOCODING_URL = 'https://data.geopf.fr/geocodage/search';

@Injectable({ providedIn: 'root' })
export class CityGeocodingService {
  constructor(private readonly http: HttpClient) {}

  searchMunicipalities(query: string, limit = 8): Observable<CitySuggestion[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return of([]);
    }

    const params = new HttpParams()
      .set('q', trimmed)
      .set('limit', String(limit + 6))
      .set('type', 'municipality');

    return this.http.get<GeopfFeatureCollection>(GEOCODING_URL, { params }).pipe(
      map((response) => this.mapFeatures(response.features ?? [], limit)),
      catchError((error) => {
        console.error('City geocoding failed', error);
        return of([]);
      })
    );
  }

  private mapFeatures(features: GeopfFeature[], limit: number): CitySuggestion[] {
    const seen = new Set<string>();
    const results: CitySuggestion[] = [];

    for (const feature of features) {
      const props = feature.properties;
      const name = props?.city?.trim() || props?.name?.trim();
      if (!name || /arrondissement/i.test(name)) {
        continue;
      }

      const key = props?.citycode || name.toLowerCase();
      if (seen.has(key)) {
        continue;
      }

      const location = this.toGeoPoint(feature.geometry?.coordinates);
      if (!location) {
        continue;
      }

      seen.add(key);
      results.push({
        city: name,
        label: props?.label?.trim() || name,
        context: props?.context?.trim() || '',
        location,
      });

      if (results.length >= limit) {
        break;
      }
    }

    return results;
  }

  private toGeoPoint(coordinates?: [number, number]): GeoPoint | null {
    if (!coordinates || coordinates.length < 2) {
      return null;
    }

    const [lng, lat] = coordinates;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return { lat, lng };
  }
}
