import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SittersClient from "./SittersClient";

export const metadata = { title: "Find Cat Sitters | Meow" };

export default function SittersPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
          <SittersClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}