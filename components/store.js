// components/store.js
import { create } from 'zustand';

export const useLineStore = create((set) => ({
  currentLine: '', // Default line
  setCurrentLine: (line) => set({ currentLine: line }),
}));