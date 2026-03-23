// app/auth/register/page.js
"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function RegisterPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'operator' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/users', {
                name: form.name,
                email: form.email,
                password: form.password,
                role: isAdmin ? form.role : 'operator',
            });
            setSuccess('Account created! Redirecting to login…');
            setTimeout(() => router.push('/auth/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-slate-800 px-8 py-6 text-center">
                    <h1 className="text-2xl font-bold text-white">Create Account</h1>
                    <p className="text-green-400 mt-1 text-sm">Slitter Knife Management</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-300 text-green-700 rounded-lg px-4 py-3 text-sm">
                            {success}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                        <input name="name" type="text" required value={form.name} onChange={handleChange}
                            placeholder="Nilesh Patel"
                            className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                        <input name="email" type="email" required value={form.email} onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                        <input name="password" type="password" required value={form.password} onChange={handleChange}
                            placeholder="Min 6 characters"
                            className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
                        <input name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange}
                            placeholder="Repeat password"
                            className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
                    </div>

                    {/* Role selector — only visible to admins */}
                    {isAdmin && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                            <select name="role" value={form.role} onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition">
                                <option value="operator">Operator</option>
                                <option value="viewer">Viewer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    )}

                    <button type="submit" disabled={loading}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60">
                        {loading ? 'Creating account…' : 'Register'}
                    </button>
                </form>

                <div className="px-8 pb-6 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-green-600 font-semibold hover:underline">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}