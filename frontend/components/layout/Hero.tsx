'use client'

import { Upload, TrendingUp, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Server1 from '@/components/ui/HomePageModel'
import Eth from '@/components/ui/Eth'
import Server2 from '../ui/Server2'
import Buttonx from '../ui/buttonx'

export function Hero() {
    return (
        <section className="relative py-24 px-6 md:px-40">
            <div className="absolute inset-0 bg-purple-100 blur-3xl -z-10" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                {/* LEFT SIDE - TEXT CONTENT */}
                <div className="max-w-xl">
                    <div className="inline-flex items-center space-x-2 bg-blue-500/20 rounded-full px-4 py-2 text-sm font-medium mb-4">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span>Powered by 1inch</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl text-green-950 font-bold mt-8 text-left">
                        Where unpaid invoices become unlocked opportunities
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 mb-12 text-left mt-4">
                        Fund invoices. Earn DeFi yield. 
                    </p>
                    <div className="flex flex-row gap-4 text-left">
                        <Link href="/sme-dashboard">
                            <Buttonx icon={<Upload/>} className='bg-gray-600' >
                                Upload Invoice
                            </Buttonx>
                        </Link>
                        <Link href="/investor-dashboard">
                            <Buttonx className="bg-sky-400"
                                icon={<TrendingUp/>}
                            >
                                Start Investing
                            </Buttonx>
                        </Link>
                    </div>
                </div>

                {/* RIGHT SIDE - LOADER */}
                <div className="md:mt-0 w-1/2 z-0">
                    {/* <div className='flex-col mb-4 ml-auto'>
                        <Server1 />
                        <Server2 />
                    </div> */}
                    <Eth />
                </div>
            </div>
        </section>
    )
}
