import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlaceSearchRequest {
  query: string;
  sessionToken?: string;
}

interface PlaceDetailsRequest {
  placeId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_PLACES_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Google Places API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'search') {
      const { query, sessionToken }: PlaceSearchRequest = await req.json();
      
      if (!query || query.trim().length < 2) {
        return new Response(
          JSON.stringify({ error: 'Query must be at least 2 characters' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
      searchUrl.searchParams.set('input', query.trim());
      searchUrl.searchParams.set('types', 'establishment');
      searchUrl.searchParams.set('key', apiKey);
      if (sessionToken) {
        searchUrl.searchParams.set('sessiontoken', sessionToken);
      }

      console.log('Searching Google Places for:', query);
      
      const response = await fetch(searchUrl.toString());
      const data = await response.json();

      if (!response.ok) {
        console.error('Google Places API error:', data);
        return new Response(
          JSON.stringify({ error: 'Failed to search places', details: data }),
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Transform the response to include only what we need
      const suggestions = data.predictions?.map((prediction: any) => ({
        placeId: prediction.place_id,
        description: prediction.description,
        structuredFormatting: prediction.structured_formatting
      })) || [];

      return new Response(
        JSON.stringify({ 
          suggestions,
          status: data.status 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } else if (action === 'details') {
      const { placeId }: PlaceDetailsRequest = await req.json();
      
      if (!placeId) {
        return new Response(
          JSON.stringify({ error: 'Place ID is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      detailsUrl.searchParams.set('place_id', placeId);
      detailsUrl.searchParams.set('fields', 'place_id,name,formatted_address');
      detailsUrl.searchParams.set('key', apiKey);

      console.log('Getting place details for:', placeId);
      
      const response = await fetch(detailsUrl.toString());
      const data = await response.json();

      if (!response.ok) {
        console.error('Google Places Details API error:', data);
        return new Response(
          JSON.stringify({ error: 'Failed to get place details', details: data }),
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (data.status !== 'OK') {
        console.error('Google Places API returned error status:', data.status);
        return new Response(
          JSON.stringify({ error: `Google Places API error: ${data.status}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Generate the review link
      const reviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;

      return new Response(
        JSON.stringify({ 
          place: data.result,
          reviewUrl,
          status: data.status 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use "search" or "details"' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in google-places-search function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});