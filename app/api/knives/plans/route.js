// app/api/knives/plans/route.js (NEW)
import dbConnect from '@/lib/mongodb';
import { KnifePlan } from '@/models/Knife';
import { NextResponse } from 'next/server';

// GET /api/knives/plans?currentLine=line2
// Returns list of unique plan numbers for a given line
export async function GET(req) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const currentLine = searchParams.get('currentLine');

        if (!currentLine) {
            return NextResponse.json({ message: 'currentLine is required' }, { status: 400 });
        }

        // ✅ Bug 2 fix: return actual unique planNo values, not knifeNo
        const planNos = await KnifePlan.distinct('planNo', { currentLine });
        return NextResponse.json(planNos);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}