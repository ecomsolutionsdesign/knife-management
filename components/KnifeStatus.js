// components/KnifeStatus.js
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const KNIFE_CONFIGS = {
    line2: { count: 30, prefix: 'TK' },
    line3: { count: 48, prefix: 'TK-' },
};

const generateKnifeNos = (line) => {
    const config = KNIFE_CONFIGS[line];
    if (!config) return [];
    return Array.from({ length: config.count }, (_, i) => `${config.prefix}${i + 1}`);
};

// ── Health thresholds (tweak to match your operational limits) ────────────────
const WARN_MINS  = 4500; // 75 h
const CRIT_MINS  = 5000; // 83 h
const WARN_KM    = 4500;
const CRIT_KM    = 5000;

function statusTier(runinmins, runningkm) {
    if (runinmins >= CRIT_MINS || runningkm >= CRIT_KM) return 'critical';
    if (runinmins >= WARN_MINS || runningkm >= WARN_KM) return 'warning';
    if (runinmins === 0 && runningkm === 0) return 'fresh';
    return 'ok';
}

const TIER_STYLES = {
    fresh:    { bar: 'bg-slate-300',  badge: 'bg-slate-100 text-slate-500',  dot: 'bg-slate-400',  label: 'Fresh'    },
    ok:       { bar: 'bg-emerald-400',badge: 'bg-emerald-50 text-emerald-700',dot: 'bg-emerald-400',label: 'Good'     },
    warning:  { bar: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700',   dot: 'bg-amber-400',  label: 'Worn'     },
    critical: { bar: 'bg-red-500',    badge: 'bg-red-50 text-red-700',       dot: 'bg-red-500',    label: 'Critical' },
};

function MiniBar({ value, max, tier }) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-500 ${TIER_STYLES[tier].bar}`}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

function KnifeCard({ knifeNo, data, loading }) {
    const mins = data?.cumulativeRuninmins ?? data?.runinmins ?? 0;
    const km   = data?.cumulativeRunningkm ?? data?.runningkm ?? 0;
    const tier = statusTier(mins, km);
    const styles = TIER_STYLES[tier];
    const hrs  = (mins / 60).toFixed(1);

    return (
        <div
            className={`
                relative rounded-xl border bg-white p-3 flex flex-col gap-2 shadow-sm
                transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                ${tier === 'critical' ? 'border-red-200 ring-1 ring-red-200' :
                  tier === 'warning'  ? 'border-amber-200' :
                  'border-slate-200'}
            `}
        >
            {/* Header row */}
            <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-800 text-sm tracking-tight">{knifeNo}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles.badge} flex items-center gap-1`}>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                    {styles.label}
                </span>
            </div>

            {loading ? (
                <div className="h-8 animate-pulse bg-slate-100 rounded" />
            ) : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-1 text-xs text-slate-500">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Cum. Mins</p>
                            <p className="font-bold text-slate-800 text-sm">{mins.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400">{hrs} hrs</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Cum. KM</p>
                            <p className="font-bold text-slate-800 text-sm">{km.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Progress bars */}
                    <div className="space-y-1">
                        <MiniBar value={mins} max={CRIT_MINS} tier={tier} />
                        <MiniBar value={km}   max={CRIT_KM}   tier={tier} />
                    </div>
                </>
            )}
        </div>
    );
}

function SummaryPill({ label, count, colorClass }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${colorClass}`}>
            <span className="text-lg font-black">{count}</span>
            <span>{label}</span>
        </div>
    );
}

export default function KnifeStatus({ currentLine, onClose }) {
    const [knifeData, setKnifeData] = useState({});
    const [loading, setLoading]     = useState(true);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [filter, setFilter]       = useState('all'); // all | fresh | ok | warning | critical
    const [search, setSearch]       = useState('');

    const knifeNos = generateKnifeNos(currentLine);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch all knife details in parallel
            const results = await Promise.allSettled(
                knifeNos.map(no => axios.get(`/api/knives/${no}`))
            );
            const map = {};
            results.forEach((res, i) => {
                if (res.status === 'fulfilled') map[knifeNos[i]] = res.value.data;
                else map[knifeNos[i]] = null;
            });
            setKnifeData(map);
            setLastRefresh(new Date());
        } catch (err) {
            console.error('Failed to fetch knife statuses', err);
        } finally {
            setLoading(false);
        }
    }, [currentLine]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── Derived summary counts ────────────────────────────────────────────────
    const counts = { fresh: 0, ok: 0, warning: 0, critical: 0 };
    knifeNos.forEach(no => {
        const d = knifeData[no];
        const tier = d ? statusTier(
            d.cumulativeRuninmins ?? d.runinmins ?? 0,
            d.cumulativeRunningkm ?? d.runningkm ?? 0
        ) : 'fresh';
        counts[tier]++;
    });

    // ── Filter + search ───────────────────────────────────────────────────────
    const visible = knifeNos.filter(no => {
        const d = knifeData[no];
        const tier = d ? statusTier(
            d.cumulativeRuninmins ?? d.runinmins ?? 0,
            d.cumulativeRunningkm ?? d.runningkm ?? 0
        ) : 'fresh';
        const matchFilter = filter === 'all' || tier === filter;
        const matchSearch = no.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const gridCols = currentLine === 'line2' ? 'sm:grid-cols-5 lg:grid-cols-6' : 'sm:grid-cols-6 lg:grid-cols-8';

    return (
        // Backdrop
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3"
            onClick={onClose}
        >
            {/* Panel */}
            <div
                className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden"
                style={{ maxHeight: '92vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ──────────────────────────────────────────────────── */}
                <div className="bg-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-white font-black text-lg tracking-tight flex items-center gap-2">
                            🔪 Knife Status Dashboard
                            <span className="text-green-400 font-mono text-base">— {currentLine.toUpperCase()}</span>
                        </h2>
                        <p className="text-slate-400 text-xs mt-0.5">
                            Cumulative runtime for all {knifeNos.length} knives
                            {lastRefresh && (
                                <> · Last updated {lastRefresh.toLocaleTimeString()}</>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchAll}
                            className="text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                        >
                            ↻ Refresh
                        </button>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white text-2xl leading-none ml-1 transition-colors"
                        >
                            &times;
                        </button>
                    </div>
                </div>

                {/* ── Summary pills ────────────────────────────────────────────── */}
                <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-wrap gap-2 items-center shrink-0">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        <span className="text-base font-black">{knifeNos.length}</span> All
                    </button>
                    {[
                        { key: 'fresh',    label: 'Fresh',    cls: 'bg-slate-100 text-slate-600',     active: 'bg-slate-500 text-white' },
                        { key: 'ok',       label: 'Good',     cls: 'bg-emerald-50 text-emerald-700',  active: 'bg-emerald-500 text-white' },
                        { key: 'warning',  label: 'Worn',     cls: 'bg-amber-50 text-amber-700',      active: 'bg-amber-500 text-white' },
                        { key: 'critical', label: 'Critical', cls: 'bg-red-50 text-red-700',          active: 'bg-red-500 text-white' },
                    ].map(({ key, label, cls, active }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(filter === key ? 'all' : key)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === key ? active : cls} hover:opacity-80`}
                        >
                            <span className="text-base font-black">{counts[key]}</span> {label}
                        </button>
                    ))}

                    {/* Search */}
                    <div className="ml-auto relative">
                        <span className="absolute left-2.5 top-1.5 text-slate-400 text-sm">🔍</span>
                        <input
                            type="text"
                            placeholder="Search knife…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-green-400 focus:outline-none bg-white"
                        />
                    </div>
                </div>

                {/* ── Grid ─────────────────────────────────────────────────────── */}
                <div className="overflow-y-auto flex-1 p-4">
                    {visible.length === 0 ? (
                        <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                            No knives match the current filter.
                        </div>
                    ) : (
                        <div className={`grid grid-cols-3 ${gridCols} gap-2`}>
                            {visible.map(no => (
                                <KnifeCard
                                    key={no}
                                    knifeNo={no}
                                    data={knifeData[no]}
                                    loading={loading}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Legend footer ─────────────────────────────────────────────── */}
                <div className="px-6 py-2.5 border-t border-slate-200 bg-white flex flex-wrap gap-4 text-[11px] text-slate-500 shrink-0">
                    <span className="font-semibold text-slate-600">Thresholds:</span>
                    <span><span className="font-semibold text-amber-600">Worn</span> ≥ {WARN_MINS} mins or {WARN_KM} km</span>
                    <span><span className="font-semibold text-red-600">Critical</span> ≥ {CRIT_MINS} mins or {CRIT_KM} km</span>
                    <span className="ml-auto">Bars show progress toward Critical limit</span>
                </div>
            </div>
        </div>
    );
}