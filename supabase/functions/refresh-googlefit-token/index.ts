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

    // Get the stored refresh token
    const { data: userData, error: fetchError } = await supabase
      .from('user_metadata')
      .select('refresh_token')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    if (fetchError || !userData?.refresh_token) {
      throw new Error('No refresh token found');
    }

    // Refresh the token using Google's OAuth2 endpoint
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
        refresh_token: userData.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const { access_token, expires_in } = await response.json();

    // Calculate new expiration time
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    // Update the stored tokens
    const { error: updateError } = await supabase
      .from('user_metadata')
      .upsert({
        user_id: userId,
        provider: 'google',
        access_token: access_token,
        expires_at: expiresAt,
      }, { onConflict: 'user_id' });

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({ 
      success: true,
      access_token: access_token,
      expires_at: expiresAt
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