import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

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
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <body className="min-h-screen antialiased flex flex-col">
                <ThemeProvider>
                    <AuthProvider>
                        <Navbar />
                        <main className="flex-1">
                            {children}
                        </main>
                        <Footer />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
