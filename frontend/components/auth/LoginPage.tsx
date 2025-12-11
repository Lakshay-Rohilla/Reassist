'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Mail,
    Lock,
    Loader2,
    Sparkles,
    Chrome,
    Github,
    ArrowRight,
    Wand2
} from 'lucide-react';
import { useAuth } from './AuthProvider';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'password' | 'magic'>('password');

    const { signIn, signInWithGoogle, signInWithGitHub, signInWithMagicLink } = useAuth();
    const router = useRouter();

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await signIn(email, password);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/');
        }
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await signInWithMagicLink(email);

        if (error) {
            setError(error.message);
        } else {
            setMagicLinkSent(true);
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        const { error } = await signInWithGoogle();
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleGitHubLogin = async () => {
        setLoading(true);
        setError(null);
        const { error } = await signInWithGitHub();
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    if (magicLinkSent) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-2xl p-8 max-w-md w-full text-center"
                >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Check your email</h2>
                    <p className="text-slate-600 mb-6">
                        We sent a magic link to <strong>{email}</strong>. Click the link to sign in.
                    </p>
                    <button
                        onClick={() => setMagicLinkSent(false)}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Use a different email
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <Sparkles className="w-8 h-8 text-primary-500" />
                        <span className="text-2xl font-bold text-gradient">ReAssist</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome back</h1>
                    <p className="text-slate-600">Sign in to continue your research</p>
                </div>

                {/* Login Card */}
                <div className="glass-card rounded-2xl p-6">
                    {/* OAuth Buttons */}
                    <div className="space-y-3 mb-6">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            <Chrome className="w-5 h-5 text-red-500" />
                            <span className="font-medium text-slate-700">Continue with Google</span>
                        </button>

                        <button
                            onClick={handleGitHubLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            <Github className="w-5 h-5" />
                            <span className="font-medium">Continue with GitHub</span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-slate-500">or continue with email</span>
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-6">
                        <button
                            onClick={() => setMode('password')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'password'
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800'
                                }`}
                        >
                            Password
                        </button>
                        <button
                            onClick={() => setMode('magic')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'magic'
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800'
                                }`}
                        >
                            Magic Link
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>

                            {mode === 'password' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="input-field pl-10"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : mode === 'password' ? (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-5 h-5" />
                                        <span>Send Magic Link</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sign Up Link */}
                <p className="text-center mt-6 text-slate-600">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                        Sign up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
