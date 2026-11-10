import nextEnv from "@next/env";
import { MongoClient } from "mongodb";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is missing from .env.");
  process.exit(1);
}

const client = new MongoClient(uri);
const authCollections = ["account", "session", "verification"];

try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "meow");
  const users = await db.collection("user").countDocuments();
  const counts = new Map();
  for (const name of authCollections) {
    const exists = (await db.listCollections({ name }, { nameOnly: true }).toArray()).length > 0;
    counts.set(name, exists ? await db.collection(name).countDocuments() : 0);
  }

  console.log(`Database: ${db.databaseName}`);
  console.log(`user: ${users} document(s)`);
  for (const [name, count] of counts) console.log(`${name}: ${count} document(s)`);

  if (process.argv.includes("--inspect")) {
    const userDocs = await db.collection("user").find({}, { projection: { _id: 1, email: 1, role: 1 } }).toArray();
    const accountDocs = await db.collection("account").find({}, { projection: { providerId: 1, userId: 1 } }).toArray();
    const sessionDocs = await db.collection("session").find({}, { projection: { userId: 1 } }).toArray();
    for (const user of userDocs) console.log(`user ${user._id}: email=${user.email ?? "unset"}; role=${user.role ?? "unset"}`);
    for (const account of accountDocs) {
      const linked = userDocs.some((user) => String(user._id) === String(account.userId));
      console.log(`account provider=${account.providerId}; user exists=${linked}`);
    }
    for (const session of sessionDocs) {
      const linked = userDocs.some((user) => String(user._id) === String(session.userId));
      console.log(`session user exists=${linked}`);
    }
  }

  if (users !== 0) {
    console.error("Refusing to clear auth records while users exist.");
    process.exitCode = 1;
  } else if (process.argv.includes("--confirm")) {
    for (const name of authCollections) {
      const count = counts.get(name);
      if (count > 0) await db.collection(name).deleteMany({});
    }
    console.log("Cleared stale account, session, and verification records.");
  } else {
    console.log("Dry run only. Pass --confirm to clear these auth collections.");
  }
} catch (error) {
  console.error("Could not inspect or clear auth records:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.close();
}
