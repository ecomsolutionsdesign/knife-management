// models/Settings.js
import mongoose from 'mongoose';

const lineThresholdSchema = new mongoose.Schema({
    line: { type: String, required: true, unique: true }, // 'line1' | 'line2' | 'line3'
    warnMins: { type: Number, default: 4500 },
    critMins: { type: Number, default: 5000 },
    warnKm:   { type: Number, default: 4500 },
    critKm:   { type: Number, default: 5000 },
});

export const LineThreshold = mongoose.models.LineThreshold || mongoose.model('LineThreshold', lineThresholdSchema);