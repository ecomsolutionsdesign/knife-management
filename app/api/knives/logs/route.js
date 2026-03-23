// app/api/knives/logs/route.js
import dbConnect from '@/lib/mongodb';
import { KnifeChangeLog } from '@/models/Knife';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const currentLine = searchParams.get('currentLine');
        const knifeNo = searchParams.get('knifeNo');

        const query = {};
        if (currentLine) query.currentLine = currentLine;
        if (knifeNo) query.knifeNo = knifeNo;

        const changeLogs = await KnifeChangeLog.find(query).sort({ changedAt: -1 });
        return NextResponse.json(changeLogs);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}