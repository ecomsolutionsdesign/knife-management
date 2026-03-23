// components/KnifeSelector.js
"use client";
import React from 'react';

const KNIFE_CONFIGS = {
    line2: { count: 30, prefix: 'TK' },
    line3: { count: 48, prefix: 'TK-' }
};

function KnifeSelector({ currentLine, selectedKnives, onToggle }) {
    const config = KNIFE_CONFIGS[currentLine];
    if (!config) return null;

    const knives = Array.from({ length: config.count }, (_, i) => `${config.prefix}${i + 1}`);

    // Use explicit class names for Tailwind to detect
    const gridClass = currentLine === 'line2' ? 'grid-cols-6' : 'grid-cols-8';
    const widthClass = currentLine === 'line2' ? 'w-2/3' : 'w-full';

    return (
        <div className={`grid ${gridClass} gap-2 ${widthClass}`}>
            {knives.map((knifeNo) => (
                <label key={knifeNo} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100 p-1 rounded">
                    <input
                        type="checkbox"
                        value={knifeNo}
                        checked={selectedKnives.includes(knifeNo)}
                        onChange={() => onToggle(knifeNo)}
                        className="form-checkbox h-4 w-4 text-indigo-600"
                    />
                    <span>{knifeNo}</span>
                </label>
            ))}
        </div>
    );
}

export default KnifeSelector;