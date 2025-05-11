// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';

// Declare the Deno namespace
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleFitData {
  steps: number;
  calories: number;
  distance: number;
  heartRate: number;
  timestamp: string;
}

async function fetchGoogleFitData(accessToken: string, startTime: string, endTime: string): Promise<GoogleFitData[]> {
  const dataSources = [
    'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
    'derived:com.google.calories.expended:com.google.android.gms:from_activities',
    'derived:com.google.distance.delta:com.google.android.gms:from_activities',
    'derived:com.google.heart_rate.bpm:com.google.android.gms:from_activities'
  ];

  const data: GoogleFitData[] = [];
  
  for (const dataSource of dataSources) {
    const response = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aggregateBy: [{
            dataSourceId: dataSource,
          }],
          bucketByTime: { durationMillis: 86400000 }, // 24 hours
          startTimeMillis: new Date(startTime).getTime(),
          endTimeMillis: new Date(endTime).getTime(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${dataSource}: ${response.statusText}`);
    }

    const result = await response.json();
    // Process and transform the data based on the dataSource
    // Add to the data array
  }

  return data;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user ID from the request headers
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get the stored access token
    const { data: userData, error: fetchError } = await supabase
      .from('user_metadata')
      .select('access_token, expires_at')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    if (fetchError || !userData?.access_token) {
      throw new Error('No access token found');
    }

    // Check if token is expired
    if (new Date(userData.expires_at) <= new Date()) {
      throw new Error('Access token expired');
    }

    // Parse request body for date range
    const { startTime, endTime } = await req.json();
    if (!startTime || !endTime) {
      throw new Error('Start time and end time are required');
    }

    // Fetch data from Google Fit
    const fitData = await fetchGoogleFitData(userData.access_token, startTime, endTime);

    // Store the data in Supabase
    const { error: insertError } = await supabase
      .from('fitness_data')
      .upsert(
        fitData.map(data => ({
          user_id: userId,
          ...data,
        })),
        { onConflict: 'user_id,timestamp' }
      );

    if (insertError) {
      throw insertError;
    }

    return new Response(JSON.stringify({ 
      success: true,
      data: fitData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 