// components/ui/GoogleMapsLoader.tsx
import { useEffect, useState } from 'react';
import { useLoadGoogleMapsQuery } from '@/redux/slices/googleMapsSlice';

interface GoogleMapsLoaderProps {
  apiKey: string;
  children: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

const GoogleMapsLoader: React.FC<GoogleMapsLoaderProps> = ({
  apiKey,
  children,
  onLoad,
  onError,
}) => {
  const [isMapsReady, setIsMapsReady] = useState(false);
  
  const {
    data: mapsLoaded,
    isLoading,
    error,
  } = useLoadGoogleMapsQuery(apiKey, {
    skip: !apiKey || isMapsReady,
  });

  useEffect(() => {
    if (mapsLoaded) {
      setIsMapsReady(true);
      onLoad?.();
    }
  }, [mapsLoaded, onLoad]);

  useEffect(() => {
    if (error) {
      onError?.(typeof error === 'string' ? error : 'Failed to load Google Maps');
    }
  }, [error, onError]);

  // إذا كان Google Maps محمل مسبقاً
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsMapsReady(true);
      onLoad?.();
    }
  }, [onLoad]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading Maps...</span>
      </div>
    );
  }

  if (error || !isMapsReady) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg">
        <div className="text-red-600 text-center">
          <div className="text-lg font-semibold">Maps Loading Failed</div>
          <div className="text-sm mt-1">
            {typeof error === 'string' ? error : 'Unable to load Google Maps'}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default GoogleMapsLoader;