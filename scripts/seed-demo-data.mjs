import { MongoClient, ObjectId } from "mongodb";
import { createHash } from "node:crypto";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "meow";

if (!uri) {
  throw new Error("MONGODB_URI is missing. Add it to the frontend .env file first.");
}

const sitters = [
  ["Ayesha Rahman", "Dhaka", 800, 4, ["Home visits", "Medication"]],
  ["Tanvir Hasan", "Dhaka", 650, 2, ["Overnight care", "Playtime"]],
  ["Nusrat Jahan", "Chattogram", 900, 6, ["Home visits", "Grooming"]],
  ["Fahim Ahmed", "Chattogram", 700, 3, ["Overnight care", "Medication"]],
  ["Maliha Chowdhury", "Sylhet", 750, 5, ["Home visits", "Playtime"]],
  ["Rafiul Islam", "Sylhet", 600, 2, ["Grooming", "Medication"]],
  ["Samia Akter", "Dhaka", 1000, 8, ["Overnight care", "Medication", "Home visits"]],
  ["Nabil Hossain", "Rajshahi", 550, 1, ["Home visits", "Playtime"]],
  ["Orpa Sultana", "Khulna", 700, 4, ["Grooming", "Overnight care"]],
  ["Sajid Karim", "Dhaka", 850, 5, ["Medication", "Playtime"]],
  ["Jannatul Ferdous", "Barishal", 650, 3, ["Home visits", "Overnight care"]],
  ["Imran Kabir", "Rajshahi", 600, 2, ["Grooming", "Playtime"]],
].map(([name, city, pricePerDay, experienceYears, services], index) => ({
  key: `demo-sitter-${String(index + 1).padStart(2, "0")}`,
  name,
  city,
  pricePerDay,
  experienceYears,
  services,
}));

const owners = [
  "Nadia Islam", "Mahmud Rahman", "Tania Akter", "Arif Hossain",
  "Sohana Karim", "Rashed Chowdhury", "Farzana Ahmed", "Samiul Haque",
].map((name, index) => ({ key: `demo-owner-${String(index + 1).padStart(2, "0")}`, name }));

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(dbName);
  const userCollection = db.collection("user");
  const profileCollection = db.collection("sitterProfiles");
  const bookingCollection = db.collection("bookings");
  const reviewCollection = db.collection("reviews");
  const catCollection = db.collection("cats");
  const now = new Date();
  const sitterIds = new Map();
  const ownerIds = new Map();

  for (const [index, sitter] of sitters.entries()) {
    const userId = await upsertUser(userCollection, sitter.key, sitter.name, "sitter", now);
    sitterIds.set(sitter.key, userId);
    await profileCollection.updateOne(
      { userId },
      {
        $set: {
          userId,
          bio: `${sitter.name} is a friendly, dependable cat sitter in ${sitter.city}. They provide attentive care and regular updates while you are away.`,
          city: sitter.city,
          address: `${sitter.city}, Bangladesh`,
          pricePerDay: sitter.pricePerDay,
          experienceYears: sitter.experienceYears,
          services: sitter.services,
          photo: `https://i.pravatar.cc/480?img=${index + 12}`,
          gallery: [],
          acceptingBookings: true,
          verificationStatus: "verified",
          ratingAvg: 0,
          ratingCount: 0,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }

  for (const owner of owners) {
    ownerIds.set(owner.key, await upsertUser(userCollection, owner.key, owner.name, "owner", now));
  }

  const comments = [
    "Very caring and reliable. I received regular updates and came home to a happy cat.",
    "Great experience from start to finish. My cat felt comfortable right away.",
    "Friendly, punctual, and attentive to the care instructions. I would book again.",
    "Took wonderful care of my cat and shared helpful photos during the stay.",
    "Communication was excellent and my cat was relaxed and well cared for.",
    "A thoughtful sitter who handled feeding and playtime exactly as requested.",
    "Everything went smoothly. I felt confident leaving my cat in their care.",
    "Kind and dependable service. My cat clearly enjoyed the visits.",
  ];
  const ratings = [5, 5, 4, 5, 4, 5, 5, 4];
  const catIds = new Map();

  for (const [index, owner] of owners.entries()) {
    const ownerId = ownerIds.get(owner.key);
    const catId = stableObjectId(`${owner.key}-cat`);
    catIds.set(owner.key, String(catId));
    await catCollection.updateOne(
      { _id: catId },
      {
        $set: {
          ownerId,
          name: ["Mochi", "Luna", "Milo", "Coco", "Ollie", "Mimi", "Simba", "Nala"][index],
          breed: "Domestic Shorthair",
          age: 2 + (index % 5),
          gender: index % 2 ? "female" : "male",
          vaccinated: true,
          createdAt: now,
          updatedAt: now,
        },
        $setOnInsert: { _id: catId },
      },
      { upsert: true },
    );
  }

  for (const [sitterIndex, sitter] of sitters.entries()) {
    const sitterId = sitterIds.get(sitter.key);
    let ratingTotal = 0;

    for (const [ownerIndex, owner] of owners.entries()) {
      const ownerId = ownerIds.get(owner.key);
      const bookingId = stableObjectId(`${sitter.key}-${owner.key}-completed-booking`);
      const catId = catIds.get(owner.key);
      const rating = ratings[(ownerIndex + sitterIndex) % ratings.length];
      const createdAt = new Date(Date.UTC(2025, 0, 1 + sitterIndex * owners.length + ownerIndex));
      ratingTotal += rating;

      await bookingCollection.updateOne(
        { _id: bookingId },
        {
          $set: {
            ownerId,
            sitterId,
            catId,
            serviceType: "Home visits",
            cat: { name: ["Mochi", "Luna", "Milo", "Coco", "Ollie", "Mimi", "Simba", "Nala"][ownerIndex] },
            from: "2025-01-01",
            to: "2025-01-02",
            nights: 1,
            pricePerDay: sitter.pricePerDay,
            subtotal: sitter.pricePerDay,
            serviceFee: 5,
            total: sitter.pricePerDay + 5,
            note: null,
            status: "completed",
            createdAt,
            updatedAt: createdAt,
            completedAt: createdAt,
            demoSeed: true,
          },
          $setOnInsert: { _id: bookingId },
        },
        { upsert: true },
      );

      const bookingIdString = String(bookingId);
      await reviewCollection.updateOne(
        { bookingId: bookingIdString },
        {
          $set: {
            bookingId: bookingIdString,
            ownerId,
            sitterId,
            rating,
            comment: comments[(ownerIndex + sitterIndex) % comments.length],
            photos: [],
            status: "visible",
            createdAt,
            demoSeed: true,
          },
          $setOnInsert: { _id: stableObjectId(`${bookingIdString}-review`) },
        },
        { upsert: true },
      );
    }

    await profileCollection.updateOne(
      { userId: sitterId },
      { $set: { ratingAvg: Math.round((ratingTotal / owners.length) * 10) / 10, ratingCount: owners.length } },
    );
  }

  console.log(`Demo data ready: ${sitters.length} verified sitters, ${owners.length} owners, and ${sitters.length * owners.length} reviews in ${dbName}.`);
  console.log("These sample records have no login credentials; use real accounts to sign in.");
} finally {
  await client.close();
}

async function upsertUser(collection, key, name, role, now) {
  const email = `${key}@example.com`;
  const existing = await collection.findOne({ email }, { projection: { _id: 1 } });
  const id = existing?._id ?? stableObjectId(key);
  await collection.updateOne(
    { email },
    {
      $set: { name, email, role, status: "active", emailVerified: true, updatedAt: now },
      $setOnInsert: { _id: id, createdAt: now },
    },
    { upsert: true },
  );
  return String(id);
}

function stableObjectId(key) {
  return new ObjectId(createHash("sha256").update(key).digest("hex").slice(0, 24));
}
