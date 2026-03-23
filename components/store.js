// components/store.js
import { create } from 'zustand';

export const useLineStore = create((set) => ({
    currentLine: 'line2',
    setCurrentLine: (line) => set({ currentLine: line }),
}));