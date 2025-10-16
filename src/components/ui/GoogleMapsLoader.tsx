"use client";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    google?: typeof google;
  }
}

type Props = {
  apiKey: string;
  children: React.ReactNode;
};

export default function GoogleMapsLoader({ apiKey, children }: Props) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.google) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, [apiKey]);

  if (!loaded)
    return (
      <div className="text-center text-gray-500 p-4">
        Loading Google Maps...
      </div>
    );

  return <>{children}</>;
}
