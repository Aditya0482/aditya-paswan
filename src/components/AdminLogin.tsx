import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, User } from '../api';
import { Shield, LogOut, LogIn, KeyRound, Mail, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';

export function AdminLogin() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      const loggedUser = await auth.login(email, password);
      if (loggedUser.isAdmin) {
        localStorage.setItem('isAdmin', 'true');
      }
      navigate('/projects');
    } catch (err: any) {
      console.error("Error signing in:", err);
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setMessage('To reset admin password, update ADMIN_PASSWORD in your Railway project environment variables.');
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isAdmin = Boolean(
    user?.isAdmin ||
    (import.meta.env.VITE_ADMIN_EMAIL &&
      user?.email?.toLowerCase() === import.meta.env.VITE_ADMIN_EMAIL.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center text-center px-6">
      <div className="glass-card p-8 max-w-md w-full flex flex-col items-center gap-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-yellow-500 p-1 shadow-[0_0_15px_rgba(234,179,8,0.3)] mb-2">
          <img
            src="/profile.png"
            alt="Aditya Paswan"
            className="w-full h-full object-cover object-top rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="text-3xl font-bold text-white">Admin Access</h2>
        
        {!user ? (
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <p className="text-gray-400 mb-2">Sign in with your email and password.</p>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2 text-left">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2 text-left">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>

            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-12 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
              Sign In
            </button>
          </form>
        ) : (
          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 mb-4">
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            
            {isAdmin ? (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg w-full text-sm">
                Admin rights granted. You can now manage projects.
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg w-full text-sm">
                Access denied. You are not the admin.
              </div>
            )}

            <button
              onClick={() => navigate('/projects')}
              className="w-full bg-yellow-500/10 hover:bg-yellow-500/30 hover:border-yellow-500 text-yellow-500 border border-yellow-500/30 font-semibold py-3 px-6 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 active:scale-95 mt-2 shadow-lg hover:shadow-yellow-500/20"
            >
              Go to Projects
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
