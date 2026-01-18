// models/Knife.js

import mongoose from 'mongoose';

const knifeSchema = new mongoose.Schema({
    currentLine: { type: String, required: true },
    knifeNo: { type: String, required: true, unique: true },
    currentPlanNo: String,
    isActive: { type: Boolean, default: true },
    runinmins: { type: Number, default: 0 },
    runningkm: { type: Number, default: 0 },
    firstUsedDate: { type: Date, default: Date.now },
    lastChanged: { type: Date, default: Date.now },
    changeReason: String,
});

const knifePlanSchema = new mongoose.Schema({
    currentLine: { type: String, required: true },
    planNo: { type: String, required: true },
    knifeNo: { type: String, required: true },
    doffLength: Number,
    noOfDoff: Number,
    mcSpeed: Number,
    runinmins: Number,
    runningkm: Number,
    cumulativeRuninmins: Number,
    cumulativeRunningkm: Number,
    usageDate: { type: Date, default: Date.now }
});

const knifeChangeLogSchema = new mongoose.Schema({
    currentLine: { type: String, required: true },
    knifeNo: String,
    changedAt: { type: Date, default: Date.now },
    reason: String,
    previousRuninmins: Number,
    previousRunningkm: Number,
});

// Handling HMR model re-compilation in Next.js
export const Knife = mongoose.models.Knife || mongoose.model('Knife', knifeSchema);
export const KnifePlan = mongoose.models.KnifePlan || mongoose.model('KnifePlan', knifePlanSchema);
export const KnifeChangeLog = mongoose.models.KnifeChangeLog || mongoose.model('KnifeChangeLog', knifeChangeLogSchema);