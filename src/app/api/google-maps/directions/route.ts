import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { 
      origin, 
      destination, 
      waypoints 
    }: { 
      origin: string; 
      destination: string; 
      waypoints?: string[] 
    } = await request.json();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    const apiKey: string = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    let url: string = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}`;

    if (waypoints && waypoints.length > 0) {
      const waypointsStr: string = waypoints.map((wp: string) => encodeURIComponent(wp)).join('|');
      url += `&waypoints=${waypointsStr}`;
    }

    const response: Response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Directions API failed: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Directions proxy error:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}