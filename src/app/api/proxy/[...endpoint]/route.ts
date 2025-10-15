import { NextRequest, NextResponse } from "next/server";

const apiURL = process.env.NEXT_PUBLIC_API_URL;

async function handleRequest(req: NextRequest, { params }: { params: { endpoint: string[] } }) {
  const endpointPath = params.endpoint.join("/");
  const url = `${apiURL}/${endpointPath}${req.nextUrl.search}`;

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  const token = req.cookies.get("token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: req.method,
    headers,
    body,
  });

  const contentType = res.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await res.json()
    : await res.text();

  return NextResponse.json(data, { status: res.status });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
