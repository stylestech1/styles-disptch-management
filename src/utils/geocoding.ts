import { TPlace } from "@/components/sections/LocationAutocomplete";
// في أعلى utils/geocoding.ts
declare global {
  interface Window {
    initGoogleGeocoding?: () => void;
  }
}

export const geocodeAddress = async (
  address: string
): Promise<TPlace | null> => {
  if (!address) return null;

  return new Promise((resolve) => {
    // التحقق من وجود Google Maps API
    if (!window.google || !window.google.maps) {
      console.warn("Google Maps API not loaded");

      // تحميل Google Maps API بشكل ديناميكي إذا لم تكن محملة
      if (!window.initGoogleGeocoding) {
        window.initGoogleGeocoding = () => {
          console.log('Google Maps API loaded, retrying geocoding...');
        };

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleGeocoding`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      // إرجاع بيانات نصية مؤقتة
      resolve({
        display_name: address,
        lat: "0",
        lon: "0",
        place_id: `temp_${Date.now()}_${address.substring(0, 10)}`,
      } as TPlace);
      return;
    }

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode(
      {
        address: address,
        componentRestrictions: { country: "US" }, // تخصيص للولايات المتحدة
      },
      (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const result = results[0];
          const location = result.geometry.location;

          // استخراج بيانات العنوان
          let postcode = "";
          let city = "";
          let state = "";
          let country = "";

          result.address_components?.forEach((component) => {
            const types = component.types;

            if (types.includes("postal_code")) {
              postcode = component.long_name;
            } else if (types.includes("locality")) {
              city = component.long_name;
            } else if (types.includes("administrative_area_level_1")) {
              state = component.short_name;
            } else if (types.includes("country")) {
              country = component.long_name;
            }
          });

          resolve({
            display_name: result.formatted_address || address,
            secondary_text: result.formatted_address
              ?.split(", ")
              .slice(1)
              .join(", "),
            lat: location.lat().toString(),
            lon: location.lng().toString(),
            place_id: result.place_id || `google_${Date.now()}`,
            postcode: postcode || undefined,
            city: city,
            state: state,
            country: country,
            address: result.address_components?.reduce((acc, component) => {
              component.types.forEach((type) => {
                if (!acc[type]) {
                  acc[type] = component.long_name;
                }
              });
              return acc;
            }, {} as { [key: string]: string }),
          } as TPlace);
        } else {
          console.warn(
            `Google Geocoding failed for address: ${address}`,
            status
          );

          // فشلت الـ geocoding، أعد بيانات نصية على الأقل
          resolve({
            display_name: address,
            lat: "0",
            lon: "0",
            place_id: `failed_${Date.now()}_${address.substring(0, 10)}`,
          } as TPlace);
        }
      }
    );
  });
};

// Batch geocoding for multiple addresses
export const geocodeAddresses = async (
  addresses: string[]
): Promise<(TPlace | null)[]> => {
  try {
    const results = await Promise.all(
      addresses.map((address) => geocodeAddress(address))
    );
    return results;
  } catch (error) {
    console.error("Batch geocoding error:", error);
    return addresses.map(() => null);
  }
};

// دالة إضافية للـ reverse geocoding
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<TPlace | null> => {
  return new Promise((resolve) => {
    if (!window.google || !window.google.maps) {
      console.warn("Google Maps API not loaded for reverse geocoding");
      resolve(null);
      return;
    }

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const result = results[0];
        const location = result.geometry.location;

        let postcode = "";
        let city = "";
        let state = "";

        result.address_components?.forEach((component) => {
          const types = component.types;

          if (types.includes("postal_code")) {
            postcode = component.long_name;
          } else if (types.includes("locality")) {
            city = component.long_name;
          } else if (types.includes("administrative_area_level_1")) {
            state = component.short_name;
          }
        });

        resolve({
          display_name: result.formatted_address || `${lat}, ${lng}`,
          secondary_text: result.formatted_address
            ?.split(", ")
            .slice(1)
            .join(", "),
          lat: location.lat().toString(),
          lon: location.lng().toString(),
          place_id: result.place_id || `reverse_${Date.now()}`,
          postcode: postcode || undefined,
          city: city,
          state: state,
          address: result.address_components?.reduce((acc, component) => {
            component.types.forEach((type) => {
              if (!acc[type]) {
                acc[type] = component.long_name;
              }
            });
            return acc;
          }, {} as { [key: string]: string }),
        } as TPlace);
      } else {
        console.warn("Reverse geocoding failed:", status);
        resolve(null);
      }
    });
  });
};
