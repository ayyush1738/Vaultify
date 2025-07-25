'use client'

import { Upload, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Loader from '@/components/ui/HomePageModel'

export function Hero() {
    return (
        <section className="relative py-20 px-6 md:px-40">
            <div className="absolute inset-0 bg-purple-100 blur-3xl -z-10" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                {/* LEFT SIDE - TEXT CONTENT */}
                <div className="max-w-xl">
                    <h1 className="text-3xl md:text-5xl text-green-900 font-bold mt-12 text-left">
                        Real-world invoices, tokenized.
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 mb-12 text-left">
                        Fund invoices. Earn DeFi yield. Powered by 1inch.
                    </p>
                    <div className="flex flex-row gap-4 text-left">
                        <Link href="/sme-dashboard">
                            <Button
                                size="lg"
                                className="w-fit bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <Upload className="mr-2 h-5 w-5" />
                                Upload Invoice
                            </Button>
                        </Link>
                        <Link href="/investor-dashboard">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-fit border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <TrendingUp className="mr-2 h-5 w-5" />
                                Start Investing
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* RIGHT SIDE - LOADER */}
                <div className="mt-12 md:mt-0">
                    <Loader />
                </div>
            </div>
        </section>
    )
}
