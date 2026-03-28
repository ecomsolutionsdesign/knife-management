// app/api/knives/[knifeNo]/route.js
import dbConnect from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { Knife, KnifeChangeLog } from '@/models/Knife';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { knifeNo } = await params;
        const knife = await Knife.findOne({ knifeNo });

        if (!knife) {
            return NextResponse.json({ message: 'Knife not found' }, { status: 404 });
        }

        return NextResponse.json(knife);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();
        const { knifeNo } = await params;
        const { currentLine, reason } = await req.json();

        const knife = await Knife.findOne({ knifeNo });
        if (!knife) {
            return NextResponse.json({ message: 'Knife not found' }, { status: 404 });
        }

        // ── Bug fix: block change if knife has never run since last change ──────
        if (knife.runinmins === 0 && knife.runningkm === 0) {
            return NextResponse.json(
                {
                    message: `Knife ${knifeNo} has 0 running mins and 0 km — it was recently changed and has not been used yet. Cannot change again.`,
                },
                { status: 409 }
            );
        }

        // ── Create change log with audit info ────────────────────────────────────
        await KnifeChangeLog.create({
            currentLine,
            knifeNo,
            reason,
            previousRuninmins: knife.runinmins,
            previousRunningkm: knife.runningkm,
            changedAt: new Date(),
            changedBy: session.user.id,
            changedByName: session.user.name,
        });

        // ── Reset knife with audit fields ────────────────────────────────────────
        Object.assign(knife, {
            currentLine,
            runinmins: 0,
            runningkm: 0,
            lastChanged: new Date(),
            changeReason: reason,
            lastChangedBy: session.user.id,
            lastChangedByName: session.user.name,
        });

        await knife.save();
        return NextResponse.json({ success: true, knife });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}