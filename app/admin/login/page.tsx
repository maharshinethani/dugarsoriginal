'use client';

import { useState } from 'react';
import { useAdminAuth } from '@/lib/admin-auth';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const { signIn, resetPassword } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Welcome back');
      router.push('/admin');
    }
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      toast.error(error);
    } else {
      setForgotSent(true);
      toast.success('Reset link sent to your email');
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* LEFT SIDE: Luxury Image Showcase */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between bg-soft-black p-12 text-on-dark overflow-hidden">
        {/* Background Image with Luxury Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            // Use a higher resolution and quality image
            src="/poster.png"
            alt="Dugars Jewellery Luxury"
            // Increased opacity to 60 for better image clarity
            className="h-full w-full object-cover opacity-60 scale-105 transition-transform duration-1000 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-soft-black via-soft-black/40 to-transparent" />
        </div>

        {/* Top Brand Tag */}
        <div className="relative z-10 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-gold" />
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium">
            Secure Admin Portal
          </span>
        </div>

        {/* Bottom Quote / Branding */}
        <div className="relative z-10 max-w-md space-y-3">
          <div className="h-px w-16 bg-gold" />
          <h2 className="font-serif text-3xl font-light tracking-wide text-on-dark">
            Crafting Elegance, Managing Excellence.
          </h2>
          <p className="text-xs text-secondary-text/80 tracking-wider leading-relaxed">
            Welcome to the DUGARS backend administration. Manage your exclusive collections, orders, and clientele with precision.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form (Fixed height, non-scrollable view) */}
      <div className="flex w-full lg:w-1/2 h-full flex-col justify-between p-6 sm:p-10 lg:p-16 bg-background overflow-y-auto">
        {/* Top Header */}
       

        {/* Center Form Container */}
        <div className="w-full max-w-sm mx-auto my-auto py-4">
     
<div className="mb-6 text-center">
  {/* Logo + Brand Name */}
  <Link
    href="/"
    className="mb-5 inline-flex items-center justify-center gap-3"
  >
    <img
      src="/logo.png"
      alt="DUGARS Logo"
      className="h-10 w-10 object-contain sm:h-12 sm:w-12"
    />

    <span className="font-serif text-2xl font-semibold tracking-[0.16em] text-body sm:text-3xl">
      DUGARS
    </span>
  </Link>

  <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
    {forgotMode ? 'Reset Password' : 'Admin Sign In'}
  </p>

  <h1 className="mt-1 font-serif text-xl text-body sm:text-2xl">
    {forgotMode ? 'Recover Access' : 'Authorized Access Only'}
  </h1>
</div>


          {forgotSent ? (
            <div className="rounded-sm border border-gold/20 bg-card p-6 text-center animate-fade-in">
              <p className="text-sm text-secondary-text/80">A password reset link has been sent to your email.</p>
              <button 
                onClick={() => { setForgotMode(false); setForgotSent(false); }} 
                className="mt-4 text-xs uppercase tracking-wider text-gold hover:underline"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={forgotMode ? handleReset : handleLogin} className="space-y-4">
              <div>
                <label className="label-luxury mb-1.5 block text-xs text-secondary-text/70 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-text/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-border/15 bg-soft-black/20 ps-10 pe-4 py-2.5 text-sm text-body outline-none transition-colors focus:border-gold rounded-sm"
                    placeholder="admin@dugarsjewellery.com"
                  />
                </div>
              </div>

              {!forgotMode && (
                <div>
                  <label className="label-luxury mb-1.5 block text-xs text-secondary-text/70 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-text/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-border/15 bg-soft-black/20 ps-10 pe-10 py-2.5 text-sm text-body outline-none transition-colors focus:border-gold rounded-sm"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-secondary-text/40 hover:text-body"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 bg-gold py-3 text-xs font-medium uppercase tracking-[0.2em] text-soft-black transition-colors hover:bg-gold-light disabled:opacity-50 rounded-sm mt-2"
              >
                {loading ? 'Processing...' : forgotMode ? 'Send Reset Link' : 'Sign In'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>

              
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-secondary-text/40 tracking-wider">
          &copy; {new Date().getFullYear()} Dugars Jewellery. All rights reserved.
        </div>
      </div>
    </div>
  );
}