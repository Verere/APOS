"use client";
import { addUser } from "@/actions";
import { GlobalContext } from "@/context";
import Link from "next/link";
import { useEffect, useContext, useState, useActionState } from "react";
import { toast } from "react-toastify";
import MainNav from "../mainNav";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  Store,
  TrendingUp,
  Zap
} from "lucide-react";

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(addUser, {});
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { setUser } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focusedInput, setFocusedInput] = useState('');

  // Password strength calculator
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
    setPasswordStrength(strength);
  }, [password]);

  useEffect(() => {
    const getState = async () => {
      if (state.error) {
        toast.error(state.error);
        setLoading(false);
      }
      if (state.success) {
        setLoading(false);
        setShowSuccess(true);
        if (state.warning) {
          toast.warning(state.warning);
        } else {
          toast.success('Account created! Please check your email to verify your account.');
        }
      }
    };
    getState();
  }, [state]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 75) return 'bg-green-500';
    if (passwordStrength >= 50) return 'bg-blue-500';
    if (passwordStrength >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength >= 75) return 'Strong';
    if (passwordStrength >= 50) return 'Medium';
    if (passwordStrength >= 25) return 'Weak';
    return 'Very Weak';
  };

  return (
    <>
      <MainNav />
      <div className="relative min-h-screen mt-14 bg-gradient-to-br from-blue-50 via-indigo-50 to-white pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Features */}
            <div className="hidden lg:block space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-sm font-semibold shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  Start Your Free Trial Today
                </div>
                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                  Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">MarketBook</span>
                </h1>
                <p className="text-xl text-gray-600">
                  The modern point-of-sale system trusted by thousands of businesses worldwide.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Multi-Store Management</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Manage multiple stores from one centralized dashboard</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Real-time Analytics</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Track sales, inventory, and performance in real-time</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Lightning Fast</h3>
                    <p className="text-gray-600 text-sm">Process transactions in seconds with our optimized system</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Trusted by 10,000+ businesses</p>
                  <p className="text-xs text-gray-600">Join our growing community</p>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full max-w-md mx-auto">
              <form action={formAction} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                {showSuccess ? (
                  <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email!</h2>
                    <p className="text-gray-600 mb-3">
                      We've sent a verification email to:
                    </p>
                    <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
                      {email}
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-700">
                        Please click the link in the email to verify your account and complete the registration.
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                      Didn't receive the email? Check your spam folder or contact support.
                    </p>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Go to Login
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-center">
                      <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                      <p className="text-blue-100">Start your 30-day free trial</p>
                    </div>

                    {/* Form Fields */}
                    <div className="p-8 space-y-6">
                      {/* Name Input */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                        <div className={`relative transition-all ${focusedInput === 'name' ? 'scale-[1.02]' : ''}`}>
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onFocus={() => setFocusedInput('name')}
                            onBlur={() => setFocusedInput('')}
                            placeholder="Enter your full name"
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                            required
                          />
                        </div>
                      </div>

                      {/* Email Input */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                        <div className={`relative transition-all ${focusedInput === 'email' ? 'scale-[1.02]' : ''}`}>
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedInput('email')}
                            onBlur={() => setFocusedInput('')}
                            placeholder="Enter your email"
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                            required
                          />
                        </div>
                      </div>

                      {/* Password Input */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Password</label>
                        <div className={`relative transition-all ${focusedInput === 'password' ? 'scale-[1.02]' : ''}`}>
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput('')}
                            placeholder="Create a strong password"
                            className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {password && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Password strength:</span>
                              <span className={`font-semibold ${passwordStrength >= 75 ? 'text-green-600' : passwordStrength >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {getPasswordStrengthText()}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                                style={{ width: `${passwordStrength}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password Input */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                        <div className={`relative transition-all ${focusedInput === 'confirmPassword' ? 'scale-[1.02]' : ''}`}>
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="cfpassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onFocus={() => setFocusedInput('confirmPassword')}
                            onBlur={() => setFocusedInput('')}
                            placeholder="Confirm your password"
                            className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                          <div className="flex items-center gap-1 text-red-600 text-xs">
                            <AlertCircle className="w-3 h-3" />
                            <span>Passwords do not match</span>
                          </div>
                        )}
                      </div>

                      {/* Terms */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 text-center">
                          By signing up, you agree to our{' '}
                          <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Privacy Policy
                          </Link>
                        </p>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading || isPending || password !== confirmPassword}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading || isPending ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Creating Account...
                          </span>
                        ) : (
                          'Create Account'
                        )}
                      </button>

                      {/* Login Link */}
                      <div className="text-center pt-4 border-t border-gray-200">
                        <p className="text-gray-600">
                          Already have an account?{' '}
                          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Sign in
                          </Link>
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
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
    </>
  );
}
