import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, ArrowRight, Sparkles, Zap, Target, CheckCircle, Clock, TrendingUp, Heart } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Animated background elements
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const features = [
    { icon: Target, title: 'Smart Task Management', description: 'Organize with categories and priorities' },
    { icon: TrendingUp, title: 'Productivity Analytics', description: 'Track your progress with insights' },
    { icon: Zap, title: 'Bulk Operations', description: 'Manage multiple tasks efficiently' },
    { icon: CheckCircle, title: 'Beautiful Interface', description: 'Enjoy a premium user experience' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div 
          className="absolute w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${mousePosition.x * 0.1}px`,
            top: `${mousePosition.y * 0.1}px`,
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            right: `${mousePosition.x * 0.05}px`,
            bottom: `${mousePosition.y * 0.05}px`,
            transform: 'translate(50%, 50%)'
          }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-2 w-full">
        <div className="w-full max-w-5xl grid grid-cols-2 gap-6 items-center min-h-[600px]" style={{height: '80vh'}}>
          
          {/* Left Side - Features & Branding */}
          <div className="flex flex-col h-full w-full max-w-xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 relative overflow-hidden">
            {/* Brand Section */}
            <div className="flex flex-col items-center pt-2 pb-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl mb-3 flex items-center justify-center shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-pulse opacity-75" />
                <svg viewBox="0 0 24 24" fill="none" className="relative z-10 text-white w-10 h-10" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 20L12 4L21 20H3Z" fill="currentColor" />
                  <path d="M9 16L12 12L15 16" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">Welcome Back</h1>
              <p className="text-slate-700 text-base mb-0">Sign in to continue your productivity journey</p>
            </div>

            {/* Features/Stats Section */}
            <div className="flex-1 flex flex-col justify-start space-y-4 pb-2">
              {/* Features Grid */}
              <div className="grid grid-cols-1 gap-2">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={index}
                      className="group bg-white/60 backdrop-blur-xl rounded-lg p-3 border border-white/20 hover:bg-white/80 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-start space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 mb-0.5">{feature.title}</h3>
                          <p className="text-xs text-slate-600">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/60 backdrop-blur-xl rounded-lg p-2 text-center border border-white/20">
                  <div className="text-lg font-bold text-blue-600">∞</div>
                  <div className="text-xs text-slate-600">Tasks</div>
                </div>
                <div className="bg-white/60 backdrop-blur-xl rounded-lg p-2 text-center border border-white/20">
                  <div className="text-lg font-bold text-purple-600">100%</div>
                  <div className="text-xs text-slate-600">Secure</div>
                </div>
                <div className="bg-white/60 backdrop-blur-xl rounded-lg p-2 text-center border border-white/20">
                  <div className="text-lg font-bold text-green-600">24/7</div>
                  <div className="text-xs text-slate-600">Available</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Brand */}
            <div className="hidden">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-2 flex items-center justify-center shadow-xl">
                <svg viewBox="0 0 24 24" fill="none" className="text-white w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 20L12 4L21 20H3Z" fill="currentColor" />
                  <path d="M9 16L12 12L15 16" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-1">Welcome Back</h1>
              <p className="text-slate-600 text-xs">Sign in to continue your journey</p>
            </div>

            {/* Login Form */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/20 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-xl" />
              <div className="absolute bottom-0 left-0 w-10 h-10 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-xl" />
              
              <div className="relative z-10">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Sign In</h2>
                  <p className="text-slate-600 text-xs">Access your productivity dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username Field */}
                  <div className="space-y-1">
                    <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                      Username
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          clearError();
                        }}
                        onFocus={() => setIsFocused('username')}
                        onBlur={() => setIsFocused(null)}
                        className={`w-full px-3 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                          isFocused === 'username'
                            ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        placeholder="Enter your username"
                        required
                      />
                      {isFocused === 'username' && (
                        <div className="absolute inset-0 border-2 border-blue-500 rounded-xl animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <div className="relative group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          clearError();
                        }}
                        onFocus={() => setIsFocused('password')}
                        onBlur={() => setIsFocused(null)}
                        className={`w-full px-3 py-3 pr-10 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                          isFocused === 'password'
                            ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      {isFocused === 'password' && (
                        <div className="absolute inset-0 border-2 border-blue-500 rounded-xl animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-3 animate-shake">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 text-xs font-bold">!</span>
                        </div>
                        <p className="text-red-700 text-sm font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group relative overflow-hidden"
                  >
                    {/* Button Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="relative z-10 text-sm">Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span className="relative z-10 text-sm">Sign In</span>
                        <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </form>

                {/* Register Link */}
                <div className="mt-6 text-center">
                  <p className="text-slate-600 text-sm">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline"
                    >
                      Sign up now
                    </Link>
                  </p>
                </div>

                {/* Quick Demo */}
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-800">Demo Account</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Try with: <code className="bg-blue-100 px-1 rounded text-xs">demo</code> / <code className="bg-blue-100 px-1 rounded text-xs">demo1234</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Subtle Branding */}
            <div className="text-center mt-2">
              <p className="text-xs text-slate-400 font-medium">Sisyphus II · Task Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Beautiful Footer */}
      <footer className="bg-white/60 backdrop-blur-xl border-t border-white/20 w-full">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-1 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium">Live</span>
              </div>
              <span className="text-slate-400">•</span>
              <p className="text-xs text-slate-600">
                Built with 🧡 for productivity
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-400">© 2025 Sisyphus II.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage; 