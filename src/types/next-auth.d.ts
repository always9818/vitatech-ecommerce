import type { DefaultSession } from "next-auth";
import "next-auth";
import "next-auth/jwt";

type Role = "CUSTOMER" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: Role;
  }
}
