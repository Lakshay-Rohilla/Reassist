import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth'
import { Navbar } from '@/components/Navbar'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

export const metadata: Metadata = {
    title: 'ReAssist - AI Research Assistant',
    description: 'Autonomous AI-powered research assistant for market analysis, competitive intelligence, and technology insights.',
    keywords: ['research', 'AI', 'market analysis', 'competitive intelligence', 'business research'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 antialiased">
                <AuthProvider>
                    <Navbar />
                    <main className="min-h-screen">
                        {children}
                    </main>
                </AuthProvider>
            </body>
        </html>
    )
}
