import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // نرجع script بسيط بدون callbacks متعددة
    const scriptContent = `
      (function() {
        if (window.google && window.google.maps) return;
        
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      })();
    `;

    return new NextResponse(scriptContent, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Maps loader error:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}