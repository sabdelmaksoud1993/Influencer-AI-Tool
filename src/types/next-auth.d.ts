import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: "member" | "venue" | "admin";
    accessCode?: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email?: string;
      role: "member" | "venue" | "admin";
      accessCode?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "member" | "venue" | "admin";
    accessCode?: string;
    id?: string;
  }
}
