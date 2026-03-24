// app/api/knives/route.js

import dbConnect from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { Knife, KnifePlan } from '@/models/Knife';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const currentLine = searchParams.get('currentLine');

        if (!currentLine) {
            return NextResponse.json({ message: "currentLine is required" }, { status: 400 });
        }

        const knives = await Knife.find({ currentLine, isActive: true });
        return NextResponse.json(knives);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    try {
        const { currentLine, planNo, doffLength, noOfDoff, mcSpeed, selectedKnives, changedKnives = [] } = await req.json();

        // ✅ Bug 1 fix: check if this planNo already has entries for this line
        const existingPlanCount = await KnifePlan.countDocuments({ currentLine, planNo });
        if (existingPlanCount > 0) {
            return NextResponse.json(
                { message: `Plan ${planNo} already exists for ${currentLine}. Use a different plan number.` },
                { status: 409 }
            );
        }

        const savedData = [];

        for (const { oldKnifeNo, newKnifeNo, changeReason } of changedKnives) {
            if (oldKnifeNo) {
                await Knife.findOneAndUpdate(
                    { knifeNo: oldKnifeNo },
                    { isActive: false, lastChanged: new Date(), changeReason }
                );
            }
            await Knife.findOneAndUpdate(
                { knifeNo: newKnifeNo },
                { runinmins: 0, runningkm: 0, isActive: true, currentPlanNo: planNo, lastChanged: new Date(), currentLine },
                { upsert: true }
            );
            if (!selectedKnives.includes(newKnifeNo)) selectedKnives.push(newKnifeNo);
        }

        const newRuninmins = Math.round((doffLength * noOfDoff) / mcSpeed);
        const newRunningkm = Math.round((doffLength * noOfDoff) / 1000);

        for (const knifeNo of selectedKnives) {
            let knife = await Knife.findOne({ knifeNo });
            if (!knife) {
                knife = new Knife({ currentLine, knifeNo, runinmins: 0, runningkm: 0 });
            }

            knife.runinmins += newRuninmins;
            knife.runningkm += newRunningkm;
            knife.currentPlanNo = planNo;
            knife.lastUsedDate = new Date(); // ✅ Now works because field is in schema
            await knife.save();

            const planEntry = await KnifePlan.create({
                currentLine, planNo, knifeNo, doffLength, noOfDoff, mcSpeed,
                runinmins: newRuninmins,
                runningkm: newRunningkm,
                cumulativeRuninmins: knife.runinmins,
                cumulativeRunningkm: knife.runningkm
            });

            savedData.push({ knife, planUsage: planEntry });
        }

        return NextResponse.json(savedData);
    } catch (error) {
        // ✅ Handle MongoDB duplicate key error gracefully
        if (error.code === 11000) {
            return NextResponse.json(
                { message: 'Duplicate entry: this plan+knife combination already exists.' },
                { status: 409 }
            );
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}