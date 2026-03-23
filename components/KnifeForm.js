// components/KnifeForm.js

"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
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

function KnifeForm() {
    const router = useRouter();
    const { currentLine, setCurrentLine } = useLineStore();

    const [formData, setFormData] = useState({
        planNo: '',
        doffLength: '',
        noOfDoff: '',
        mcSpeed: ''
    });
    const [selectedKnives, setSelectedKnives] = useState([]);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [existingPlans, setExistingPlans] = useState([]);
    const [lastSavedPlan, setLastSavedPlan] = useState(null);   // ✅ NEW
    const [showPlanModal, setShowPlanModal] = useState(false);   // ✅ NEW

    // Fetch existing plan numbers when line changes
    useEffect(() => {
        const fetchExistingPlans = async () => {
            if (!currentLine) return;
            try {
                const response = await axios.get('/api/knives/plans', {
                    params: { currentLine }
                });
                const plans = response.data; // array of planNo strings
                setExistingPlans(plans);

                // ✅ Determine the last saved plan (numeric sort to find max)
                if (plans.length > 0) {
                    const sorted = [...plans].sort((a, b) =>
                        b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' })
                    );
                    setLastSavedPlan(sorted[0]);
                } else {
                    setLastSavedPlan(null);
                }
            } catch (error) {
                console.error('Error fetching existing plans:', error);
            }
        };
        fetchExistingPlans();
    }, [currentLine]);

    const handleInputChange = (field, value) => {
        if (['doffLength', 'noOfDoff', 'mcSpeed'].includes(field)) {
            const numValue = value.replace(/\D/g, '');
            if (value !== numValue) alert("Only whole numbers are allowed!");
            setFormData(prev => ({ ...prev, [field]: numValue }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
        setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleKnifeToggle = (knifeNo) => {
        setSelectedKnives(prev =>
            prev.includes(knifeNo)
                ? prev.filter(k => k !== knifeNo)
                : [...prev, knifeNo]
        );
        setErrors(prev => ({ ...prev, knives: null }));
    };

    const showMessage = (msg, duration = 1500) => {
        setMessage(msg);
        setTimeout(() => setMessage(""), duration);
    };

    const handleSave = async () => {
        if (existingPlans.includes(formData.planNo)) {
            alert(`❌ Plan No. "${formData.planNo}" already exists for ${currentLine}!\n\nPlease use a different plan number.`);
            setErrors(prev => ({ ...prev, planNo: `Plan No. "${formData.planNo}" already exists!` }));
            return;
        }

        const validationErrors = validateInputs(
            formData.planNo, formData.doffLength,
            formData.noOfDoff, formData.mcSpeed, selectedKnives
        );

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            alert(Object.values(validationErrors).join('\n'));
            return;
        }

        try {
            await axios.post('/api/knives', { ...formData, selectedKnives, currentLine });
            showMessage("✅ Data saved successfully!");
            setErrors({});

            // ✅ Update last saved plan immediately after successful save
            setLastSavedPlan(formData.planNo);
            setExistingPlans(prev => [...prev, formData.planNo]);

            setFormData({ planNo: '', doffLength: '', noOfDoff: '', mcSpeed: '' });
            setSelectedKnives([]);
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to save data.";
            showMessage(`❌ ${msg}`);
        }
    };

    const handlePlanView = () => {
        if (!formData.planNo) {
            alert('Please enter a Plan No to view');
            return;
        }
        router.push(`/knives/plans/${formData.planNo}?currentLine=${currentLine}`);
    };

    return (
        <div className="bg-slate-100">
            <LineSelector currentLine={currentLine} onLineChange={setCurrentLine} />

            {/* ✅ Last Saved Plan Banner */}
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

            <div className="mb-4 space-x-2">
                <div className="inline-block">
                    <input
                        type="text"
                        placeholder="Plan No"
                        value={formData.planNo}
                        onChange={(e) => handleInputChange('planNo', e.target.value)}
                        className={`border rounded p-2 ${errors.planNo ? 'border-red-500' : ''}`}
                    />
                    {errors.planNo && <p className="text-red-500 text-sm mt-1">{errors.planNo}</p>}
                </div>
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

            <div className="mb-4">
                <KnifeSelector
                    currentLine={currentLine}
                    selectedKnives={selectedKnives}
                    onToggle={handleKnifeToggle}
                />
                {errors.knives && <p className="text-red-500 mt-2">{errors.knives}</p>}
            </div>

            <div className="space-x-2 flex items-center flex-wrap gap-y-2">
                <button
                    onClick={handleSave}
                    disabled={!!errors.planNo}
                    className={`font-bold py-2 px-4 rounded-full transition-colors text-slate-100 ${
                        errors.planNo
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-700 cursor-pointer'
                    }`}
                >
                    Save Data
                </button>

                {/* View specific plan by typed plan no */}
                <button
                    onClick={handlePlanView}
                    className="bg-green-500 hover:bg-green-700 cursor-pointer text-slate-100 font-bold py-2 px-4 rounded-full transition-colors"
                >
                    View Plan
                </button>

                {/* ✅ NEW: Open plan list modal */}
                <button
                    onClick={() => setShowPlanModal(true)}
                    className="bg-purple-500 hover:bg-purple-700 cursor-pointer text-slate-100 font-bold py-2 px-4 rounded-full transition-colors"
                >
                    📋 View Plan List
                </button>

                {message && <p className="text-blue-800 text-xl">{message}</p>}
            </div>

            {/* ✅ Plan List Modal */}
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