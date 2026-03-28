// components/PlanListModal.js
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function PlanListModal({ currentLine, onClose }) {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(''); // New search state
    const router = useRouter();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/knives/plans', {
                    params: { currentLine }
                });
                // Sort plans descending so newest appears first
                const sorted = [...response.data].sort((a, b) =>
                    b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' })
                );
                setPlans(sorted);
            } catch (error) {
                console.error('Error fetching plans:', error);
            } finally {
                setLoading(false);
            }
        };
        if (currentLine) fetchPlans();
    }, [currentLine]);

    // --- Filter Logic ---
    const filteredPlans = plans.filter(planNo => 
        planNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewPlan = (planNo) => {
        router.push(`/knives/plans/${planNo}?currentLine=${currentLine}`);
        onClose();
    };

    return (
        // Backdrop
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            {/* Modal box */}
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold">
                        Plans — <span className="text-green-400">{currentLine}</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-300 hover:text-white text-2xl leading-none transition-colors"
                    >
                        &times;
                    </button>
                </div>

                {/* --- Search Bar --- */}
                <div className="p-4 border-b bg-slate-50 shrink-0">
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Search plan number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none text-sm shadow-sm"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Body (Scrollable Area) */}
                <div className="p-4 overflow-y-auto flex-1 bg-white">
                    {loading ? (
                        <p className="text-center text-slate-500 py-8">Loading plans…</p>
                    ) : filteredPlans.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-400 bg-slate-50 rounded-lg p-4 border border-dashed border-slate-200">
                                {searchQuery 
                                    ? `No plans matching "${searchQuery}"` 
                                    : `No plans found for ${currentLine}.`}
                            </p>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {filteredPlans.map((planNo) => {
                                // Logic to keep "Latest" badge accurate relative to the main plans array
                                const isLatest = planNo === plans[0];
                                
                                return (
                                    <li key={planNo}>
                                        <button
                                            onClick={() => handleViewPlan(planNo)}
                                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-green-50 hover:border-green-400 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                {isLatest && (
                                                    <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                        Latest
                                                    </span>
                                                )}
                                                <span className="font-mono font-semibold text-slate-700 group-hover:text-green-700">
                                                    {planNo}
                                                </span>
                                            </div>
                                            <span className="text-slate-400 group-hover:text-green-500 text-lg transition-transform group-hover:translate-x-1">→</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-3 flex justify-end border-t shrink-0">
                    <button
                        onClick={onClose}
                        className="bg-slate-600 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded-full text-sm transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PlanListModal;