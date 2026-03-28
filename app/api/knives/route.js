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
            return NextResponse.json({ message: 'currentLine is required' }, { status: 400 });
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
        const {
            currentLine,
            planNo,
            planDate,       // ISO date string chosen in UI
            doffLength,
            noOfDoff,
            mcSpeed,
            selectedKnives,
            changedKnives = [],
        } = await req.json();

        // ── Guard: duplicate planNo for this line ──────────────────────────────
        const existingPlan = await KnifePlan.findOne({ currentLine, planNo });
        if (existingPlan) {
            return NextResponse.json(
                { message: `Plan ${planNo} already exists for ${currentLine}. Use a different plan number.` },
                { status: 409 }
            );
        }

        // ── Handle knife-change swaps ──────────────────────────────────────────
        const allKnives = [...selectedKnives];

        for (const { oldKnifeNo, newKnifeNo, changeReason } of changedKnives) {
            if (oldKnifeNo) {
                await Knife.findOneAndUpdate(
                    { knifeNo: oldKnifeNo },
                    { isActive: false, lastChanged: new Date(), changeReason }
                );
            }
            await Knife.findOneAndUpdate(
                { knifeNo: newKnifeNo },
                {
                    runinmins: 0,
                    runningkm: 0,
                    isActive: true,
                    currentPlanNo: planNo,
                    lastChanged: new Date(),
                    currentLine,
                },
                { upsert: true }
            );
            if (!allKnives.includes(newKnifeNo)) allKnives.push(newKnifeNo);
        }

        // ── Compute increments ─────────────────────────────────────────────────
        const newRuninmins = Math.round((doffLength * noOfDoff) / mcSpeed);
        const newRunningkm = Math.round((doffLength * noOfDoff) / 1000);

        // ── Build the knives array for the single KnifePlan document ──────────
        const knivesArray = [];

        for (const knifeNo of allKnives) {
            let knife = await Knife.findOne({ knifeNo });
            if (!knife) {
                knife = new Knife({ currentLine, knifeNo, runinmins: 0, runningkm: 0 });
            }

            knife.runinmins += newRuninmins;
            knife.runningkm += newRunningkm;
            knife.currentPlanNo = planNo;
            knife.lastUsedDate = new Date();
            await knife.save();

            knivesArray.push({
                knifeNo,
                runinmins: newRuninmins,
                runningkm: newRunningkm,
                cumulativeRuninmins: knife.runinmins,
                cumulativeRunningkm: knife.runningkm,
            });
        }

        // ── Create ONE document for the whole plan ────────────────────────────
        const planDoc = await KnifePlan.create({
            currentLine,
            planNo,
            planDate: planDate ? new Date(planDate) : new Date(),
            doffLength,
            noOfDoff,
            mcSpeed,
            knives: knivesArray,
            createdBy: session.user.id,
            createdByName: session.user.name,
        });

        return NextResponse.json(planDoc);
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json(
                { message: 'Duplicate entry: this plan already exists for this line.' },
                { status: 409 }
            );
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}