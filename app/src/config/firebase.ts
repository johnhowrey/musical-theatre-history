// Firebase configuration
// Replace these values with your actual Firebase project config
// Get these from: Firebase Console > Project Settings > Your App > Config

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Access tiers
export type AccessTier = 'free' | 'registered' | 'premium';

// What each tier gets:
// FREE: Map view, pan/zoom, show names, basic info (title + year)
// REGISTERED: Full Wikipedia synopses, cast album links, creator bios, search
// PREMIUM: Scripts/scores library, detailed production data, ad-free, early access to updates

export const tierFeatures: Record<AccessTier, string[]> = {
  free: [
    'Interactive subway map with pan/zoom',
    'Show names and basic info',
    'Creator names visible on map',
  ],
  registered: [
    'Everything in Free, plus:',
    'Full show synopses from Wikipedia',
    'Cast album links (Spotify, Apple Music, Amazon)',
    'Creator biographies',
    'Search functionality',
    'IBDB and Playbill links',
    'Book recommendations',
  ],
  premium: [
    'Everything in Registered, plus:',
    'Scripts & scores library (PDF viewer)',
    'Detailed production data',
    'Cast lists and original performers',
    'Ad-free experience',
    'Early access to map updates',
    'Collaboration network explorer',
  ],
};
