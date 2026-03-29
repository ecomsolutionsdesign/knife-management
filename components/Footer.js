// components/Footer.js
"use client";
import React from 'react'

const Footer = () => {
  return (
    <div className='bg-slate-800 text-white flex flex-row w-full bottom-0 fixed'>
      <div className='w-full flex text-lg text-green-400'>
        Copyrights &copy; www.ktexnonwovens.com
      </div>
      <div className='container mx-auto text-right text-green-400'>Developed by <span className="font-semibold">Mustanshir Vohra</span></div>
    </div>
  )
}

export default Footer