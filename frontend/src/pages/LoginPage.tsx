import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, LogIn, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const user = await login({ email, password });
      const destination = (location.state as any)?.from?.pathname || getDashboardPath(user.role);
      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-forest text-white flex items-center justify-center mx-auto shadow-md">
            <HeartHandshake className="w-8 h-8 text-orangeAccent" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-forest">Welcome Back</h2>
          <p className="text-sm text-mutedText">
            Sign in to access your role-specific NourishNet dashboard
          </p>
        </div>

        {/* Demo Fast Fill Buttons */}
        <div className="card-warm p-4 bg-cream-50 space-y-2 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primaryGreen">
            <Sparkles className="w-3.5 h-3.5 text-orangeAccent" />
            <span>Academic Demonstration Accounts:</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemoAccount('donor.annapoorna@nourishnet.org')}
              className="px-2.5 py-1.5 rounded-lg border border-lightBorder bg-white hover:bg-softGreen/30 font-medium transition-colors truncate"
              title="Murugan P (Annapoorna Bhavan)"
            >
              Donor Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('recipient.anbu@nourishnet.org')}
              className="px-2.5 py-1.5 rounded-lg border border-lightBorder bg-white hover:bg-softGreen/30 font-medium transition-colors truncate"
              title="Sister Rosy (Anbu Karangal)"
            >
              Recipient Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('volunteer.ramesh@nourishnet.org')}
              className="px-2.5 py-1.5 rounded-lg border border-lightBorder bg-white hover:bg-softGreen/30 font-medium transition-colors truncate"
              title="Ramesh Kumar (Motorcycle)"
            >
              Volunteer Demo
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="card-warm p-8">
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mutedText mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedText" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@nourishnet.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mutedText mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedText" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-forest hover:bg-primaryGreen text-white font-semibold text-sm transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-lightBorder text-center text-xs text-mutedText">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-primaryGreen hover:underline">
              Create an account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
