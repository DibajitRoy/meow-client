import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SitterDetailClient from "./SitterDetailClient";

export default function SitterDetailPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
          <SitterDetailClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}