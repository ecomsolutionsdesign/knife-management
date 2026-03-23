// components/KnifeChange.js
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useLineStore } from './store';

const KNIFE_CONFIGS = {
    line2: { count: 30, prefix: 'TK' },
    line3: { count: 48, prefix: 'TK-' }
};

const generateKnives = (line) => {
    const config = KNIFE_CONFIGS[line];
    if (!config) return [];
    return Array.from({ length: config.count }, (_, i) => `${config.prefix}${i + 1}`);
};

function KnifeChange() {
    const router = useRouter();
    const { currentLine } = useLineStore();
    
    const [knifeNo, setKnifeNo] = useState('');
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState("");
    const [knives, setKnives] = useState([]);

    useEffect(() => {
        const generatedKnives = generateKnives(currentLine);
        setKnives(generatedKnives);
        if (generatedKnives.length > 0) {
            setKnifeNo(generatedKnives[0]);
        }
    }, [currentLine]);

    const showMessage = (msg, duration = 1500) => {
        setMessage(msg);
        setTimeout(() => setMessage(""), duration);
    };

    const handleChange = async () => {
        if (!currentLine || !knifeNo || !reason) {
            alert("Please fill in all fields before saving.");
            return;
        }

        try {
            await axios.patch(`/api/knives/${knifeNo}`, { 
                currentLine, 
                reason 
            });
            
            showMessage("✅ Knife changed successfully!");
            setReason("");
        } catch (error) {
            console.error('Error changing knife:', error);
            showMessage("❌ Failed to change knife. Please try again.");
        }
    };

    const navigateToLogs = (specificKnife = false) => {
        const baseUrl = '/knives/logs';
        const params = new URLSearchParams({ currentLine });
        if (specificKnife) params.append('knifeNo', knifeNo);
        router.push(`${baseUrl}?${params.toString()}`);
    };

    return (
        <div className="p-4 bg-slate-100">
            <div className="mb-4 space-x-2 flex items-center">
                <select 
                    value={knifeNo} 
                    onChange={(e) => setKnifeNo(e.target.value)} 
                    className="border rounded p-2"
                >
                    {knives.map((knife) => (
                        <option key={knife} value={knife}>{knife}</option>
                    ))}
                </select>

                <input 
                    type="text" 
                    placeholder="Reason" 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)} 
                    className="border rounded p-2 flex-1"
                />
                
                <button 
                    onClick={handleChange} 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors"
                >
                    Change Knife
                </button>
                
                {message && <p className="text-blue-800 text-xl">{message}</p>}
            </div>

            <div className="space-x-2">
                <button 
                    onClick={() => navigateToLogs(true)} 
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition-colors"
                >
                    View Knife Log
                </button>
                <button 
                    onClick={() => navigateToLogs(false)} 
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full transition-colors"
                >
                    View All Logs
                </button>
            </div>
        </div>
    );
}

export default KnifeChange;