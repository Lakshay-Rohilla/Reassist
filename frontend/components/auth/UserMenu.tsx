'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    User,
    LogOut,
    History,
    Settings,
    Bookmark,
    LayoutDashboard,
    ChevronDown
} from 'lucide-react';
import { useAuth } from './AuthProvider';

export function UserMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { user, signOut } = useAuth();
    const router = useRouter();

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: History, label: 'Research History', href: '/history' },
        { icon: Bookmark, label: 'Saved Reports', href: '/saved' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    const userEmail = user?.email || 'User';
    const userName = user?.user_metadata?.full_name || userEmail.split('@')[0];
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
            >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {userInitial}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[120px] truncate">
                    {userName}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-slate-100">
                            <p className="text-sm font-medium text-slate-800 truncate">{userName}</p>
                            <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <item.icon className="w-4 h-4 text-slate-400" />
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Sign Out */}
                        <div className="border-t border-slate-100 py-2">
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
