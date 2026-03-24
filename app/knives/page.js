// app/knives/page.js

// "use client";
// import KnifeForm from '@/components/KnifeForm';
// import KnifeChange from '@/components/KnifeChange';

// export default function KnivesPage() {
//     return (
//         <main className="min-h-screen bg-slate-100 p-4">
//             <KnifeForm />
//             <hr className="my-8 border-slate-300" />
//             <KnifeChange />
//         </main>
//     );
// }
"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import KnifeForm from '@/components/KnifeForm';
import KnifeChange from '@/components/KnifeChange';

export default function KnivesPage() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/auth/login');
        }
    }, [status]);

    if (status === 'loading') return null;
    if (status === 'unauthenticated') return null;

    return (
        <main className="min-h-screen bg-slate-100 p-4">
            <KnifeForm />
            <hr className="my-8 border-slate-300" />
            <KnifeChange />
        </main>
    );
}