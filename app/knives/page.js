// app/knives/page.js (Updated - moved from root)

"use client";
import KnifeForm from '@/components/KnifeForm';
import KnifeChange from '@/components/KnifeChange';

export default function KnivesPage() {
    return (
        <main className="min-h-screen bg-slate-100 p-4">
            <KnifeForm />
            <hr className="my-8 border-slate-300" />
            <KnifeChange />
        </main>
    );
}
