export const environment = {
  production: true,
  supabaseUrl: 'https://your-supabase-url.supabase.co',
  supabaseKey: 'your-supabase-key',
  googleFit: {
    clientId: '818897445122-196gkq28cm5p50cg7h8npk96gs1390sf.apps.googleusercontent.com', // Replace with your Google Fit client ID
    redirectUri: window.location.origin + '/app/googlefit/callback',
    scopes: [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.sleep.read'
    ]
  }
}; 