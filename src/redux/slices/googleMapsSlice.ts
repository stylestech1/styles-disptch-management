import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

type GoogleMapsError = {
  status: number;
  data: string;
};

export const googleMapsApi = createApi({
  reducerPath: 'googleMapsApi',
  baseQuery: fetchBaseQuery(),
  tagTypes: ['GoogleMaps'],
  endpoints: (builder) => ({
    loadGoogleMaps: builder.query<boolean, string>({
      queryFn: async (apiKey: string) => {
        return new Promise((resolve) => {
          if (window.google && window.google.maps) {
            resolve({ data: true });
            return;
          }

          const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
          if (existingScript) {
            const onScriptLoad = () => {
              existingScript.removeEventListener('load', onScriptLoad);
              existingScript.removeEventListener('error', onScriptError);
              resolve({ data: true });
            };
            
            const onScriptError = () => {
              existingScript.removeEventListener('load', onScriptLoad);
              existingScript.removeEventListener('error', onScriptError);
              resolve({ 
                error: { 
                  status: 500, 
                  data: 'Failed to load Google Maps' 
                } as GoogleMapsError 
              });
            };
            
            existingScript.addEventListener('load', onScriptLoad);
            existingScript.addEventListener('error', onScriptError);
            return;
          }

          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,directions`;
          script.async = true;
          script.defer = true;
          
          script.onload = () => {
            resolve({ data: true });
          };
          
          script.onerror = () => {
            resolve({ 
              error: { 
                status: 500, 
                data: 'Failed to load Google Maps' 
              } as GoogleMapsError 
            });
          };
          
          document.head.appendChild(script);
        });
      },
      providesTags: ['GoogleMaps'],
      keepUnusedDataFor: 3600,
    }),
  }),
});

export const { useLoadGoogleMapsQuery } = googleMapsApi;