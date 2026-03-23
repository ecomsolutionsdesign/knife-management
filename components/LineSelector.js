// components/LineSelector.js
"use client";
import React from 'react';

function LineSelector({ currentLine, onLineChange }) {
    const lines = [
        { id: 'line2', label: 'Line 2' },
        { id: 'line3', label: 'Line 3' }
    ];

    return (
        <div className="mb-4">
            {lines.map(({ id, label }) => (
                <button
                    key={id}
                    onClick={() => onLineChange(id)}
                    className={`${
                        currentLine === id
                            ? 'bg-slate-800 text-green-700'
                            : 'bg-slate-200 text-green-500'
                    } font-bold py-2 px-4 rounded mr-2 transition-colors hover:bg-slate-600`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

export default LineSelector;