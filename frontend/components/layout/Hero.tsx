'use client'

import { useState, useEffect } from 'react';
import { Upload, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Eth from '@/components/ui/Eth';
import Buttonx from '../ui/buttonx';
import { useAccount, useSignMessage } from 'wagmi';
import { useRouter } from 'next/navigation';

export function Hero() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loadingNextPage, setLoadingNextPage] = useState(false);

  // Track login role for modal: 'enterprise' or 'investor'
  const [loginRole, setLoginRole] = useState<'enterprise' | 'investor'>('enterprise');

  useEffect(() => {
    setWalletAddress(isConnected ? address || null : null);
  }, [address, isConnected]);

  const handleEnterpriseLogin = async () => {
    if (!username.trim()) {
      setStatus('Please enter organization name');
      return;
    }

    if (!walletAddress) {
      setStatus('Please connect your wallet first');
      return;
    }

    try {
      setStatus('Fetching nonce...');

      const nonceRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/nonce?wallet_address=${walletAddress}`
      );

      if (!nonceRes.ok) throw new Error('Failed to get nonce');

      const { nonce } = await nonceRes.json();

      setStatus('Signing message...');
      const loginMessage = `Sign this message to login. Nonce: ${nonce}`;
      const signature = await signMessageAsync({ message: loginMessage });

      setStatus('Verifying credentials...');

      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/enterprise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          nonce,
          signature,
          username: username.trim(),
        }),
      });

      const data = await loginRes.json();

      if (!loginRes.ok) {
        setStatus(data.message || 'Login failed');
        return;
      }

      setStatus('Login successful! Redirecting...');
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('organizationName', username.trim());
      setLoadingNextPage(true);

      setTimeout(() => {
        router.push(`/enterprise/${walletAddress}`);
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);
      setStatus(`Login error: ${error.message || 'Unknown error occurred'}`);
    }
  };

  const handleInvestorLogin = async () => {
    if (!username.trim()) {
      setStatus('Please enter investor name');
      return;
    }

    if (!walletAddress) {
      setStatus('Please connect your wallet first');
      return;
    }

    try {
      setStatus('Fetching nonce...');

      const nonceRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/nonce?wallet_address=${walletAddress}`
      );

      if (!nonceRes.ok) throw new Error('Failed to get nonce');

      const { nonce } = await nonceRes.json();

      setStatus('Signing message...');
      const loginMessage = `Sign this message to login. Nonce: ${nonce}`;
      const signature = await signMessageAsync({ message: loginMessage });

      setStatus('Verifying credentials...');

      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/investor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          nonce,
          signature,
          username: username.trim(),
        }),
      });

      const data = await loginRes.json();

      if (!loginRes.ok) {
        setStatus(data.message || 'Login failed');
        return;
      }

      setStatus('Login successful! Redirecting...');
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('username', username.trim());
      setLoadingNextPage(true);

      setTimeout(() => {
        router.push(`/investor/${walletAddress}`);
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);
      setStatus(`Login error: ${error.message || 'Unknown error occurred'}`);
    }
  };

  return (
    <section className="relative py-24 px-6 md:px-40">
      <div className="absolute inset-0 bg-purple-100 blur-3xl -z-10" />

      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
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

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl text-slate-500 mb-4 text-left"
          >
            Fund invoices. Earn DeFi yield.
            <section className="text-sm mt-4 text-black">
              Are you an Investor?
              <button
                onClick={() => {
                  setLoginRole('investor');
                  setShowModal(true);
                  setUsername('');
                  setStatus('');
                }}
                className="bg-blue-400 rounded-2xl p-2 ml-2 hover:bg-blue-300 text-xs"
              >
                Click here
              </button>
            </section>
          </motion.div>

          {/* Existing Upload Invoices triggers Enterprise login */}
          <motion.div
            className="flex flex-row gap-4 text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div onClick={() => {
              setLoginRole('enterprise');
              setShowModal(true);
              setUsername('');
              setStatus('');
            }}>
              <Buttonx icon={<Upload />} className="bg-gray-600">
                Upload Invoices
              </Buttonx>
            </div>
          </motion.div>
        </div>

        <div className="relative md:mt-0 w-1/2 z-0 flex items-center justify-center">
          <div className="absolute w-full h-full bg-purple-500/40 rounded-full blur-3xl z-[-1]" />
          <Eth />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 text-white rounded-xl p-8 w-full max-w-md shadow-lg space-y-6">
            <h2 className="text-2xl font-bold text-center">
              {loginRole === 'enterprise' ? 'Enterprise Login' : 'Investor Login'}
            </h2>

            <div>
              <label className="block mb-1 text-sm">
                {loginRole === 'enterprise' ? 'Organization Name' : 'Investor Name'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-purple-500"
                placeholder={loginRole === 'enterprise' ? 'Enter your organization name' : 'Enter your investor name'}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Wallet Address</label>
              <input
                type="text"
                value={walletAddress || ''}
                readOnly
                className="w-full bg-zinc-700 rounded-lg px-4 py-2 text-zinc-400"
              />
            </div>

            {status && (
              <div
                className={`text-sm p-2 rounded ${
                  status.toLowerCase().includes('error') ||
                  status.toLowerCase().includes('failed') ||
                  status.toLowerCase().includes('denied')
                    ? 'bg-red-500/20 text-red-300'
                    : status.toLowerCase().includes('successful')
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-blue-500/20 text-blue-300'
                }`}
              >
                {status}
              </div>
            )}

            <div className="flex justify-between gap-4">
              <button
                onClick={loginRole === 'enterprise' ? handleEnterpriseLogin : handleInvestorLogin}
                disabled={loadingNextPage}
                className="flex-1 bg-gradient-to-br from-purple-600 to-green-500 px-6 py-2 rounded-lg font-semibold hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loadingNextPage ? 'Redirecting...' : 'Proceed'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setStatus('');
                  setLoadingNextPage(false);
                  setUsername('');
                }}
                disabled={loadingNextPage}
                className="px-6 py-2 rounded-lg border border-zinc-600 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>

            {loadingNextPage && (
              <div className="flex justify-center">
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
