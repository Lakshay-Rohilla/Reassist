'use client';

import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
                            <Shield className="w-6 h-6 text-primary-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800">Privacy Policy</h1>
                    </div>

                    <p className="text-slate-500 mb-8">Last updated: December 12, 2024</p>

                    <div className="prose prose-slate max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Information We Collect</h2>
                            <p className="text-slate-600 mb-4">
                                We collect information you provide directly to us, including:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600 space-y-2">
                                <li>Account information (email address, name)</li>
                                <li>Research queries and preferences</li>
                                <li>Usage data and analytics</li>
                                <li>Communication preferences</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">2. How We Use Your Information</h2>
                            <p className="text-slate-600 mb-4">We use the information we collect to:</p>
                            <ul className="list-disc pl-6 text-slate-600 space-y-2">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Process and complete research requests</li>
                                <li>Send you technical notices and support messages</li>
                                <li>Respond to your comments and questions</li>
                                <li>Analyze usage patterns to improve user experience</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">3. Data Storage and Security</h2>
                            <p className="text-slate-600 mb-4">
                                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely using industry-standard encryption.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">4. Data Sharing</h2>
                            <p className="text-slate-600 mb-4">
                                We do not sell, trade, or otherwise transfer your personal information to third parties. We may share data with trusted service providers who assist us in operating our platform, subject to confidentiality agreements.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">5. Your Rights</h2>
                            <p className="text-slate-600 mb-4">You have the right to:</p>
                            <ul className="list-disc pl-6 text-slate-600 space-y-2">
                                <li>Access your personal data</li>
                                <li>Correct inaccurate data</li>
                                <li>Request deletion of your data</li>
                                <li>Export your data</li>
                                <li>Opt-out of marketing communications</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">6. Contact Us</h2>
                            <p className="text-slate-600">
                                If you have any questions about this Privacy Policy, please contact us at{' '}
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
