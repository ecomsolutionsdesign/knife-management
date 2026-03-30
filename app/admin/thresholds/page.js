// app/admin/thresholds/page.js
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const LINES = ['line1', 'line2', 'line3'];

const LINE_LABELS = {
    line1: 'Line 1',
    line2: 'Line 2',
    line3: 'Line 3',
};

const FIELDS = [
    { key: 'warnMins',  label: 'Warn Mins',  hint: 'Running minutes before "Worn" status' },
    { key: 'critMins',  label: 'Crit Mins',  hint: 'Running minutes before "Critical" status' },
    { key: 'warnKm',    label: 'Warn KM',    hint: 'Running km before "Worn" status' },
    { key: 'critKm',    label: 'Crit KM',    hint: 'Running km before "Critical" status' },
];

const DEFAULT_THRESHOLDS = {
    warnMins: 4500,
    critMins: 5000,
    warnKm:   4500,
    critKm:   5000,
};

function LineCard({ line, values, onChange, error }) {
    return (
        <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
            {/* Card header */}
            <div className="bg-slate-700 px-6 py-4 flex items-center gap-3">
                <span className="bg-green-400 text-slate-900 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {LINE_LABELS[line]}
                </span>
                <span className="text-slate-300 text-sm">Knife health thresholds</span>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
                    {error}
                </div>
            )}

            {/* Fields */}
            <div className="p-6 grid grid-cols-2 gap-5">
                {FIELDS.map(({ key, label, hint }) => (
                    <div key={key}>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            {label}
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={values[key] ?? ''}
                            onChange={e => onChange(line, key, e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-green-400 focus:outline-none transition"
                        />
                        <p className="text-xs text-slate-400 mt-1">{hint}</p>
                    </div>
                ))}
            </div>

            {/* Visual health bar preview */}
            <div className="px-6 pb-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Mins threshold preview
                </p>
                <div className="relative h-4 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                    <div
                        className="absolute left-0 top-0 h-full bg-emerald-400 transition-all duration-300"
                        style={{ width: `${Math.min((values.warnMins / values.critMins) * 100, 100)}%` }}
                    />
                    <div className="absolute left-0 top-0 h-full w-full bg-amber-400 opacity-40"
                        style={{ width: `${Math.min((values.warnMins / values.critMins) * 100, 100)}%`, left: `${Math.min((values.warnMins / values.critMins) * 100, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>0</span>
                    <span className="text-amber-600 font-semibold">⚠ {values.warnMins} mins</span>
                    <span className="text-red-600 font-semibold">🔴 {values.critMins} mins</span>
                </div>
            </div>
        </div>
    );
}

export default function ThresholdsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [thresholds, setThresholds] = useState(
        Object.fromEntries(LINES.map(l => [l, { ...DEFAULT_THRESHOLDS }]))
    );
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [success, setSuccess]   = useState('');
    const [errors, setErrors]     = useState({});  // { line1: 'msg', ... }

    // Auth guard
    useEffect(() => {
        if (status === 'unauthenticated') router.push('/auth/login');
        if (status === 'authenticated' && session.user.role !== 'admin') router.push('/knives');
    }, [status, session]);

    // Load current values
    useEffect(() => {
        if (session?.user?.role !== 'admin') return;
        axios.get('/api/settings/thresholds')
            .then(r => setThresholds(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [session]);

    const handleChange = (line, key, rawValue) => {
        const value = parseInt(rawValue, 10) || 0;
        setThresholds(prev => ({
            ...prev,
            [line]: { ...prev[line], [key]: value },
        }));
        // Clear error for this line on edit
        setErrors(prev => ({ ...prev, [line]: '' }));
        setSuccess('');
    };

    const validate = () => {
        const errs = {};
        LINES.forEach(line => {
            const t = thresholds[line];
            if (t.warnMins >= t.critMins) {
                errs[line] = 'Warn Mins must be less than Crit Mins.';
            } else if (t.warnKm >= t.critKm) {
                errs[line] = 'Warn KM must be less than Crit KM.';
            } else if (Object.values(t).some(v => v <= 0)) {
                errs[line] = 'All values must be greater than 0.';
            }
        });
        return errs;
    };

    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setSaving(true);
        setSuccess('');
        try {
            await axios.patch('/api/settings/thresholds', thresholds);
            setSuccess('✅ Thresholds saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setErrors({ global: err.response?.data?.message || 'Save failed.' });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setThresholds(Object.fromEntries(LINES.map(l => [l, { ...DEFAULT_THRESHOLDS }])));
        setErrors({});
        setSuccess('');
    };

    if (status === 'loading' || loading) {
        return <div className="p-8 text-center text-slate-500">Loading…</div>;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Page header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Knife Health Thresholds</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Set per-line warn and critical limits for running minutes and kilometres.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/admin/users')}
                    className="text-slate-500 hover:text-slate-800 text-sm transition-colors"
                >
                    ← Back to Users
                </button>
            </div>

            {/* Global error */}
            {errors.global && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm">
                    {errors.global}
                </div>
            )}

            {/* Line cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {LINES.map(line => (
                    <LineCard
                        key={line}
                        line={line}
                        values={thresholds[line]}
                        onChange={handleChange}
                        error={errors[line]}
                    />
                ))}
            </div>

            {/* Action row */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-slate-800 hover:bg-slate-600 text-white font-bold py-2.5 px-8 rounded-full transition-colors disabled:opacity-60 shadow"
                >
                    {saving ? 'Saving…' : 'Save Thresholds'}
                </button>
                <button
                    onClick={handleReset}
                    className="border border-slate-300 hover:bg-slate-100 text-slate-600 font-semibold py-2.5 px-6 rounded-full transition-colors"
                >
                    Reset to Defaults
                </button>
                {success && (
                    <span className="text-green-700 font-semibold text-sm">{success}</span>
                )}
            </div>

            {/* Info note */}
            <p className="text-xs text-slate-400 mt-6">
                Changes take effect immediately — the Knife Status dashboard fetches thresholds on every open.
            </p>
        </div>
    );
}