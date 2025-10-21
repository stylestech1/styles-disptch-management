import { useEffect } from 'react';
import { useGoogleMaps } from '@/hook/useGoogleMaps';

interface GoogleMapsLoaderProps {
  children: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

const GoogleMapsLoader: React.FC<GoogleMapsLoaderProps> = ({
  children,
  onLoad,
}) => {
  const isMapsReady = useGoogleMaps();
  
  useEffect(() => {
    if (isMapsReady) {
      onLoad?.();
    }
  }, [isMapsReady, onLoad]);

  if (!isMapsReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading Maps...</span>
      </div>
    );
  }

  return <>{children}</>;
};

export default GoogleMapsLoader;