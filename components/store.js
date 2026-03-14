// components/store.js
import { create } from 'zustand';

export const useLineStore = create((set) => ({
    // ✅ Bug 4 fix: set a real default so first-load API calls don't send currentLine=''
    currentLine: 'line2',
    setCurrentLine: (line) => set({ currentLine: line }),
}));