// components/KnifeForm.js
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLineStore } from './store';
import LineSelector from './LineSelector';
import KnifeSelector from './KnifeSelector';
import PlanListModal from './PlanListModal';

const validateInputs = (planNo, doffLength, noOfDoff, mcSpeed, selectedKnives) => {
    const errors = {};
    if (!planNo) errors.planNo = 'Plan No is required';
    if (!doffLength) errors.doffLength = 'Doff Length is required';
    if (!noOfDoff) errors.noOfDoff = 'No of Doff is required';
    if (!mcSpeed) errors.mcSpeed = 'MC Speed is required';
    if (selectedKnives.length === 0) errors.knives = 'Select at least one knife';
    return errors;
};

// Format a Date → "YYYY-MM-DD" (for the date input's value)
const toDateInputValue = (date) => {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

function KnifeForm() {
    const router = useRouter();
    const { data: session } = useSession();
    const { currentLine, setCurrentLine } = useLineStore();

    const [planDate, setPlanDate] = useState(toDateInputValue(new Date()));
    const [planNo, setPlanNo] = useState('');
    const [planNoLoading, setPlanNoLoading] = useState(false);

    const [formData, setFormData] = useState({
        doffLength: '',
        noOfDoff: '',
        mcSpeed: '',
    });
    const [selectedKnives, setSelectedKnives] = useState([]);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [existingPlans, setExistingPlans] = useState([]);
    const [lastSavedPlan, setLastSavedPlan] = useState(null);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // ── Fetch next available planNo whenever date or line changes ──────────────
    const fetchNextPlanNo = useCallback(async (line, date) => {
        if (!line || !date) return;
        try {
            setPlanNoLoading(true);
            const res = await axios.get('/api/knives/plans/next-serial', {
                params: { currentLine: line, date },
            });
            setPlanNo(res.data.planNo);
        } catch (err) {
            console.error('Could not fetch next plan no:', err);
        } finally {
            setPlanNoLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNextPlanNo(currentLine, planDate);
    }, [currentLine, planDate, fetchNextPlanNo]);

    // ── Fetch existing plan list (for duplicate check & last-saved banner) ─────
    useEffect(() => {
        const fetchExistingPlans = async () => {
            if (!currentLine) return;
            try {
                const res = await axios.get('/api/knives/plans', { params: { currentLine } });
                const plans = res.data;
                setExistingPlans(plans);
                if (plans.length > 0) {
                    const sorted = [...plans].sort((a, b) =>
                        b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' })
                    );
                    setLastSavedPlan(sorted[0]);
                } else {
                    setLastSavedPlan(null);
                }
            } catch (err) {
                console.error('Error fetching existing plans:', err);
            }
        };
        fetchExistingPlans();
    }, [currentLine]);

    const handleSaveInitiate = () => {
        // 1. Check if plan exists
        if (existingPlans.includes(planNo)) {
            alert(`❌ Plan No. "${planNo}" already exists for ${currentLine}!`);
            return;
        }

        // 2. Validate inputs
        const validationErrors = validateInputs(
            planNo, formData.doffLength, formData.noOfDoff, formData.mcSpeed, selectedKnives
        );

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            alert(Object.values(validationErrors).join('\n'));
            return;
        }

        // 3. If all good, show confirmation instead of saving immediately
        setShowConfirm(true);
    };

    const handleConfirmSave = async () => {
        setShowConfirm(false);
        try {
            await axios.post('/api/knives', {
                ...formData,
                planNo,
                planDate,
                selectedKnives,
                currentLine,
            });
            showMessage('✅ Data saved successfully!');
            setErrors({});
            setLastSavedPlan(planNo);
            setExistingPlans(prev => [...prev, planNo]);
            setFormData({ doffLength: '', noOfDoff: '', mcSpeed: '' });
            setSelectedKnives([]);
            await fetchNextPlanNo(currentLine, planDate);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to save data.';
            showMessage(`❌ ${msg}`);
        }
    };

    const handleInputChange = (field, value) => {
        if (['doffLength', 'noOfDoff', 'mcSpeed'].includes(field)) {
            const numValue = value.replace(/\D/g, '');
            if (value !== numValue) alert('Only whole numbers are allowed!');
            setFormData(prev => ({ ...prev, [field]: numValue }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
        setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleKnifeToggle = (knifeNo) => {
        setSelectedKnives(prev =>
            prev.includes(knifeNo) ? prev.filter(k => k !== knifeNo) : [...prev, knifeNo]
        );
        setErrors(prev => ({ ...prev, knives: null }));
    };

    const showMessage = (msg, duration = 2000) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), duration);
    };

    const handleSave = async () => {
        if (existingPlans.includes(planNo)) {
            alert(`❌ Plan No. "${planNo}" already exists for ${currentLine}!\n\nPlease regenerate a new plan number.`);
            setErrors(prev => ({ ...prev, planNo: `Plan No. "${planNo}" already exists!` }));
            return;
        }

        const validationErrors = validateInputs(
            planNo, formData.doffLength, formData.noOfDoff, formData.mcSpeed, selectedKnives
        );

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            alert(Object.values(validationErrors).join('\n'));
            return;
        }

        try {
            await axios.post('/api/knives', {
                ...formData,
                planNo,
                planDate,
                selectedKnives,
                currentLine,
            });
            showMessage('✅ Data saved successfully!');
            setErrors({});

            setLastSavedPlan(planNo);
            setExistingPlans(prev => [...prev, planNo]);
            setFormData({ doffLength: '', noOfDoff: '', mcSpeed: '' });
            setSelectedKnives([]);

            // Auto-advance plan number for next entry on same date
            await fetchNextPlanNo(currentLine, planDate);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to save data.';
            showMessage(`❌ ${msg}`);
        }
    };

    return (
        <div className="bg-slate-100 relative">
            {/* --- NEW: PLAN SAVING CONFIRMATION MODAL --- */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full mx-4 border-t-8 border-blue-600">
                        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                            <span>📋</span> Confirm New Plan
                        </h3>
                        
                        <div className="space-y-3 bg-slate-50 p-4 rounded border border-slate-200 mb-6">
                            <div className="flex justify-between border-b pb-1">
                                <span className="text-slate-500">Target Line:</span>
                                <span className="font-bold text-blue-700 underline decoration-2 underline-offset-4">
                                    {currentLine.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                                <span className="text-slate-500">Plan Number:</span>
                                <span className="font-mono font-bold">{planNo}</span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                                <span className="text-slate-500">Date:</span>
                                <span className="font-bold">{planDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Knives Selected:</span>
                                <span className="font-bold text-green-900">{selectedKnives.join(', ')}</span>
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 mb-6 text-center italic">
                            Please verify the data before saving.
                        </p>

                        <div className="flex gap-3">
                            <button 
                                onClick={handleConfirmSave}
                                className="flex-1 bg-blue-600 hover:bg-blue-800 text-white font-black py-3 rounded-lg shadow-lg transition-all active:scale-95"
                            >
                                Confirm & Save
                            </button>
                            <button 
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-lg transition-all"
                            >
                                Edit Data
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <LineSelector currentLine={currentLine} onLineChange={setCurrentLine} />

            {/* ── Plan date + auto plan number row ───────────────────────────── */}
            <div className="mb-4 flex flex-wrap items-end gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Plan Date</label>
                    <input
                        type="date"
                        value={planDate}
                        onChange={(e) => setPlanDate(e.target.value)}
                        className="border rounded p-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Plan No (auto)</label>
                    <div className="flex items-center gap-2">
                        <span className={`border rounded px-3 py-2 text-sm font-mono font-bold bg-white min-w-40 ${errors.planNo ? 'border-red-500 text-red-600' : 'text-slate-800 border-slate-300'}`}>
                            {planNoLoading ? '…' : planNo}
                        </span>
                        <button
                            type="button"
                            onClick={() => fetchNextPlanNo(currentLine, planDate)}
                            title="Refresh plan number"
                            className="text-slate-500 hover:text-slate-800 text-lg leading-none px-1"
                        >
                            ↻
                        </button>
                    </div>
                    {errors.planNo && <p className="text-red-500 text-xs mt-1">{errors.planNo}</p>}
                </div>

                {/* Who will create this plan */}
                {session && (
                    <div className="text-xs text-slate-400 pb-2">
                        Creating as <span className="font-semibold text-slate-600">{session.user.name}</span>
                    </div>
                )}
            </div>

            {/* ── Last saved plan banner ─────────────────────────────────────── */}
            {lastSavedPlan && (
                <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-300 rounded-lg px-4 py-2 w-fit">
                    <span className="text-green-700 font-semibold text-sm">Last Saved Plan:</span>
                    <button
                        onClick={() => router.push(`/knives/plans/${lastSavedPlan}?currentLine=${currentLine}`)}
                        className="text-green-800 font-bold underline hover:text-green-600 transition-colors"
                    >
                        {lastSavedPlan}
                    </button>
                </div>
            )}

            {/* ── Numeric inputs ─────────────────────────────────────────────── */}
            <div className="mb-4 space-x-2">
                <input
                    type="number"
                    placeholder="Doff Length"
                    value={formData.doffLength}
                    onChange={(e) => handleInputChange('doffLength', e.target.value)}
                    className={`border rounded p-2 ${errors.doffLength ? 'border-red-500' : ''}`}
                />
                <input
                    type="number"
                    placeholder="No of Doff"
                    value={formData.noOfDoff}
                    onChange={(e) => handleInputChange('noOfDoff', e.target.value)}
                    className={`border rounded p-2 ${errors.noOfDoff ? 'border-red-500' : ''}`}
                />
                <input
                    type="number"
                    placeholder="MC Speed"
                    value={formData.mcSpeed}
                    onChange={(e) => handleInputChange('mcSpeed', e.target.value)}
                    className={`border rounded p-2 ${errors.mcSpeed ? 'border-red-500' : ''}`}
                />
            </div>

            {/* ── Knife selector ─────────────────────────────────────────────── */}
            <div className="mb-4">
                <KnifeSelector
                    currentLine={currentLine}
                    selectedKnives={selectedKnives}
                    onToggle={handleKnifeToggle}
                />
                {errors.knives && <p className="text-red-500 mt-2">{errors.knives}</p>}
            </div>

            {/* ── Action buttons ─────────────────────────────────────────────── */}
            <div className="space-x-2 flex items-center flex-wrap gap-y-2">
                <button
                    onClick={handleSaveInitiate} 
                    disabled={!!errors.planNo || planNoLoading}
                    className={`font-bold py-2 px-4 rounded-full transition-colors text-slate-100 ${
                        errors.planNo || planNoLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-700 cursor-pointer shadow-md'
                    }`}
                >
                    Save Data
                </button>

                <button
                    onClick={() => setShowPlanModal(true)}
                    className="bg-purple-500 hover:bg-purple-700 cursor-pointer text-slate-100 font-bold py-2 px-4 rounded-full transition-colors"
                >
                    📋 View Plan List
                </button>

                {message && <p className="text-blue-800 text-xl">{message}</p>}
            </div>

            {showPlanModal && (
                <PlanListModal
                    currentLine={currentLine}
                    onClose={() => setShowPlanModal(false)}
                />
            )}
        </div>
    );
}

export default KnifeForm;