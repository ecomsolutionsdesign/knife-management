// app/api/knives/plans/next-serial/route.js
// GET /api/knives/plans/next-serial?currentLine=line2&date=2026-03-28
// Returns { planNo: "P-260328-3" } — next available serial for that date+line

import dbConnect from '@/lib/mongodb';
import { KnifePlan } from '@/models/Knife';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const currentLine = searchParams.get('currentLine');
        const dateStr = searchParams.get('date'); // e.g. "2026-03-28"

        if (!currentLine || !dateStr) {
            return NextResponse.json({ message: 'currentLine and date are required' }, { status: 400 });
        }

        // Build date prefix:  P-YYMMDD-
        const d = new Date(dateStr);
        const yy = String(d.getFullYear()).slice(-2);       // "26"
        const mm = String(d.getMonth() + 1).padStart(2, '0'); // "03"
        const dd = String(d.getDate()).padStart(2, '0');       // "28"
        const prefix = `P-${yy}${mm}${dd}-`;               // "P-260328-"

        // Find all plans for this line that start with this prefix
        const existing = await KnifePlan.find(
            { currentLine, planNo: { $regex: `^${prefix}` } },
            { planNo: 1 }
        );

        // Extract serial numbers and find max
        let maxSerial = 0;
        for (const doc of existing) {
            const parts = doc.planNo.split('-');
            const serial = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(serial) && serial > maxSerial) maxSerial = serial;
        }

        const nextPlanNo = `${prefix}${maxSerial + 1}`;
        return NextResponse.json({ planNo: nextPlanNo, prefix, nextSerial: maxSerial + 1 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}