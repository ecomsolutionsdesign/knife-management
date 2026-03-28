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
    lastUsedDate: { type: Date, default: Date.now },
    lastChanged: { type: Date, default: Date.now },
    changeReason: String,
    lastChangedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastChangedByName: String,
});

// ─── NEW: one document per (currentLine + planNo) ────────────────────────────
// knives is an array so 15 knives → 15 array entries, NOT 15 documents.
const knifePlanEntrySchema = new mongoose.Schema({
    knifeNo: { type: String, required: true },
    runinmins: { type: Number, default: 0 },
    runningkm: { type: Number, default: 0 },
    cumulativeRuninmins: { type: Number, default: 0 },
    cumulativeRunningkm: { type: Number, default: 0 },
}, { _id: false });

const knifePlanSchema = new mongoose.Schema({
    currentLine: { type: String, required: true },
    planNo: { type: String, required: true },
    planDate: { type: Date, required: true },        // date chosen in UI
    doffLength: Number,
    noOfDoff: Number,
    mcSpeed: Number,
    knives: [knifePlanEntrySchema],                  // ← array replaces N docs
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdByName: String,
    createdAt: { type: Date, default: Date.now },
});

// Unique plan per line
knifePlanSchema.index({ currentLine: 1, planNo: 1 }, { unique: true });

const knifeChangeLogSchema = new mongoose.Schema({
    currentLine: { type: String, required: true },
    knifeNo: String,
    changedAt: { type: Date, default: Date.now },
    reason: String,
    previousRuninmins: Number,
    previousRunningkm: Number,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedByName: String,
});

export const Knife = mongoose.models.Knife || mongoose.model('Knife', knifeSchema);
export const KnifePlan = mongoose.models.KnifePlan || mongoose.model('KnifePlan', knifePlanSchema);
export const KnifeChangeLog = mongoose.models.KnifeChangeLog || mongoose.model('KnifeChangeLog', knifeChangeLogSchema);