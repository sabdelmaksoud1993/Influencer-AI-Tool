import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface User {
    role?: string;
    accessCode?: string;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email?: string;
      role: string;
      accessCode?: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
    accessCode?: string;
    id?: string;
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    // Credentials provider is configured in auth.ts with full Node.js access
    Credentials({
      credentials: {
        code: { label: "Access Code", type: "text" },
      },
      // authorize is overridden in auth.ts
      authorize: () => null,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.accessCode = (user as any).accessCode;
        token.id = user.id as string;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).accessCode = token.accessCode;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as any)?.role;
      const pathname = nextUrl.pathname;

      // Protected routes
      if (pathname.startsWith("/member") || pathname.startsWith("/venue") || pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false; // Redirect to signIn page

        // Role-based access
        if (pathname.startsWith("/member") && role !== "member") return false;
        if (pathname.startsWith("/venue") && role !== "venue") return false;
        if (pathname.startsWith("/admin") && role !== "admin") return false;
      }

      return true;
    },
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
};
