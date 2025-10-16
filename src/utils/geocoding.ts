import { TPlace } from "@/components/sections/LocationAutocomplete";

export const geocodeAddress = async (address: string): Promise<TPlace | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=US`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const place = data[0];
      return {
        display_name: place.display_name,
        lat: place.lat,
        lon: place.lon,
        place_id: place.place_id.toString(),
        postcode: place.address?.postcode
      } as TPlace;
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Batch geocoding for multiple addresses
export const geocodeAddresses = async (addresses: string[]): Promise<(TPlace | null)[]> => {
  try {
    const results = await Promise.all(
      addresses.map(address => geocodeAddress(address))
    );
    return results;
  } catch (error) {
    console.error('Batch geocoding error:', error);
    return addresses.map(() => null);
  }
};