// components/LogsTable.js
"use client";
import React from 'react';

function LogsTable({ logs, title }) {
    if (!logs || logs.length === 0) {
        return (
            <div className="flex w-[50%] text-center text-xl px-35 bg-red-100 text-red-700 p-2 my-2 rounded">
                No logs to display {title && `for ${title}`}
            </div>
        );
    }

    return (
        <div className="w-full">
            {title && (
                <div className="flex w-full text-center text-2xl bg-yellow-200 p-2 mb-4 rounded">
                    {title}
                </div>
            )}
            <table className="w-full border-collapse bg-white shadow-md rounded">
                <thead>
                    <tr className="bg-slate-400 text-white">
                        <th className="border p-2 w-[10%]">Knife No.</th>
                        <th className="border p-2 w-[18%]">Changed At</th>
                        <th className="border p-2 w-[15%]">Changed By</th>
                        <th className="border p-2 w-[30%]">Reason</th>
                        <th className="border p-2 w-[12%]">Prev. Mins</th>
                        <th className="border p-2 w-[15%]">Prev. KM</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log._id} className="border-b bg-slate-50 hover:bg-slate-100">
                            <td className="border p-2 text-center font-semibold">{log.knifeNo}</td>
                            <td className="border p-2 text-center text-sm">{new Date(log.changedAt).toLocaleString()}</td>
                            <td className="border p-2 text-center text-sm font-medium text-slate-700">
                                {log.changedByName || <span className="text-slate-400 italic">—</span>}
                            </td>
                            <td className="border p-2 text-sm">{log.reason}</td>
                            <td className="border p-2 text-center">{log.previousRuninmins ?? 'N/A'}</td>
                            <td className="border p-2 text-center">{log.previousRunningkm ?? 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default LogsTable;