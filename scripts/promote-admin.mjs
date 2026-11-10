import nextEnv from "@next/env";
import { MongoClient } from "mongodb";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const uri = process.env.MONGODB_URI;

if (!email) {
  console.error("Set ADMIN_EMAIL in .env to the existing account you want to promote.");
  process.exit(1);
}

if (!uri) {
  console.error("MONGODB_URI is missing from .env.");
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "meow");
  const users = db.collection("user");
  const matches = await users
    .find({ email })
    .collation({ locale: "en", strength: 2 })
    .limit(2)
    .toArray();

  if (matches.length === 0) {
    console.error(`No existing user found for ${email}. Sign in or create that account first.`);
    process.exitCode = 1;
  } else if (matches.length > 1) {
    console.error(`More than one user uses ${email}; resolve the duplicate records before promoting.`);
    process.exitCode = 1;
  } else {
    const user = matches[0];
    await users.updateOne({ _id: user._id }, { $set: { role: "admin" } });
    console.log(`Promoted ${email} to admin. Sign out and sign in again to refresh the session.`);
  }
} catch (error) {
  console.error("Could not promote the admin account:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.close();
}
