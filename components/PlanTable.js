// // components/PlanTable.js (NEW - Reusable)
// // ============================================
// "use client";
// import React from 'react';

// function PlanTable({ knivesData, planNo, currentLine }) {
//     if (!knivesData || knivesData.length === 0) {
//         return (
//             <div className='flex w-[50%] text-center text-xl px-35 bg-red-100 text-red-700 p-2 my-2 rounded'>
//                 No data to display for Plan No. {planNo} & {currentLine}
//             </div>
//         );
//     }

//     return (
//         <div className='w-full'>
//             <div className='flex w-full text-center text-2xl bg-yellow-200 p-2 mb-4 rounded'>
//                 Displaying Plan No. {planNo} Data for {currentLine}
//             </div>
//             <table className="w-full border-collapse bg-white shadow-md rounded">
//                 <thead>
//                     <tr className="bg-gray-300">
//                         <th className="border p-2 w-[20%]">Knife No.</th>
//                         <th className="border p-2 w-[20%]">Plan Running Mins</th>
//                         <th className="border p-2 w-[20%]">Plan Running KM</th>
//                         <th className="border p-2 w-[20%]">Total Running Mins</th>
//                         <th className="border p-2 w-[20%]">Total Running KM</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {knivesData.map((knife) => (
//                         <tr key={knife.knifeNo} className="border-b hover:bg-gray-50">
//                             <td className="border p-2 text-center font-semibold">{knife.knifeNo}</td>
//                             <td className="border p-2 text-center">{knife.runinmins}</td>
//                             <td className="border p-2 text-center">{knife.runningkm}</td>
//                             <td className="border p-2 text-center">{knife.cumulativeRuninmins}</td>
//                             <td className="border p-2 text-center">{knife.cumulativeRunningkm}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }

// export default PlanTable;

"use client";
import React from 'react';

function PlanTable({ knivesData, planNo, currentLine }) {
    if (!knivesData || knivesData.length === 0) {
        return (
            <div className='flex w-[50%] text-center text-xl px-35 bg-red-100 text-red-700 p-2 my-2 rounded'>
                No data to display for Plan No. {planNo} & {currentLine}
            </div>
        );
    }

    return (
        <div className='w-full'>
            <div className='flex w-full text-center text-2xl bg-yellow-200 p-2 mb-4 rounded'>
                Displaying Plan No. {planNo} Data for {currentLine}
            </div>
            <table className="w-full border-collapse bg-white shadow-md rounded">
                <thead>
                    <tr className="bg-gray-300">
                        <th className="border p-2 w-[20%]">Knife No.</th>
                        <th className="border p-2 w-[20%]">Plan Running Mins</th>
                        <th className="border p-2 w-[20%]">Plan Running KM</th>
                        <th className="border p-2 w-[20%]">Total Running Mins</th>
                        <th className="border p-2 w-[20%]">Total Running KM</th>
                    </tr>
                </thead>
                <tbody>
                    {knivesData.map((knife, index) => (
                        // ✅ Bug 1 fix: use _id as key (guaranteed unique from MongoDB)
                        // Falls back to index only as last resort for old duplicate data
                        <tr key={knife._id || `${knife.knifeNo}-${index}`} className="border-b hover:bg-gray-50">
                            <td className="border p-2 text-center font-semibold">{knife.knifeNo}</td>
                            <td className="border p-2 text-center">{knife.runinmins}</td>
                            <td className="border p-2 text-center">{knife.runningkm}</td>
                            <td className="border p-2 text-center">{knife.cumulativeRuninmins}</td>
                            <td className="border p-2 text-center">{knife.cumulativeRunningkm}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default PlanTable;