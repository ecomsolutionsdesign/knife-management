// components/PlanListModal.js
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function PlanListModal({ currentLine, onClose }) {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const handleViewPlan = (planNo) => {
        router.push(`/knives/plans/${planNo}?currentLine=${currentLine}`);
        onClose();
    };

    return (
        // Backdrop
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            {/* Modal box */}
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
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

                {/* Body */}
                <div className="p-4 max-h-96 overflow-y-auto">
                    {loading ? (
                        <p className="text-center text-slate-500 py-8">Loading plans…</p>
                    ) : plans.length === 0 ? (
                        <p className="text-center text-red-500 bg-red-50 rounded p-4">
                            No plans found for {currentLine}.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {plans.map((planNo, idx) => (
                                <li key={planNo}>
                                    <button
                                        onClick={() => handleViewPlan(planNo)}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-green-50 hover:border-green-400 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Badge for latest plan */}
                                            {idx === 0 && (
                                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                                    Latest
                                                </span>
                                            )}
                                            <span className="font-semibold text-slate-700 group-hover:text-green-700">
                                                Plan No: {planNo}
                                            </span>
                                        </div>
                                        <span className="text-slate-400 group-hover:text-green-500 text-lg">→</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-3 flex justify-end border-t">
                    <button
                        onClick={onClose}
                        className="bg-slate-600 hover:bg-slate-800 text-white font-bold py-2 px-5 rounded-full transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PlanListModal;