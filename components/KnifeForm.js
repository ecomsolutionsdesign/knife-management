// // ============================================
// // components/KnifeForm.js (Updated - Using reusable components)
// // ============================================
// "use client";
// import React, { useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useLineStore } from './store';
// import LineSelector from './LineSelector';
// import KnifeSelector from './KnifeSelector';

// const validateInputs = (planNo, doffLength, noOfDoff, mcSpeed, selectedKnives) => {
//     const errors = {};
//     if (!planNo) errors.planNo = 'Plan No is required';
//     if (!doffLength) errors.doffLength = 'Doff Length is required';
//     if (!noOfDoff) errors.noOfDoff = 'No of Doff is required';
//     if (!mcSpeed) errors.mcSpeed = 'MC Speed is required';
//     if (selectedKnives.length === 0) errors.knives = 'Select at least one knife';
//     return errors;
// };

// function KnifeForm() {
//     const router = useRouter();
//     const { currentLine, setCurrentLine } = useLineStore();

//     const [formData, setFormData] = useState({
//         planNo: '',
//         doffLength: '',
//         noOfDoff: '',
//         mcSpeed: ''
//     });
//     const [selectedKnives, setSelectedKnives] = useState([]);
//     const [message, setMessage] = useState("");
//     const [errors, setErrors] = useState({});

//     const handleInputChange = (field, value) => {
//         // Only allow whole numbers for numeric fields
//         if (['doffLength', 'noOfDoff', 'mcSpeed'].includes(field)) {
//             const numValue = value.replace(/\D/g, '');
//             if (value !== numValue) {
//                 alert("Only whole numbers are allowed!");
//             }
//             setFormData(prev => ({ ...prev, [field]: numValue }));
//         } else {
//             setFormData(prev => ({ ...prev, [field]: value }));
//         }
//         // Clear error for this field
//         setErrors(prev => ({ ...prev, [field]: null }));
//     };

//     const handleKnifeToggle = (knifeNo) => {
//         setSelectedKnives(prev =>
//             prev.includes(knifeNo)
//                 ? prev.filter(k => k !== knifeNo)
//                 : [...prev, knifeNo]
//         );
//         setErrors(prev => ({ ...prev, knives: null }));
//     };

//     const showMessage = (msg, duration = 1500) => {
//         setMessage(msg);
//         setTimeout(() => setMessage(""), duration);
//     };

//     const handleSave = async () => {
//         const validationErrors = validateInputs(
//             formData.planNo,
//             formData.doffLength,
//             formData.noOfDoff,
//             formData.mcSpeed,
//             selectedKnives
//         );

//         if (Object.keys(validationErrors).length > 0) {
//             setErrors(validationErrors);
//             alert(Object.values(validationErrors).join('\n'));
//             return;
//         }

//         try {
//             await axios.post('/api/knives', {
//                 ...formData,
//                 selectedKnives,
//                 currentLine
//             });

//             showMessage("✅ Data saved successfully!");
//             setErrors({});
//             setFormData({ planNo: '', doffLength: '', noOfDoff: '', mcSpeed: '' });
//             setSelectedKnives([]);
//         } catch (error) {
//             console.error('Error saving knives:', error);
//             showMessage("❌ Failed to save data. Please try again.");
//         }
//     };

//     const handlePlanView = () => {
//         if (!formData.planNo) {
//             alert('Please enter a Plan No to view');
//             return;
//         }
//         router.push(`/knives/plans/${formData.planNo}?currentLine=${currentLine}`);
//     };

//     return (
//         <div className="bg-slate-100">
//             <LineSelector currentLine={currentLine} onLineChange={setCurrentLine} />

//             <div className="mb-4 space-x-2">
//                 <input
//                     type="text"
//                     placeholder="Plan No"
//                     value={formData.planNo}
//                     onChange={(e) => handleInputChange('planNo', e.target.value)}
//                     className={`border rounded p-2 ${errors.planNo ? 'border-red-500' : ''}`}
//                 />
//                 <input
//                     type="number"
//                     placeholder="Doff Length"
//                     value={formData.doffLength}
//                     onChange={(e) => handleInputChange('doffLength', e.target.value)}
//                     className={`border rounded p-2 ${errors.doffLength ? 'border-red-500' : ''}`}
//                 />
//                 <input
//                     type="number"
//                     placeholder="No of Doff"
//                     value={formData.noOfDoff}
//                     onChange={(e) => handleInputChange('noOfDoff', e.target.value)}
//                     className={`border rounded p-2 ${errors.noOfDoff ? 'border-red-500' : ''}`}
//                 />
//                 <input
//                     type="number"
//                     placeholder="MC Speed"
//                     value={formData.mcSpeed}
//                     onChange={(e) => handleInputChange('mcSpeed', e.target.value)}
//                     className={`border rounded p-2 ${errors.mcSpeed ? 'border-red-500' : ''}`}
//                 />
//             </div>

//             <div className="mb-4">
//                 <KnifeSelector
//                     currentLine={currentLine}
//                     selectedKnives={selectedKnives}
//                     onToggle={handleKnifeToggle}
//                 />
//                 {errors.knives && <p className="text-red-500 mt-2">{errors.knives}</p>}
//             </div>

//             <div className="space-x-2 flex items-center">
//                 <button
//                     onClick={handleSave}
//                     className="bg-blue-500 hover:bg-blue-700 cursor-pointer text-slate-100 font-bold py-2 px-4 rounded-full transition-colors"
//                 >
//                     Save Data
//                 </button>
//                 <button
//                     onClick={handlePlanView}
//                     className="bg-green-500 hover:bg-green-700 cursor-pointer text-slate-100 font-bold py-2 px-4 rounded-full transition-colors"
//                 >
//                     View Plan
//                 </button>
//                 {message && <p className="text-blue-800 text-xl">{message}</p>}
//             </div>
//         </div>
//     );
// }

// export default KnifeForm;

// ============================================
// components/KnifeForm.js (Updated - With duplicate validation)
// ============================================
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useLineStore } from './store';
import LineSelector from './LineSelector';
import KnifeSelector from './KnifeSelector';

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
    const [existingPlans, setExistingPlans] = useState([]); // Store existing plan numbers

    // Fetch existing plans when component mounts or line changes
    useEffect(() => {
        const fetchExistingPlans = async () => {
            try {
                const response = await axios.get(`/api/knives?currentLine=${currentLine}`);
                // Extract unique plan numbers from the response
                const planNumbers = [...new Set(response.data.map(item => item.knifeNo))];
                setExistingPlans(planNumbers);
            } catch (error) {
                console.error('Error fetching existing plans:', error);
            }
        };

        if (currentLine) {
            fetchExistingPlans();
        }
    }, [currentLine]);

    const handleInputChange = (field, value) => {
        // Only allow whole numbers for numeric fields
        if (['doffLength', 'noOfDoff', 'mcSpeed'].includes(field)) {
            const numValue = value.replace(/\D/g, '');
            if (value !== numValue) {
                alert("Only whole numbers are allowed!");
            }
            setFormData(prev => ({ ...prev, [field]: numValue }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
        // Clear error for this field
        setErrors(prev => ({ ...prev, [field]: null }));
    };

    // Validate plan number on blur (when user leaves the input field)
    const handlePlanNoBlur = () => {
        if (formData.planNo && existingPlans.includes(formData.planNo)) {
            setErrors(prev => ({ 
                ...prev, 
                planNo: `Plan number ${formData.planNo} already exists for this line!` 
            }));
        }
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
        // Check for duplicate plan number first
        if (existingPlans.includes(formData.planNo)) {
            alert(`❌ Plan number ${formData.planNo} already exists for this line!\n\nPlease use a different plan number.`);
            setErrors(prev => ({ 
                ...prev, 
                planNo: `Plan number ${formData.planNo} already exists!` 
            }));
            return;
        }

        const validationErrors = validateInputs(
            formData.planNo,
            formData.doffLength,
            formData.noOfDoff,
            formData.mcSpeed,
            selectedKnives
        );

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            alert(Object.values(validationErrors).join('\n'));
            return;
        }

        try {
            await axios.post('/api/knives', {
                ...formData,
                selectedKnives,
                currentLine
            });

            showMessage("✅ Data saved successfully!");
            setErrors({});
            
            // Add the new plan to existing plans list
            setExistingPlans(prev => [...prev, formData.planNo]);
            
            // Reset form
            setFormData({ planNo: '', doffLength: '', noOfDoff: '', mcSpeed: '' });
            setSelectedKnives([]);
        } catch (error) {
            console.error('Error saving knives:', error);
            showMessage("❌ Failed to save data. Please try again.");
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

            <div className="mb-4 space-x-2">
                <div className="inline-block">
                    <input
                        type="text"
                        placeholder="Plan No"
                        value={formData.planNo}
                        onChange={(e) => handleInputChange('planNo', e.target.value)}
                        onBlur={handlePlanNoBlur}
                        className={`border rounded p-2 ${errors.planNo ? 'border-red-500' : ''}`}
                    />
                    {errors.planNo && (
                        <p className="text-red-500 text-sm mt-1">{errors.planNo}</p>
                    )}
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

            <div className="space-x-2 flex items-center">
                <button
                    onClick={handleSave}
                    disabled={errors.planNo}
                    className={`font-bold py-2 px-4 rounded-full transition-colors ${
                        errors.planNo 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-700 cursor-pointer'
                    } text-slate-100`}
                >
                    Save Data
                </button>
                <button
                    onClick={handlePlanView}
                    className="bg-green-500 hover:bg-green-700 cursor-pointer text-slate-100 font-bold py-2 px-4 rounded-full transition-colors"
                >
                    View Plan
                </button>
                {message && <p className="text-blue-800 text-xl">{message}</p>}
            </div>
        </div>
    );
}

export default KnifeForm;