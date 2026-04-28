import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import { useAxiosPrivate } from '../api/axiosPrivate';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ─── Validators ───────────────────────────────────────────────────────────────
const validateIdentifier = (identifier) =>{
  if (!identifier.trim()) return 'Identifier is required';
  if (identifier.trim().length < 3) return 'Identifier must be at least 3 characters';
  return '';
}

const validateUsername = (username) => {
  if (!username.trim()) return 'Username is required';
  if (username.trim().length < 3) return 'Username must be at least 3 characters';
  if (username.trim().length > 20) return 'Username must be at most 20 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers and underscores';
  return '';
};

const validateEmail = (email) => {
  if (!email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return '';
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[^a-zA-Z0-9]/.test(password)) return 'Password must contain at least one special character';
  return '';
};

const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

// ─── Password Strength Indicator ──────────────────────────────────────────────

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: '#ef4444' };
  if (score === 3) return { score, label: 'Fair', color: '#f97316' };
  if (score === 4) return { score, label: 'Good', color: '#eab308' };
  return { score, label: 'Strong', color: '#22c55e' };
};

// ─── Field Error Component ─────────────────────────────────────────────────────

const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
      <span>⚠</span> {message}
    </p>
  ) : null;

// ─── AuthPage ─────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    identifier: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setAccessToken } = useAuth();
  const api = useAxiosPrivate();

  const passwordStrength = getPasswordStrength(formData.password);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Live-validate once field has been touched
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'identifier':
        error = validateIdentifier(value);
        break;
      case 'username':
        error = validateUsername(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        // Re-validate confirmPassword when password changes
        if (touched.confirmPassword) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: validateConfirmPassword(value, formData.confirmPassword),
          }));
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.password, value);
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateSignupForm = () => {
    const newErrors = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
    };
    setErrors(newErrors);
    setTouched({ username: true, email: true, password: true, confirmPassword: true });
    return Object.values(newErrors).every((e) => e === '');
  };

  const validateLoginForm = () => {
    const newErrors = {
      identifier: formData.identifier.trim() ? '' : 'Email or username is required',
      password: formData.password ? '' : 'Password is required',
    };
    setErrors(newErrors);
    setTouched({ identifier: true, password: true });
    return Object.values(newErrors).every((e) => e === '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      if (!validateLoginForm()) return;
    } else {
      if (!validateSignupForm()) return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const response = await api.post(
          '/api/auth/login',
          { identifier: formData.identifier, password: formData.password },
          { withCredentials: true }
        );
        setAccessToken(response.data.token);
        toast.success('Welcome back 👋', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#1e1b4b',
            color: '#e9d5ff',
            border: '1px solid #7c3aed',
          },
        });
        navigate('/chats');
      } else {
        const response = await api.post(
          '/api/auth/register',
          { username: formData.username, email: formData.email, password: formData.password },
          { withCredentials: true }
        );
        setAccessToken(response.data.token);
        toast.success('Welcome aboard 🎉', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#1e1b4b',
            color: '#e9d5ff',
            border: '1px solid #7c3aed',
          },
        });
        navigate('/chats');
      }
    } catch (err) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message;

      let errorMessage = 'Something went wrong. Please try again.';

      if (serverMessage) {
        errorMessage = serverMessage;
      } else if (status === 401) {
        errorMessage = 'Invalid credentials. Please check and try again.';
      } else if (status === 404) {
        errorMessage = 'Account not found. Please sign up first.';
      } else if (status === 409) {
        errorMessage = 'Username or email already in use.';
      } else if (status === 429) {
        errorMessage = 'Too many attempts. Please slow down.';
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection.';
      }

      toast.error(errorMessage, {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#1f0a0a',
          color: '#fca5a5',
          border: '1px solid #EB300E',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({identifier:'', username: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setTouched({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .strength-bar {
          height: 3px;
          border-radius: 2px;
          transition: width 0.4s ease, background-color 0.4s ease;
        }
      `}</style>

      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 sm:p-10">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent mb-2">
              {isLogin ? 'Welcome Back' : 'Join Us'}
            </h1>
            <p className="text-gray-300 text-sm">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Username (Register only) */}
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <label className="block text-sm font-medium text-gray-200 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="john_doe"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all duration-300 backdrop-blur-sm ${
                    errors.username && touched.username
                      ? 'border-red-500/70 focus:border-red-400 focus:ring-red-400/30'
                      : 'border-white/10 focus:border-purple-400 focus:ring-purple-400/50'
                  }`}
                />
                <FieldError message={touched.username && errors.username} />
              </div>
            )}

            {/* Email (Register only) */}
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <label className="block text-sm font-medium text-gray-200 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all duration-300 backdrop-blur-sm ${
                    errors.email && touched.email
                      ? 'border-red-500/70 focus:border-red-400 focus:ring-red-400/30'
                      : 'border-white/10 focus:border-purple-400 focus:ring-purple-400/50'
                  }`}
                />
                <FieldError message={touched.email && errors.email} />
              </div>
            )}

            {/* Identifier (Login only) */}
            {isLogin && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Email Address or Username
                </label>
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="you@example.com or john_doe"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all duration-300 backdrop-blur-sm ${
                    errors.identifier && touched.username
                      ? 'border-red-500/70 focus:border-red-400 focus:ring-red-400/30'
                      : 'border-white/10 focus:border-purple-400 focus:ring-purple-400/50'
                  }`}
                />
                <FieldError message={touched.identifier && errors.identifier} />
              </div>
            )}

            {/* Password */}
            <div className="animate-in fade-in slide-in-from-top-2 duration-500">
              <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all duration-300 backdrop-blur-sm ${
                    errors.password && touched.password
                      ? 'border-red-500/70 focus:border-red-400 focus:ring-red-400/30'
                      : 'border-white/10 focus:border-purple-400 focus:ring-purple-400/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors text-lg"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <FieldError message={touched.password && errors.password} />

              {/* Password strength bar (signup only) */}
              {!isLogin && formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="strength-bar flex-1"
                        style={{
                          backgroundColor:
                            i <= passwordStrength.score ? passwordStrength.color : 'rgba(255,255,255,0.1)',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <label className="block text-sm font-medium text-gray-200 mb-2">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all duration-300 backdrop-blur-sm ${
                    errors.confirmPassword && touched.confirmPassword
                      ? 'border-red-500/70 focus:border-red-400 focus:ring-red-400/30'
                      : 'border-white/10 focus:border-purple-400 focus:ring-purple-400/50'
                  }`}
                />
                <FieldError message={touched.confirmPassword && errors.confirmPassword} />
              </div>
            )}

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <div className="text-right">
                <a href="#" className="text-sm text-purple-300 hover:text-purple-200 transition-colors">
                  Forgot password?
                </a>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-purple-500/50 disabled:to-pink-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  {isLogin ? 'Signing in…' : 'Creating account…'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="px-3 text-sm text-gray-400">or</span>
            <div className="flex-1 border-t border-white/10"></div>
          </div>

          {/* Toggle Mode */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={toggleMode}
                className="text-purple-300 hover:text-purple-200 font-semibold transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}