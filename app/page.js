
// ============================================
// app/page.js (Root - Redirects to /knives)
// ============================================
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/knives');
}