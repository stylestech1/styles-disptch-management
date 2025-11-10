import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  calculateDhoToOriginDistance,
  calculateFullRouteDistance,
} from "@/utils/googleDistanceCalculator";
import { TPlace } from "@/components/sections/LocationAutocomplete";

export const useDistanceCalculations = () => {
  const { dho, origin, destinations, price } = useSelector(
    (state: RootState) => state.loadsForm
  );

  const [dhoToOriginDistance, setDhoToOriginDistance] = useState<number | null>(
    null
  );
  const [averageTime, setAverageTime] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [allDistance, setAllDistance] = useState<string>("");
  const [pricePerMile, setPricePerMile] = useState<number | null>(null);

  // Calculate DHO to Origin distance
  useEffect(() => {
    const calculateDhoToOrigin = async () => {
      if (!dho || !origin) {
        setDhoToOriginDistance(null);
        setAverageTime(null);
        return;
      }

      try {
        const result = await calculateDhoToOriginDistance(
          { lat: parseFloat(dho.lat), lng: parseFloat(dho.lon) },
          { lat: parseFloat(origin.lat), lng: parseFloat(origin.lon) }
        );
        setDhoToOriginDistance(result.distance);
        setAverageTime(result.duration);
      } catch (error) {
        console.error("Error calculating DHO to Origin distance:", error);
        setDhoToOriginDistance(null);
        setAverageTime(null);
      }
    };

    calculateDhoToOrigin();
  }, [dho, origin]);

  // Calculate total distance
  useEffect(() => {
    const calculateTotalDistance = async () => {
      const validDestinations = destinations.filter((dest) => dest !== null);

      if (
        (dho && origin && validDestinations.length > 0) ||
        (origin && validDestinations.length > 0)
      ) {
        try {
          const destinationsCoords = validDestinations.map((dest) => ({
            lat: parseFloat(dest.lat),
            lng: parseFloat(dest.lon),
          }));

          const result = await calculateFullRouteDistance(
            dho ? { lat: parseFloat(dho.lat), lng: parseFloat(dho.lon) } : null,
            origin
              ? { lat: parseFloat(origin.lat), lng: parseFloat(origin.lon) }
              : null,
            destinationsCoords
          );

          setDistance(result.distance);
          setAllDistance(result.distance.toFixed(2));

          if (price && Number(price) > 0) {
            const perMile = Number(price) / result.distance;
            setPricePerMile(perMile);
          }
        } catch (error) {
          console.error("Error calculating total distance:", error);
          setDistance(null);
          setAllDistance("");
        }
      } else {
        setDistance(null);
        setAllDistance("");
      }
    };

    calculateTotalDistance();
  }, [origin, destinations, dho, price]);

  const formatTime = (hours: number): string => {
    const totalMinutes = hours * 60;
    const hoursPart = Math.floor(totalMinutes / 60);
    const minutesPart = Math.round(totalMinutes % 60);

    if (hoursPart === 0) {
      return `${minutesPart} minutes`;
    } else if (minutesPart === 0) {
      return `${hoursPart} hours`;
    } else {
      return `${hoursPart}h ${minutesPart}m`;
    }
  };

  return {
    dhoToOriginDistance,
    averageTime,
    distance,
    allDistance,
    pricePerMile,
    formatTime,
  };
};
