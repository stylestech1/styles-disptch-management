import { useState, useEffect } from 'react';

let mapsLoaded = false;
let mapsLoading = false;
let mapsLoadCallbacks: Array<(loaded: boolean) => void> = [];

declare global {
  interface Window {
    google: {
      maps: typeof google.maps
    };
  }
}

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(mapsLoaded);

  useEffect(() => {
    if (mapsLoaded) {
      setIsLoaded(true);
      return;
    }

    const handleLoad = (loaded: boolean) => {
      setIsLoaded(loaded);
    };

    mapsLoadCallbacks.push(handleLoad);

    if (!mapsLoading && !mapsLoaded) {
      loadGoogleMaps();
    }

    return () => {
      // Cleanup
      const index = mapsLoadCallbacks.indexOf(handleLoad);
      if (index > -1) {
        mapsLoadCallbacks.splice(index, 1);
      }
    };
  }, []);

  return isLoaded;
};

const loadGoogleMaps = () => {
  if (mapsLoading || mapsLoaded) return;

  mapsLoading = true;
  console.log('Starting to load Google Maps...');

  if (window.google && window.google.maps) {
    console.log('Google Maps already loaded');
    mapsLoaded = true;
    mapsLoading = false;
    mapsLoadCallbacks.forEach(callback => callback(true));
    mapsLoadCallbacks = [];
    return;
  }

  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    console.log('Google Maps script already exists, waiting for load...');
    
    const checkLoaded = () => {
      if (window.google && window.google.maps) {
        console.log('Existing Google Maps script loaded successfully');
        mapsLoaded = true;
        mapsLoading = false;
        mapsLoadCallbacks.forEach(callback => callback(true));
        mapsLoadCallbacks = [];
      } else {
        setTimeout(checkLoaded, 100);
      }
    };
    
    checkLoaded();
    return;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Google Maps API key not found');
    mapsLoading = false;
    mapsLoadCallbacks.forEach(callback => callback(false));
    mapsLoadCallbacks = [];
    return;
  }

  console.log('Loading Google Maps directly with API key');
  
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  
  script.onload = () => {
    console.log('Google Maps loaded successfully');
    mapsLoaded = true;
    mapsLoading = false;
    mapsLoadCallbacks.forEach(callback => callback(true));
    mapsLoadCallbacks = [];
  };
  
  script.onerror = (error) => {
    console.error('Failed to load Google Maps:', error);
    mapsLoading = false;
    mapsLoadCallbacks.forEach(callback => callback(false));
    mapsLoadCallbacks = [];
  };

  document.head.appendChild(script);
};