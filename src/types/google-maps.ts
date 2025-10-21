export interface GoogleGeocodingResponse {
  results: GoogleGeocodeResult[];
  status: string;
}

export interface GoogleGeocodeResult {
  address_components: GoogleAddressComponent[];
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    location_type: string;
    viewport: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  };
  place_id: string;
  types: string[];
}

export interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface GoogleDirectionsResponse {
  routes: GoogleRoute[];
  status: string;
}

export interface GoogleRoute {
  legs: GoogleLeg[];
  overview_polyline: { points: string };
}

export interface GoogleLeg {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  end_address: string;
  end_location: { lat: number; lng: number };
  start_address: string;
  start_location: { lat: number; lng: number };
}

export interface GooglePlacesResponse {
  predictions: GooglePlacePrediction[];
  status: string;
}

export interface GooglePlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}