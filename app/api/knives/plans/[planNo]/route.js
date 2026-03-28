// app/api/knives/plans/[planNo]/route.js
import dbConnect from '@/lib/mongodb';
import { KnifePlan } from '@/models/Knife';
import { NextResponse } from 'next/server';

// GET /api/knives/plans/[planNo]?currentLine=line2
// Returns ONE document that contains the whole plan (knives as an array)
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { planNo } = await params;
        const { searchParams } = new URL(req.url);
        const currentLine = searchParams.get('currentLine');

        if (!currentLine) {
            return NextResponse.json({ message: 'currentLine is required' }, { status: 400 });
        }

        const planDoc = await KnifePlan.findOne({ currentLine, planNo });
        if (!planDoc) {
            return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
        }

        return NextResponse.json(planDoc);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}