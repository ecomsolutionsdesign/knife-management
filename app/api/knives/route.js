// app/api/knives/route.js (Keep existing save logic)
// ============================================
import dbConnect from '@/lib/mongodb';
import { Knife, KnifePlan } from '@/models/Knife';
import { NextResponse } from 'next/server';

export async function GET(req) {
    await dbConnect();
    try {
        // Extract query parameters from the URL
        const { searchParams } = new URL(req.url);
        const currentLine = searchParams.get('currentLine');

        if (!currentLine) {
            return NextResponse.json({ message: "currentLine is required" }, { status: 400 });
        }

        // Fetch knives associated with the current line
        // You can adjust the query to find what you specifically need
        const knives = await Knife.find({ currentLine: currentLine, isActive: true });

        return NextResponse.json(knives);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();
    try {
        const { currentLine, planNo, doffLength, noOfDoff, mcSpeed, selectedKnives, changedKnives = [] } = await req.json();
        const savedData = [];

        // Process changed knives
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

        // Process selected knives
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
            knife.lastUsedDate = new Date();
            await knife.save();

            const planEntry = await KnifePlan.create({
                currentLine, planNo, knifeNo, doffLength, noOfDoff, mcSpeed,
                runinmins: newRuninmins, runningkm: newRunningkm,
                cumulativeRuninmins: knife.runinmins, 
                cumulativeRunningkm: knife.runningkm
            });

            savedData.push({ knife, planUsage: planEntry });
        }
        
        return NextResponse.json(savedData);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}