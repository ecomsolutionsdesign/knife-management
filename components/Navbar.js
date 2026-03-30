// components/Navbar.js
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
    const { data: session, status } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className='bg-slate-800 text-white w-full fixed z-40'>
            <div className="flex h-14 justify-between items-center px-4">
                {/* Logo */}
                <div className="w-22">
                    <img className='rounded-lg h-9' src="/icon/ktex.jpeg" alt="KTex" />
                </div>

                {/* Title */}
                <div className="font-bold text-white text-xl hidden sm:block">
                    <span className="text-green-500">Slitter Knife Management</span>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {session && (
                        <Link href="/knives" className='text-slate-300 hover:text-white text-sm transition-colors'>
                            Home
                        </Link>
                    )}

                    {status === 'loading' ? null : session ? (
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(o => !o)}
                                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 rounded-full px-3 py-1.5 transition-colors"
                            >
                                {/* Avatar circle */}
                                <span className="bg-green-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                    {session.user.name?.[0]?.toUpperCase()}
                                </span>
                                <span className="text-sm text-slate-200 max-w-25 truncate">
                                    {session.user.name}
                                </span>
                                <span className="text-slate-400 text-xs">▾</span>
                            </button>

                            {menuOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                                    onMouseLeave={() => setMenuOpen(false)}
                                >
                                    <div className="px-4 py-3 border-b">
                                        <p className="text-sm font-semibold text-slate-800">{session.user.name}</p>
                                        <p className="text-xs text-slate-500">{session.user.email}</p>
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                                            {session.user.role}
                                        </span>
                                    </div>

                                    {session.user.role === 'admin' && (
                                        <Link href="/admin/thresholds" onClick={() => setMenuOpen(false)}
                                            className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                            ⚙️ Knife Thresholds
                                        </Link>
                                    )}
                                    
                                    {session.user.role === 'admin' && (
                                        <Link
                                            href="/admin/users"
                                            onClick={() => setMenuOpen(false)}
                                            className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            👥 Manage Users
                                        </Link>
                                    )}

                                    <button
                                        onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/auth/login' }); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        🚪 Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-1.5 rounded-full transition-colors"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;