'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isConfigured: boolean;
    signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signInWithGoogle: () => Promise<{ error: Error | null }>;
    signInWithGitHub: () => Promise<{ error: Error | null }>;
    signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isConfigured, setIsConfigured] = useState(false);

    useEffect(() => {
        const configured = isSupabaseConfigured();
        setIsConfigured(configured);

        if (!configured) {
            setLoading(false);
            return;
        }

        const supabase = getSupabase();
        if (!supabase) {
            setLoading(false);
            return;
        }

        // Get initial session
        const initAuth = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                setSession(initialSession);
                setUser(initialSession?.user ?? null);
            } catch {
                // Ignore errors
            } finally {
                setLoading(false);
            }
        };
        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event: string, newSession: Session | null) => {
                setSession(newSession);
                setUser(newSession?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, fullName?: string) => {
        const supabase = getSupabase();
        if (!supabase) return { error: new Error('Supabase not configured') };

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });
        return { error: error as Error | null };
    };

    const signIn = async (email: string, password: string) => {
        const supabase = getSupabase();
        if (!supabase) return { error: new Error('Supabase not configured') };

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error: error as Error | null };
    };

    const signInWithGoogle = async () => {
        const supabase = getSupabase();
        if (!supabase) return { error: new Error('Supabase not configured') };

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        return { error: error as Error | null };
    };

    const signInWithGitHub = async () => {
        const supabase = getSupabase();
        if (!supabase) return { error: new Error('Supabase not configured') };

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        return { error: error as Error | null };
    };

    const signInWithMagicLink = async (email: string) => {
        const supabase = getSupabase();
        if (!supabase) return { error: new Error('Supabase not configured') };

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        return { error: error as Error | null };
    };

    const signOut = async () => {
        const supabase = getSupabase();
        if (supabase) {
            await supabase.auth.signOut();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                isConfigured,
                signUp,
                signIn,
                signInWithGoogle,
                signInWithGitHub,
                signInWithMagicLink,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
