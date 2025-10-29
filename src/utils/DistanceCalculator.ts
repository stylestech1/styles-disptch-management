export const calculateRouteDistance = (
  dho: { lat: number; lng: number } | null,
  origin: { lat: number; lng: number } | null,
  destinations: { lat: number; lng: number }[]
): Promise<{ distance: number; duration: number }> => {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject("Google Maps not loaded");
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    // DHO و Origin و Destinations
    if (dho && origin && destinations.length > 0) {
      const waypoints = destinations.slice(0, -1).map(dest => ({
        location: dest,
        stopover: true,
      }));

      const lastDestination = destinations[destinations.length - 1];

      directionsService.route(
        {
          origin: dho,
          destination: lastDestination,
          waypoints: [
            { location: origin, stopover: true },
            ...waypoints
          ],
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: false,
        },
        (response, status) => {
          if (status === google.maps.DirectionsStatus.OK && response) {
            let totalDistance = 0;
            let totalDuration = 0;

            response.routes[0].legs.forEach(leg => {
              totalDistance += leg.distance?.value || 0;
              totalDuration += leg.duration?.value || 0;
            });

            resolve({
              distance: totalDistance / 1609.34, 
              duration: totalDuration / 3600, 
            });
          } else {
            reject("Route calculation failed");
          }
        }
      );
    }
    //Origin و Destinations
    else if (origin && destinations.length > 0) {
      const waypoints = destinations.slice(0, -1).map(dest => ({
        location: dest,
        stopover: true,
      }));

      const lastDestination = destinations[destinations.length - 1];

      directionsService.route(
        {
          origin: origin,
          destination: lastDestination,
          waypoints: waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: false,
        },
        (response, status) => {
          if (status === google.maps.DirectionsStatus.OK && response) {
            let totalDistance = 0;
            let totalDuration = 0;

            response.routes[0].legs.forEach(leg => {
              totalDistance += leg.distance?.value || 0;
              totalDuration += leg.duration?.value || 0;
            });

            resolve({
              distance: totalDistance / 1609.34,
              duration: totalDuration / 3600,
            });
          } else {
            reject("Route calculation failed");
          }
        }
      );
    }
    //DHO و Origin 
    else if (dho && origin) {
      directionsService.route(
        {
          origin: dho,
          destination: origin,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === google.maps.DirectionsStatus.OK && response) {
            const leg = response.routes[0].legs[0];
            resolve({
              distance: (leg.distance?.value || 0) / 1609.34,
              duration: (leg.duration?.value || 0) / 3600,
            });
          } else {
            reject("Route calculation failed");
          }
        }
      );
    } else {
      reject("Insufficient location data");
    }
  });
};

export const calculateDhoToOriginDistance = (
  dho: { lat: number; lng: number } | null,
  origin: { lat: number; lng: number } | null
): Promise<{ distance: number; duration: number }> => {
  return new Promise((resolve, reject) => {
    if (!dho || !origin) {
      reject("DHO or Origin missing");
      return;
    }

    if (!window.google) {
      reject("Google Maps not loaded");
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: dho,
        destination: origin,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === google.maps.DirectionsStatus.OK && response) {
          const leg = response.routes[0].legs[0];
          resolve({
            distance: (leg.distance?.value || 0) / 1609.34,
            duration: (leg.duration?.value || 0) / 3600,
          });
        } else {
          reject("Distance calculation failed");
        }
      }
    );
  });
};