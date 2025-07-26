'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  FileText, 
  Database, 
  Coins, 
  TrendingUp, 
  Users, 
  DollarSign,
  Github,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { NavbarDemo } from '@/components/layout/Navbar';
import { Hero } from '@/components/layout/Hero';

export default function HomePage() {

  return (
    <div className="min-h-screen bg-purple-100">
      {/* Navigation */}
      <NavbarDemo />

      {/* Hero Section */}
      <Hero />

      {/* How It Works Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Upload,
                title: "SME Uploads Invoice",
                description: "Small businesses upload pending invoices as PDF or images"
              },
              {
                icon: Database,
                title: "IPFS Storage",
                description: "Metadata extracted and securely stored on IPFS network"
              },
              {
                icon: FileText,
                title: "NFT Minting",
                description: "Invoice minted as unique NFT on Ethereum blockchain"
              },
              {
                icon: Coins,
                title: "Earn Yield",
                description: "Investors fund invoices and earn yield when SMEs repay"
              }
            ].map((step, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 w-fit group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-white">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300 text-center">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Who Are You?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 p-8">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-r from-green-600 to-blue-600 w-fit">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">For Investors</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate-300 mb-6 text-lg">
                  Deposit ETH/USDC into Vaults and earn yield backed by real invoices
                </CardDescription>
                <Link href="/investor-dashboard">
                  <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    Investor Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 p-8">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 w-fit">
                  <Upload className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">For SMEs</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate-300 mb-6 text-lg">
                  Get capital instantly by uploading pending invoices
                </CardDescription>
                <Link href="/sme-dashboard">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    SME Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vault Stats Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: DollarSign,
                title: "Total Value Locked",
                value: "$2.4M",
                description: "Locked in vaults"
              },
              {
                icon: FileText,
                title: "Active Invoices",
                value: "1,247",
                description: "Being funded"
              },
              {
                icon: TrendingUp,
                title: "Average APY",
                value: "12.4%",
                description: "Historical average"
              }
            ].map((stat, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 text-center p-6">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 w-fit">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <CardDescription className="text-slate-300">{stat.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 md:mb-0">
              Vaultify
            </div>
            <div className="flex items-center gap-6">
              <a href="https://github.com" className="text-slate-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://ethglobal.com" className="text-slate-400 hover:text-white transition-colors">
                <ExternalLink className="h-5 w-5" />
              </a>
              <a href="https://1inch.io" className="text-slate-400 hover:text-white transition-colors">
                1inch
              </a>
              <a href="https://ipfs.io" className="text-slate-400 hover:text-white transition-colors">
                IPFS
              </a>
              <a href="https://ens.domains" className="text-slate-400 hover:text-white transition-colors">
                ENS
              </a>
            </div>
          </div>
          <div className="text-center mt-8 text-slate-400">
            <p>&copy; 2025 Vaultify. Built for ETHGlobal.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}