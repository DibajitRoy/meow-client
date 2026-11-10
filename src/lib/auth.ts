import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db(process.env.MONGODB_DB || "meow");

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      allowDifferentEmails: false,
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      const apiKey = process.env.EMAIL_API_KEY;
      const from = process.env.EMAIL_FROM;
      if (!apiKey || !from) throw new Error("Password reset email is not configured");

      const response = await fetch(process.env.EMAIL_API_URL || "https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [user.email],
          subject: "Reset your Meow password",
          text: `Hello ${user.name},\n\nUse this link to reset your Meow password. It expires in one hour.\n\n${url}\n\nIf you did not request this, you can ignore this email.`,
        }),
      });
      if (!response.ok) throw new Error("The password reset email could not be sent");
    },
  },

  ...(googleClientId && googleClientSecret
    ? { socialProviders: { google: { clientId: googleClientId, clientSecret: googleClientSecret } } }
    : {}),

  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "owner", input: true },
      phone: { type: "string", required: false, input: true },
      status: { type: "string", defaultValue: "active", input: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
       
        before: async (user) => {
          const role = user.role === "sitter" ? "sitter" : "owner";
          return { data: { ...user, role } };
        },
      },
    },
  },

  plugins: [jwt()],
});
