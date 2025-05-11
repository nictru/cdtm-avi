export const environment = {
  production: true,
  supabaseUrl: 'https://wuumbpaehazgzsosudvr.supabase.co',
  supabaseKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dW1icGFlaGF6Z3pzb3N1ZHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzA1OTksImV4cCI6MjA2MjQwNjU5OX0.ymGyEccy4RthloXoIR0f3WK1hIywpN3sadp6wlbPlQg',
  googleFit: {
    clientId:
      '818897445122-196gkq28cm5p50cg7h8npk96gs1390sf.apps.googleusercontent.com', // Replace with your Google Fit client ID
    redirectUri: window.location.origin + '/app/googlefit/callback',
    scopes: [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.sleep.read',
    ],
  },
};
