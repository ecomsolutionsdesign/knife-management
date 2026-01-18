// components/Navbar.js
"use client";
import React from 'react'
import Link from 'next/link';

const Navbar = () => {
    return (
        <nav className='bg-slate-800 text-white w-full fixed'>
            <div className="mycontainer flex h-14 justify-between items-center px-4 py-5">
                <div className="logo w-22"><img className='rounded-lg' src="/icon/ktex.jpeg" alt="" /></div>
                <div className="logo font-bold text-white text-2xl">
                    <span className="text-green-700">Slitter Knife Management</span>
                </div>
                <ul>
                    <li className='flex gap-4'>
                        <Link href="/" className='hover:font-bold'>Home</Link>
                    </li>
                </ul>
            </div>
        </nav>
    )
}

export default Navbar