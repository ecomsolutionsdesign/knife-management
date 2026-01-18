// app/layout.js
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <div className="pt-14 pb-20">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}