'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { AuthBadge } from './auth-badge';
import { AuthHeader } from './auth-header';
import { InputField } from './input-field';
import { PasswordInput } from './password-input';
import { RememberMe } from './remember-me';
import { ForgotPassword } from './forgot-password';
import { SubmitButton } from './submit-button';
import { RoleNotice } from './role-notice';
import { AuthFooter } from './auth-footer';

export const LoginForm: React.FC = () => {
  // Fixed: Initialize password as empty string
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('passwordUpdated') === '1') {
      setFormMessage('Password updated. Sign in with your new password.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setFormError("");
    setFormMessage('');
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        setFormError(result.error ?? "Sign-in failed. Please try again.");
        return;
      }

      router.replace(result.role === "admin" ? "/admin/overview" : "/homeowner/overview");
      router.refresh();
    } catch {
      setFormError("Could not reach the sign-in service. Check the Supabase setup and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <AuthBadge />

      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6">
        <AuthHeader
          title="Welcome back"
          subtitle="Sign in to your community account."
        />

        {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{formError}</p>}
        {formMessage && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800" role="status">{formMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            id="email"
            type="email"
            label="Email address"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            error={errors.email}
          />

          <PasswordInput
            id="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <div className="flex items-center justify-between pt-1">
            <RememberMe checked={rememberMe} onChange={setRememberMe} />
            <ForgotPassword />
          </div>

          <div className="pt-1">
            <SubmitButton isLoading={isLoading} text="Sign in securely" />
          </div>
        </form>

        <RoleNotice />
      </div>

      <AuthFooter />
    </div>
  );
};
