export async function geocodeAddress(address: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key is missing");
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to geocode the address");
  }

  const data = (await response.json()) as {
    status: string;
    results?: Array<{ geometry: { location: { lat: number; lng: number } } }>;
  };

  if (data.status !== "OK" || !data.results?.length) {
    throw new Error("Unable to validate delivery distance for this address");
  }

  return data.results[0].geometry.location;
}
