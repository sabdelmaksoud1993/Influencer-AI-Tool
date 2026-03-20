import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getMemberByCode, getVenueByCode } from "@/lib/db";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        code: { label: "Access Code", type: "text" },
      },
      async authorize(credentials) {
        const code = (credentials?.code as string)?.trim();
        if (!code) return null;

        // Creator login
        if (code.startsWith("CRC-")) {
          const member = await getMemberByCode(code);
          if (!member) return null;
          if (member.status === "blacklisted") return null;
          return {
            id: member.id,
            name: member.fullName,
            email: member.email,
            role: "member",
            accessCode: member.accessCode,
          };
        }

        // Venue login
        if (code.startsWith("VNU-")) {
          const venue = await getVenueByCode(code);
          if (!venue) return null;
          if (venue.status !== "active") return null;
          return {
            id: venue.id,
            name: venue.name,
            role: "venue",
            accessCode: venue.accessCode,
          };
        }

        // Admin login
        const adminPassword = process.env.ADMIN_PASSWORD || "cercle2024";
        if (code === adminPassword) {
          return {
            id: "admin",
            name: "Admin",
            role: "admin",
          };
        }

        return null;
      },
    }),
  ],
});
