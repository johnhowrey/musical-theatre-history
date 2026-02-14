import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth';
import { firebaseConfig, type AccessTier } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  tier: AccessTier;
  loading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  canAccess: (requiredTier: AccessTier) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const tierRank: Record<AccessTier, number> = {
  free: 0,
  registered: 1,
  premium: 2,
};

// Premium user emails (in production, store this in Firestore)
const PREMIUM_EMAILS = new Set<string>([
  // Add premium user emails here
]);

function getUserTier(user: User | null): AccessTier {
  if (!user) return 'free';
  if (PREMIUM_EMAILS.has(user.email || '')) return 'premium';
  return 'registered';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Only initialize Firebase if config is provided
    if (!firebaseConfig.apiKey) {
      setLoading(false);
      setIsConfigured(false);
      return;
    }

    try {
      const app: FirebaseApp = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      setAuth(authInstance);
      setIsConfigured(true);

      const unsubscribe = onAuthStateChanged(authInstance, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch {
      console.warn('Firebase not configured. Running in free-tier mode.');
      setLoading(false);
      setIsConfigured(false);
    }
  }, []);

  const tier = getUserTier(user);

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error('Auth not configured');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    if (!auth) throw new Error('Auth not configured');
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Auth not configured');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  };

  const canAccess = (requiredTier: AccessTier): boolean => {
    return tierRank[tier] >= tierRank[requiredTier];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tier,
        loading,
        isConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
