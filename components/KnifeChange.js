// // components/KnifeChange.js
// "use client";
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import { useLineStore } from './store';

// const KNIFE_CONFIGS = {
//     line2: { count: 30, prefix: 'TK' },
//     line3: { count: 48, prefix: 'TK-' },
// };

// const generateKnives = (line) => {
//     const config = KNIFE_CONFIGS[line];
//     if (!config) return [];
//     return Array.from({ length: config.count }, (_, i) => `${config.prefix}${i + 1}`);
// };

// function KnifeChange() {
//     const router = useRouter();
//     const { data: session } = useSession();
//     const { currentLine } = useLineStore();

//     const [knifeNo, setKnifeNo] = useState('');
//     const [reason, setReason] = useState('');
//     const [message, setMessage] = useState('');
//     const [messageType, setMessageType] = useState('info'); // 'success' | 'error' | 'warning'
//     const [knives, setKnives] = useState([]);
//     const [knifeInfo, setKnifeInfo] = useState(null); // current knife stats

//     useEffect(() => {
//         const generated = generateKnives(currentLine);
//         setKnives(generated);
//         if (generated.length > 0) setKnifeNo(generated[0]);
//     }, [currentLine]);

//     // Fetch knife stats when selection changes
//     useEffect(() => {
//         if (!knifeNo) return;
//         axios
//             .get(`/api/knives/${knifeNo}`)
//             .then((res) => setKnifeInfo(res.data))
//             .catch(() => setKnifeInfo(null));
//     }, [knifeNo]);

//     const showMessage = (msg, type = 'info', duration = 2500) => {
//         setMessage(msg);
//         setMessageType(type);
//         setTimeout(() => setMessage(''), duration);
//     };

//     const handleChange = async () => {
//         if (!currentLine || !knifeNo || !reason) {
//             alert('Please fill in all fields before saving.');
//             return;
//         }

//         // Client-side guard (mirrors server-side check)
//         if (knifeInfo && knifeInfo.runinmins === 0 && knifeInfo.runningkm === 0) {
//             showMessage(
//                 `⚠️ ${knifeNo} has 0 running mins & 0 km — it was recently changed and not yet used.`,
//                 'warning',
//                 4000
//             );
//             return;
//         }

//         try {
//             await axios.patch(`/api/knives/${knifeNo}`, { currentLine, reason });
//             showMessage('✅ Knife changed successfully!', 'success');
//             setReason('');
//             // Refresh knife info
//             const res = await axios.get(`/api/knives/${knifeNo}`);
//             setKnifeInfo(res.data);
//         } catch (error) {
//             const msg = error.response?.data?.message || 'Failed to change knife. Please try again.';
//             showMessage(`❌ ${msg}`, 'error', 4000);
//         }
//     };

//     const navigateToLogs = (specificKnife = false) => {
//         const params = new URLSearchParams({ currentLine });
//         if (specificKnife) params.append('knifeNo', knifeNo);
//         router.push(`/knives/logs?${params.toString()}`);
//     };

//     const msgColor =
//         messageType === 'success' ? 'text-green-700' :
//         messageType === 'error'   ? 'text-red-700' :
//         'text-amber-700';

//     const isZeroKnife = knifeInfo && knifeInfo.runinmins === 0 && knifeInfo.runningkm === 0;

//     return (
//         <div className="p-4 bg-slate-100">
//             <div className="mb-4 space-x-2 flex items-start flex-wrap gap-y-3">
//                 <div>
//                     <select
//                         value={knifeNo}
//                         onChange={(e) => setKnifeNo(e.target.value)}
//                         className="border rounded p-2"
//                     >
//                         {knives.map((knife) => (
//                             <option key={knife} value={knife}>{knife}</option>
//                         ))}
//                     </select>

//                     {/* Knife stats mini-badge */}
//                     {knifeInfo && (
//                         <div className={`mt-1 text-xs px-2 py-1 rounded inline-block ${isZeroKnife ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
//                             {isZeroKnife
//                                 ? '⚠️ Not yet used since last change'
//                                 : `Run: ${knifeInfo.runinmins} mins / ${knifeInfo.runningkm} km`}
//                         </div>
//                     )}
//                 </div>

//                 <input
//                     type="text"
//                     placeholder="Reason"
//                     value={reason}
//                     onChange={(e) => setReason(e.target.value)}
//                     className="border rounded p-2 flex-1 min-w-45"
//                 />

//                 <button
//                     onClick={handleChange}
//                     disabled={isZeroKnife}
//                     className={`font-bold py-2 px-4 rounded-full transition-colors text-white ${
//                         isZeroKnife
//                             ? 'bg-gray-400 cursor-not-allowed'
//                             : 'bg-blue-500 hover:bg-blue-700 cursor-pointer'
//                     }`}
//                 >
//                     Change Knife
//                 </button>
//             </div>

//             {/* Message */}
//             {message && <p className={`text-base font-semibold mb-3 ${msgColor}`}>{message}</p>}

//             {/* Audit preview */}
//             {session && (
//                 <p className="text-xs text-slate-400 mb-3">
//                     Change will be recorded as <span className="font-semibold text-slate-600">{session.user.name}</span>
//                     {' '}at <span className="font-semibold text-slate-600">{new Date().toLocaleString()}</span>
//                 </p>
//             )}

//             <div className="space-x-2">
//                 <button
//                     onClick={() => navigateToLogs(true)}
//                     className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition-colors"
//                 >
//                     View Knife Log
//                 </button>
//                 <button
//                     onClick={() => navigateToLogs(false)}
//                     className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full transition-colors"
//                 >
//                     View All Logs
//                 </button>
//             </div>
//         </div>
//     );
// }

// export default KnifeChange;

"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLineStore } from './store';

const KNIFE_CONFIGS = {
    line2: { count: 30, prefix: 'TK' },
    line3: { count: 48, prefix: 'TK-' },
};

const generateKnives = (line) => {
    const config = KNIFE_CONFIGS[line];
    if (!config) return [];
    return Array.from({ length: config.count }, (_, i) => `${config.prefix}${i + 1}`);
};

function KnifeChange() {
    const router = useRouter();
    const { data: session } = useSession();
    const { currentLine } = useLineStore();

    const [knifeNo, setKnifeNo] = useState('');
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [knives, setKnives] = useState([]);
    const [knifeInfo, setKnifeInfo] = useState(null);
    
    // NEW: Modal State
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const generated = generateKnives(currentLine);
        setKnives(generated);
        if (generated.length > 0) setKnifeNo(generated[0]);
    }, [currentLine]);

    useEffect(() => {
        if (!knifeNo) return;
        axios
            .get(`/api/knives/${knifeNo}`)
            .then((res) => setKnifeInfo(res.data))
            .catch(() => setKnifeInfo(null));
    }, [knifeNo]);

    const showMessage = (msg, type = 'info', duration = 2500) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), duration);
    };

    // Triggered by the "Change Knife" button
    const handleInitialClick = () => {
        if (!currentLine || !knifeNo || !reason) {
            alert('Please fill in all fields before saving.');
            return;
        }
        setShowConfirm(true); // Open the modal
    };

    // Actual save logic
    const handleConfirmSave = async () => {
        setShowConfirm(false);
        try {
            await axios.patch(`/api/knives/${knifeNo}`, { currentLine, reason });
            showMessage('✅ Knife changed successfully!', 'success');
            setReason('');
            const res = await axios.get(`/api/knives/${knifeNo}`);
            setKnifeInfo(res.data);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to change knife.';
            showMessage(`❌ ${msg}`, 'error', 4000);
        }
    };

    const isZeroKnife = knifeInfo && knifeInfo.runinmins === 0 && knifeInfo.runningkm === 0;

    return (
        <div className="p-4 bg-slate-100 relative">
            
            {/* --- CONFIRMATION MODAL OVERLAY --- */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 border-t-4 border-blue-500">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Knife Change</h3>
                        <p className="text-slate-600 mb-4">
                            You are currently working on <span className="font-black text-blue-600 underline">{currentLine.toUpperCase()}</span>.
                            <br /><br />
                            Changing knife <span className="font-bold">{knifeNo}</span> for reason: <span className="italic">"{reason}"</span>.
                        </p>
                        <div className="flex space-x-3">
                            <button 
                                onClick={handleConfirmSave}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md transition-colors"
                            >
                                Yes, Save it
                            </button>
                            <button 
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-4 space-x-2 flex items-start flex-wrap gap-y-3">
                <div>
                    <select
                        value={knifeNo}
                        onChange={(e) => setKnifeNo(e.target.value)}
                        className="border rounded p-2"
                    >
                        {knives.map((knife) => (
                            <option key={knife} value={knife}>{knife}</option>
                        ))}
                    </select>

                    {knifeInfo && (
                        <div className={`mt-1 text-xs px-2 py-1 rounded inline-block ${isZeroKnife ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                            {isZeroKnife
                                ? '⚠️ Not yet used since last change'
                                : `Run: ${knifeInfo.runinmins} mins / ${knifeInfo.runningkm} km`}
                        </div>
                    )}
                </div>

                <input
                    type="text"
                    placeholder="Reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="border rounded p-2 flex-1 min-w-45"
                />

                <button
                    onClick={handleInitialClick} // Changed from handleChange
                    disabled={isZeroKnife}
                    className={`font-bold py-2 px-4 rounded-full transition-colors text-white ${
                        isZeroKnife
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-700 cursor-pointer'
                    }`}
                >
                    Change Knife
                </button>
            </div>

            {/* ... rest of your UI (Messages, Audit preview, Buttons) */}
            {message && <p className={`text-base font-semibold mb-3 ${messageType === 'success' ? 'text-green-700' : messageType === 'error' ? 'text-red-700' : 'text-amber-700'}`}>{message}</p>}
            
            {session && (
                <p className="text-xs text-slate-400 mb-3">
                    Change will be recorded as <span className="font-semibold text-slate-600">{session.user.name}</span>
                    {' '}at <span className="font-semibold text-slate-600">{new Date().toLocaleString()}</span>
                </p>
            )}

            <div className="space-x-2">
                <button onClick={() => router.push(`/knives/logs?currentLine=${currentLine}&knifeNo=${knifeNo}`)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition-colors">
                    View Knife Log
                </button>
                <button onClick={() => router.push(`/knives/logs?currentLine=${currentLine}`)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full transition-colors">
                    View All Logs
                </button>
            </div>
        </div>
    );
}

export default KnifeChange;