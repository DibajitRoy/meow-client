"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { SitterProfile } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import Avatar from "@/components/ui/Avatar";

const SUGGESTED = ["Daily Visit", "Feeding", "Playtime", "Litter Cleaning", "Medication", "Photo Updates", "Overnight Stay", "Grooming"];

function StatusBanner({ p }: { p: SitterProfile }) {
  const map = {
    pending: ["bg-amber-50 text-amber-800", "Waiting for admin verification. You will appear in search after approval."],
    verified: ["bg-emerald-50 text-emerald-800", "Your profile is verified and visible to cat owners."],
    rejected: ["bg-red-50 text-red-700", `Your profile was rejected: ${p.rejectionReason ?? "no reason given"}. Update it and save to submit again.`],
  } as const;
  const [cls, text] = map[p.verificationStatus];
  return (
    <div className={`mb-6 flex flex-wrap items-center gap-3 rounded-2xl p-4 text-sm ${cls}`}>
      <StatusBadge status={p.verificationStatus} />
      <p className="flex-1">{text}</p>
    </div>
  );
}

export default function SitterProfilePage() {
  const [loaded, setLoaded] = useState(false);
  const [existing, setExisting] = useState<SitterProfile | null>(null);

  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [experience, setExperience] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [photo, setPhoto] = useState("");
  const [gallery, setGallery] = useState("");
  const [accepting, setAccepting] = useState(true);

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ profile: SitterProfile | null }>("/api/sitters/me/profile")
      .then(({ profile }) => {
        if (profile) {
          setExisting(profile);
          setBio(profile.bio);
          setCity(profile.city);
          setAddress(profile.address ?? "");
          setPrice(String(profile.pricePerDay));
          setExperience(String(profile.experienceYears));
          setServices(profile.services);
          setPhoto(profile.photo ?? "");
          setGallery(profile.gallery.join("\n"));
          setAccepting(profile.acceptingBookings);
        }
        setLoaded(true);
      })
      .catch((e) => {
        setError((e as Error).message);
        setLoaded(true);
      });
  }, []);

  function toggleService(s: string) {
    setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  }

  function addCustom() {
    const v = custom.trim();
    if (v && !services.includes(v) && services.length < 12) setServices([...services, v]);
    setCustom("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);

    const priceNum = Number(price);
    const expNum = Number(experience);
    if (bio.trim().length < 10) return setError("Bio must be at least 10 characters");
    if (city.trim().length < 2) return setError("Please enter your city");
    if (!priceNum || priceNum < 1) return setError("Enter a valid price per day");
    if (!Number.isInteger(expNum) || expNum < 0) return setError("Experience must be a whole number of years");

    const galleryList = gallery.split("\n").map((s) => s.trim()).filter(Boolean);

    setSaving(true);
    try {
      const r = await api<{ profile: SitterProfile }>("/api/sitters/me/profile", {
        method: "PUT",
        body: JSON.stringify({
          bio: bio.trim(),
          city: city.trim(),
          ...(address.trim() ? { address: address.trim() } : {}),
          pricePerDay: priceNum,
          experienceYears: expNum,
          services,
          ...(photo.trim() ? { photo: photo.trim() } : {}),
          gallery: galleryList,
          acceptingBookings: accepting,
        }),
      });
      setExisting(r.profile);
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    }
    setSaving(false);
  }

  if (!loaded) return <p className="text-sm text-gray-500">Loading...</p>;

  const extra = services.filter((s) => !SUGGESTED.includes(s));

  return (
    <>
      <PageHeader title="Sitter Profile" subtitle="This is what cat owners see when they find you" />
      {existing && <StatusBanner p={existing} />}

      <form onSubmit={save} className="card max-w-3xl space-y-5">
        <div className="flex items-center gap-4">
          <Avatar src={photo || null} name={city || "S"} size={72} rounded="xl" />
          <label className="block flex-1 text-sm font-medium">
            Profile photo URL
            <input value={photo} onChange={(e) => setPhoto(e.target.value)} className="input mt-1" placeholder="https://..." />
          </label>
        </div>

        <label className="block text-sm font-medium">
          About you *
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={1500} className="input mt-1" placeholder="Tell owners about your experience with cats..." />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            City *
            <input value={city} onChange={(e) => setCity(e.target.value)} className="input mt-1" placeholder="Dhaka" />
          </label>
          <label className="block text-sm font-medium">
            Address (optional)
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="input mt-1" />
          </label>
          <label className="block text-sm font-medium">
            Price per day *
            <input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} className="input mt-1" />
          </label>
          <label className="block text-sm font-medium">
            Years of experience *
            <input type="number" min="0" step="1" value={experience} onChange={(e) => setExperience(e.target.value)} className="input mt-1" />
          </label>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Services</p>
          <div className="flex flex-wrap gap-2">
            {[...SUGGESTED, ...extra].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => toggleService(s)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  services.includes(s) ? "border-brand-500 bg-brand-500 text-white" : "border-brand-200 bg-white text-gray-600 hover:bg-brand-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
              className="input"
              placeholder="Add your own service"
            />
            <button type="button" onClick={addCustom} className="btn-outline">Add</button>
          </div>
        </div>

        <label className="block text-sm font-medium">
          Gallery image links (one per line, max 8)
          <textarea value={gallery} onChange={(e) => setGallery(e.target.value)} rows={3} className="input mt-1" placeholder="https://..." />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={accepting} onChange={(e) => setAccepting(e.target.checked)} className="accent-brand-500" />
          I am currently accepting new bookings
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-emerald-600">Profile saved.</p>}
        <button disabled={saving} className="btn-primary">{saving ? "Saving..." : existing ? "Save Changes" : "Submit for Verification"}</button>
      </form>
    </>
  );
}