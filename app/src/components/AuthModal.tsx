import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tierFeatures } from '../config/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup' | 'upgrade';
}

export default function AuthModal({ isOpen, onClose, initialTab = 'signin' }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, isConfigured } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'signup') {
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&#x2715;</button>

        {!isConfigured ? (
          <div className="modal-unconfigured">
            <h2>Authentication Not Yet Configured</h2>
            <p>
              Firebase credentials need to be added to enable sign-in.
              Set the VITE_FIREBASE_* environment variables in your .env file.
            </p>
            <p className="modal-hint">
              The app works in free-tier mode without authentication configured.
            </p>
          </div>
        ) : tab === 'upgrade' ? (
          <div className="upgrade-section">
            <h2>Upgrade Your Access</h2>
            <div className="tier-cards">
              <div className="tier-card">
                <h3>Free</h3>
                <p className="tier-price">$0</p>
                <ul>
                  {tierFeatures.free.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
              <div className="tier-card highlighted">
                <h3>Registered</h3>
                <p className="tier-price">Free (sign up)</p>
                <ul>
                  {tierFeatures.registered.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
                <button className="tier-btn" onClick={() => setTab('signup')}>
                  Sign Up Free
                </button>
              </div>
              <div className="tier-card premium">
                <h3>Premium</h3>
                <p className="tier-price">Coming Soon</p>
                <ul>
                  {tierFeatures.premium.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
                <button className="tier-btn" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="auth-tabs">
              <button
                className={`auth-tab ${tab === 'signin' ? 'active' : ''}`}
                onClick={() => setTab('signin')}
              >
                Sign In
              </button>
              <button
                className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
                onClick={() => setTab('signup')}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {tab === 'signup' && (
                <input
                  type="text"
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="auth-input"
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                required
                minLength={6}
              />

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Please wait...' : tab === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button className="google-btn" onClick={handleGoogle}>
              Sign in with Google
            </button>

            {tab === 'signin' && (
              <p className="auth-footer">
                Don't have an account?{' '}
                <button className="auth-link" onClick={() => setTab('signup')}>
                  Sign up free
                </button>{' '}
                to unlock full show details, cast albums, and more.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
