'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { Package } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await api.post('/auth/forgot-password', { email });
            const successMsg = res.data.mockDelivery 
                ? `${res.data.message}\n(Demo Mock - New Password is: ${res.data.mockDelivery})`
                : res.data.message;
            setMessage(successMsg);
        } catch (err: any) {
             setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-neutral-950">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px]" />
            
            <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 dark:bg-neutral-900/50 dark:border-neutral-800 p-8 rounded-3xl shadow-2xl relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/20">
                        <Package className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Reset Password</h1>
                    <p className="text-neutral-400 mt-2 text-sm font-medium text-center">Enter your email and we'll send you a password reset.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="p-3 text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center whitespace-pre-wrap">
                            {message}
                        </div>
                    )}
                    
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-neutral-300 ml-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                            placeholder="Enter your registered email"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Reset Email'}
                    </button>
                    
                    <p className="text-center text-sm text-neutral-400 mt-6">
                        Remembered your password?{' '}
                        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                            Sign In
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
