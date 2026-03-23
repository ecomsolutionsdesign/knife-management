// app/api/knives/plans/[planNo]/route.js
import dbConnect from '@/lib/mongodb';
import { KnifePlan } from '@/models/Knife';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { planNo } = await params;
        const { searchParams } = new URL(req.url);
        const currentLine = searchParams.get('currentLine');

        if (!currentLine) {
            return NextResponse.json({ message: 'currentLine is required' }, { status: 400 });
        }

        const planData = await KnifePlan.find({ currentLine, planNo });
        return NextResponse.json(planData);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
