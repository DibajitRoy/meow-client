import Image from "next/image";
import Link from "next/link";
import { Search, CalendarCheck, Heart, ShieldCheck, Star, MapPin, CalendarDays } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeaturedSitters from "@/components/home/FeaturedSitters";

const stats = [
  { value: "Verified", label: "Sitter profiles" },
  { value: "Personal", label: "Cat care details" },
  { value: "Clear", label: "Booking status" },
  { value: "Real", label: "Owner reviews" },
];

const steps = [
  { icon: Search, title: "Search", text: "Find verified sitters near you by city, price and rating." },
  { icon: CalendarCheck, title: "Book", text: "Pick your cat, choose dates and send a booking request." },
  { icon: Heart, title: "Relax", text: "Your cat stays in safe, loving hands while you are away." },
];

const services = [
  { title: "Boarding", text: "Your cat stays cozy in the sitter's home.", image: "/images/cuddle.png" },
  { title: "Drop-in Visits", text: "Feeding, play and fresh water at your place.", image: "/images/feeding.png" },
  { title: "Play & Care", text: "Daily play time, cuddles and attention.", image: "/images/play.png" },
  { title: "Grooming & Spa", text: "Gentle bath and brushing for a happy coat.", image: "/images/spa.png" },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-brand-50 to-white">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
            <div>
              <span className="badge">🐾 Cat sitting made simple</span>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-brand-900 md:text-5xl">
                Trusted care for your cat, while you&apos;re away.
              </h1>
              <p className="mt-4 max-w-md text-gray-600">
                Find loving and verified cat sitters near you. Because your cat deserves the best care.
              </p>

              <form action="/sitters" className="mt-7 flex flex-col gap-2 rounded-2xl border border-brand-100 bg-white p-2 shadow-sm sm:flex-row sm:items-center">
                <label className="flex flex-1 items-center gap-2 px-3">
                  <MapPin size={18} className="text-brand-500" />
                  <input name="city" placeholder="Enter your city" className="w-full py-2 text-sm outline-none" />
                </label>
                <label className="flex flex-1 items-center gap-2 px-3">
                  <CalendarDays size={18} className="text-brand-500" />
                  <input name="from" type="date" aria-label="Start date" className="w-full py-2 text-sm text-gray-600 outline-none" />
                </label>
                <label className="flex flex-1 items-center gap-2 px-3">
                  <CalendarDays size={18} className="text-brand-500" />
                  <input name="to" type="date" aria-label="End date" className="w-full py-2 text-sm text-gray-600 outline-none" />
                </label>
                <button className="btn-primary">Search Sitters</button>
              </form>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lg">
              <Image src="/images/hero.png" alt="A fluffy cat resting on a purple blanket" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 pb-12 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-brand-100 bg-white p-4 text-center">
                <p className="text-2xl font-bold text-brand-600">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
          <h2 className="text-center text-3xl font-bold text-brand-900">How it Works</h2>
          <p className="mt-2 text-center text-gray-600">Simple steps to book a cat sitter</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="card text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
                  <s.icon />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{i + 1}. {s.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section id="services" className="scroll-mt-20 bg-brand-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-3xl font-bold text-brand-900">Care Your Cat Will Love</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((s) => (
                <div key={s.title} className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
                  <div className="relative aspect-[4/3]">
                    <Image src={s.image} alt={s.title} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FeaturedSitters />

        {/* Trust */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src="/images/login.png" alt="A sleepy cat" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-brand-900">Built on trust</h2>
            <ul className="mt-5 space-y-4">
              <li className="flex gap-3"><ShieldCheck className="shrink-0 text-brand-500" /><span className="text-gray-600"><b className="text-gray-900">Verified sitters.</b> Every sitter profile is reviewed by our admin team.</span></li>
              <li className="flex gap-3"><Star className="shrink-0 text-brand-500" /><span className="text-gray-600"><b className="text-gray-900">Real reviews.</b> Only owners with a completed booking can leave a review.</span></li>
              <li className="flex gap-3"><Heart className="shrink-0 text-brand-500" /><span className="text-gray-600"><b className="text-gray-900">Care instructions.</b> Share feeding, medical and routine notes with your sitter.</span></li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-r from-brand-500 to-brand-400 p-10 text-center text-white">
            <h2 className="text-3xl font-bold">Ready to find the perfect sitter?</h2>
            <p className="mt-2 text-white/90">Join Meow as a cat owner or a cat sitter today.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/register" className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">Get Started</Link>
              <Link href="/sitters" className="rounded-xl border border-white/70 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10">Browse Sitters</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
