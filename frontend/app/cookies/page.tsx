'use client';

import { motion } from 'framer-motion';
import { Cookie, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link href="/" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary-100 rounded-xl">
                            <Cookie className="w-6 h-6 text-primary-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800">Cookie Policy</h1>
                    </div>

                    <p className="text-slate-500 mb-8">Last updated: December 12, 2024</p>

                    <div className="prose prose-slate max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">1. What Are Cookies</h2>
                            <p className="text-slate-600 mb-4">
                                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our Service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">2. Types of Cookies We Use</h2>

                            <h3 className="text-lg font-medium text-slate-700 mb-2">Essential Cookies</h3>
                            <p className="text-slate-600 mb-4">
                                These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and session management.
                            </p>

                            <h3 className="text-lg font-medium text-slate-700 mb-2">Preference Cookies</h3>
                            <p className="text-slate-600 mb-4">
                                These cookies remember your settings and preferences, such as theme selection and search depth preferences, to enhance your experience.
                            </p>

                            <h3 className="text-lg font-medium text-slate-700 mb-2">Analytics Cookies</h3>
                            <p className="text-slate-600 mb-4">
                                We use analytics cookies to understand how visitors interact with our website. This helps us improve our Service and user experience.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">3. Cookie Details</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cookie</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Purpose</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        <tr>
                                            <td className="px-4 py-3 text-sm text-slate-600">session</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">User authentication</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">Session</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-sm text-slate-600">theme</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">Theme preference</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">1 year</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-sm text-slate-600">preferences</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">User settings</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">1 year</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">4. Managing Cookies</h2>
                            <p className="text-slate-600 mb-4">
                                You can control and manage cookies through your browser settings. Most browsers allow you to:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600 space-y-2">
                                <li>View cookies stored on your device</li>
                                <li>Delete all or specific cookies</li>
                                <li>Block cookies from all or specific websites</li>
                                <li>Set preferences for third-party cookies</li>
                            </ul>
                            <p className="text-slate-600 mt-4">
                                Please note that disabling certain cookies may affect the functionality of our Service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">5. Updates to This Policy</h2>
                            <p className="text-slate-600 mb-4">
                                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">6. Contact Us</h2>
                            <p className="text-slate-600">
                                If you have any questions about our use of cookies, please contact us at{' '}
                                <a href="mailto:privacy@reassist.ai" className="text-primary-600 hover:underline">
                                    privacy@reassist.ai
                                </a>
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
