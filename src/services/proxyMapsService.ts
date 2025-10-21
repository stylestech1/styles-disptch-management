import { TPlace } from "@/components/sections/LocationAutocomplete";
import {
  GoogleGeocodingResponse,
  GoogleGeocodeResult,
  GoogleAddressComponent,
  GoogleDirectionsResponse,
  GoogleRoute,
  GoogleLeg,
  GooglePlacesResponse
} from "@/types/google-maps";

class ProxyMapsService {
  private baseUrl = '/api/google-maps';

  // Geocoding through proxy
  async geocodeAddress(address: string): Promise<TPlace | null> {
    try {
      const response = await fetch(`${this.baseUrl}/geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data: GoogleGeocodingResponse = await response.json();
      
      if (data.results && data.results.length > 0) {
        const place: GoogleGeocodeResult = data.results[0];
        const postcode: string = this.extractPostcode(place.address_components);
        const addressComponents: Record<string, string> = this.extractAddressComponents(place.address_components);
        
        return {
          display_name: place.formatted_address,
          lat: place.geometry.location.lat.toString(),
          lon: place.geometry.location.lng.toString(),
          place_id: place.place_id,
          postcode: postcode,
          address: addressComponents,
          ...addressComponents
        } as TPlace;
      }
      
      return null;
    } catch (error) {
      console.error('Proxy geocoding error:', error);
      return null;
    }
  }

  private extractPostcode(addressComponents: GoogleAddressComponent[]): string {
    const postcodeComponent: GoogleAddressComponent | undefined = addressComponents?.find(
      (component: GoogleAddressComponent) => component.types.includes('postal_code')
    );
    return postcodeComponent?.long_name || '';
  }

  private extractAddressComponents(addressComponents: GoogleAddressComponent[]): Record<string, string> {
    const components: Record<string, string> = {};
    
    if (!addressComponents) return components;

    addressComponents.forEach((component: GoogleAddressComponent) => {
      component.types.forEach((type: string) => {
        components[type] = component.long_name;
      });
    });

    return components;
  }

  // Directions through proxy
  async calculateRouteDistance(
    dho: { lat: number; lng: number } | null,
    origin: { lat: number; lng: number } | null,
    destinations: { lat: number; lng: number }[]
  ): Promise<{ distance: number; duration: number }> {
    try {
      return await this.proxyCalculateRoute(dho, origin, destinations);
    } catch (error) {
      console.error('Proxy directions error:', error);
      return this.clientSideCalculateRoute(dho, origin, destinations);
    }
  }

  private async proxyCalculateRoute(
    dho: { lat: number; lng: number } | null,
    origin: { lat: number; lng: number } | null,
    destinations: { lat: number; lng: number }[]
  ): Promise<{ distance: number; duration: number }> {
    if (!dho && !origin) {
      throw new Error('Insufficient location data');
    }

    let routeOrigin: string;
    let routeDestination: string;
    let waypoints: string[] = [];

    if (dho && origin && destinations.length > 0) {
      routeOrigin = `${dho.lat},${dho.lng}`;
      routeDestination = `${destinations[destinations.length - 1].lat},${destinations[destinations.length - 1].lng}`;
      waypoints = [
        `${origin.lat},${origin.lng}`,
        ...destinations.slice(0, -1).map(dest => `${dest.lat},${dest.lng}`)
      ];
    } else if (origin && destinations.length > 0) {
      routeOrigin = `${origin.lat},${origin.lng}`;
      routeDestination = `${destinations[destinations.length - 1].lat},${destinations[destinations.length - 1].lng}`;
      waypoints = destinations.slice(0, -1).map(dest => `${dest.lat},${dest.lng}`);
    } else if (dho && origin) {
      routeOrigin = `${dho.lat},${dho.lng}`;
      routeDestination = `${origin.lat},${origin.lng}`;
    } else {
      throw new Error('Insufficient location data');
    }

    const response = await fetch(`${this.baseUrl}/directions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin: routeOrigin,
        destination: routeDestination,
        waypoints: waypoints
      }),
    });

    if (!response.ok) {
      throw new Error('Directions calculation failed');
    }

    const data: GoogleDirectionsResponse = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route: GoogleRoute = data.routes[0];
      let totalDistance: number = 0;
      let totalDuration: number = 0;

      route.legs.forEach((leg: GoogleLeg) => {
        totalDistance += leg.distance?.value || 0;
        totalDuration += leg.duration?.value || 0;
      });

      return {
        distance: totalDistance / 1609.34,
        duration: totalDuration / 3600,
      };
    }

    throw new Error('No route found');
  }

  private async clientSideCalculateRoute(
    dho: { lat: number; lng: number } | null,
    origin: { lat: number; lng: number } | null,
    destinations: { lat: number; lng: number }[]
  ): Promise<{ distance: number; duration: number }> {
    const { calculateFullRouteDistance } = await import('@/utils/googleDistanceCalculator');
    return calculateFullRouteDistance(dho, origin, destinations);
  }

  // Places Autocomplete
  async autocomplete(input: string): Promise<GooglePlacesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/places`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error('Autocomplete failed');
      }

      const data: GooglePlacesResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Proxy autocomplete error:', error);
      return { predictions: [], status: 'ERROR' };
    }
  }

  // Batch geocoding
  async geocodeAddresses(addresses: string[]): Promise<(TPlace | null)[]> {
    try {
      const results: (TPlace | null)[] = await Promise.all(
        addresses.map(address => this.geocodeAddress(address))
      );
      return results;
    } catch (error) {
      console.error('Batch geocoding error:', error);
      return addresses.map(() => null);
    }
  }

  // للتوافق مع الدوال القديمة
  async calculateFullRouteDistance(
    dho: { lat: number; lng: number } | null,
    origin: { lat: number; lng: number } | null,
    destinations: { lat: number; lng: number }[]
  ): Promise<{ distance: number; duration: number }> {
    return this.calculateRouteDistance(dho, origin, destinations);
  }

  async calculateDhoToOriginDistance(
    dho: { lat: number; lng: number } | null,
    origin: { lat: number; lng: number } | null
  ): Promise<{ distance: number; duration: number }> {
    return this.calculateRouteDistance(dho, origin, []);
  }
}

export const proxyMapsService = new ProxyMapsService();