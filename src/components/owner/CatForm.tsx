"use client";

import { useState } from "react";
import Link from "next/link";
import type { Cat } from "@/lib/types";

type Props = {
  initial?: Cat;
  submitLabel: string;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
};

export default function CatForm({ initial, submitLabel, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [breed, setBreed] = useState(initial?.breed ?? "");
  const [age, setAge] = useState(initial?.age?.toString() ?? "");
  const [weight, setWeight] = useState(initial?.weight?.toString() ?? "");
  const [gender, setGender] = useState<Cat["gender"]>(initial?.gender ?? "unknown");
  const [vaccinated, setVaccinated] = useState(initial?.vaccinated ?? false);
  const [feedingSchedule, setFeeding] = useState(initial?.feedingSchedule ?? "");
  const [careInstructions, setCare] = useState(initial?.careInstructions ?? "");
  const [medicalNotes, setMedical] = useState(initial?.medicalNotes ?? "");
  const [emergencyContact, setEmergency] = useState(initial?.emergencyContact ?? "");
  const [photo, setPhoto] = useState(initial?.photo ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Khali field gulo pathai na (backend e optional)
    const payload: Record<string, unknown> = { name: name.trim(), gender, vaccinated };
    if (breed.trim()) payload.breed = breed.trim();
    if (age.trim()) payload.age = Number(age);
    if (weight.trim()) payload.weight = Number(weight);
    if (feedingSchedule.trim()) payload.feedingSchedule = feedingSchedule.trim();
    if (careInstructions.trim()) payload.careInstructions = careInstructions.trim();
    if (medicalNotes.trim()) payload.medicalNotes = medicalNotes.trim();
    if (emergencyContact.trim()) payload.emergencyContact = emergencyContact.trim();
    if (photo.trim()) payload.photo = photo.trim();

    if (payload.age !== undefined && (Number.isNaN(payload.age) || (payload.age as number) < 0))
      return setError("Age must be a valid number");
    if (payload.weight !== undefined && Number.isNaN(payload.weight)) return setError("Weight must be a valid number");

    setLoading(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-3xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Cat name *
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input mt-1" placeholder="e.g. Milo" />
        </label>
        <label className="block text-sm font-medium">
          Breed
          <input value={breed} onChange={(e) => setBreed(e.target.value)} className="input mt-1" placeholder="e.g. British Shorthair" />
        </label>
        <label className="block text-sm font-medium">
          Age (years)
          <input type="number" min="0" step="0.5" value={age} onChange={(e) => setAge(e.target.value)} className="input mt-1" />
        </label>
        <label className="block text-sm font-medium">
          Weight (kg)
          <input type="number" min="0" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="input mt-1" />
        </label>
        <label className="block text-sm font-medium">
          Gender
          <select value={gender} onChange={(e) => setGender(e.target.value as Cat["gender"])} className="input mt-1">
            <option value="unknown">Not sure</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Emergency contact
          <input value={emergencyContact} onChange={(e) => setEmergency(e.target.value)} className="input mt-1" placeholder="Vet / family phone" />
        </label>
      </div>

      <label className="block text-sm font-medium">
        Photo URL
        <input value={photo} onChange={(e) => setPhoto(e.target.value)} className="input mt-1" placeholder="https://..." />
        <span className="text-xs font-normal text-gray-500">Photo upload will be added later. For now paste an image link.</span>
      </label>

      <label className="block text-sm font-medium">
        Feeding schedule
        <textarea value={feedingSchedule} onChange={(e) => setFeeding(e.target.value)} rows={2} className="input mt-1" placeholder="e.g. 8am and 7pm, dry food" />
      </label>
      <label className="block text-sm font-medium">
        Care instructions
        <textarea value={careInstructions} onChange={(e) => setCare(e.target.value)} rows={3} className="input mt-1" placeholder="Play time, litter box, favourite toys..." />
      </label>
      <label className="block text-sm font-medium">
        Medical notes
        <textarea value={medicalNotes} onChange={(e) => setMedical(e.target.value)} rows={2} className="input mt-1" placeholder="Allergies, medicines..." />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={vaccinated} onChange={(e) => setVaccinated(e.target.checked)} className="accent-brand-500" />
        Vaccinated
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button disabled={loading} className="btn-primary">{loading ? "Saving..." : submitLabel}</button>
        <Link href="/dashboard/owner/cats" className="btn-outline">Cancel</Link>
      </div>
    </form>
  );
}