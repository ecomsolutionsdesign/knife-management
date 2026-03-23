// app/knives/logs/page.js
"use client";
import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import LogsTable from '@/components/LogsTable';
import { useLineStore } from '@/components/store';

function LogsContent() {
    const [changeLogs, setChangeLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const { currentLine } = useLineStore();
    
    const knifeNo = searchParams.get('knifeNo');
    const lineParam = searchParams.get('currentLine');
    const activeLine = lineParam || currentLine;

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const params = {};
                if (activeLine) params.currentLine = activeLine;
                if (knifeNo) params.knifeNo = knifeNo;

                const response = await axios.get('/api/knives/logs', { params });
                setChangeLogs(response.data);
            } catch (error) {
                console.error('Error fetching logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [activeLine, knifeNo]);

    const title = knifeNo 
        ? `Logs for Knife ${knifeNo} - ${activeLine}`
        : `All Knife Logs - ${activeLine}`;

    return (
        <div className='p-8 max-w-7xl mx-auto'>
            <h1 className='text-3xl font-bold mb-6 text-slate-800'>{title}</h1>
            {loading ? (
                <div className='text-center text-slate-600'>Loading...</div>
            ) : (
                <LogsTable logs={changeLogs} />
            )}
        </div>
    );
}

// 2. The main page component wraps the content in Suspense
export default function LogsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading Page...</div>}>
            <LogsContent />
        </Suspense>
    );
}