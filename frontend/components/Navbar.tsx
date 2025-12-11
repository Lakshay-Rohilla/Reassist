'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth, UserMenu } from './auth';

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { user, loading } = useAuth();

    const navLinks = [
        { href: '/', label: 'Research' },
        { href: '/history', label: 'History' },
        { href: '/dashboard', label: 'Dashboard' },
    ];

    // Don't show navbar on auth pages
    if (pathname?.startsWith('/login') || pathname?.startsWith('/signup')) {
        return null;
    }

    return (
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Sparkles className="w-7 h-7 text-primary-500" />
                        <span className="text-xl font-bold text-gradient">ReAssist</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === link.href
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Section */}
                    <div className="hidden md:flex items-center gap-4">
                        {loading ? (
                            <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
                        ) : user ? (
                            <UserMenu />
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-slate-600 hover:text-slate-900"
                                >
                                    Sign In
                                </Link>
                                <Link href="/signup" className="btn-primary text-sm py-2">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-slate-600 hover:text-slate-900"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-slate-100">
                    <div className="px-4 py-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2 rounded-lg text-sm font-medium ${pathname === link.href
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {!user && (
                            <div className="pt-4 border-t border-slate-100 space-y-2">
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full text-center px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="btn-primary block text-center text-sm py-2"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
