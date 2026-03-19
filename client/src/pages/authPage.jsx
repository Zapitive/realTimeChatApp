import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/authContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const {setAccessToken} = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    try{
      e.preventDefault();
        if(isLogin){
            const response = await axios.post(
                '/api/auth/login',{
                    identifier: formData.username,
                    password: formData.password
                }
            ).catch(function (error){
              if (error.response){
                console.log(error.response.status);
                console.log(error.response.data.message);
              }
            });
            console.log(response.status);
            console.log(response.data.message);
            setAccessToken(response.data.token);
        }else{
          if (formData.confirmPassword === formData.password){
            const response = await axios.post(
                '/api/auth/register',{
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                }
            ).catch(function (error){
              if (error.response){
                console.log(error.response.status);
                console.log(error.response.data.message);
              }
            });
            console.log(response.status);
            console.log(response.data.message);
            setAccessToken(response.data.token);
          }else{
            console.log("Password does not match");
          }
        }
    }catch(err){
        console.log(err)
    }
    
    console.log('Form submitted:', isLogin ? 'Login' : 'Register', formData);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', email: '', password: '', confirmPassword: ''});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <div className="relative w-full max-w-md">
        {/* Card container */}
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
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field (Register only) */}
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
            )}

            {/* Email Field */}
            {!isLogin && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all duration-300 backdrop-blur-sm"
                    />
                </div>
            )}

            {/* Identifier Field for login form */}
            {isLogin && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        Email Address or Username
                    </label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all duration-300 backdrop-blur-sm"
                    />
                </div>
            )}
            

            {/* Password Field */}
            <div className="animate-in fade-in slide-in-from-top-2 duration-500 animation-delay-100">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all duration-300 backdrop-blur-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Register only) */}
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500 animation-delay-200">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all duration-300 backdrop-blur-sm"
                />
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

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/50"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="px-3 text-sm text-gray-400">or</span>
            <div className="flex-1 border-t border-white/10"></div>
          </div>

          {/* Toggle Auth Mode */}
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

        {/* Footer text */}
        <p className="text-center text-gray-500 text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}