// app/api/settings/thresholds/route.js
import dbConnect from '@/lib/mongodb';
import { LineThreshold } from '@/models/Settings';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const LINES = ['line1', 'line2', 'line3'];

export const DEFAULT_THRESHOLDS = {
    warnMins: 4500,
    critMins: 5000,
    warnKm:   4500,
    critKm:   5000,
};

// GET /api/settings/thresholds
// Returns { line1: {...}, line2: {...}, line3: {...} }
// Authenticated users can read — no admin restriction on GET so KnifeStatus can fetch it.
export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const docs = await LineThreshold.find({});

    // Seed defaults for any line not yet in DB
    const map = Object.fromEntries(
        LINES.map(l => [l, { ...DEFAULT_THRESHOLDS }])
    );
    docs.forEach(d => {
        map[d.line] = {
            warnMins: d.warnMins,
            critMins: d.critMins,
            warnKm:   d.warnKm,
            critKm:   d.critKm,
        };
    });

    return NextResponse.json(map);
}

// PATCH /api/settings/thresholds
// Body: { line1: { warnMins, critMins, warnKm, critKm }, line2: {...}, ... }
// Admin only.
export async function PATCH(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const updates = await req.json();

        for (const [line, values] of Object.entries(updates)) {
            if (!LINES.includes(line)) continue;

            const { warnMins, critMins, warnKm, critKm } = values;

            // Basic validation: warn must be less than crit
            if (warnMins >= critMins || warnKm >= critKm) {
                return NextResponse.json(
                    { message: `${line}: Warning threshold must be less than Critical threshold.` },
                    { status: 400 }
                );
            }

            await LineThreshold.findOneAndUpdate(
                { line },
                { warnMins, critMins, warnKm, critKm },
                { upsert: true, new: true }
            );
        }

        return NextResponse.json({ message: 'Thresholds saved successfully.' });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}