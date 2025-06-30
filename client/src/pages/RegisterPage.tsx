import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, ArrowRight, Sparkles, Zap, Shield, Users, Star, Sun, Moon } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Dark mode state
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Animated background elements
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleThemeToggle = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      // Handle password mismatch
      return;
    }

    try {
      await register(
        formData.email.trim(),
        formData.username.trim(),
        formData.password.trim(),
        formData.fullName?.trim()
      );
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const benefits = [
    { icon: Shield, title: 'Secure & Private', description: 'Your data is encrypted and protected' },
    { icon: Users, title: 'Team Ready', description: 'Scale from personal to team use' },
    { icon: Star, title: 'Premium Features', description: 'Access advanced productivity tools' },
    { icon: Zap, title: 'Lightning Fast', description: 'Optimized for speed and performance' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative overflow-hidden">
      {/* Dark Mode Toggle */}
      <button
        onClick={handleThemeToggle}
        className="fixed top-4 right-4 z-50 p-3 text-slate-600 dark:text-yellow-300 hover:text-slate-900 dark:hover:text-yellow-400 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm rounded-xl transition-all duration-200 group shadow-lg"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun size={20} className="transition-transform" /> : <Moon size={20} className="transition-transform" />}
      </button>

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
          className="absolute w-64 h-64 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"
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
      <div className="relative z-10 flex-1 flex items-center justify-center p-2 w-full h-full">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch h-full">
          {/* Left Side - Benefits & Branding (Hidden on mobile) */}
          <div className="hidden md:flex flex-col justify-center h-full w-full max-w-xl bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-xl p-4 relative overflow-hidden flex-1">
            {/* Brand Section */}
            <div className="flex flex-col items-center pt-1 pb-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-2xl mb-2 flex items-center justify-center shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-500 animate-pulse opacity-75" />
                <svg viewBox="0 0 24 24" fill="none" className="relative z-10 text-white w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 20L12 4L21 20H3Z" fill="currentColor" />
                  <path d="M9 16L12 12L15 16" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Join Sisyphus</h1>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-0">Create your account and start your productivity journey</p>
            </div>

            {/* Benefits Section */}
            <div className="flex-1 flex flex-col justify-start space-y-3 pb-2">
              {/* Benefits Grid */}
              <div className="grid grid-cols-1 gap-2">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div 
                      key={index}
                      className="group bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-2 border border-white/20 dark:border-gray-600/20 hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-0.5">{benefit.title}</h3>
                          <p className="text-[10px] text-slate-600 dark:text-slate-300">{benefit.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-8">
                <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-2 text-center border border-white/20 dark:border-gray-600/20">
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">Free</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-300">Forever</div>
                </div>
                <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-2 text-center border border-white/20 dark:border-gray-600/20">
                  <div className="text-sm font-bold text-purple-600 dark:text-purple-400">100%</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-300">Secure</div>
                </div>
                <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-2 text-center border border-white/20 dark:border-gray-600/20">
                  <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">∞</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-300">Tasks</div>
                </div>
              </div>

              {/* Inspirational Quote */}
              <div className="flex flex-col items-center justify-center mt-16">
                <blockquote className="italic text-slate-500 dark:text-slate-400 text-center text-sm max-w-xs px-2">
                  "The impediment to action advances action. What stands in the way becomes the way."
                </blockquote>
                <span className="text-slate-400 dark:text-slate-500 text-xs mt-1">— Marcus Aurelius</span>
                {/* Mountain Emoji */}
                <div className="mt-6 flex justify-center">
                  <span className="text-6xl opacity-80">🏔️</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Brand (Visible only on mobile) */}
            <div className="md:hidden text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-xl">
                <svg viewBox="0 0 24 24" fill="none" className="text-white w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 20L12 4L21 20H3Z" fill="currentColor" />
                  <path d="M9 16L12 12L15 16" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Join Sisyphus</h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm">Create your account and start your journey</p>
            </div>

            {/* Registration Form */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-3 shadow-xl border border-white/20 dark:border-gray-700/20 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-xl" />
              <div className="absolute bottom-0 left-0 w-10 h-10 bg-gradient-to-br from-purple-400/10 to-indigo-500/10 rounded-full blur-xl" />
              
              <div className="relative z-10">
                <div className="text-center mb-3">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Create Account</h2>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">Join our productivity community</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Full Name Field */}
                  <div className="space-y-1">
                    <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Full Name
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        onFocus={() => setIsFocused('fullName')}
                        onBlur={() => setIsFocused(null)}
                        className={`w-full px-3 py-2.5 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                          isFocused === 'fullName'
                            ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                            : 'border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500'
                        } text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400`}
                        placeholder="Enter your full name"
                        required
                      />
                      {isFocused === 'fullName' && (
                        <div className="absolute inset-0 border-2 border-blue-500 rounded-xl animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Username Field */}
                  <div className="space-y-1">
                    <label htmlFor="username" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Username
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        onFocus={() => setIsFocused('username')}
                        onBlur={() => setIsFocused(null)}
                        className={`w-full px-3 py-2.5 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                          isFocused === 'username'
                            ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                            : 'border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500'
                        } text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400`}
                        placeholder="Choose a username"
                        required
                      />
                      {isFocused === 'username' && (
                        <div className="absolute inset-0 border-2 border-blue-500 rounded-xl animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Email
                    </label>
                    <div className="relative group">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setIsFocused('email')}
                        onBlur={() => setIsFocused(null)}
                        className={`w-full px-3 py-2.5 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                          isFocused === 'email'
                            ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                            : 'border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500'
                        } text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400`}
                        placeholder="Enter your email"
                        required
                      />
                      {isFocused === 'email' && (
                        <div className="absolute inset-0 border-2 border-blue-500 rounded-xl animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Password
                    </label>
                    <div className="relative group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setIsFocused('password')}
                        onBlur={() => setIsFocused(null)}
                        className={`w-full px-3 py-2.5 pr-10 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                          isFocused === 'password'
                            ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                            : 'border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500'
                        } text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400`}
                        placeholder="Create a password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-gray-600 rounded-lg"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      {isFocused === 'password' && (
                        <div className="absolute inset-0 border-2 border-blue-500 rounded-xl animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Password must be at least 8 characters long.</p>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onFocus={() => setIsFocused('confirmPassword')}
                        onBlur={() => setIsFocused(null)}
                        className={`w-full px-3 py-2.5 pr-10 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                          isFocused === 'confirmPassword'
                            ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                            : 'border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500'
                        } text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400`}
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-gray-600 rounded-lg"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      {isFocused === 'confirmPassword' && (
                        <div className="absolute inset-0 border-2 border-blue-500 rounded-xl animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 animate-shake">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                          <span className="text-red-600 dark:text-red-400 text-xs font-bold">!</span>
                        </div>
                        <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                          {error.includes('Password must be at least 8 characters long')
                            ? 'Password must be at least 8 characters long.'
                            : error}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group relative overflow-hidden"
                  >
                    {/* Button Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="relative z-10 text-sm">Creating account...</span>
                      </>
                    ) : (
                      <>
                        <span className="relative z-10 text-sm">Create Account</span>
                        <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </form>

                {/* Login Link */}
                <div className="mt-4 text-center">
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors hover:underline"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>

                {/* Terms */}
                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-1">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-blue-800 dark:text-blue-200">Free Forever</span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    No credit card required • Full access to all features
                  </p>
                </div>
              </div>
            </div>

            {/* Subtle Branding */}
            <div className="text-center mt-2">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Sisyphus II · Task Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Beautiful Footer */}
      <footer className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-t border-white/20 dark:border-gray-800/20 w-full">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-1 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium">Live</span>
              </div>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Built with 🧡 for productivity
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-400 dark:text-slate-500">© 2025 Sisyphus II.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RegisterPage; 