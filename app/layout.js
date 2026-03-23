// app/layout.js
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthSessionProvider from "@/lib/SessionProvider";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased">
                <AuthSessionProvider>
                    <Navbar />
                    <div className="pt-14 pb-20">
                        {children}
                    </div>
                    <Footer />
                </AuthSessionProvider>
            </body>
        </html>
    );
}