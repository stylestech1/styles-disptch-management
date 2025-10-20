// components/ui/MapWithRoute.tsx
import { useEffect, useRef, useState } from "react";
import { TPlace } from "@/components/sections/LocationAutocomplete";

interface MapWithRouteProps {
  dho: TPlace | null;
  origin: TPlace | null;
  destinations: (TPlace | null)[];
  height?: string;
}

const MapWithRoute: React.FC<MapWithRouteProps> = ({
  dho,
  origin,
  destinations,
  height = "400px",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService] = useState(
    () => new google.maps.DirectionsService()
  );
  const [directionsRenderer] = useState(
    () => new google.maps.DirectionsRenderer()
  );
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const googleMap = new google.maps.Map(mapRef.current, {
      zoom: 5,
      center: { lat: 39.8283, lng: -98.5795 }, // Center of US
      mapTypeControl: false,
      streetViewControl: false,
    });

    setMap(googleMap);
    directionsRenderer.setMap(googleMap);
  }, [directionsRenderer]);

  // Clear previous markers and routes
  const clearMarkers = () => {
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);
  };

  const clearRoutes = () => {
    directionsRenderer.setDirections({
      routes: [],
      request: {
        travelMode: google.maps.TravelMode.DRIVING,
      } as google.maps.DirectionsRequest,
    } as google.maps.DirectionsResult);
  };

  // Add markers and calculate route
  useEffect(() => {
    if (!map) return;

    clearMarkers();
    clearRoutes();

    const validDestinations = destinations.filter(
      (dest): dest is TPlace => dest !== null
    );
    const allLocations: TPlace[] = [];

    if (dho) allLocations.push(dho);
    if (origin) allLocations.push(origin);
    allLocations.push(...validDestinations);

    if (allLocations.length === 0) return;

    // Add markers
    const newMarkers = allLocations.map((location, index) => {
      const position = {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon),
      };

      let icon: google.maps.Icon | undefined;
      let label: string | undefined;

      if (location === dho) {
        icon = {
          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNy41ODYgMiA0IDUuNTg2IDQgMTBDNCAxNC40MTQgNy41ODYgMTggMTIgMThDMTYuNDE0IDE4IDIwIDE0LjQxNCAyMCAxMEMyMCA1LjU4NiAxNi40MTQgMiAxMiAyWk0xMiAxMkMxMC44OTcgMTIgMTAgMTEuMTAzIDEwIDEwQzEwIDguODk3IDEwLjg5NyA4IDEyIDhDMTMuMTAzIDggMTQgOC44OTcgMTQgMTBDMTQgMTEuMTAzIDEzLjEwMyAxMiAxMiAxMloiIGZpbGw9IiMzMzgwRkYiLz4KPC9zdmc+",
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12),
        };
        label = "DHO";
      } else if (location === origin) {
        icon = {
          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNy41ODYgMiA0IDUuNTg2IDQgMTBDNCAxNC40MTQgNy41ODYgMTggMTIgMThDMTYuNDE0IDE4IDIwIDE0LjQxNCAyMCAxMEMyMCA1LjU4NiAxNi40MTQgMiAxMiAyWk0xMiAxMkMxMC44OTcgMTIgMTAgMTEuMTAzIDEwIDEwQzEwIDguODk3IDEwLjg5NyA4IDEyIDhDMTMuMTAzIDggMTQgOC44OTcgMTQgMTBDMTQgMTEuMTAzIDEzLjEwMyAxMiAxMiAxMloiIGZpbGw9IiMxNjlFNzYiLz4KPC9zdmc+",
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12),
        };
        label = "Origin";
      } else {
        icon = {
          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNy41ODYgMiA0IDUuNTg2IDQgMTBDNCAxNC40MTQgNy41ODYgMTggMTIgMThDMTYuNDE0IDE4IDIwIDE0LjQxNCAyMCAxMEMyMCA1LjU4NiAxNi40MTQgMiAxMiAyWk0xMiAxMkMxMC44OTcgMTIgMTAgMTEuMTAzIDEwIDEwQzEwIDguODk3IDEwLjg5NyA4IDEyIDhDMTMuMTAzIDggMTQgOC44OTcgMTQgMTBDMTQgMTEuMTA3IDEzLjEwMyAxMiAxMiAxMloiIGZpbGw9IiNERjQ0MzYiLz4KPC9zdmc+",
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12),
        };
        label = `Dest ${validDestinations.indexOf(location) + 1}`;
      }

      const marker = new google.maps.Marker({
        position,
        map,
        icon,
        label: {
          text: label,
          color: "#fff",
          fontSize: "10px",
          fontWeight: "bold",
        },
        title: location.display_name,
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <div class="font-semibold">${label}</div>
            <div class="text-sm text-gray-600">${location.display_name}</div>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Calculate and display route if we have enough points
    if ((dho && origin) || (origin && validDestinations.length > 0)) {
      calculateAndDisplayRoute();
    }

    // Fit map to bounds
    const bounds = new google.maps.LatLngBounds();
    allLocations.forEach((location) => {
      bounds.extend({
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon),
      });
    });

    // تأكد من وجود نقاط قبل fitBounds
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);

      // حد أدنى للـ zoom إذا كانت النقاط قريبة جداً
      const listener = google.maps.event.addListener(map, "idle", () => {
        const currentZoom = map.getZoom();
        if (currentZoom && currentZoom > 15) {
          map.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [map, dho, origin, destinations, directionsService, directionsRenderer]);

  const calculateAndDisplayRoute = () => {
    if (!map || (!dho && !origin)) return;

    const validDestinations = destinations.filter(
      (dest): dest is TPlace => dest !== null
    );

    let waypoints: google.maps.DirectionsWaypoint[] = [];
    let routeOrigin: google.maps.LatLngLiteral;
    let routeDestination: google.maps.LatLngLiteral;

    if (dho && origin && validDestinations.length > 0) {
      // DHO → Origin → Destinations
      routeOrigin = { lat: parseFloat(dho.lat), lng: parseFloat(dho.lon) };
      routeDestination = {
        lat: parseFloat(validDestinations[validDestinations.length - 1].lat),
        lng: parseFloat(validDestinations[validDestinations.length - 1].lon),
      };

      waypoints = [
        {
          location: {
            lat: parseFloat(origin.lat),
            lng: parseFloat(origin.lon),
          },
          stopover: true,
        },
        ...validDestinations.slice(0, -1).map((dest) => ({
          location: { lat: parseFloat(dest.lat), lng: parseFloat(dest.lon) },
          stopover: true,
        })),
      ];
    } else if (origin && validDestinations.length > 0) {
      // Origin → Destinations
      routeOrigin = {
        lat: parseFloat(origin.lat),
        lng: parseFloat(origin.lon),
      };
      routeDestination = {
        lat: parseFloat(validDestinations[validDestinations.length - 1].lat),
        lng: parseFloat(validDestinations[validDestinations.length - 1].lon),
      };

      waypoints = validDestinations.slice(0, -1).map((dest) => ({
        location: { lat: parseFloat(dest.lat), lng: parseFloat(dest.lon) },
        stopover: true,
      }));
    } else if (dho && origin) {
      // DHO → Origin فقط
      routeOrigin = { lat: parseFloat(dho.lat), lng: parseFloat(dho.lon) };
      routeDestination = {
        lat: parseFloat(origin.lat),
        lng: parseFloat(origin.lon),
      };
    } else {
      return;
    }

    directionsService.route(
      {
        origin: routeOrigin,
        destination: routeDestination,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
        } else {
          console.warn("Directions request failed due to", status);
        }
      }
    );
  };

  return (
    <div
      ref={mapRef}
      style={{ height }}
      className="w-full rounded-lg border border-gray-200"
    />
  );
};

export default MapWithRoute;
