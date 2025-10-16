// components/ui/MapWithRoute.tsx
"use client";
import { useEffect, useRef } from "react";
import { TPlace } from "@/components/sections/LocationAutocomplete";

type Props = {
  dho?: TPlace | null;
  origin?: TPlace | null;
  destinations?: (TPlace | null)[];
};

export default function MapWithRoute({ dho, origin, destinations = [] }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 5,
      center: dho ? { lat: parseFloat(dho.lat), lng: parseFloat(dho.lon) } : { lat: 39.8283, lng: -98.5795 },
      styles: [
          // الخلفية العامة
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#f8fafc" }], // خلفية فاتحة
          },
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#64748b" }], // لون النصوص العام
          },

          // المحيطات والمياه
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e0f2fe" }], // لون المياه
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#0ea5e9" }], // لون تسميات المياه
          },

          // الطرق السريعة
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#fecaca" }, { weight: 1.5 }], // طرق سريعة بلون وردي فاتح
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#dc2626" }], // تسميات الطرق السريعة
          },

          // الطرق الرئيسية
          {
            featureType: "road.arterial",
            elementType: "geometry",
            stylers: [{ color: "#fed7aa" }, { weight: 1.2 }], // طرق رئيسية بلون برتقالي فاتح
          },
          {
            featureType: "road.arterial",
            elementType: "labels.text.fill",
            stylers: [{ color: "#ea580c" }], // تسميات الطرق الرئيسية
          },

          // الطرق المحلية
          {
            featureType: "road.local",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }, { weight: 0.8 }], // طرق محلية بيضاء
          },
          {
            featureType: "road.local",
            elementType: "labels.text.fill",
            stylers: [{ color: "#475569" }], // تسميات الطرق المحلية
          },

          // المناطق السكنية
          {
            featureType: "landscape.man_made",
            elementType: "geometry",
            stylers: [{ color: "#f1f5f9" }], // مناطق سكنية
          },

          // الحدائق والمساحات الخضراء
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#dcfce7" }], // حدائق خضراء
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#16a34a" }], // تسميات الحدائق
          },

          // المناطق التجارية
          {
            featureType: "poi.business",
            elementType: "geometry",
            stylers: [{ color: "#fef3c7" }], // مناطق تجارية
          },

          // الحدود الإدارية
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#7c3aed" }], // أسماء المدن
          },
          {
            featureType: "administrative.neighborhood",
            elementType: "labels.text.fill",
            stylers: [{ color: "#475569" }], // أسماء الأحياء
          },

          // النقاط المهمة (POI)
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b7280" }], // تسميات النقاط المهمة
          },
          {
            featureType: "poi",
            elementType: "labels.icon",
            stylers: [{ visibility: "simplified" }], // تبسيط الأيقونات
          },

          // المناطق الطبيعية
          {
            featureType: "landscape.natural",
            elementType: "geometry",
            stylers: [{ color: "#ecfccb" }], // مناطق طبيعية
          },

          // الخطوط العريضة
          {
            featureType: "administrative",
            elementType: "geometry.stroke",
            stylers: [{ color: "#cbd5e1" }, { weight: 0.5 }], // حدود إدارية
          },
        ],
    });

    // Initialize directions renderer
    directionsRenderer.current = new google.maps.DirectionsRenderer({
      map: mapInstance.current,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: "#3b82f6",
        strokeWeight: 4,
        strokeOpacity: 0.8,
      },
    });
  }, []);

  useEffect(() => {
    if (!window.google || !mapInstance.current || !directionsRenderer.current) return;

    const validDestinations = destinations.filter((dest): dest is TPlace => dest !== null);
    
    if (!origin && validDestinations.length === 0 && !dho) {
      // التعديل هنا: استخدم setMap(null) بدل setDirections
      directionsRenderer.current.setMap(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    // إعادة تفعيل الـ directions renderer إذا كان معطل
    if (!directionsRenderer.current.getMap()) {
      directionsRenderer.current.setMap(mapInstance.current);
    }

    // إذا كان هناك DHO و Origin و Destinations
    if (dho && origin && validDestinations.length > 0) {
      const waypoints = validDestinations.slice(0, -1).map(dest => ({
        location: { lat: parseFloat(dest.lat), lng: parseFloat(dest.lon) },
        stopover: true,
      }));

      const lastDestination = validDestinations[validDestinations.length - 1];

      directionsService.route(
        {
          origin: { lat: parseFloat(dho.lat), lng: parseFloat(dho.lon) },
          destination: { lat: parseFloat(lastDestination.lat), lng: parseFloat(lastDestination.lon) },
          waypoints: [
            { location: { lat: parseFloat(origin.lat), lng: parseFloat(origin.lon) }, stopover: true },
            ...waypoints
          ],
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: false,
        },
        (result, status) => {
          if (status === "OK" && result) {
            directionsRenderer.current?.setDirections(result);
          }
        }
      );
    }
    // إذا كان هناك Origin و Destinations فقط
    else if (origin && validDestinations.length > 0) {
      const waypoints = validDestinations.slice(0, -1).map(dest => ({
        location: { lat: parseFloat(dest.lat), lng: parseFloat(dest.lon) },
        stopover: true,
      }));

      const lastDestination = validDestinations[validDestinations.length - 1];

      directionsService.route(
        {
          origin: { lat: parseFloat(origin.lat), lng: parseFloat(origin.lon) },
          destination: { lat: parseFloat(lastDestination.lat), lng: parseFloat(lastDestination.lon) },
          waypoints: waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: false,
        },
        (result, status) => {
          if (status === "OK" && result) {
            directionsRenderer.current?.setDirections(result);
          }
        }
      );
    }
    // إذا كان هناك DHO و Origin فقط
    else if (dho && origin) {
      directionsService.route(
        {
          origin: { lat: parseFloat(dho.lat), lng: parseFloat(dho.lon) },
          destination: { lat: parseFloat(origin.lat), lng: parseFloat(origin.lon) },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            directionsRenderer.current?.setDirections(result);
          }
        }
      );
    }
    // إذا كان هناك Origin فقط
    else if (origin) {
      // إخفاء الـ directions renderer أولاً
      directionsRenderer.current.setMap(null);
      
      const marker = new google.maps.Marker({
        position: { lat: parseFloat(origin.lat), lng: parseFloat(origin.lon) },
        map: mapInstance.current,
        title: "Origin",
      });

      mapInstance.current.setCenter({ lat: parseFloat(origin.lat), lng: parseFloat(origin.lon) });
      mapInstance.current.setZoom(12);

      return () => {
        marker.setMap(null);
      };
    }
    // إذا كان هناك DHO فقط
    else if (dho) {
      // إخفاء الـ directions renderer أولاً
      directionsRenderer.current.setMap(null);
      
      const marker = new google.maps.Marker({
        position: { lat: parseFloat(dho.lat), lng: parseFloat(dho.lon) },
        map: mapInstance.current,
        title: "DHO",
      });

      mapInstance.current.setCenter({ lat: parseFloat(dho.lat), lng: parseFloat(dho.lon) });
      mapInstance.current.setZoom(12);

      return () => {
        marker.setMap(null);
      };
    }
  }, [dho, origin, destinations]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[350px] rounded-xl overflow-hidden border border-slate-200 shadow-sm"
    />
  );
}