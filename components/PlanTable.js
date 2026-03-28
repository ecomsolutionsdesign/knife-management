// components/PlanTable.js
"use client";
import React from 'react';

function PlanTable({ planDoc, planNo, currentLine }) {
    // planDoc is now a single object with a `knives` array
    if (!planDoc || !planDoc.knives || planDoc.knives.length === 0) {
        return (
            <div className="flex w-[50%] text-center text-xl px-35 bg-red-100 text-red-700 p-2 my-2 rounded">
                No data to display for Plan No. {planNo} &amp; {currentLine}
            </div>
        );
    }

    const { knives, createdByName, createdAt, doffLength, noOfDoff, mcSpeed } = planDoc;

    return (
        <div className="w-full">
            {/* ── Plan header ──────────────────────────────────────────────── */}
            <div className="flex w-full text-center text-2xl bg-yellow-200 p-2 mb-2 rounded">
                Plan No. {planNo} — {currentLine}
            </div>

            {/* ── Audit info ───────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4 px-1">
                {createdByName && (
                    <span>
                        Created by: <span className="font-semibold text-slate-700">{createdByName}</span>
                    </span>
                )}
                {createdAt && (
                    <span>
                        on <span className="font-semibold text-slate-700">{new Date(createdAt).toLocaleString()}</span>
                    </span>
                )}
                {doffLength && (
                    <span>Doff Length: <span className="font-semibold text-slate-700">{doffLength}</span></span>
                )}
                {noOfDoff && (
                    <span>No of Doff: <span className="font-semibold text-slate-700">{noOfDoff}</span></span>
                )}
                {mcSpeed && (
                    <span>MC Speed: <span className="font-semibold text-slate-700">{mcSpeed}</span></span>
                )}
            </div>

            {/* ── Knives table ─────────────────────────────────────────────── */}
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
                    {knives.map((knife) => (
                        <tr key={knife.knifeNo} className="border-b hover:bg-gray-50">
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