'use client'

import { Upload, TrendingUp, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Eth from '@/components/ui/Eth'
import Buttonx from '../ui/buttonx'

export function Hero() {
    return (
        <section className="relative py-24 px-6 md:px-40">
            <div className="absolute inset-0 bg-purple-100 blur-3xl -z-10" />

            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                {/* LEFT SIDE - TEXT CONTENT */}
                <div className="max-w-xl space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center space-x-2 bg-blue-500/20 rounded-full px-4 py-2 text-sm font-medium"
                    >
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span>Powered by 1inch</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7 }}
                        className="text-3xl md:text-5xl text-green-950 font-bold text-left"
                    >
                        Where unpaid invoices become unlocked opportunities
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-lg md:text-xl text-slate-500 mb-8 text-left"
                    >
                        Fund invoices. Earn DeFi yield.
                    </motion.p>

                    <motion.div
                        className="flex flex-row gap-4 text-left"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: {
                                transition: {
                                    staggerChildren: 0.2,
                                },
                            },
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Link href="/sme-dashboard">
                                <Buttonx icon={<Upload />} className="bg-gray-600">
                                    Upload Invoice
                                </Buttonx>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <Link href="/investor-dashboard">
                                <Buttonx className="bg-sky-400" icon={<TrendingUp />}>
                                    Start Investing
                                </Buttonx>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

                {/* RIGHT SIDE - LOADER */}
                <div className="relative md:mt-0 w-1/2 z-0 flex items-center justify-center">
                    {/* PURPLE GLOWING LIGHT */}
                    <div className="absolute w-full h-full bg-purple-500/40 rounded-full blur-3xl z-[-1]" />
                    <Eth />
                </div>
            </div>
        </section>
    )
}
