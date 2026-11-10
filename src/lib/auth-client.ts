import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    jwtClient(),
    inferAdditionalFields({
      user: {
        role: { type: "string" },
        phone: { type: "string", required: false },
      },
    }),
  ],
});