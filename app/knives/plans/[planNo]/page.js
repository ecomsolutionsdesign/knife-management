// app/knives/plans/[planNo]/page.js
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useSearchParams } from 'next/navigation';
import PlanTable from '@/components/PlanTable';
import { useLineStore } from '@/components/store';

const KnifePlanPage = () => {
    const [planDoc, setPlanDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const searchParams = useSearchParams();
    const { currentLine } = useLineStore();

    const planNo = params.planNo;
    const lineParam = searchParams.get('currentLine');
    const activeLine = lineParam || currentLine;

    useEffect(() => {
        const fetchPlanData = async () => {
            if (!planNo || !activeLine) return;
            try {
                setLoading(true);
                // API now returns a single plan document (not an array)
                const response = await axios.get(`/api/knives/plans/${planNo}`, {
                    params: { currentLine: activeLine },
                });
                setPlanDoc(response.data);
            } catch (error) {
                console.error('Error fetching plan data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlanData();
    }, [planNo, activeLine]);

    return (
        <div className="container max-w-5xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">Plan Details</h1>
            {loading ? (
                <div className="text-center text-slate-600">Loading...</div>
            ) : (
                <PlanTable planDoc={planDoc} planNo={planNo} currentLine={activeLine} />
            )}
        </div>
    );
};

export default KnifePlanPage;